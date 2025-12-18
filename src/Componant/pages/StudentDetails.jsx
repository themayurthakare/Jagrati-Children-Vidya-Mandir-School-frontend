import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AdminViewStudentDetails.css";

// import "./StudentDetails.css"; // You'll need to rename or copy the CSS

const StudentDetails = ({ apiBase = "http://localhost:8080" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const studentId = location.state?.studentId || localStorage.getItem("userId");

  const [user, setUser] = useState(null);
  const [docs, setDocs] = useState([]);
  const [className, setClassName] = useState("");
  const [studentPhotoUrl, setStudentPhotoUrl] = useState("");
  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingClass, setLoadingClass] = useState(false);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [error, setError] = useState(null);

  // Fetch class name by ID
  const fetchClassName = async (classId) => {
    if (!classId) {
      setClassName("Not Assigned");
      return;
    }

    setLoadingClass(true);
    try {
      const res = await fetch(`${apiBase}/api/classes/getAll`);
      if (res.ok) {
        const classes = await res.json();
        const classObj = Array.isArray(classes)
          ? classes.find(
              (c) =>
                c.classId === classId ||
                c.id === classId ||
                String(c.classId) === String(classId) ||
                String(c.id) === String(classId)
            )
          : null;

        if (classObj) {
          setClassName(
            classObj.className || classObj.name || `Class ${classId}`
          );
        } else {
          setClassName(`Class ${classId}`);
        }
      } else {
        setClassName(`Class ${classId}`);
      }
    } catch (err) {
      console.error("Failed to fetch class:", err);
      setClassName(`Class ${classId}`);
    } finally {
      setLoadingClass(false);
    }
  };

  // Fetch student photo using the download endpoint
  const fetchStudentPhoto = async (userId) => {
    if (!userId) return;

    setLoadingPhoto(true);
    try {
      // Try different possible photo document types
      const possibleTypes = [
        "PHOTO",
        "STUDENT_PHOTO",
        "PROFILE_PHOTO",
        "IMAGE",
      ];

      let photoFound = false;

      for (const type of possibleTypes) {
        try {
          const response = await fetch(
            `${apiBase}/api/documents/download/${userId}/${type}`,
            {
              method: "GET",
            }
          );

          if (response.ok) {
            // Create object URL from blob
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            setStudentPhotoUrl(objectUrl);
            photoFound = true;
            break;
          }
        } catch (err) {
          console.log(`Photo type ${type} not found, trying next...`);
          continue;
        }
      }

      if (!photoFound) {
        // Try to get photo from documents list
        const docsRes = await fetch(`${apiBase}/api/documents/${userId}`);
        if (docsRes.ok) {
          const documents = await docsRes.json();
          const photoDoc = documents.find(
            (doc) =>
              (doc.type &&
                (doc.type.toUpperCase().includes("PHOTO") ||
                  doc.type.toUpperCase().includes("IMAGE") ||
                  doc.type.toUpperCase().includes("PROFILE"))) ||
              (doc.endpoint &&
                (doc.endpoint.toUpperCase().includes("PHOTO") ||
                  doc.endpoint.toUpperCase().includes("IMAGE") ||
                  doc.endpoint.toUpperCase().includes("PROFILE")))
          );

          if (photoDoc && photoDoc.url) {
            setStudentPhotoUrl(photoDoc.url);
          } else if (photoDoc) {
            // Try to download the photo
            try {
              const photoResponse = await fetch(
                `${apiBase}/api/documents/download/${userId}/${
                  photoDoc.type || photoDoc.endpoint
                }`
              );
              if (photoResponse.ok) {
                const blob = await photoResponse.blob();
                const objectUrl = URL.createObjectURL(blob);
                setStudentPhotoUrl(objectUrl);
              }
            } catch (err) {
              console.log("Could not download photo from document:", err);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching student photo:", err);
    } finally {
      setLoadingPhoto(false);
    }
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (studentPhotoUrl && studentPhotoUrl.startsWith("blob:")) {
        URL.revokeObjectURL(studentPhotoUrl);
      }
    };
  }, [studentPhotoUrl]);

  useEffect(() => {
    if (!studentId) return;

    // Fetch user
    const fetchUser = async () => {
      setLoadingUser(true);
      setError(null);
      try {
        const res = await fetch(`${apiBase}/api/users/${studentId}`);

        if (res.status === 404) {
          throw new Error("Student not found");
        }

        if (!res.ok) {
          throw new Error(`Failed to load student (${res.status})`);
        }

        const data = await res.json();
        setUser(data);

        // Fetch class name after getting user data
        if (data.studentClassId || data.studentClass) {
          fetchClassName(data.studentClassId || data.studentClass);
        }

        // Fetch student photo
        fetchStudentPhoto(studentId);
      } catch (err) {
        setError(err.message || "Failed to load student details");
      } finally {
        setLoadingUser(false);
      }
    };

    // Fetch docs
    const fetchDocs = async () => {
      setLoadingDocs(true);
      try {
        const res = await fetch(`${apiBase}/api/documents/${studentId}`);

        if (res.status === 404) {
          setDocs([]);
          return;
        }

        if (!res.ok) {
          console.warn(`Failed to load documents (${res.status})`);
          setDocs([]);
          return;
        }

        const arr = await res.json();
        setDocs(Array.isArray(arr) ? arr : []);
      } catch (err) {
        console.warn("Documents fetch:", err.message);
        setDocs([]);
      } finally {
        setLoadingDocs(false);
      }
    };

    fetchUser();
    fetchDocs();
  }, [studentId, apiBase]);

  // Download document (kept for user view access)
  const handleDownload = async (doc) => {
    try {
      const userId = studentId;
      const type = doc.type || doc.endpoint || "";

      if (!type) {
        alert("Cannot download: Document type not specified");
        return;
      }

      const downloadUrl = `${apiBase}/api/documents/download/${userId}/${encodeURIComponent(
        type
      )}`;
      window.open(downloadUrl, "_blank");
    } catch (err) {
      console.error("Download error:", err);
      alert("Download failed: " + (err.message || ""));
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (!studentId) {
    return (
      <div className="vsd-container">
        <div className="vsd-card vsd-error-card">
          <h2>⚠️ No Student Selected</h2>
          <p>Please select a student to view details.</p>
          <button className="btn-primary" onClick={handleBack}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vsd-container">
      {/* Simplified header - only back button */}
      <div className="vsd-actions">
        <button className="btn-ghost" onClick={handleBack}>
          ← Back
        </button>
      </div>

      <div className="vsd-card" id="printable-content">
        {loadingUser ? (
          <div className="vsd-loading">
            <div className="loading-spinner"></div>
            <p>Loading student details...</p>
          </div>
        ) : error ? (
          <div className="vsd-error">
            <h3>❌ Error Loading Student</h3>
            <p>{error}</p>
            <div className="error-actions">
              <button className="btn-ghost" onClick={handleBack}>
                Go Back
              </button>
            </div>
          </div>
        ) : !user ? (
          <div className="vsd-empty">
            <h3>Student Not Found</h3>
            <p>The student with ID {studentId} could not be found.</p>
            <button className="btn-primary" onClick={handleBack}>
              Go Back
            </button>
          </div>
        ) : (
          <>
            {/* Header Section with Photo and Basic Info */}
            <div className="vsd-header-section">
              <div className="vsd-photo-container">
                {loadingPhoto ? (
                  <div className="vsd-photo-loading">
                    <div className="loading-spinner-small"></div>
                  </div>
                ) : studentPhotoUrl ? (
                  <img
                    src={studentPhotoUrl}
                    alt="student"
                    className="vsd-photo-img"
                  />
                ) : (
                  <div className="vsd-photo-placeholder">
                    <span className="vsd-photo-initial">
                      {(user.name || "?").slice(0, 1).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="vsd-header-info">
                <h1 className="vsd-student-name">{user.name || "—"}</h1>
                <div className="vsd-header-grid">
                  <div className="vsd-header-item">
                    <span className="vsd-header-label">Admission No:</span>
                    <span className="vsd-header-value">
                      {user.admissionNo || "—"}
                    </span>
                  </div>
                  <div className="vsd-header-item">
                    <span className="vsd-header-label">Student ID:</span>
                    <span className="vsd-header-value">{studentId}</span>
                  </div>
                  <div className="vsd-header-item">
                    <span className="vsd-header-label">Class:</span>
                    <span className="vsd-header-value">
                      {loadingClass
                        ? "Loading..."
                        : className || "Not Assigned"}
                    </span>
                  </div>
                  <div className="vsd-header-item">
                    <span className="vsd-header-label">Admission Date:</span>
                    <span className="vsd-header-value">
                      {user.admissionDate || "—"}
                    </span>
                  </div>
                  <div className="vsd-header-item">
                    <span className="vsd-header-label">Phone:</span>
                    <span className="vsd-header-value">
                      {user.studentPhone || "—"}
                    </span>
                  </div>
                  <div className="vsd-header-item">
                    <span className="vsd-header-label">Email:</span>
                    <span className="vsd-header-value">
                      {user.email || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="vsd-content-grid">
              {/* Left Column - Personal Information */}
              <div className="vsd-info-section">
                <h2 className="vsd-section-title">
                  <span className="vsd-title-icon">👤</span>
                  Personal Information
                </h2>
                <div className="vsd-info-grid">
                  <div className="vsd-info-item">
                    <span className="vsd-info-label">Date of Birth</span>
                    <span className="vsd-info-value">{user.dob || "-"}</span>
                  </div>
                  <div className="vsd-info-item">
                    <span className="vsd-info-label">Gender</span>
                    <span className="vsd-info-value">{user.gender || "-"}</span>
                  </div>
                  <div className="vsd-info-item">
                    <span className="vsd-info-label">Student Aadhar</span>
                    <span className="vsd-info-value">
                      {user.studentAadharNo || "-"}
                    </span>
                  </div>
                  <div className="vsd-info-item">
                    <span className="vsd-info-label">RTE Status</span>
                    <span className="vsd-info-value">{user.rte || "-"}</span>
                  </div>
                  <div className="vsd-info-item">
                    <span className="vsd-info-label">SSM ID</span>
                    <span className="vsd-info-value">{user.ssmId || "-"}</span>
                  </div>
                  <div className="vsd-info-item">
                    <span className="vsd-info-label">Passout Class</span>
                    <span className="vsd-info-value">
                      {user.passoutClass || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle Column - Parent Information */}
              <div className="vsd-info-section">
                <h2 className="vsd-section-title">
                  <span className="vsd-title-icon">👨‍👩‍👧‍👦</span>
                  Parent Information
                </h2>
                <div className="vsd-info-grid">
                  <div className="vsd-info-item">
                    <span className="vsd-info-label">Father's Name</span>
                    <span className="vsd-info-value">
                      {user.fatherName || "-"}
                    </span>
                  </div>
                  <div className="vsd-info-item">
                    <span className="vsd-info-label">Mother's Name</span>
                    <span className="vsd-info-value">
                      {user.motherName || "-"}
                    </span>
                  </div>
                  <div className="vsd-info-item">
                    <span className="vsd-info-label">Parent Phone</span>
                    <span className="vsd-info-value">
                      {user.parentPhone || "-"}
                    </span>
                  </div>
                  <div className="vsd-info-item">
                    <span className="vsd-info-label">Parent Aadhar</span>
                    <span className="vsd-info-value">
                      {user.parentAadharNo || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column - Additional Information */}
              <div className="vsd-info-section">
                <h2 className="vsd-section-title">
                  <span className="vsd-title-icon">🏠</span>
                  Address & Other Details
                </h2>
                <div className="vsd-info-grid">
                  <div className="vsd-info-item vsd-address-item">
                    <span className="vsd-info-label">Address</span>
                    <span className="vsd-info-value">
                      {user.address || "-"}
                    </span>
                  </div>
                  <div className="vsd-info-item">
                    <span className="vsd-info-label">TC Number</span>
                    <span className="vsd-info-value">
                      {user.tcNumber || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="vsd-documents-section">
              <h2 className="vsd-section-title">
                <span className="vsd-title-icon">📄</span>
                Uploaded Documents
                {loadingDocs && (
                  <span className="vsd-loading-text"> (loading...)</span>
                )}
              </h2>

              {loadingDocs ? (
                <div className="vsd-loading-small">
                  <div className="loading-spinner-small"></div>
                  <p>Loading documents...</p>
                </div>
              ) : !docs || docs.length === 0 ? (
                <div className="vsd-empty-docs">
                  <p>No documents uploaded for this student.</p>
                </div>
              ) : (
                <div className="vsd-documents-grid">
                  {docs.map((d) => (
                    <div
                      className="vsd-document-card"
                      key={d.documentId ?? d.id ?? d.fileName}
                    >
                      <div className="vsd-document-icon">📎</div>
                      <div className="vsd-document-content">
                        <div className="vsd-document-type">
                          {d.type || d.endpoint || "Document"}
                        </div>
                        <div className="vsd-document-name">
                          {d.fileName || d.originalName || "-"}
                        </div>
                        <div className="vsd-document-time">
                          {d.uploadedAt
                            ? new Date(d.uploadedAt).toLocaleDateString()
                            : ""}
                        </div>
                      </div>
                      <div className="vsd-document-actions">
                        {d.url ? (
                          <a
                            className="vsd-doc-btn"
                            href={d.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View
                          </a>
                        ) : (
                          <button
                            className="vsd-doc-btn"
                            onClick={() => handleDownload(d)}
                            title={`Download ${
                              d.type || d.endpoint || "document"
                            }`}
                          >
                            Download
                          </button>
                        )}
                      </div>
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

export default StudentDetails;
