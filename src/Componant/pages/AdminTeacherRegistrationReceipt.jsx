import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./AdminTeacherRegistrationReceipt.css";

const AdminTeacherRegistrationReceipt = ({
  apiBase = "http://localhost:8080/api",
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const teacherId = searchParams.get("teacherId");

  const [teacher, setTeacher] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!teacherId) {
      setError("Teacher ID missing");
      setLoading(false);
      return;
    }
    fetchAll();
  }, [teacherId]);

  // Add this function:
  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    // If there is a previous entry in history, go back; otherwise go to dashboard
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/admindashboard");
    }
  };
  const fetchAll = async () => {
    try {
      const tRes = await fetch(`${apiBase}/teachers/${teacherId}`);
      if (!tRes.ok) throw new Error("Teacher not found");
      const teacherData = await tRes.json();

      const dRes = await fetch(`${apiBase}/teacher-documents/${teacherId}`);
      const docData = dRes.ok ? await dRes.json() : [];

      setTeacher(teacherData);
      setDocuments(docData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="receipt-loading">Loading receipt...</div>;

  if (error || !teacher) {
    return (
      <div className="receipt-error">
        <h2>Receipt Not Available</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Back</button>
      </div>
    );
  }

  return (
    <div className="receipt-container">
      {/* Screen buttons */}
      <div className="receipt-screen-only">
        <button className="btn-print" onClick={handlePrint}>
          🖨 Print
        </button>
        <button className="btn-secondary" onClick={handleBack}>
          ← Back
        </button>
      </div>

      {/* Print Area */}
      <div className="receipt-print-only">
        {/* School Header */}
        <div className="school-header">
          <h1>JAGRATI CHILDREN VIDHIYA MANDIR SCHOOL</h1>
          <p>Gol Pahadiya, Shankar Colony</p>
          <p>Gwalior (M.P.)</p>
          <p className="recognized">(Recognized by M.P. Govt.)</p>
        </div>

        <div className="receipt-title">TEACHER REGISTRATION RECEIPT</div>

        <div className="receipt-id">
          Receipt No: TR-{teacherId.padStart(4, "0")} <br />
          Date: {new Date().toLocaleDateString("en-IN")}
        </div>

        {/* Teacher Details */}
        <h3 className="section-title">Teacher Information</h3>
        <div className="detail-grid">
          <div>
            <b>Name:</b> {teacher.name}
          </div>
          <div>
            <b>Teacher ID:</b> {teacherId}
          </div>
          <div>
            <b>Email:</b> {teacher.email}
          </div>
          <div>
            <b>Phone:</b> {teacher.phone}
          </div>
          <div>
            <b>Date of Birth:</b>{" "}
            {new Date(teacher.dateOfBirth).toLocaleDateString("en-IN")}
          </div>
          <div>
            <b>Experience:</b> {teacher.yearOfExperience} Years
          </div>
          <div>
            <b>Qualification:</b> {teacher.educationalDetails}
          </div>
          <div>
            <b>Aadhaar No:</b> {teacher.aadharNo}
          </div>
          <div className="full">
            <b>Address:</b> {teacher.address}
          </div>
        </div>

        {/* Classes */}
        <h3 className="section-title">Assigned Classes</h3>
        <div className="simple-box">
          {teacher.classNames?.length
            ? teacher.classNames.map((c, i) => <div key={i}>• {c}</div>)
            : "No classes assigned"}
        </div>

        {/* Documents */}
        <h3 className="section-title">Uploaded Documents</h3>
        <div className="simple-box">
          {documents.length
            ? documents.map((d) => (
                <div key={d.type}>
                  ✓ {d.type.replace("TEACHER_", "")} {d.filename}
                </div>
              ))
            : "No documents uploaded"}
        </div>

        {/* Footer */}
        <div className="receipt-footer">
          <div className="signature-section">
            <div>
              ____________________
              <br />
              Principal Signature
            </div>
            <div>
              ____________________
              <br />
              Teacher Signature
            </div>
          </div>

          <p className="footer-note">This is a computer-generated receipt.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminTeacherRegistrationReceipt;
