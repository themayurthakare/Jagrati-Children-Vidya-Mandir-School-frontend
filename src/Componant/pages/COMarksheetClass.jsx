import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "./SessionContext";
import "./AdminStudentIdClass.css";

const COMarksheetClass = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const { selectedSession } = useContext(SessionContext);
  const sessionId = selectedSession?.id;

  const loadClasses = () => {
    if (!sessionId) {
      setError("No session selected. Please select a session first.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    // Try multiple endpoints to fetch classes
    const fetchClasses = async () => {
      try {
        // Method 1: Try the classes endpoint
        const response = await fetch(
          `http://localhost:8080/api/classes/${sessionId}/getAll`,
        );

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setClasses(data);
          } else {
            setClasses([]);
          }
        } else {
          // Method 2: Try alternative endpoint
          const altResponse = await fetch(
            `http://localhost:8080/api/classes/session/${sessionId}`,
          );
          if (altResponse.ok) {
            const data = await altResponse.json();
            setClasses(Array.isArray(data) ? data : []);
          } else {
            setError("Unable to fetch classes. Please check your connection.");
          }
        }
      } catch (err) {
        console.error("Error fetching classes:", err);
        setError(`Failed to load classes: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  };

  useEffect(() => {
    loadClasses();
  }, [sessionId]);

  return (
    <div className="id-cards-container">
      <div className="id-cards-header">
        <h2 className="id-cards-title">Generate Marksheet - Select Class</h2>
        <button
          className="id-cards-refresh-btn"
          onClick={loadClasses}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div
          className="id-cards-error"
          style={{
            color: "red",
            padding: "10px",
            margin: "10px 0",
            backgroundColor: "#ffeeee",
          }}
        >
          <p>{error}</p>
        </div>
      )}

      <div className="id-cards-table-container">
        {loading ? (
          <div
            className="loading-state"
            style={{ textAlign: "center", padding: "50px" }}
          >
            <p>Loading classes...</p>
          </div>
        ) : classes.length === 0 ? (
          <div
            className="no-data"
            style={{ textAlign: "center", padding: "50px" }}
          >
            <p>No classes found for this session.</p>
            <p>Session ID: {sessionId}</p>
            <button
              onClick={loadClasses}
              style={{ marginTop: "20px", padding: "10px 20px" }}
            >
              Try Again
            </button>
          </div>
        ) : (
          <table className="id-cards-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Class Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c, index) => (
                <tr key={c.classId || index}>
                  <td className="text-center">{index + 1}</td>
                  <td>
                    <div className="class-name1">{c.className}</div>
                  </td>
                  <td className="text-center">
                    <button
                      className="tc-btn"
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        navigate("/computeroperator/marksheet-students", {
                          state: {
                            classId: c.classId,
                            className: c.className,
                          },
                        })
                      }
                    >
                      View Students
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

export default COMarksheetClass;
