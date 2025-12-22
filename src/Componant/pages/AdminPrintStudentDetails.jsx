import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AdminPrintStudentDetails.css";
import logo from "../../media/logo.jpeg";

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

  const userEndpoints = [
    (id) => `${apiBase}/api/users/${id}`,
    (id) => `${apiBase}/api/users/get/${id}`,
    (id) => `${apiBase}/api/users/getById/${id}`,
    (id) => `${apiBase}/api/users/getUser/${id}`,
  ];

  useEffect(() => {
    if (!studentId) {
      const q = new URLSearchParams(window.location.search);
      const qId = q.get("studentId");
      if (qId) setStudentId(qId);
    }
  }, [studentId]);

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

  // Normalise date string to YYYY-MM-DD if possible
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

  const fmtDate = (iso) => normalizeDate(iso);

  // Split DOB into DD / MM / YYYY for the three boxes
  const parseDobParts = (dob) => {
    const str = normalizeDate(dob);
    if (!str || !str.includes("-")) {
      return { dd: "", mm: "", yyyy: "" };
    }
    const [yyyy, mm, dd] = str.split("-");
    return { dd: dd || "", mm: mm || "", yyyy: yyyy || "" };
  };

  const { dd, mm, yyyy } = parseDobParts(user?.dob);

  return (
    <div className="ps-page">
      {/* header – do not change */}
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
        <div id="print-area">
          {/* PAGE 1: ADMISSION FORM */}
          <div className="ps-sheet">
            {/* ==== top header box ==== */}
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
                    <div className="meta-value">
                      {fmtDate(user.admissionDate)}
                    </div>
                  </div>

                  <div className="meta-row">
                    <div className="meta-label">Class</div>
                    <div className="meta-value">{className || ""}</div>
                    <div className="meta-label">Session</div>
                    <div className="meta-value">2025-2026</div>
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

            {/* red + blue line */}
            <div className="admission-form-title">
              APPLICATION FOR ADMISSION
            </div>

            {/* ==== body ==== */}
            <div className="admission-body">
              <div className="ad-row">
                <span className="ad-label">Name of the student</span>
                <span className="ad-underline long">{user.name ?? ""}</span>
              </div>

              <div className="ad-row">
                <span className="ad-label">Father/Guardian&apos;s Name</span>
                <span className="ad-underline long">
                  {user.fatherName ?? ""}
                </span>
              </div>

              <div className="ad-row">
                <span className="ad-label">Mother&apos;s Name</span>
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
                <span className="ad-label small">In words</span>
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
                <span className="ad-label">
                  Father&apos;s/Guardian&apos;s Occupation
                </span>
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

              <div className="ad-declaration">
                मैं ____________________ पुत्री / पुत्र ____________________
                घोषणा कर हूं कि मेरे द्वारा दी गई सारी जानकारी सही है। मेरे
                द्वारा दिए गए दस्तावेजों में किसी भी प्रकार की गलती होती है तो
                उसका मैं स्वयं जिम्मेदार रहूंगा / रहूंगी। मैं स्कूल के सारे
                नियमों का पालन करूंगा / करूंगी।
              </div>

              <div className="ad-sign-row">
                <div>Student signature</div>
                <div>Parents Signature</div>
              </div>
            </div>
          </div>

          {/* PAGE 2: IMPORTANT DOCUMENT LIST (AS PER IMAGE) */}
          <div className="ps-sheet doc-page">
            <h2 className="doc-page-title">IMPORTANT DOCUMENT</h2>

            {/* Nursery to UKG Section */}
            <div className="doc-section">
              <h3 className="doc-section-head">
                Only for class Nur. TO U.K.G:
              </h3>
              <div className="doc-detail-box">
                <span className="doc-icon">❖</span>{" "}
                <strong>Document detail:</strong>
                <div className="doc-input-row">
                  SSSMID{" "}
                  <div className="doc-input-line">{user.ssmId ?? ""}</div>
                </div>
                <div className="doc-input-row">
                  Aadhaar No.{" "}
                  <div className="doc-input-line">
                    {user.studentAadharNo ?? ""}
                  </div>
                </div>
              </div>

              <div className="doc-checklist-container">
                <span className="doc-icon">❖</span>{" "}
                <strong>Document submitted:</strong>
                <div className="doc-checklist">
                  <div className="check-item">
                    <span className="box"></span> Photocopy of birth certificate
                  </div>
                  <div className="check-item">
                    <span className="box"></span> Passport size photographs of
                    student
                  </div>
                  <div className="check-item">
                    <span className="box"></span> Transfer Certificate
                    (Original)
                  </div>
                  <div className="check-item">
                    <span className="box"></span> Photocopy of Report card
                  </div>
                  <div className="check-item">
                    <span className="box"></span> Photocopy of SSSMID
                  </div>
                  <div className="check-item">
                    <span className="box"></span> Photocopy of Aadhaar card
                  </div>
                </div>
              </div>
            </div>

            {/* 1st to 8th Section */}
            <div className="doc-section">
              <h3 className="doc-section-head">
                Only for class 1<sup>st</sup> TO 8<sup>th</sup>:
              </h3>
              <div className="doc-detail-box">
                <span className="doc-icon">❖</span>{" "}
                <strong>Document detail:</strong>
                <div className="doc-input-row">
                  SSSMID{" "}
                  <div className="doc-input-line">{user.ssmId ?? ""}</div>
                </div>
                <div className="doc-input-row">
                  Aadhaar No.{" "}
                  <div className="doc-input-line wide">
                    {user.studentAadharNo ?? ""}
                  </div>
                </div>
                <div className="doc-input-row">
                  Bank Account <div className="doc-input-line mid"></div>
                  IFSC Code <div className="doc-input-line mid"></div>
                </div>
              </div>

              <div className="doc-checklist-container">
                <span className="doc-icon">❖</span>{" "}
                <strong>Document submitted:</strong>
                <div className="doc-checklist">
                  <div className="check-item">
                    <span className="box"></span> Photocopy of birth certificate
                  </div>
                  <div className="check-item">
                    <span className="box"></span> Passport size photographs of
                    student
                  </div>
                  <div className="check-item">
                    <span className="box"></span> Transfer Certificate
                    (Original)
                  </div>
                  <div className="check-item">
                    <span className="box"></span> Photocopy of Report card
                  </div>
                  <div className="check-item">
                    <span className="box"></span> Photocopy of SSSMID
                  </div>
                  <div className="check-item">
                    <span className="box"></span> Photocopy of Aadhaar card
                  </div>
                  <div className="check-item">
                    <span className="box"></span> Photocopy of Domicile
                    Certificate
                  </div>
                  <div className="check-item">
                    <span className="box"></span> Photocopy of Cast Certificate
                  </div>
                  <div className="check-item">
                    <span className="box"></span> Photocopy of Income
                    Certificate
                  </div>
                </div>
              </div>
            </div>

            <div className="doc-instruction">
              निर्देश :- ऊपर दिए गए दस्तावेजों की कमी के कारण अगर मेरे बच्चों की
              स्कॉलरशिप स्कूल की अन्य सुविधाओं से वंचित होता है तो उसके लिए मैं
              स्वयं जिम्मेदार हूं।
            </div>

            <div className="doc-sign-area">
              <span>Student signature</span>
              <span>Parents Signature</span>
            </div>

            <div className="office-use-section">
              <div className="office-title">FOR OFFICE USE ONLY</div>

              <div className="office-row">
                <span>Student Name :</span>
                <span className="fill-line">{user.name ?? ""}</span>
                <span>S/o , D/o :</span>
                <span className="fill-line"></span>
              </div>

              <div className="office-row">
                <span>Is admitted in class :</span>
                <span className="fill-line short">{className || ""}</span>
                <span>section :</span>
                <span className="fill-line short"></span>
                <span>His Registration No :</span>
                <span className="fill-line"></span>
              </div>

              <div className="office-row">
                <span>Date :</span>

                <span className="fill-line date-line">
                  {fmtDate(user.admissionDate)}
                </span>
              </div>

              <div className="office-footer">
                <span>Class Teacher Signature</span>
                <span>Principal Signature</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPrintStudentDetails;
