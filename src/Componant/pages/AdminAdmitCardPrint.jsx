import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AdmitCardPrint.css";

const AdminAdmitCardPrint = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const studentName = state?.studentName || "____________";
  const fatherName = state?.fatherName || "____________";
  const rollNo = state?.rollNo || "_____";
  const className = state?.className || "_____";

  return (
    <div className="print-root">
      <div className="print-actions">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>
        <button onClick={() => window.print()} className="print-btn">
          🖨 Print Admit Card
        </button>
      </div>

      <div className="admit-card">
        <h1 className="school-title">JAGRATI CHILDREN VIDYA MANDIR</h1>

        <div className="session-text">
          Half yearly Examination Session - 2025-26
        </div>

        <div className="admit-label">Admit Card</div>

        <div className="details">
          <div className="detail-row">
            <span>Name of student :</span>
            <span className="value">{studentName}</span>

            <span>Father Name :</span>
            <span className="value">{fatherName}</span>
          </div>

          <div className="detail-row">
            <span>Roll No :</span>
            <span className="value red">{rollNo}</span>

            <span>Class :</span>
            <span className="value">{className}</span>
          </div>
        </div>

        <div className="signatures">
          <div>Class teacher signature --------------------</div>
          <div>Principal signature --------------------</div>
        </div>
      </div>
    </div>
  );
};

export default AdminAdmitCardPrint;
