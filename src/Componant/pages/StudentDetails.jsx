import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SessionContext } from "./SessionContext";
import "./AdminViewStudentDetails.css";

const StudentDetails = ({ apiBase = "http://localhost:8080" }) => {
  const location = useLocation();
  const navigate = useNavigate();

  /* ---------------- CONTEXT SESSION ---------------- */
  const { selectedSession } = useContext(SessionContext);
  const [autoSessionId, setAutoSessionId] = useState(null);

  /* ---------------- FINAL SESSION ID ---------------- */
  const sessionId =
    selectedSession?.id ||
    autoSessionId ||
    localStorage.getItem("sessionId");

  /* ---------------- STUDENT ---------------- */
  const studentId =
    location.state?.studentId || localStorage.getItem("userId");

  /* ---------------- STATE ---------------- */
  const [user, setUser] = useState(null);
  const [className, setClassName] = useState("");
  const [studentPhotoUrl, setStudentPhotoUrl] = useState("");

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingClass, setLoadingClass] = useState(false);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [error, setError] = useState(null);

  /* ---------------- AUTO SELECT ACTIVE SESSION ---------------- */
  useEffect(() => {
    if (selectedSession?.id) return;

    const fetchActiveSession = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/sessions/getAll");
        const sessions = await res.json();

        const active =
          sessions.find((s) => s.active === true) ||
          sessions.find((s) => s.isActive === true);

        if (active) {
          const sid = active.sessionId || active.id;
          setAutoSessionId(sid);
          localStorage.setItem("sessionId", sid);
        }
      } catch (err) {
        console.error("Session auto-pick failed", err);
      }
    };

    fetchActiveSession();
  }, [selectedSession]);

  /* ---------------- FETCH CLASS ---------------- */
  const fetchClassName = async (classId) => {
    if (!classId || !sessionId) {
      setClassName("Not Assigned");
      return;
    }

    setLoadingClass(true);
    try {
<<<<<<< HEAD
      const res = await fetch(`${apiBase}/api/classes/getAll`);
      if (res.ok) {
        const classes = await res.json();
        const classObj = Array.isArray(classes)
          ? classes.find(
              (c) =>
                c.classId === classId ||
                c.id === classId ||
                String(c.classId) === String(classId) ||
                String(c.id) === String(classId),
            )
          : null;

        if (classObj) {
          setClassName(
            classObj.className || classObj.name || `Class ${classId}`,
          );
        } else {
          setClassName(`Class ${classId}`);
        }
      } else {
        setClassName(`Class ${classId}`);
      }
    } catch (err) {
      console.error("Failed to fetch class:", err);
=======
      const res = await fetch(`${apiBase}/api/classes/${sessionId}/getAll`);
      const classes = res.ok ? await res.json() : [];
      const found = classes.find(
        (c) =>
          String(c.id) === String(classId) ||
          String(c.classId) === String(classId)
      );
      setClassName(found?.className || found?.name || `Class ${classId}`);
    } catch {
>>>>>>> 1e769ba7396e6710c950499340f35a320a83a60a
      setClassName(`Class ${classId}`);
    } finally {
      setLoadingClass(false);
    }
  };

  /* ---------------- FETCH PHOTO ---------------- */
  const fetchStudentPhoto = async (uid) => {
    if (!uid) return;
    setLoadingPhoto(true);

    try {
<<<<<<< HEAD
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
            },
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
                  doc.endpoint.toUpperCase().includes("PROFILE"))),
          );

          if (photoDoc && photoDoc.url) {
            setStudentPhotoUrl(photoDoc.url);
          } else if (photoDoc) {
            // Try to download the photo
            try {
              const photoResponse = await fetch(
                `${apiBase}/api/documents/download/${userId}/${
                  photoDoc.type || photoDoc.endpoint
                }`,
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
=======
      const types = ["PHOTO", "STUDENT_PHOTO", "PROFILE_PHOTO", "IMAGE"];
      for (const type of types) {
        const res = await fetch(
          `${apiBase}/api/documents/download/${uid}/${type}`
        );
        if (res.ok) {
          const blob = await res.blob();
          setStudentPhotoUrl(URL.createObjectURL(blob));
          break;
        }
      }
    } catch {
      // ignore
>>>>>>> 1e769ba7396e6710c950499340f35a320a83a60a
    } finally {
      setLoadingPhoto(false);
    }
  };

  /* ---------------- CLEANUP PHOTO ---------------- */
  useEffect(() => {
    return () => {
      if (studentPhotoUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(studentPhotoUrl);
      }
    };
  }, [studentPhotoUrl]);

  /* ---------------- FETCH USER ---------------- */
  useEffect(() => {
    if (!studentId || !sessionId) return;

    const fetchUser = async () => {
      try {
<<<<<<< HEAD
        const res = await fetch(`${apiBase}/api/users/${1}/${studentId}`);

        if (res.status === 404) {
          throw new Error("Student not found");
        }

        if (!res.ok) {
          throw new Error(`Failed to load student (${res.status})`);
        }
=======
        const res = await fetch(
          `${apiBase}/api/users/${sessionId}/${studentId}`
        );
        if (!res.ok) throw new Error("Student not found");
>>>>>>> 1e769ba7396e6710c950499340f35a320a83a60a

        const data = await res.json();
        setUser(data);
        fetchClassName(data.studentClassId || data.studentClass);
        fetchStudentPhoto(studentId);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [studentId, sessionId, apiBase]);

<<<<<<< HEAD
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
        type,
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
=======
  /* ---------------- GUARDS ---------------- */
  if (!studentId) return <p style={{ padding: 20 }}>No student selected.</p>;
  if (!sessionId) return <p style={{ padding: 20 }}>Loading session…</p>;
>>>>>>> 1e769ba7396e6710c950499340f35a320a83a60a

  /* ---------------- UI ---------------- */
  return (
    <div className="vsd-container">
      <div className="vsd-actions">
        <button className="btn-ghost" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="vsd-card">
        {loadingUser ? (
          <p>Loading student details…</p>
        ) : error ? (
          <p>❌ {error}</p>
        ) : (
          <>
            {/* HEADER */}
            <div className="vsd-header-section">
              <div className="vsd-photo-container">
                {loadingPhoto ? (
                  <div className="vsd-photo-loading" />
                ) : studentPhotoUrl ? (
                  <img
                    src={studentPhotoUrl}
                    alt="student"
                    className="vsd-photo-img"
                  />
                ) : (
                  <div className="vsd-photo-placeholder">
                    {(user.name || "?")[0]}
                  </div>
                )}
              </div>

              <div className="vsd-header-info">
                <h1>{user.name}</h1>
                <div className="vsd-header-grid">
                  <div><b>Admission No:</b> {user.admissionNo || "-"}</div>
                  <div><b>Student ID:</b> {studentId}</div>
                  <div><b>Class:</b> {loadingClass ? "Loading..." : className}</div>
                  <div><b>Admission Date:</b> {user.admissionDate || "-"}</div>
                  <div><b>Phone:</b> {user.studentPhone || "-"}</div>
                  <div><b>Email:</b> {user.email || "-"}</div>
                </div>
              </div>
            </div>

            {/* DETAILS */}
            <div className="vsd-content-grid">
              <div className="vsd-info-section">
                <h2 className="vsd-section-title">👤 Personal Information</h2>
                <div className="vsd-info-grid">
                  <div>DOB: {user.dob || "-"}</div>
                  <div>Gender: {user.gender || "-"}</div>
                  <div>Aadhar: {user.studentAadharNo || "-"}</div>
                  <div>Caste: {user.caste || "-"}</div>
                  <div>Sub Caste: {user.subCaste || "-"}</div>
                  <div>Religion: {user.religion || "-"}</div>
                </div>
              </div>

              <div className="vsd-info-section">
                <h2 className="vsd-section-title">👨‍👩‍👧‍👦 Parent Information</h2>
                <div className="vsd-info-grid">
                  <div>Father: {user.fatherName || "-"}</div>
                  <div>Mother: {user.motherName || "-"}</div>
                  <div>Parent Phone: {user.parentPhone || "-"}</div>
                  <div>Parent Aadhar: {user.parentAadharNo || "-"}</div>
                </div>
              </div>

              <div className="vsd-info-section">
                <h2 className="vsd-section-title">📋 Additional Details</h2>
                <div className="vsd-info-grid">
                  <div>Address: {user.address || "-"}</div>
                  <div>APAAR ID: {user.apaarId || "-"}</div>
                  <div>PAN: {user.panNo || "-"}</div>
                  <div>RTE: {user.rte || "-"}</div>
                  <div>SSSM ID: {user.ssmId || "-"}</div>
                  <div>Passout Class: {user.passoutClass || "-"}</div>
                  <div>TC No: {user.tcNumber || "-"}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDetails;
