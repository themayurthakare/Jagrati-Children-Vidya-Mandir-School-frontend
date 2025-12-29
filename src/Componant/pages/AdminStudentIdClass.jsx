import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "./SessionContext";

import "./AdminStudentIdClass.css";

const AdminStudentIdClass = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { selectedSession } = useContext(SessionContext);
  const sessionId = selectedSession?.id;

  const loadClasses = () => {
    setLoading(true);
    setError("");
    fetch(`http://localhost:8080/api/classes/${sessionId}/getAll`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Classes API endpoint not found");
          }
          throw new Error(`Network response was not ok: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setClasses(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length === 0) {
          setError("No classes found in the system.");
        }
      })
      .catch((err) => {
        setError(`Failed to load classes: ${err.message}`);
        setClasses([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadClasses();
  }, []);

  return (
    <div className="id-cards-container">
      <div className="id-cards-header">
        <h2 className="id-cards-title">Generate ID & Admit Cards</h2>
        <button
          className="id-cards-refresh-btn"
          onClick={loadClasses}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="id-cards-error">
          <p>{error}</p>
          <button
            className="error-retry-btn"
            onClick={loadClasses}
            disabled={loading}
          >
            Retry
          </button>
        </div>
      )}

      <div className="id-cards-table-container">
        {loading ? (
          <div className="loading-state">
            <p>Loading classes...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="empty-state">
            <p>No classes found.</p>
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
                <tr key={c.classId || c.id}>
                  <td className="text-center">{index + 1}</td>

                  <td>
                    <div className="class-name1">
                      {c.className || "Unnamed Class"}
                    </div>
                  </td>

                  <td className="text-center">
                    <div className="action-buttons">
                      <button
                        className="idcard1-btn"
                        onClick={() =>
                          navigate("/admindashboard/generate-admit-cards", {
                            state: {
                              classId: c.classId || c.id,
                              className: c.className,
                            },
                          })
                        }
                      >
                        Generate ID Card
                      </button>

                      <button
                        className="admit-btn"
                        onClick={() =>
                          navigate("/admindashboard/generate-admit-cards", {
                            state: {
                              classId: c.classId || c.id,
                              className: c.className,
                            },
                          })
                        }
                      >
                        Generate Admit Card
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

export default AdminStudentIdClass;
