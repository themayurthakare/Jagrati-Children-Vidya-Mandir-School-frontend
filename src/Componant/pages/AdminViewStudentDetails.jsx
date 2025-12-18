import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AdminViewStudentDetails.css";

const AdminViewStudentDetails = ({ apiBase = "http://localhost:8080" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const studentId = location.state?.studentId ?? null;

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

  // Download document
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

  const printPage = () => {
    const printWindow = window.open("", "_blank", "width=900,height=650");

    // Generate photo HTML for print
    let photoHtml = "";
    if (studentPhotoUrl) {
      photoHtml = `<img src="${studentPhotoUrl}" alt="Student Photo" style="max-width: 150px; max-height: 150px; border: 1px solid #000;">`;
    } else {
      photoHtml = `<div style="width: 150px; height: 150px; border: 1px solid #000; display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: bold;">${
        user?.name ? user.name.charAt(0).toUpperCase() : "?"
      }</div>`;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Student Details - ${user?.name || "Student"}</title>
        <style>
          @page {
            margin: 5mm;
          }
          body {
            font-family: 'Times New Roman', serif;
            margin: 0;
            padding: 0;
            color: #000;
            background: white;
            font-size: 12pt;
            line-height: 1.5;
          }
          .print-container {
            max-width: 210mm;
            margin: 0 auto;
          }
          
          /* School Header */
          .school-header {
            text-align: center;
            margin-bottom: 20px;
          }
          .school-name {
            font-size: 24pt;
            font-weight: bold;
            margin: 0 0 5px 0;
            text-transform: uppercase;
          }
          .school-address {
            font-size: 11pt;
            margin: 0 0 10px 0;
            color: #666;
          }
          .print-title {
            font-size: 18pt;
            margin: 15px 0;
            text-decoration: underline;
            font-weight: bold;
          }
          
          /* Student Header with Photo */
          .student-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #000;
          }
          .student-photo-section {
            text-align: center;
          }
          .photo-label {
            font-size: 10pt;
            margin-top: 5px;
            color: #666;
          }
          .student-info-section {
            flex: 1;
            margin-left: 30px;
          }
          .basic-info-row {
            display: flex;
            margin-bottom: 10px;
          }
          .basic-info-label {
            width: 150px;
            font-weight: bold;
          }
          .basic-info-value {
            flex: 1;
          }
          
          /* Details Section */
          .details-section {
            margin: 20px 0;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 14pt;
            font-weight: bold;
            margin: 15px 0 10px 0;
            padding-bottom: 5px;
            border-bottom: 2px solid #000;
          }
          
          /* Details Table */
          .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
          }
          .details-table td {
            padding: 8px 10px;
            border: 1px solid #000;
            vertical-align: top;
          }
          .field-label {
            font-weight: bold;
            width: 35%;
            background: #f5f5f5;
          }
          .field-value {
            width: 65%;
          }
          
          /* Address Section */
          .address-section {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #000;
            background: #f9f9f9;
          }
          .address-title {
            font-weight: bold;
            margin-bottom: 10px;
          }
          .address-content {
            white-space: pre-line;
            min-height: 60px;
          }
          
          /* Documents Section */
          .documents-section {
            margin-top: 25px;
           /*  page-break-before: always;*/
          }
          .documents-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
          }
          .documents-table th,
          .documents-table td {
            padding: 8px;
            border: 1px solid #000;
            text-align: left;
          }
          .documents-table th {
            background: #f5f5f5;
            font-weight: bold;
          }
          
          /* Footer */
          .print-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #000;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .signature-section {
            text-align: center;
            width: 250px;
          }
          .signature-line {
            width: 200px;
            height: 1px;
            border-bottom: 1px solid #000;
            margin: 0 auto 5px;
          }
          .print-date {
            font-size: 10pt;
            color: #666;
            text-align: right;
          }
          
         @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .no-print { display: none; } .print-container { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="print-container">
          <!-- School Header -->
          <div class="school-header">
            <h1 class="school-name">JAGRATI CHILDREN VIDHYA MANDIR</h1>
            <p class="school-address">Official Student Record Document</p>
            <h2 class="print-title">STUDENT DETAILS</h2>
          </div>
          
          <!-- Student Header with Photo -->
          <div class="student-header">
            <div class="student-photo-section">
              ${photoHtml}
              <div class="photo-label">Student Photo</div>
            </div>
            <div class="student-info-section">
              <div class="basic-info-row">
                <div class="basic-info-label">Student Name:</div>
                <div class="basic-info-value"><strong>${
                  user?.name || "—"
                }</strong></div>
              </div>
              <div class="basic-info-row">
                <div class="basic-info-label">Admission No:</div>
                <div class="basic-info-value">${user?.admissionNo || "—"}</div>
              </div>
              <div class="basic-info-row">
                <div class="basic-info-label">Student ID:</div>
                <div class="basic-info-value">${studentId}</div>
              </div>
              <div class="basic-info-row">
                <div class="basic-info-label">Class:</div>
                <div class="basic-info-value">${
                  className || "Not Assigned"
                }</div>
              </div>
              <div class="basic-info-row">
                <div class="basic-info-label">Admission Date:</div>
                <div class="basic-info-value">${
                  user?.admissionDate || "—"
                }</div>
              </div>
              <div class="basic-info-row">
                <div class="basic-info-label">Date of Birth:</div>
                <div class="basic-info-value">${user?.dob || "—"}</div>
              </div>
            </div>
          </div>
          
          <!-- Student Details Table -->
          <div class="details-section">
            <h3 class="section-title">Student Information</h3>
            <table class="details-table">
              <tr>
                <td class="field-label">Gender</td>
                <td class="field-value">${user?.gender || "—"}</td>
              </tr>
              <tr>
                <td class="field-label">Student Phone</td>
                <td class="field-value">${user?.studentPhone || "—"}</td>
              </tr>
              <tr>
                <td class="field-label">Email</td>
                <td class="field-value">${user?.email || "—"}</td>
              </tr>
              <tr>
                <td class="field-label">Student Aadhar No</td>
                <td class="field-value">${user?.studentAadharNo || "—"}</td>
              </tr>
            
              <tr>
                <td class="field-label">SSSM ID</td>
                <td class="field-value">${user?.ssmId || "—"}</td>
              </tr>
              <tr>
                <td class="field-label">Passout Class</td>
                <td class="field-value">${user?.passoutClass || "—"}</td>
              </tr>
              <tr>
                <td class="field-label">TC Number</td>
                <td class="field-value">${user?.tcNumber || "—"}</td>
              </tr>
            </table>
          </div>
          
          <!-- Parent Information -->
          <div class="details-section">
            <h3 class="section-title">Parent/Guardian Information</h3>
            <table class="details-table">
              <tr>
                <td class="field-label">Father's Name</td>
                <td class="field-value">${user?.fatherName || "—"}</td>
              </tr>
              <tr>
                <td class="field-label">Mother's Name</td>
                <td class="field-value">${user?.motherName || "—"}</td>
              </tr>
              <tr>
                <td class="field-label">Parent Phone</td>
                <td class="field-value">${user?.parentPhone || "—"}</td>
              </tr>
              <tr>
                <td class="field-label">Parent Aadhar No</td>
                <td class="field-value">${user?.parentAadharNo || "—"}</td>
              </tr>
            </table>
          </div>
          
          <!-- Address Information -->
          <div class="address-section">
            <div class="address-title">Address:</div>
            <div class="address-content">${user?.address || "—"}</div>
          </div>
          
          <!-- Documents Information -->
          ${
            docs && docs.length > 0
              ? `
          <div class="documents-section">
            <h3 class="section-title">Uploaded Documents</h3>
            <table class="documents-table">
              <thead>
                <tr>
                  <th width="30%">Document Type</th>
                  <th width="50%">File Name</th>
                  <th width="20%">Upload Date</th>
                </tr>
              </thead>
              <tbody>
                ${docs
                  .map(
                    (doc) => `
                  <tr>
                    <td>${doc.type || doc.endpoint || "Document"}</td>
                    <td>${doc.fileName || doc.originalName || "-"}</td>
                    <td>${
                      doc.uploadedAt
                        ? new Date(doc.uploadedAt).toLocaleDateString()
                        : "-"
                    }</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          `
              : ""
          }
          
          <!-- Footer -->
          <div class="print-footer">
            <div class="print-date">
              <strong>Printed on:</strong> ${new Date().toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </div>
            <div class="signature-section">
              <div class="signature-line"></div>
              <div>Authorized Signature</div>
              <div>(School Authority)</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleUpdate = () => {
    if (!studentId) return;
    navigate("/admindashboard/update-student", {
      state: { studentId },
    });
  };

  const handleBackToList = () => {
    navigate("/admindashboard/view-students");
  };

  if (!studentId) {
    return (
      <div className="vsd-container">
        <div className="vsd-card vsd-error-card">
          <h2>⚠️ No Student Selected</h2>
          <p>Please select a student from the student list to view details.</p>
          <button className="btn-primary" onClick={handleBackToList}>
            Go to Student List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vsd-container">
      <div className="vsd-actions">
        <button className="btn-ghost" onClick={handleBackToList}>
          ← Back to Student List
        </button>

        <div className="vsd-action-buttons">
          <button
            className="btn-update"
            onClick={handleUpdate}
            disabled={loadingUser || !user}
          >
            Update Student
          </button>

          <button className="btn-print" onClick={printPage} disabled={!user}>
            🖨️ Print Details
          </button>
        </div>
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
              <button className="btn-ghost" onClick={handleBackToList}>
                Back to List
              </button>
              <button
                className="btn-primary"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        ) : !user ? (
          <div className="vsd-empty">
            <h3>Student Not Found</h3>
            <p>The student with ID {studentId} could not be found.</p>
            <button className="btn-primary" onClick={handleBackToList}>
              Back to Student List
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
                    <span className="vsd-info-label">SSSM ID</span>
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

export default AdminViewStudentDetails;
