import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AdmitCardPrint.css";

const AdminAdmitCardPrintAll = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const classId = state?.classId;
  const className = state?.className || "Class";

  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (!classId) return;

    fetch("http://localhost:8080/api/users/getAll")
      .then((res) => res.json())
      .then((data) => {
        const filtered = Array.isArray(data)
          ? data.filter((s) => s.studentClassId === classId)
          : [];
        setStudents(filtered);
      });
  }, [classId]);

  return (
    <div className="print-root">
      <div className="print-actions">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>
        <button onClick={() => window.print()} className="print-btn">
          🖨 Print All Admit Cards
        </button>
      </div>

      <div className="admit-grid">
        {students.map((student) => (
          <div className="admit-card" key={student.userId}>
            <h1 className="school-title">JAGRATI CHILDREN VIDYA MANDIR</h1>

            <div className="session-text">
              Half yearly Examination Session - 2025-26
            </div>

            <div className="admit-label">Admit Card</div>

            <div className="details">
              <div className="detail-row">
                <span>Name of student :</span>
                <span className="value">{student.name || "__________"}</span>

                <span>Father Name :</span>
                <span className="value">
                  {student.fatherName || "__________"}
                </span>
              </div>

              <div className="detail-row">
                <span>Roll No :</span>
                <span className="value red">{"_________"}</span>

                <span>Class :</span>
                <span className="value">{className}</span>
              </div>
            </div>

            <div className="signatures">
              <div>Class teacher signature --------------------</div>
              <div>Principal signature --------------------</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAdmitCardPrintAll;
