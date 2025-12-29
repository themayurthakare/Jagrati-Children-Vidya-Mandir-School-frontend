import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "./SessionContext";
import "./AdminViewClasses.css";

const AdminViewClasses = () => {
  const { selectedSession } = useContext(SessionContext);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadClasses = async () => {
    if (!selectedSession?.id) {
      setClasses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/classes/${selectedSession.id}/getAll`
      );

      if (!res.ok) throw new Error("Failed to fetch classes");

      const data = await res.json();
      setClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load classes:", err);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 reload whenever session changes
  useEffect(() => {
    loadClasses();
  }, [selectedSession]);

  // ---------------- DELETE CLASS ----------------
  const deleteClass = async (id) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;

    try {
      const res = await fetch(`http://localhost:8080/api/classes/${id}`, {
        method: "DELETE",
      });

      if (res.status === 204) {
        alert("Class deleted successfully.");
        loadClasses();
      } else {
        alert("Failed to delete class.");
      }
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Error deleting class.");
    }
  };

  return (
    <div className="vc-container">
      <div className="vc-header">
        <h2 className="vc-title">All Classes</h2>

        <button
          className="vc-add-btn"
          onClick={() => navigate("/admindashboard/add-class")}
        >
          + Add Class
        </button>
      </div>

      <div className="vc-table-wrap">
        <table className="vc-table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Class Name</th>
              <th>Fees</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="vc-empty">
                  Loading...
                </td>
              </tr>
            ) : classes.length === 0 ? (
              <tr>
                <td colSpan="5" className="vc-empty">
                  No classes found.
                </td>
              </tr>
            ) : (
              classes.map((c, index) => (
                <tr key={c.classId}>
                  <td>{index + 1}</td>
                  <td>{c.className}</td>
                  <td>₹ {c.fees}</td>

                  <td>
                    <button
                      className="vc-update-btn"
                      onClick={() =>
                        navigate("/admindashboard/update-class", {
                          state: { classId: c.classId },
                        })
                      }
                    >
                      Update
                    </button>
                  </td>

                  <td>
                    <button
                      className="vc-delete-btn"
                      onClick={() => deleteClass(c.classId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminViewClasses;
