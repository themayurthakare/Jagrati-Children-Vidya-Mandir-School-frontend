import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AdminViewClassStudents.css";

const AdminViewClassStudents = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get class ID from navigation state
  const classId = location.state?.classId;
  const className = location.state?.className || "Class";

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch class details and students
  useEffect(() => {
    if (!classId) {
      setError(
        "No class selected. Please select a class from the classes list."
      );
      setLoading(false);
      return;
    }

    const fetchClassData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch class details
        const classResponse = await fetch(
          `http://localhost:8080/api/classes/${classId}`
        );

        if (!classResponse.ok) {
          if (classResponse.status === 404) {
            throw new Error("Class not found");
          }
          throw new Error(
            `Failed to fetch class details: ${classResponse.status}`
          );
        }

        const classData = await classResponse.json();
        setClassInfo(classData);

        // Fetch students for this class
        // Try class-specific endpoint first
        const studentsResponse = await fetch(
          `http://localhost:8080/api/classes/${classId}/students`
        );

        if (!studentsResponse.ok) {
          // If endpoint doesn't exist, try the general students endpoint
          await fetchAllStudentsAndFilter();
          return;
        }

        const studentsData = await studentsResponse.json();
        const studentsList = Array.isArray(studentsData) ? studentsData : [];
        setStudents(studentsList);
        setFilteredStudents(studentsList);
      } catch (err) {
        console.error("Error fetching class data:", err);
        setError(err.message || "Failed to load class data");
        setStudents([]);
        setFilteredStudents([]);
      } finally {
        setLoading(false);
      }
    };

    // Alternative: Fetch all students and filter by class
    const fetchAllStudentsAndFilter = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/users/getAll");
        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }

        const allStudents = await response.json();
        const filteredStudents = Array.isArray(allStudents)
          ? allStudents.filter(
              (student) =>
                student.studentClassId === classId ||
                student.studentClass === classId ||
                (student.studentClass &&
                  student.studentClass.toString() === classId.toString())
            )
          : [];

        setStudents(filteredStudents);
        setFilteredStudents(filteredStudents);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Could not load students for this class");
        setStudents([]);
        setFilteredStudents([]);
      }
    };

    fetchClassData();
  }, [classId]);

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStudents(students);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = students.filter(
        (student) =>
          (student.name && student.name.toLowerCase().includes(term)) ||
          (student.admissionNo &&
            student.admissionNo.toLowerCase().includes(term)) ||
          (student.studentPhone && student.studentPhone.includes(term)) ||
          (student.parentPhone && student.parentPhone.includes(term))
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
  };

  // Navigate back to classes list
  const goBackToClasses = () => {
    navigate("/admindashboard/view-fees");
  };

  return (
    <div className="class-students-container">
      {/* Header */}
      <div className="class-students-header">
        <div className="header-left">
          <button className="back-btn" onClick={goBackToClasses}>
            ← Back to Classes
          </button>
          <h2 className="page-title">{className} Students</h2>
        </div>

        <div className="header-right">
          {!loading && !error && (
            <div className="total-students">
              Total Students:{" "}
              <span className="student-count">{students.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, admission no, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="search-clear-btn" onClick={clearSearch}>
              ×
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="search-stats">
            Showing {filteredStudents.length} of {students.length} students
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Students Table */}
      <div className="students-table-container">
        {loading ? (
          <div className="loading-state">
            <p>Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="empty-state">
            {searchTerm ? (
              <>
                <p>No students found matching "{searchTerm}"</p>
                <button className="clear-search-btn" onClick={clearSearch}>
                  Clear Search
                </button>
              </>
            ) : (
              <p>No students found in this class.</p>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Student Name</th>
                  <th>Admission No</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr key={student.userId}>
                    <td className="text-center">{index + 1}</td>
                    <td>
                      <div className="student-name">
                        {student.name || "N/A"}
                      </div>
                    </td>
                    <td>{student.admissionNo || "N/A"}</td>
                    <td>
                      {student.studentPhone || student.parentPhone || "N/A"}
                    </td>
                    <td>
                      <button
                        className="payment-btn"
                        onClick={() =>
                          navigate("/admindashboard/fee-details", {
                            state: {
                              studentId: student.userId,
                              studentName: student.name,
                            },
                          })
                        }
                      >
                        View Payment Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminViewClassStudents;
