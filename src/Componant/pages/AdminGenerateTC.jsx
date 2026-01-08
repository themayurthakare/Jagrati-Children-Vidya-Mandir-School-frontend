import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AdminGenerateTC.css";
import logo from "../../media/logo.jpeg";
import { SessionContext } from "./SessionContext";

const AdminGenerateTC = ({ apiBase = "http://localhost:8080" }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { selectedSession } = useContext(SessionContext);
  const sessionId = selectedSession?.id;

  // 🔥 BOTH IDs
  const studentIdFromRoute = location.state?.studentId ?? null;
  const tcIdFromRoute = location.state?.tcId ?? null;

  const [studentId, setStudentId] = useState(
    studentIdFromRoute ? String(studentIdFromRoute) : ""
  );
  const [tcId] = useState(tcIdFromRoute ? String(tcIdFromRoute) : "");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [className, setClassName] = useState("");

  /* =========================
     CLASS NAME (STUDENT ONLY)
     ========================= */
  const fetchClassName = async (classId) => {
    if (!classId) {
      setClassName("-");
      return;
    }
    try {
      const res = await fetch(`${apiBase}/api/classes/${sessionId}/getAll`);
      const classes = await res.json();
      const cls = classes.find(
        (c) =>
          String(c.classId) === String(classId) ||
          String(c.id) === String(classId)
      );
      setClassName(cls?.className || classId);
    } catch {
      setClassName(classId);
    }
  };

  /* =========================
     FETCH STUDENT
     ========================= */
  const fetchStudent = async (id) => {
    const res = await fetch(`${apiBase}/api/users/${sessionId}/${id}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error("Student not found");
    return res.json();
  };

  /* =========================
     FETCH TC
     ========================= */
  const fetchTC = async (id) => {
    const res = await fetch(`${apiBase}/api/tc/${id}`);
    if (!res.ok) throw new Error("TC not found");
    return res.json();
  };

  /* =========================
     LOAD DATA
     ========================= */
  const loadData = async () => {
    setLoading(true);
    setError(null);
    setUser(null);

    try {
      // 🔹 TC REPRINT CASE
      if (tcId) {
        const tc = await fetchTC(tcId);
        setUser(tc);
        setClassName(tc.className || "-");
      }
      // 🔹 STUDENT → GENERATE TC CASE
      else if (studentId) {
        const u = await fetchStudent(studentId);
        setUser(u);
        fetchClassName(u.studentClassId || u.studentClass);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tcId || studentId) {
      loadData();
    }
  }, [tcId, studentId]);

  /* =========================
     PRINT LOGIC (SAFE)
     ========================= */
  const onPrint = async () => {
    if (!user) return;

    // 🔁 REPRINT TC → ONLY PRINT
    if (tcId) {
      window.print();
      return;
    }

    // 🧾 GENERATE TC
    const ok = window.confirm(
      "TC will be generated and student removed. Continue?"
    );
    if (!ok) return;

    try {
      const res = await fetch(`${apiBase}/api/tc/generate/${user.userId}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();

      window.print();
      setTimeout(() => navigate("/admindashboard/tc-students"), 1000);
    } catch {
      alert("Failed to generate TC");
    }
  };

  const normalizeDate = (iso) => {
    if (!iso) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
    try {
      const d = new Date(iso);
      if (isNaN(d)) return iso;
      return d.toISOString().slice(0, 10);
    } catch {
      return iso;
    }
  };

  const fmtDate = (date) => {
    if (!date) return "";
    try {
      return new Date(date).toLocaleDateString("en-IN");
    } catch {
      return date;
    }
  };

  const parseDobParts = (dob) => {
    const d = normalizeDate(dob);
    if (!d.includes("-")) return { dd: "", mm: "", yyyy: "" };
    const [yyyy, mm, dd] = d.split("-");
    return { dd, mm, yyyy };
  };

  const { dd, mm, yyyy } = parseDobParts(user?.dob);

  /* =========================
     JSX (UNCHANGED)
     ========================= */
  return (
    <div className="ps-page">
      <div className="ps-header">
        <button className="ps-back" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Transfer Certificate — Print View</h1>
        <div className="ps-actions">
          <button onClick={onPrint} className="ps-print" disabled={!user}>
            Print
          </button>
        </div>
      </div>

      {loading ? (
        <div className="ps-loading">Loading...</div>
      ) : error ? (
        <div className="ps-error">Error: {error}</div>
      ) : !user ? (
        <div className="ps-empty">No data</div>
      ) : (
        <div id="print-area">
          <div className="ps-sheet">
            <div className="admission-header">
              <div className="admission-logo">
                <img src={logo} alt="School logo" />
              </div>

              <div className="admission-title-block">
                <h1 className="admission-school-name">
                  JAGRATI CHILDREN VIDHIYA MANDIR SCHOOL
                </h1>
                <div className="admission-school-address">
                  GOL PAHADIYA, SHANKAR COLONY, GWALIOR (M.P.)
                </div>
                <div className="admission-recognized">
                  (recognized by M.P Govt.)
                </div>

                <div className="admission-meta-box">
                  <div className="meta-row">
                    <div className="meta-label">Admission No.</div>
                    <div className="meta-value">{user.admissionNo ?? ""}</div>
                    <div className="meta-label">Date</div>
                    <div className="meta-value">{fmtDate(new Date())}</div>
                  </div>

                  <div className="meta-row">
                    <div className="meta-label">Class</div>
                    <div className="meta-value">{className || ""}</div>
                  </div>

                  <div className="meta-row">
                    <div className="meta-label">Medium</div>
                    <div className="meta-value">ENGLISH [ ] / HINDI [ ]</div>
                  </div>

                  <div className="meta-row">
                    <div className="meta-label">SSSM ID</div>
                    <div className="meta-value">{user.ssmId ?? ""}</div>
                  </div>

                  <div className="meta-row">
                    <div className="meta-label">Aadhaar No.</div>
                    <div className="meta-value">
                      {user.studentAadharNo ?? ""}
                    </div>
                  </div>
                </div>
              </div>

              <div className="admission-photo-box">
                <img
                  src={`http://localhost:8080/api/documents/download/${
                    user.userId ?? user.id ?? ""
                  }/STUDENT_PHOTO`}
                  alt="Student"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            </div>

            <div className="admission-form-title">TRANSFER CERTIFICATE</div>

            <div className="admission-body">
              <div className="ad-row">
                <span className="ad-label">Name of the student</span>
                <span className="ad-underline long">{user.name ?? ""}</span>
              </div>

              <div className="ad-row">
                <span className="ad-label">Father/Guardian's Name</span>
                <span className="ad-underline long">
                  {user.fatherName ?? ""}
                </span>
              </div>

              <div className="ad-row">
                <span className="ad-label">Mother's Name</span>
                <span className="ad-underline long">
                  {user.motherName ?? ""}
                </span>
              </div>

              <div className="ad-row">
                <span className="ad-label">Date of Birth</span>
                <span className="dob-boxes">
                  <span className="dob-box">{dd}</span>
                  <span className="dob-box">{mm}</span>
                  <span className="dob-box">{yyyy}</span>
                </span>
                <span className="ad-label small">in words</span>
                <span className="ad-underline long">
                  {user.dobInWords ?? ""}
                </span>
              </div>

              <div className="ad-row">
                <span className="ad-label">Language</span>
                <span className="ad-underline small">
                  {user.language ?? ""}
                </span>
              </div>

              <div className="ad-row">
                <span className="ad-label">Cast</span>
                <span className="ad-underline small">{user.caste ?? ""}</span>
                <span className="ad-label">Sub Cast</span>
                <span className="ad-underline small">
                  {user.subCaste ?? ""}
                </span>
                <span className="ad-label">Religion</span>
                <span className="ad-underline small">
                  {user.religion ?? ""}
                </span>
              </div>

              <div className="ad-row">
                <span className="ad-label">Father/Guardian's Occupation</span>
                <span className="ad-underline long">
                  {user.fatherOccupation ?? ""}
                </span>
              </div>

              <div className="ad-row">
                <span className="ad-label">Permanent Add.</span>
                <span className="ad-underline long">
                  {user.permanentAddress ?? user.address ?? ""}
                </span>
              </div>

              <div className="ad-row">
                <span className="ad-label">Local Address</span>
                <span className="ad-underline long">
                  {user.localAddress ?? ""}
                </span>
              </div>

              <div className="ad-row">
                <span className="ad-label">Father mobile No.</span>
                <span className="phone-box">{user.parentPhone ?? ""}</span>
              </div>

              <div className="ad-row">
                <span className="ad-label">Other mobile No.</span>
                <span className="phone-box">{user.studentPhone ?? ""}</span>
              </div>

              <div className="ad-row">
                <span className="ad-label">Class of Admission</span>
                <span className="ad-underline long">{className || ""}</span>
              </div>

              <div className="ad-row">
                <span className="ad-label">Name of Last Year School</span>
                <span className="ad-underline long">
                  {user.passoutClass ?? ""}
                </span>
              </div>

              <div className="ad-sign-row">
                <div>Class Teacher Signature</div>
                <div>Principal Signature</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGenerateTC;
