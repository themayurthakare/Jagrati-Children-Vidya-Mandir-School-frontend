import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AdminViewTeacherDetails.css";

const COViewTeacherDetails = ({ apiBase = "http://localhost:8080" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const teacherId = location.state?.teacherId ?? null;

  const [teacher, setTeacher] = useState(null);
  const [docs, setDocs] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loadingTeacher, setLoadingTeacher] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [error, setError] = useState(null);

  // Back to teacher list
  const handleBack = () => {
    navigate("/computeroperator/view-teachers");
  };

  // Go to update teacher page (NO URL PARAM)
  const handleUpdate = () => {
    if (!teacherId) return;

    navigate("/computeroperator/update-teacher", {
      state: { teacherId },
    });
  };

  // Print current page -> navigate to receipt page with query param
  const handlePrint = () => {
    if (!teacherId || !teacher) return;

    navigate(`/computeroperator/teacher-receipt?teacherId=${teacherId}`);
  };

  // Load teacher + docs + classes
  useEffect(() => {
    if (!teacherId) return;

    const fetchTeacher = async () => {
      setLoadingTeacher(true);
      setError(null);
      try {
        const res = await fetch(`${apiBase}/api/teachers/${teacherId}`);
        if (res.status === 404) throw new Error("Teacher not found");
        if (!res.ok) throw new Error(`Failed to load teacher (${res.status})`);
        const data = await res.json();
        setTeacher(data);
      } catch (err) {
        setError(err.message || "Failed to load teacher");
      } finally {
        setLoadingTeacher(false);
      }
    };

    const fetchDocs = async () => {
      setLoadingDocs(true);
      try {
        const res = await fetch(
          `${apiBase}/api/teacher-documents/${teacherId}`
        );
        if (!res.ok) {
          setDocs([]);
          return;
        }
        const arr = await res.json();
        setDocs(Array.isArray(arr) ? arr : []);
      } catch {
        setDocs([]);
      } finally {
        setLoadingDocs(false);
      }
    };

    const fetchClasses = async () => {
      setLoadingClasses(true);
      try {
        const res = await fetch(`${apiBase}/api/teachers/${teacherId}/classes`);
        if (!res.ok) {
          setClasses([]);
          return;
        }
        const arr = await res.json();
        const list = Array.isArray(arr)
          ? arr.map(
              (c) => c.className || c.name || `Class ${c.classId || c.id}`
            )
          : [];
        setClasses(list);
      } catch {
        setClasses([]);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchTeacher();
    fetchDocs();
    fetchClasses();
  }, [teacherId, apiBase]);

  // Download teacher document (any type, including PHOTO)
  const handleDownload = async (doc) => {
    const type = doc.type || doc.endpoint || "";
    if (!type) {
      alert("Cannot download: Document type not specified");
      return;
    }
    const url = `${apiBase}/api/teacher-documents/download/${teacherId}/${encodeURIComponent(
      type
    )}`;
    window.open(url, "_blank");
  };

  if (!teacherId) {
    return (
      <div className="td-container">
        <div className="td-card td-error-card">
          <h2>No Teacher Selected</h2>
          <p>Please open this page from the teacher list.</p>
          <button className="btn-update" onClick={handleBack}>
            Go to Teacher List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="td-container">
      {/* Top actions bar */}
      <div className="td-actions">
        <button className="btn-ghost" onClick={handleBack}>
          ← Back to Teacher List
        </button>

        <div className="td-actions-right">
          <button
            className="btn-update"
            onClick={handleUpdate}
            disabled={!teacher}
          >
            ✏️ Update
          </button>
          <button
            className="btn-print"
            onClick={handlePrint}
            disabled={!teacher}
          >
            🖨 Print Details
          </button>
        </div>
      </div>

      <div className="td-card">
        {loadingTeacher ? (
          <div className="td-loading">
            <div className="loading-spinner"></div>
            <p>Loading teacher details...</p>
          </div>
        ) : error ? (
          <div className="td-error">
            <h3>Error Loading Teacher</h3>
            <p>{error}</p>
            <button className="btn-update" onClick={handleBack}>
              Back to List
            </button>
          </div>
        ) : !teacher ? (
          <div className="td-empty">
            <h3>Teacher Not Found</h3>
            <button className="btn-update" onClick={handleBack}>
              Back to List
            </button>
          </div>
        ) : (
          <>
            {/* HEADER: photo + name + header grid (like student card) */}
            <div className="td-header-section">
              {/* Photo from API or initial */}
              <div className="td-photo-container">
                {teacher.photoAvailable ? (
                  <img
                    className="td-photo-img"
                    src={`${apiBase}/api/teacher-documents/download/${teacherId}/PHOTO`}
                    alt={teacher.name || "Teacher"}
                  />
                ) : (
                  <div className="td-photo-placeholder">
                    <span className="td-photo-initial">
                      {(teacher.name || "-").charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Name and quick info */}
              <div className="td-header-info">
                <h1 className="td-name">{teacher.name || "—"}</h1>

                <div className="td-header-grid">
                  <div className="td-header-item">
                    <span className="td-header-label">Teacher ID</span>
                    <span className="td-header-value">{teacherId}</span>
                  </div>
                  <div className="td-header-item">
                    <span className="td-header-label">Email</span>
                    <span className="td-header-value">
                      {teacher.email || "-"}
                    </span>
                  </div>
                  <div className="td-header-item">
                    <span className="td-header-label">Password</span>
                    <span className="td-header-value">
                      {teacher.password || "-"}
                    </span>
                  </div>
                  <div className="td-header-item">
                    <span className="td-header-label">Phone</span>
                    <span className="td-header-value">
                      {teacher.phone || "-"}
                    </span>
                  </div>
                  <div className="td-header-item">
                    <span className="td-header-label">Experience</span>
                    <span className="td-header-value">
                      {teacher.yearOfExperience
                        ? `${teacher.yearOfExperience} years`
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* MAIN CONTENT GRID: Professional / Personal */}
            <div className="td-info-grid">
              <div className="td-info-section">
                <h2 className="td-section-title">Professional</h2>
                <div className="td-info-grid-inner">
                  <div className="td-info-item">
                    <span className="td-info-label">Qualification</span>
                    <span className="td-info-value">
                      {teacher.educationalDetails || "-"}
                    </span>
                  </div>
                  <div className="td-info-item">
                    <span className="td-info-label">Assigned Classes</span>
                    <span className="td-info-value">
                      {loadingClasses
                        ? "Loading..."
                        : classes.length
                        ? classes.join(", ")
                        : "Not Assigned"}
                    </span>
                  </div>
                  <div className="td-info-item">
                    <span className="td-info-label">Date of Birth</span>
                    <span className="td-info-value">
                      {teacher.dateOfBirth
                        ? new Date(teacher.dateOfBirth).toLocaleDateString(
                            "en-IN"
                          )
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="td-info-section">
                <h2 className="td-section-title">Personal</h2>
                <div className="td-info-grid-inner">
                  <div className="td-info-item">
                    <span className="td-info-label">Aadhaar</span>
                    <span className="td-info-value">
                      {teacher.aadharNo || "-"}
                    </span>
                  </div>
                  <div className="td-info-item td-address-item">
                    <span className="td-info-label">Address</span>
                    <span className="td-info-value">
                      {teacher.address || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* DOCUMENTS */}
            <div className="td-docs-section">
              <h2 className="td-section-title">
                Documents{" "}
                {loadingDocs && (
                  <span className="td-loading-text">loading…</span>
                )}
              </h2>

              {loadingDocs ? (
                <div className="td-loading-small">
                  <div className="loading-spinner-small"></div>
                  <p>Loading documents...</p>
                </div>
              ) : !docs.length ? (
                <p className="td-empty-docs">
                  No documents uploaded for this teacher.
                </p>
              ) : (
                <div className="td-docs-grid">
                  {docs.map((d) => (
                    <div
                      className="td-doc-card"
                      key={d.id ?? d.documentId ?? d.filename}
                    >
                      <div className="td-doc-main">
                        <div className="td-doc-type">
                          {d.type?.replace("TEACHER_", "") ||
                            d.endpoint ||
                            "Document"}
                        </div>
                        <div className="td-doc-name">
                          {d.filename || d.fileName || "-"}
                        </div>
                      </div>
                      <button
                        className="td-doc-btn"
                        onClick={() => handleDownload(d)}
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default COViewTeacherDetails;
