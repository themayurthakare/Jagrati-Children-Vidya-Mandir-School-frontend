import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AdminPrintMarksheet.css";

const AdminPrintMarksheet = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { sessionId, studentId, className } = location.state || {};

  const [student, setStudent] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);

    const fetchStudent = fetch(
      `http://localhost:8080/api/users/${sessionId}/${studentId}`,
    ).then((res) => res.json());

    const fetchSession = fetch(
      `http://localhost:8080/api/sessions/${sessionId}`,
    ).then((res) => res.json());

    Promise.all([fetchStudent, fetchSession])
      .then(([studentData, sessionData]) => {
        setStudent(studentData);
        setSession(sessionData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (sessionId && studentId) fetchData();
  }, [sessionId, studentId]);

  if (loading) return <div>Loading...</div>;
  if (!student || !session) return <div>No data found</div>;

  return (
    <>
      {/* CONTROLS */}
      <div className="ms-controls">
        <button onClick={() => window.print()} className="ms-btn print">
          🖨 Print
        </button>
        <button onClick={fetchData} className="ms-btn refresh">
          🔄 Refresh
        </button>
        <button onClick={() => navigate(-1)} className="ms-btn back">
          ← Back
        </button>
      </div>

      <div className="ms-page-wrapper">
        <div className="ms-page">
          <div className="ms-recognized">(Recognized by M.P. Government)</div>
          <div className="ms-school-name">
            JAGRATI CHILDREN VIDHIYA MANDIR SCHOOL
          </div>
          <div className="ms-school-address">
            SHANKAR COLONY, A.B. ROAD, GOL PAHADIYA, LASHKAR, GWALIOR (M.P.) -
            474001
          </div>
          <div className="ms-class-session">
            CLASS <b>{className || student.studentClassId}</b> : Academic
            Session {session.name}
          </div>
          <div className="ms-dise">(School Dise-code : 23040504429)</div>

          {/* TOP INFO */}
          <table className="ms-top-table">
            <tbody>
              <tr>
                <th>Roll No.</th>
                <th>Admission No.</th>
                <th>SSSM ID</th>
                <th>Aadhar No.</th>
              </tr>
              <tr>
                <td>{student.userId}</td>
                <td>{student.admissionNo}</td>
                <td>{student.ssmId}</td>
                <td>{student.studentAadharNo}</td>
              </tr>
            </tbody>
          </table>

          {/* STUDENT DETAILS */}
          <table className="ms-student-table">
            <tbody>
              <tr>
                <th colSpan="4">STUDENT DETAILS</th>
              </tr>
              <tr>
                <td className="ms-label">Student Name :</td>
                <td colSpan="3">{student.name}</td>
              </tr>
              <tr>
                <td className="ms-label">Father's Name :</td>
                <td colSpan="3">{student.fatherName}</td>
              </tr>
              <tr>
                <td className="ms-label">Mother's name :</td>
                <td>{student.motherName}</td>
                <td className="ms-label">Date of Birth :</td>
                <td>{student.dob}</td>
              </tr>
              <tr>
                <td className="ms-label">Medium :</td>
                <td colSpan="3">ENGLISH</td>
              </tr>
            </tbody>
          </table>

          <div className="ms-marksheet-title">MARK SHEET</div>

          {/* MARKS TABLE */}
          <table className="ms-marks-table">
            <colgroup>
              <col style={{ width: "12%" }} />
              {Array.from({ length: 12 }).map((_, i) => (
                <col key={i} style={{ width: "7.333%" }} />
              ))}
            </colgroup>

            <thead>
              <tr>
                <th rowSpan="2">SUBJECT</th>
                <th colSpan="3">Maximum</th>
                <th colSpan="3">Quarterly</th>
                <th colSpan="3">Half Yearly</th>
                <th colSpan="3">Annual</th>
              </tr>
              <tr>
                <th>THEORY</th>
                <th>PROJECT</th>
                <th>TOTAL</th>
                <th>THEORY</th>
                <th>PROJECT</th>
                <th>TOTAL</th>
                <th>THEORY</th>
                <th>PROJECT</th>
                <th>TOTAL</th>
                <th>THEORY</th>
                <th>PROJECT</th>
                <th>TOTAL</th>
              </tr>
            </thead>

            <tbody>
              {["Hindi", "English", "Mathematics", "E.V.S."].map((sub) => (
                <tr key={sub}>
                  <td>{sub}</td>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <td key={i}></td>
                  ))}
                </tr>
              ))}

              <tr className="ms-bold">
                <td>GRAND TOTAL</td>
                {Array.from({ length: 12 }).map((_, i) => (
                  <td key={i}></td>
                ))}
              </tr>

              <tr>
                <td>PERCENTAGE</td>
                <td colSpan="3"></td>
                <td colSpan="3"></td>
                <td colSpan="3"></td>
                <td colSpan="3"></td>
              </tr>

              <tr>
                <td>GRADE</td>
                <td colSpan="3"></td>
                <td colSpan="3"></td>
                <td colSpan="3"></td>
                <td colSpan="3"></td>
              </tr>

              {/* ADDITIONAL SUBJECT */}
              <tr>
                <td rowSpan="2" className="ms-bold">
                  ADDITIONAL SUBJECT
                </td>
                <td>G.K.</td>
                <td>COMP</td>
                <td>DRAW</td>
                <td>G.K.</td>
                <td>COMP</td>
                <td>DRAW</td>
                <td>G.K.</td>
                <td>COMP</td>
                <td>DRAW</td>
                <td>G.K.</td>
                <td>COMP</td>
                <td>DRAW</td>
              </tr>

              <tr></tr>

              <tr>
                <td className="ms-bold">GRADE</td>
                {Array.from({ length: 12 }).map((_, i) => (
                  <td key={i}></td>
                ))}
              </tr>
            </tbody>
          </table>

          {/* GRADE SYSTEM */}
          <table className="ms-grade-result">
            <tbody>
              <tr>
                <th colSpan="8">GRADE SYSTEM</th>
                <th colSpan="4">RESULT</th>
              </tr>
              <tr>
                <td>GRADE</td>
                <td>A+</td>
                <td>A</td>
                <td>B+</td>
                <td>B</td>
                <td>C+</td>
                <td>C</td>
                <td>D</td>
                <td colSpan="4" rowSpan="2" className="ms-result">
                  PASS
                </td>
              </tr>
              <tr>
                <td>PERCENTAGE</td>
                <td>86-100</td>
                <td>76-85</td>
                <td>66-75</td>
                <td>56-65</td>
                <td>51-55</td>
                <td>46-50</td>
                <td>33-45</td>
              </tr>
            </tbody>
          </table>
          {/* ================= SIGNATURE SECTION ================= */}
          <div className="ms-signature-section">
            <div className="ms-sign-box">
              <div className="ms-sign-line">Signature</div>
              <div className="ms-sign-label">Class Teacher</div>
            </div>

            <div className="ms-sign-box">
              <div className="ms-sign-line">Signature</div>
              <div className="ms-sign-label">Parent</div>
            </div>

            <div className="ms-sign-box">
              <div className="ms-sign-line">Signature</div>
              <div className="ms-sign-label">Principal</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPrintMarksheet;
