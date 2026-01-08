import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Enrolledstudents.css";

const TeacherViewEnrolledStudents = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const teacherId = localStorage.getItem("userId");

  /* ================= AUTH + LOAD CLASSES ================= */
  useEffect(() => {
    if (!teacherId) {
      navigate("/login");
      return;
    }

    const fetchClasses = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/teachers/${teacherId}/classes`
        );
        if (!res.ok) throw new Error("Failed to fetch classes");
        const data = await res.json();
        setClasses(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchClasses();
  }, [teacherId, navigate]);

  /* ================= FETCH STUDENTS BY CLASS ================= */
  const fetchStudentsByClass = async (classId) => {
    if (!classId) {
      setStudents([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `http://localhost:8080/api/teachers/${teacherId}/class/${classId}/students`
      );

      if (res.status === 204) {
        setStudents([]);
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch students");

      const data = await res.json();
      setStudents(data);
    } catch (err) {
      setError(err.message);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= DROPDOWN CHANGE ================= */
  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    fetchStudentsByClass(classId);
  };

  return (
    <div className="students-container">

      {/* ===== Assigned Classes ===== */}
      <div className="assigned-card">
        <h3>Assigned Classes</h3>
        {classes.length === 0 ? (
          <p>No classes assigned</p>
        ) : (
          <div className="class-badges">
            {classes.map((cls) => (
              <span key={cls.classId} className="class-badge">
                {cls.className}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ===== Page Title ===== */}
      <h2 className="page-title">Enrolled Students</h2>

      {/* ===== Class Dropdown ===== */}
      <div className="filter-row">
        <select value={selectedClassId} onChange={handleClassChange}>
          <option value="">Select Class</option>
          {classes.map((cls) => (
            <option key={cls.classId} value={cls.classId}>
              {cls.className}
            </option>
          ))}
        </select>
      </div>

      {/* ===== Status Messages ===== */}
      {loading && <p>Loading students...</p>}
      {error && <div className="error-message">{error}</div>}

      {!loading && selectedClassId && students.length === 0 && (
        <p>No students found.</p>
      )}

      {/* ===== Students Table ===== */}
      {students.length > 0 && (
        <div className="table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {students.map((stu, index) => (
                <tr key={stu.userId}>
                  <td>{index + 1}</td>
                  <td>{stu.name}</td>
                  <td>{stu.gender}</td>
                  <td>{stu.studentPhone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default TeacherViewEnrolledStudents;