import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AdminPrintIdCard.css";

import { SessionContext } from "./SessionContext";

const AdminPrintIdCard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const classId = location.state?.classId;
  const className = location.state?.className || "Class";

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdmitCards, setShowAdmitCards] = useState(false); // NEW STATE

  const { selectedSession } = useContext(SessionContext);
  const sessionId = selectedSession?.id;

  useEffect(() => {
    if (!classId) {
      setError("No class selected. Please select a class.");
      setLoading(false);
      return;
    }

    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:8080/api/classes/${sessionId}/${classId}/students`
        );

        if (response.ok) {
          const data = await response.json();
          const list = Array.isArray(data) ? data : [];
          setStudents(list);
          setFilteredStudents(list);
        } else {
          // fallback: fetch all students
          const allRes = await fetch(
            `http://localhost:8080/api/users/${sessionId}/getAll`
          );
          const allStudents = await allRes.json();
          const filtered = allStudents.filter(
            (s) => s.studentClassId === classId
          );
          setStudents(filtered);
          setFilteredStudents(filtered);
        }
      } catch (err) {
        setError("Failed to load students");
        setStudents([]);
        setFilteredStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classId]);

  // Search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredStudents(students);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredStudents(
        students.filter((s) => s.name && s.name.toLowerCase().includes(term))
      );
    }
  }, [searchTerm, students]);

  const goBack = () => {
    navigate("/admindashboard/generate-id-cards");
  };

  // Function to show all admit cards for printing
  const handleShowAllAdmitCards = () => {
    if (students.length === 0) {
      alert("No students to generate admit cards for.");
      return;
    }
    setShowAdmitCards(true);
  };

  // Function to close admit cards view
  const handleCloseAdmitCards = () => {
    setShowAdmitCards(false);
  };

  // ADMIT CARDS COMPONENT (Embedded)
  const AdmitCardsView = () => {
    return (
      <div className="print-root">
        {/* ACTION BUTTONS (NOT PRINTED) */}
        <div className="print-actions">
          <button onClick={handleCloseAdmitCards} className="back-admitall-btn">
            ← Back to List
          </button>
          <button onClick={() => window.print()} className="print-admitall-btn">
            🖨 Print All Admit Cards
          </button>
        </div>

        {/* ALL ADMIT CARDS */}
        {students.map((student) => (
          <div className="admit-card page-break" key={student.userId}>
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
                <span className="value red">{"__________"}</span>

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
    );
  };

  // If showing admit cards, render that view instead
  if (showAdmitCards) {
    return <AdmitCardsView />;
  }

  // Original main view
  return (
    <div className="print-id-card-container">
      {/* Header */}
      <div className="print-id-card-header">
        <div className="header-left">
          <button className="back-btn" onClick={goBack}>
            ← Back
          </button>
          <h2 className="page-title">{className} – Student Cards</h2>
        </div>

        {!loading && !error && (
          <div className="header-right">
            <div className="bulk-actions">
              <button
                className="download-all-id-btn"
                onClick={() =>
                  navigate("/admindashboard/generate-id-cards/print-all", {
                    state: {
                      classId,
                      className,
                    },
                  })
                }
              >
                Download All ID Cards
              </button>
              <button
                className="download-all-admit-btn"
                onClick={handleShowAllAdmitCards} // Updated to use local function
              >
                Download All Admit Cards
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rest of your component remains the same */}
      <div className="search-section">
        <input
          type="text"
          className="search-input"
          placeholder="Search student name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="students-table-container">
        {loading ? (
          <div className="loading-state">Loading students...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="empty-state">No students found.</div>
        ) : (
          <table className="students-id-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Student Name</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student, index) => (
                <tr key={student.userId}>
                  <td className="text-center">{index + 1}</td>
                  <td className="text-center">{student.name || "N/A"}</td>
                  <td className="text-center">
                    <div className="action-buttons">
                      <button
                        className="idcard-btn"
                        onClick={() =>
                          navigate("/admindashboard/generate-id-cards/print", {
                            state: {
                              studentId: student.userId,
                              className,
                              studentName: student.name,
                            },
                          })
                        }
                      >
                        Download ID Card
                      </button>
                      <button
                        className="admit-btn"
                        onClick={() =>
                          navigate("/admindashboard/generate-admit-card", {
                            state: {
                              studentId: student.userId,
                              className,
                              studentName: student.name,
                              fatherName: student.fatherName,
                            },
                          })
                        }
                      >
                        Download Admit Card
                      </button>
                      <button
                        className="tc-btn"
                        onClick={() =>
                          navigate("/admindashboard/generate-tc", {
                            state: {
                              studentId: student.userId,
                              className,
                            },
                          })
                        }
                      >
                        Generate TC
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPrintIdCard;
