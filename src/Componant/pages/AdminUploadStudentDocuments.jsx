import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AdminUploadStudentDocuments.css";

const DOC_TYPES = [
  { key: "adhar", label: "Student Aadhar", endpoint: "STUDENT_AADHAR" },
  { key: "sssm", label: "SSSM ID", endpoint: "SSSMID_CARD" },
  { key: "photo", label: "Student Photo", endpoint: "STUDENT_PHOTO" },
  { key: "birth", label: "Birth Certificate", endpoint: "BIRTH_CERTIFICATE" },
  {
    key: "income",
    label: "Income Certificate",
    endpoint: "INCOME_CERTIFICATE",
  },
  { key: "tc", label: "Transfer Certificate (TC)", endpoint: "TC" },
  { key: "bank", label: "Bank Passbook", endpoint: "BANK_PASSBOOK" },
  { key: "domicile", label: "Domicile Certificate", endpoint: "DOMICILE" },
  { key: "parentAdhar", label: "Parent Aadhar", endpoint: "PARENT_AADHAR" },
];

const AdminUploadStudentDocuments = ({ apiBase = "http://localhost:8080" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const prefillId = location.state?.studentId ?? null;

  const [studentId, setStudentId] = useState(
    prefillId ? String(prefillId) : ""
  );
  const [docs, setDocs] = useState({
    adhar: null,
    sssm: null,
    photo: null,
    birth: null,
    income: null,
    tc: null,
    bank: null,
    domicile: null,
    parentAdhar: null,
  });

  const [docStatus, setDocStatus] = useState({
    adhar: null,
    sssm: null,
    photo: null,
    birth: null,
    income: null,
    tc: null,
    bank: null,
    domicile: null,
    parentAdhar: null,
  });

  const [uploadingGlobal, setUploadingGlobal] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    // support query param ?studentId= if someone opens directly
    if (!studentId) {
      const q = new URLSearchParams(window.location.search);
      const qId = q.get("studentId");
      if (qId) setStudentId(qId);
    }
  }, []);

  const validateForm = () => {
    if (!studentId || !/^\d+$/.test(studentId)) {
      setValidationError("Please enter a valid numeric Student ID.");
      return false;
    }

    // Check if at least one document is selected
    const hasDocument = Object.values(docs).some((doc) => doc !== null);
    if (!hasDocument) {
      setValidationError("Please choose at least one document to upload.");
      return false;
    }

    setValidationError("");
    return true;
  };

  const uploadSingle = async (userId, endpoint, file) => {
    const url = `${apiBase}/api/documents/upload/${userId}/${endpoint}`;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("docType", endpoint);

    try {
      const res = await fetch(url, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Status ${res.status}`);
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message || String(err) };
    }
  };

  // Handle file selection - only updates state, no upload
  const handleFileChange = (e, key) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setDocs((s) => ({ ...s, [key]: file }));

    // Reset status for this document
    setDocStatus((s) => ({
      ...s,
      [key]: null,
    }));

    if (validationError) setValidationError("");
  };

  const handleSaveAll = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      window.alert(validationError);
      return;
    }

    setUploadingGlobal(true);
    setValidationError("");

    setDocStatus({
      adhar: null,
      sssm: null,
      photo: null,
      birth: null,
      income: null,
      tc: null,
      bank: null,
      domicile: null,
      parentAdhar: null,
    });

    const toUpload = DOC_TYPES.map((d) => ({ ...d, file: docs[d.key] })).filter(
      (d) => d.file
    );

    const results = [];
    for (const item of toUpload) {
      // Set uploading status
      setDocStatus((s) => ({
        ...s,
        [item.key]: { uploading: true, ok: false, error: null },
      }));

      const r = await uploadSingle(studentId, item.endpoint, item.file);

      if (r.ok) {
        setDocStatus((s) => ({
          ...s,
          [item.key]: { uploading: false, ok: true, error: null },
        }));
      } else {
        setDocStatus((s) => ({
          ...s,
          [item.key]: { uploading: false, ok: false, error: r.error },
        }));
      }
      results.push({ label: item.label, key: item.key, result: r });
    }
    setUploadingGlobal(false);

    const failed = results.filter((r) => !r.result.ok);
    const successCount = results.length - failed.length;

    if (failed.length === 0) {
      window.alert(
        `All ${successCount} document(s) uploaded successfully for student ${studentId}.`
      );

      // Navigate to print page
      navigate("/admindashboard/print-student", {
        state: { studentId },
      });


    } else {
      const messages = failed.map((f) => `${f.label}: ${f.result.error}`);
      window.alert(
        `Uploaded ${successCount} succeeded, ${
          failed.length
        } failed:\n\n${messages.join("\n")}`
      );
    }
  };

  const handleBack = () => {
    const hasSelectedFiles = Object.values(docs).some((doc) => doc !== null);
    if (
      hasSelectedFiles &&
      !window.confirm(
        "You have unsaved document selections. Are you sure you want to go back?"
      )
    ) {
      return;
    }
    navigate(-1);
  };

  const handleClearAll = () => {
    if (window.confirm("Clear all selected documents?")) {
      setDocs({
        adhar: null,
        sssm: null,
        photo: null,
        birth: null,
        income: null,
        tc: null,
        bank: null,
        domicile: null,
        parentAdhar: null,
      });
      setDocStatus({
        adhar: null,
        sssm: null,
        photo: null,
        birth: null,
        income: null,
        tc: null,
        bank: null,
        domicile: null,
        parentAdhar: null,
      });
      setValidationError("");
    }
  };

  return (
    <div className="ud-container">
      <div className="ud-card">
        <h2>Upload Student Documents</h2>

        {prefillId && (
          <div className="ud-info">
            Preparing uploads for student id: <strong>{prefillId}</strong>
          </div>
        )}

        <div className="ud-input-block">
          <label>Student ID *</label>
          <input
            type="text"
            className="ud-input"
            placeholder="Enter Student ID"
            value={studentId}
            onChange={(e) => {
              setStudentId(e.target.value);
              if (validationError) setValidationError("");
            }}
          />
          <small style={{ display: "block", marginTop: 6, color: "#666" }}>
            Note: Documents will only be uploaded when you click "Save (batch)"
            button.
          </small>
        </div>

        {validationError && (
          <div
            style={{
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "20px",
              border: "1px solid #f5c6cb",
            }}
          >
            ⚠️ {validationError}
          </div>
        )}

        <form className="ud-form" onSubmit={handleSaveAll}>
          <div className="ud-grid">
            {DOC_TYPES.map((d) => (
              <label key={d.key} className="ud-file-block">
                {d.label}
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, d.key)}
                  disabled={uploadingGlobal}
                />
                <div className="ud-file-name">
                  {docs[d.key] ? (
                    <div>
                      <span style={{ color: "#2c3e50", fontWeight: "500" }}>
                        {docs[d.key].name}
                      </span>
                      <br />
                      <small style={{ color: "#7f8c8d" }}>
                        Size: {(docs[d.key].size / 1024).toFixed(2)} KB
                      </small>
                    </div>
                  ) : (
                    <span className="ud-empty">No file chosen</span>
                  )}
                </div>

                {/* Status display */}
                <div style={{ marginTop: 6, fontSize: 13, minHeight: "20px" }}>
                  {docStatus[d.key] ? (
                    docStatus[d.key].uploading ? (
                      <span style={{ color: "#3498db" }}>Uploading...</span>
                    ) : docStatus[d.key].ok ? (
                      <span style={{ color: "green", fontWeight: "500" }}>
                        ✓ Uploaded Successfully
                      </span>
                    ) : (
                      <span style={{ color: "red" }}>
                        ✗ Error: {docStatus[d.key].error || "Upload failed"}
                      </span>
                    )
                  ) : (
                    docs[d.key] && (
                      <span style={{ color: "#f39c12", fontWeight: "500" }}>
                        ⏳ Ready to upload
                      </span>
                    )
                  )}
                </div>
              </label>
            ))}
          </div>

          {/* Action buttons */}
          <div className="ud-button-row">
            <button
              type="button"
              className="ud-btn ud-back-btn"
              onClick={handleBack}
              disabled={uploadingGlobal}
            >
              Back
            </button>

            <button
              type="button"
              className="ud-btn ud-clear-btn"
              onClick={handleClearAll}
              disabled={uploadingGlobal}
              style={{
                backgroundColor: "#95a5a6",
                color: "white",
              }}
            >
              Clear All
            </button>

            <button
              type="submit"
              className="ud-btn ud-save-btn"
              disabled={uploadingGlobal}
            >
              {uploadingGlobal ? "Uploading..." : "Save (batch)"}
            </button>
          </div>

          {/* Upload summary */}
          <div
            style={{
              marginTop: "30px",
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "6px",
              borderLeft: "4px solid #3498db",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <strong>Upload Summary:</strong>
                <div style={{ marginTop: "10px" }}>
                  <span style={{ marginRight: "20px" }}>
                    📄 Selected:{" "}
                    {Object.values(docs).filter((d) => d !== null).length} files
                  </span>
                  <span style={{ marginRight: "20px" }}>
                    ✓ Uploaded:{" "}
                    {Object.values(docStatus).filter((d) => d?.ok).length} files
                  </span>
                  <span>
                    ⚠️ Pending:{" "}
                    {Object.values(docs).filter((d) => d !== null).length -
                      Object.values(docStatus).filter((d) => d?.ok).length}{" "}
                    files
                  </span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div>Total Documents: {DOC_TYPES.length}</div>
                <div
                  style={{
                    fontSize: "0.9em",
                    color: "#7f8c8d",
                    marginTop: "5px",
                  }}
                >
                  Student ID: {studentId || "Not entered"}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUploadStudentDocuments;
