import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/Enrolledstudents.css";

const Enrolledstudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  
  // Get teacher ID from localStorage
  const teacherId = localStorage.getItem("teacherId");

  // Fetch students data from API
  useEffect(() => {
    if (!teacherId) {
      setError("Teacher not authenticated. Please login again.");
      setLoading(false);
      return;
    }
    fetchStudents();
  }, [teacherId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/teachers/${teacherId}/students`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      const studentsData = await response.json();
      setStudents(studentsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="students-container">
        <h2 className="page-title">View Enrolled Students</h2>
        <div className="loading">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="students-container">
      <h2 className="page-title">View Enrolled Students</h2>

      {error && (
        <div className="error-message">
          {error}
          <button className="retry-btn" onClick={fetchStudents}>
            Retry
          </button>
        </div>
      )}

      {students.length === 0 ? (
        <div className="no-data">
          <p>No students enrolled yet.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((stu, index) => (
                <tr key={stu.id}>
                  <td>{index + 1}</td>
                  <td>{stu.name || stu.studentName}</td>
                  <td>{stu.className || `${stu.class} - ${stu.section}`}</td>
                  <td>{stu.gender}</td>
                  <td>{stu.phone || stu.contact || stu.mobile}</td>
                  <td>
                    <button className="action-btn view-marks">
                      Marks
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Enrolledstudents;
