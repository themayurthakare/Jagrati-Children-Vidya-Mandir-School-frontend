import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Assignedclasses.css";

const Assignedclasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Get teacher ID from localStorage (set during login)
  const teacherId = localStorage.getItem("userId");

  // Fetch assigned classes from API
  useEffect(() => {
    loadClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(
        `http://localhost:8080/api/teachers/${teacherId}/classes`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("Non-OK response body:", text);
        throw new Error("Failed to fetch classes");
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Expected JSON, got:", text);
        throw new Error("Server did not return JSON");
      }

      const data = await response.json();
      setClasses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // For retry button
  const fetchAssignedClasses = () => {
    loadClasses();
  };

  const handleViewStudents = () => {
    navigate(`/teacherdashboard/enrolled-students?teacherId=${teacherId}`);
  };

  if (loading) {
    return (
      <div className="assigned-container">
        <h2 className="page-title">View Assigned Classes</h2>
        <div className="loading">Loading your classes...</div>
      </div>
    );
  }

  return (
    <div className="assigned-container">
      <h2 className="page-title">View Assigned Classes</h2>

      {error && (
        <div className="error-message">
          {error}
          <button className="retry-btn" onClick={fetchAssignedClasses}>
            Retry
          </button>
        </div>
      )}

      {classes.length === 0 ? (
        <div className="no-data">
          <p>No classes assigned yet.</p>
          <p>Contact admin to assign classes.</p>
        </div>
      ) : (
        <div className="card-grid">
          {classes.map((cls) => (
            <div className="class-card" key={cls.id}>
              <h3>{cls.className || `${cls.class} - ${cls.section}`}</h3>
              <p>
                <strong>Section:</strong> {cls.section}
              </p>
              <p>
                <strong>Subject:</strong> {cls.subject}
              </p>
              <p>
                <strong>Total Students:</strong>{" "}
                {cls.studentsCount || cls.studentCount || 0}
              </p>
              <button className="view-btn" onClick={handleViewStudents}>
                View Students
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Assignedclasses;
