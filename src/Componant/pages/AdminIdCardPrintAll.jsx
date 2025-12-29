import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SessionContext } from "./SessionContext";

import "./IdCardPrint.css";

const AdminIdCardPrintAll = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const classId = state?.classId;
  const className = state?.className || "Class";

  const [students, setStudents] = useState([]);

  const { selectedSession } = useContext(SessionContext);
  const sessionId = selectedSession?.id;

  useEffect(() => {
    if (!classId) return;

    fetch(`http://localhost:8080/api/users/${sessionId}/getAll`)
      .then((res) => res.json())
      .then((data) =>
        setStudents(data.filter((s) => s.studentClassId === classId))
      );
  }, [classId]);

  return (
    <div className="print-page">
      {/* ACTION BUTTONS */}
      <div className="print-actions">
        <button className="back-id-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <button className="print-id-btn" onClick={() => window.print()}>
          🖨 Print All ID Cards
        </button>
      </div>

      {/* PRINT AREA */}
      <div className="print-root">
        <div className="id-grid-4">
          {students.map((student) => (
            <div className="id-card" key={student.userId}>
              {/* HEADER */}
              <div className="id-header">
                JAGRATI CHILDREN VIDHYA MANDIR SCHOOL
                <div className="id-sub-header">IDENTITY CARD</div>
              </div>

              {/* BODY */}
              <div className="id-body">
                <div className="id-photo">
                  <img
                    src={`http://localhost:8080/api/documents/download/${student.userId}/STUDENT_PHOTO`}
                    alt="student"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  <div className="signature">Signature</div>
                </div>

                <div className="id-details">
                  <table>
                    <thead>
                      <tr>
                        <th>CLASS</th>
                        <th>AD. NO.</th>
                        <th>AD. DATE</th>
                        <th>DOB</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{className}</td>
                        <td>{student.admissionNo || student.userId}</td>
                        <td>{student.admissionDate || "----"}</td>
                        <td>{student.dob || "----"}</td>
                      </tr>
                    </tbody>
                  </table>

                  <p>
                    <b>NAME :</b> {student.name}
                  </p>
                  <p>
                    <b>FATHER'S NAME :</b> {student.fatherName}
                  </p>
                  <p>
                    <b>MOTHER'S NAME :</b> {student.motherName}
                  </p>
                  <p>
                    <b>ADDRESS :</b> {student.address}
                  </p>
                  <p>
                    <b>PHONE NO. :</b> {student.parentPhone}
                  </p>
                </div>
              </div>

              {/* FOOTER */}
              <div className="id-footer"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminIdCardPrintAll;
