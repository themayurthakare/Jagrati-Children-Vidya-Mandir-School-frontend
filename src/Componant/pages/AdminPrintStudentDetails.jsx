import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AdminPrintStudentDetails.css";

/**
 * PrintStudent
 * - reads studentId from location.state.studentId or query param ?studentId=
 * - fetches user details and documents
 * - renders a printable sheet with registration info + list of uploaded documents (with links if provided)
 *
 * Backend expectations:
 * - GET /api/users/{id}  OR /api/users/get/{id}  OR /api/users/getById/{id}
 * - GET /api/documents/{id}  (DocumentController.getDocuments)
 *
 * If your endpoints differ, adjust the `userEndpoints` array or the documents URL.
 */

const AdminPrintStudentDetails = ({ apiBase = "http://localhost:8080" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const prefillId = location.state?.studentId ?? null;

  const [studentId, setStudentId] = useState(
    prefillId ? String(prefillId) : ""
  );
  const [user, setUser] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [className, setClassName] = useState("");
  // Try several possible user endpoints (choose the first that returns 200 + valid JSON)
  const userEndpoints = [
    (id) => `${apiBase}/api/users/${id}`,
    (id) => `${apiBase}/api/users/get/${id}`,
    (id) => `${apiBase}/api/users/getById/${id}`,
    (id) => `${apiBase}/api/users/getUser/${id}`,
  ];

  useEffect(() => {
    // prefill id from query param if not passed in state
    if (!studentId) {
      const q = new URLSearchParams(window.location.search);
      const qId = q.get("studentId");
      if (qId) setStudentId(qId);
    }
  }, []);
  const fetchClassName = async (classId) => {
    if (!classId) {
      setClassName("-");
      return;
    }

    try {
      const res = await fetch(`${apiBase}/api/classes/getAll`);
      if (!res.ok) {
        setClassName(classId);
        return;
      }

      const classes = await res.json();
      const cls = classes.find(
        (c) =>
          String(c.classId) === String(classId) ||
          String(c.id) === String(classId)
      );

      setClassName(cls?.className || cls?.name || classId);
    } catch (err) {
      console.error("Class fetch error", err);
      setClassName(classId);
    }
  };

  const fetchUser = async (id) => {
    for (const getUrl of userEndpoints) {
      try {
        const url = getUrl(id);
        const res = await fetch(url, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) continue;
        const json = await res.json();
        // basic sanity check: must be object with name or admissionNo or userId
        if (json && typeof json === "object") return json;
      } catch (err) {
        // try next
      }
    }
    throw new Error("User not found on known endpoints.");
  };

  const fetchDocs = async (id) => {
    const url = `${apiBase}/api/documents/${id}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      // if 404 or error, return empty array
      return [];
    }
    const json = await res.json();
    return Array.isArray(json) ? json : [];
  };

  const loadAll = async (id) => {
    setLoading(true);
    setError(null);
    setUser(null);
    setDocs([]);
    try {
      const [u, d] = await Promise.all([fetchUser(id), fetchDocs(id)]);
      setUser(u);
      if (u?.studentClassId || u?.studentClass) {
        fetchClassName(u.studentClassId || u.studentClass);
      }
      setDocs(d);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId && /^\d+$/.test(studentId)) {
      loadAll(studentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const onPrint = () => {
    window.print();
  };

  const fmtDate = (iso) => {
    if (!iso) return "-";
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
    try {
      const d = new Date(iso);
      if (isNaN(d)) return iso;
      return d.toISOString().slice(0, 10);
    } catch {
      return iso;
    }
  };

  return (
    <div className="ps-page">
      <div className="ps-header">
        <button className="ps-back" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Student Registration — Print View</h1>
        <div className="ps-actions">
          <input
            type="text"
            placeholder="Enter student id"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="ps-id-input"
          />
          <button
            onClick={() => {
              if (!studentId || !/^\d+$/.test(studentId)) {
                alert("Enter numeric student ID");
                return;
              }
              loadAll(studentId);
            }}
            className="ps-load"
          >
            Load
          </button>

          <button
            onClick={onPrint}
            className="ps-print"
            disabled={!user && docs.length === 0}
          >
            Print
          </button>
        </div>
      </div>

      {loading ? (
        <div className="ps-loading">Loading...</div>
      ) : error ? (
        <div className="ps-error">Error: {error}</div>
      ) : !user ? (
        <div className="ps-empty">
          No student loaded. Enter an ID and click Load.
        </div>
      ) : (
        <div className="ps-sheet" id="print-area">
          {/* Header Row */}
          <div className="ps-sheet-header">
            <div className="ps-school">
              <h2>Jagrati Children Vidya Mandir</h2>
              <div className="ps-sub">Student Registration & Documents</div>
            </div>
            <div className="ps-meta">
              <div>
                <strong>ID:</strong> {user.userId ?? user.id ?? studentId}
              </div>
              <div>
                <strong>Date:</strong> {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Registration details */}
          <section className="ps-section">
            <h3>Registration Details</h3>
            <table className="ps-table">
              <tbody>
                <tr>
                  <td className="ps-label">Name</td>
                  <td>{user.name ?? "-"}</td>
                  <td className="ps-label">Admission No</td>
                  <td>{user.admissionNo ?? "-"}</td>
                </tr>
                <tr>
                  <td className="ps-label">Admission Date</td>
                  <td>{fmtDate(user.admissionDate)}</td>
                  <td className="ps-label">DOB</td>
                  <td>{fmtDate(user.dob)}</td>
                </tr>
                <tr>
                  <td className="ps-label">Class Name</td>
                  <td>{className || "-"}</td>
                  <td className="ps-label">Phone Number</td>
                  <td>{user.studentPhone ?? "-"}</td>
                </tr>
                <tr>
                  <td className="ps-label">Email Id</td>
                  <td>{user.email ?? "-"}</td>
                  <td className="ps-label">Parent Phone</td>
                  <td>{user.parentPhone ?? "-"}</td>
                </tr>
                <tr>
                  <td className="ps-label">Father Name</td>
                  <td>{user.fatherName ?? "-"}</td>
                  <td className="ps-label">Mother Name</td>
                  <td>{user.motherName ?? "-"}</td>
                </tr>
                <tr>
                  <td className="ps-label">Aadhar (Student)</td>
                  <td>{user.studentAadharNo ?? "-"}</td>
                  <td className="ps-label">Aadhar (Parent)</td>
                  <td>{user.parentAadharNo ?? "-"}</td>
                </tr>
                <tr>
                  <td className="ps-label">Address</td>
                  <td colSpan="3">{user.address ?? "-"}</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Documents */}
          <section className="ps-section">
            <h3>Uploaded Documents</h3>

            {!docs || docs.length === 0 ? (
              <div className="ps-empty-docs">
                No documents uploaded for this student.
              </div>
            ) : (
              <table className="ps-doc-table">
                <thead>
                  <tr>
                    <th>Sr No</th>
                    <th>Type</th>
                    <th>Filename / Info</th>
                    <th>Uploaded At</th>
                    <th>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((d, idx) => {
                    // document DTO may have fields: id, type, fileName, url, uploadedAt, createdAt
                    const type = d.type || d.docType || d.documentType || "-";
                    const name = d.fileName || d.filename || d.name || "-";
                    const uploadedAt =
                      d.uploadedAt || d.createdAt || d.timestamp || "-";
                    const url = d.url || d.fileUrl || d.path || null;
                    return (
                      <tr key={d.id ?? idx}>
                        <td>{idx + 1}</td>
                        <td>{type}</td>
                        <td>{name}</td>
                        <td>{fmtDate((uploadedAt || "").toString())}</td>
                        <td>
                          {url ? (
                            <a href={url} target="_blank" rel="noreferrer">
                              Open
                            </a>
                          ) : (
                            <span style={{ color: "#666" }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>

          {/* Footer / Sign */}
          <div className="ps-footer">
            <div className="ps-sign">
              <div>Signature: ____________________</div>
              <div>Date: ____________________</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPrintStudentDetails;
