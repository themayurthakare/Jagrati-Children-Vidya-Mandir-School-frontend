import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminViewFees.css";

const OperatorViewFees = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadClasses = () => {
    setLoading(true);
    setError("");
    fetch("http://localhost:8080/api/classes/getAll")
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
        console.log("Classes data received:", data);
        setClasses(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length === 0) {
          setError("No classes found in the system.");
        }
      })
      .catch((err) => {
        console.error("Failed to load classes:", err);
        setError(`Failed to load classes: ${err.message}`);
        setClasses([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "₹ 0";
    return `₹ ${parseInt(amount).toLocaleString("en-IN")}`;
  };

  return (
    <div className="fees-container">
      <div className="fees-header">
        <h2 className="fees-title">Class Fees Details</h2>
        <div className="header-buttons">
          <button
            className="fees-refresh-btn"
            onClick={loadClasses}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="fees-error">
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

      <div className="fees-table-container">
        {loading ? (
          <div className="loading-state">
            <p>Loading class fees...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="empty-state">
            <p>No classes found.</p>
            <button
              className="add-class-btn"
              onClick={() => navigate("/admindashboard/add-class")}
            >
              Add Class
            </button>
          </div>
        ) : (
          <table className="fees-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Class Name</th>
                <th>Annual Fees</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {classes.map((c, index) => (
                <tr key={c.classId || c.id}>
                  <td className="text-center">{index + 1}</td>
                  <td>
                    <div className="class-name">
                      {c.className || "Unnamed Class"}
                    </div>
                  </td>
                  <td className="text-left fees-amount">
                    {formatCurrency(c.fees)}
                  </td>
                  <td className="text-center">
                    <div className="action-buttons">
                      <button
                        className="view-btn"
                        onClick={() =>
                          navigate("/admindashboard/view-class-student", {
                            state: {
                              classId: c.classId || c.id,
                              className: c.className,
                            },
                          })
                        }
                      >
                        View Students
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

export default OperatorViewFees;
