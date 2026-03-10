import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SessionContext } from "./SessionContext";
import "./AdminViewClassStudents.css";

const COMarksheetStudents = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const classId = location.state?.classId;
  const className = location.state?.className || "Class";

  const { selectedSession } = useContext(SessionContext);
  const sessionId = selectedSession?.id;

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!classId) {
      setError("No class selected.");
      setLoading(false);
      return;
    }

    if (!sessionId) {
      setError("No session selected. Please select a session first.");
      setLoading(false);
      return;
    }

    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError("");

        console.log(
          "Fetching students for class:",
          classId,
          "session:",
          sessionId,
        );

        // First try: Get students by class from users endpoint
        const response = await fetch(
          `http://localhost:8080/api/users/${sessionId}/getAll`,
        );

        if (response.ok) {
          const allUsers = await response.json();
          console.log("All users:", allUsers);

          if (Array.isArray(allUsers)) {
            // Filter users who are students and belong to this class
            const classStudents = allUsers.filter((user) => {
              // Check if user is a student (you might have a role field)
              const isStudent =
                !user.role ||
                user.role === "student" ||
                user.role === "Student";

              // Check class ID match (try different possible field names)
              const userClassId =
                user.studentClassId || user.classId || user.class;

              return (
                isStudent && userClassId?.toString() === classId.toString()
              );
            });

            console.log("Filtered students:", classStudents);

            if (classStudents.length > 0) {
              setStudents(classStudents);
              setFilteredStudents(classStudents);
            } else {
              // If no students found, show all users for debugging
              setError(
                `No students found in class ${className}. Total users: ${allUsers.length}`,
              );
              setStudents([]);
              setFilteredStudents([]);
            }
          }
        } else {
          setError(`Failed to fetch users: ${response.status}`);
        }
      } catch (err) {
        console.error("Error fetching students:", err);
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classId, sessionId, className]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStudents(students);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = students.filter(
      (student) =>
        (student.name?.toLowerCase() || "").includes(term) ||
        (student.fullName?.toLowerCase() || "").includes(term) ||
        (student.admissionNo?.toLowerCase() || "").includes(term) ||
        (student.userId?.toString() || "").includes(term),
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const openMarksheet = (student) => {
    if (!selectedSession?.id) {
      alert("No session selected");
      return;
    }

    // Determine class range
    let classNumber;
    const classStr = className.toString().toLowerCase();

    if (
      classStr.includes("nursery") ||
      classStr.includes("kg") ||
      classStr.includes("pre") ||
      classStr.includes("play")
    ) {
      classNumber = 0; // Pre-primary
    } else {
      const match = classStr.match(/\d+/);
      classNumber = match ? parseInt(match[0]) : 0;
    }

    let route = "";
    if (classNumber < 1) {
      route = "/computeroperator/marksheet-pre";
    } else if (classNumber >= 1 && classNumber <= 5) {
      route = "/computeroperator/marksheet-1-5";
    } else if (classNumber >= 6 && classNumber <= 8) {
      route = "/computeroperator/marksheet-6-8";
    } else {
      alert(`No marksheet template for class ${className}`);
      return;
    }

    console.log("Navigating to:", route, "with student:", student);

    navigate(route, {
      state: {
        studentId: student.userId || student.id,
        sessionId: selectedSession.id,
        className: className,
      },
    });
  };

  return (
    <div className="class-students-container">
      <div className="class-students-header">
        <button
          className="back-btn"
          onClick={() => navigate("/computeroperator/marksheet-class")}
          style={{
            padding: "8px 16px",
            marginRight: "20px",
            cursor: "pointer",
          }}
        >
          ← Back to Classes
        </button>
        <h2>{className} - Students</h2>
      </div>

      {/* Search Section */}
      <div className="search-section" style={{ margin: "20px 0" }}>
        <input
          type="text"
          className="search-input"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "8px",
            width: "300px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      {/* Students Table */}
      <div className="students-table-container1">
        {loading ? (
          <p style={{ textAlign: "center", padding: "50px" }}>
            Loading students...
          </p>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "50px", color: "red" }}>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <p>No students found in this class.</p>
            {students.length === 0 && (
              <div>
                <p>Debug Info:</p>
                <p>Class ID: {classId}</p>
                <p>Session ID: {sessionId}</p>
                <p>Class Name: {className}</p>
              </div>
            )}
          </div>
        ) : (
          <table
            className="students-class-table"
            style={{ width: "100%", borderCollapse: "collapse" }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th style={{ padding: "12px", border: "1px solid #ddd" }}>
                  Sr. No.
                </th>
                <th style={{ padding: "12px", border: "1px solid #ddd" }}>
                  Student Name
                </th>
                <th style={{ padding: "12px", border: "1px solid #ddd" }}>
                  Admission No.
                </th>
                <th style={{ padding: "12px", border: "1px solid #ddd" }}>
                  Roll No.
                </th>
                <th style={{ padding: "12px", border: "1px solid #ddd" }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr key={student.userId || student.id || index}>
                  <td
                    style={{
                      padding: "10px",
                      border: "1px solid #ddd",
                      textAlign: "center",
                    }}
                  >
                    {index + 1}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {student.name || student.fullName || "N/A"}
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      border: "1px solid #ddd",
                      textAlign: "center",
                    }}
                  >
                    {student.admissionNo || "N/A"}
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      border: "1px solid #ddd",
                      textAlign: "center",
                    }}
                  >
                    {student.userId || student.id || "N/A"}
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      border: "1px solid #ddd",
                      textAlign: "center",
                    }}
                  >
                    <button
                      onClick={() => openMarksheet(student)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Generate Marksheet
                    </button>
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

export default COMarksheetStudents;
