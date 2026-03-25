import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import "./AdminTeacherDocumentUpload.css";

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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const AdminTeacherDocumentUpload = ({
  apiBase = "http://localhost:8080/api",
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const prefillId = location.state?.teacherId || searchParams.get("teacherId");
  const [teacherId, setTeacherId] = useState(
    prefillId ? String(prefillId) : "",
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

  const handleCancel = () => {
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
  };
  // ✅ File size formatter
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

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

  // ✅ Updated file change with size validation
  const handleFileChange = (e, key) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      window.alert(
        `File size exceeds 5MB limit.\nSelected file size: ${formatFileSize(
          file.size,
        )}`,
      );
      return;
    }

    setDocs((s) => ({
      ...s,
      [key]: file, // replace old file
    }));

    e.target.value = null;

    setDocStatus((s) => ({
      ...s,
      [key]: null,
    }));

    if (validationError) setValidationError("");
  };

  const handleSaveAll = async (e) => {
    setDocs({
      photo: null,
      aadhar: null,
      pan: null,
      degree: null,
      certificate: null,
    });
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
      (d) => d.file,
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
        `All ${successCount} document(s) uploaded successfully for teacher ${teacherId}.`,
      );
      navigate(`/admindashboard/teacher-receipt?teacherId=${teacherId}`);
    } else {
      const messages = failed.map((f) => `${f.label}: ${f.result.error}`);
      window.alert(
        `Uploaded ${successCount} succeeded, ${failed.length} failed:\n\n${messages.join("\n")}`,
      );
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="ud-container">
      {/* Back Button - Added exactly as you had it */}
      <div className="ud-back-button-container">
        <button onClick={handleBack} className="ud-back-btn">
          ← Back
        </button>
      </div>

      <div className="ud-card">
        <h2>Upload Teacher Documents</h2>

        <div className="ud-input-block">
          <label>Teacher ID *</label>
          <input
            type="text"
            className="ud-input"
            placeholder="Enter Teacher ID"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
          />
        </div>

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
                      <span style={{ fontWeight: "500" }}>
                        {docs[d.key].name}
                      </span>
                      <br />
                      <small style={{ color: "#7f8c8d" }}>
                        Size: {formatFileSize(docs[d.key].size)}
                      </small>
                    </div>
                  ) : (
                    <span className="ud-empty">No file chosen</span>
                  )}
                </div>
              </label>
            ))}
          </div>

          <div className="ud-button-row">
            <button
              type="button"
              onClick={handleCancel}
              className="ud-btn ud-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ud-btn ud-save-btn"
              disabled={uploadingGlobal}
            >
              {uploadingGlobal ? "Uploading..." : "Save (batch)"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminTeacherDocumentUpload;
