import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./IdCardPrint.css";

const AdminIdCardPrint = () => {
  const { state } = useLocation();
  const studentId = state?.studentId;
  const className = state?.className || "1st";

  const [student, setStudent] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);

  const navigate = useNavigate();
  useEffect(() => {
    if (!studentId) return;

    fetch(`http://localhost:8080/api/users/${studentId}`)
      .then((res) => res.json())
      .then((data) => {
        setStudent(data);
        fetch(
          `http://localhost:8080/api/documents/download/${data.userId}/STUDENT_PHOTO`
        )
          .then((r) => r.blob())
          .then((blob) => setPhotoUrl(URL.createObjectURL(blob)))
          .catch(() => setPhotoUrl(null));
      });
  }, [studentId]);

  if (!student) return <p>Loading...</p>;

  return (
    <div className="print-page">
      <div className="print-actions">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <button className="print-btn" onClick={() => window.print()}>
          🖨 Print ID Card
        </button>
      </div>

      <div className="print-root">
        <div className="id-grid">
          <div className="id-card">
            {/* HEADER */}
            <div className="id-header">
              JAGRATI CHILDREN VIDHYA MANDIR SCHOOL
              <div className="id-sub-header">IDENTITY CARD</div>
            </div>

            {/* BODY */}
            <div className="id-body">
              <div className="id-photo">
                {photoUrl ? (
                  <img src={photoUrl} alt="student" />
                ) : (
                  <div className="no-photo">PHOTO</div>
                )}
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
        </div>
      </div>
    </div>
  );
};

export default AdminIdCardPrint;
