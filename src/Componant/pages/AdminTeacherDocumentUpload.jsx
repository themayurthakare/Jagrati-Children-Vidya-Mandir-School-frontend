import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import "./AdminTeacherDocumentUpload.css"; // Reuse student CSS with teacher naming

const DOC_TYPES = [
  { key: "photo", label: "Teacher Photo", endpoint: "TEACHER_PHOTO" },
  { key: "aadhar", label: "Aadhaar Card", endpoint: "TEACHER_AADHAR" },
  { key: "pan", label: "PAN Card", endpoint: "TEACHER_PAN" },
  { key: "degree", label: "Degree Certificate", endpoint: "TEACHER_DEGREE" },
  {
    key: "certificate",
    label: "Other Certificate",
    endpoint: "TEACHER_CERTIFICATE",
  },
];

const AdminTeacherDocumentUpload = ({
  apiBase = "http://localhost:8080/api",
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const prefillId = location.state?.teacherId || searchParams.get("teacherId");
  const [teacherId, setTeacherId] = useState(
    prefillId ? String(prefillId) : ""
  );

  const [docs, setDocs] = useState({
    photo: null,
    aadhar: null,
    pan: null,
    degree: null,
    certificate: null,
  });

  const [docStatus, setDocStatus] = useState({
    photo: null,
    aadhar: null,
    pan: null,
    degree: null,
    certificate: null,
  });

  const [uploadingGlobal, setUploadingGlobal] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (!teacherId) {
      const qId = searchParams.get("teacherId");
      if (qId) setTeacherId(qId);
    }
  }, [teacherId, searchParams]);

  const validateForm = () => {
    if (!teacherId || !/^\d+$/.test(teacherId)) {
      setValidationError("Please enter a valid numeric Teacher ID.");
      return false;
    }

    const hasDocument = Object.values(docs).some((doc) => doc !== null);
    if (!hasDocument) {
      setValidationError("Please choose at least one document to upload.");
      return false;
    }

    setValidationError("");
    return true;
  };

  const uploadSingle = async (teacherId, endpoint, file) => {
    const url = `${apiBase}/teacher-documents/upload/${teacherId}/${endpoint}`;
    const fd = new FormData();
    fd.append("file", file);

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

  const handleFileChange = (e, key) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setDocs((s) => ({ ...s, [key]: file }));

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
      photo: null,
      aadhar: null,
      pan: null,
      degree: null,
      certificate: null,
    });

    const toUpload = DOC_TYPES.map((d) => ({ ...d, file: docs[d.key] })).filter(
      (d) => d.file
    );

    const results = [];
    for (const item of toUpload) {
      setDocStatus((s) => ({
        ...s,
        [item.key]: { uploading: true, ok: false, error: null },
      }));

      const r = await uploadSingle(teacherId, item.endpoint, item.file);

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
        `All ${successCount} document(s) uploaded successfully for teacher ${teacherId}.`
      );
      navigate(`/admindashboard/teacher-receipt?teacherId=${teacherId}`);
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
    navigate("/admin/add-teacher");
  };

  const handleClearAll = () => {
    if (window.confirm("Clear all selected documents?")) {
      setDocs({
        photo: null,
        aadhar: null,
        pan: null,
        degree: null,
        certificate: null,
      });
      setDocStatus({
        photo: null,
        aadhar: null,
        pan: null,
        degree: null,
        certificate: null,
      });
      setValidationError("");
    }
  };

  return (
    <div className="ud-container">
      <div className="ud-card">
        <h2>Upload Teacher Documents</h2>

        {prefillId && (
          <div className="ud-info">
            Preparing uploads for teacher id: <strong>{prefillId}</strong>
          </div>
        )}

        <div className="ud-input-block">
          <label>Teacher ID *</label>
          <input
            type="text"
            className="ud-input"
            placeholder="Enter Teacher ID"
            value={teacherId}
            onChange={(e) => {
              setTeacherId(e.target.value);
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
                  accept={d.key === "photo" ? "image/*" : "image/*,.pdf"}
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
                  Teacher ID: {teacherId || "Not entered"}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminTeacherDocumentUpload;
