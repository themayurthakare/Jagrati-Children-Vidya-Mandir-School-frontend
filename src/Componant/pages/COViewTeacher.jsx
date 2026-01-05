import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminViewTeacher.css";

const COViewTeacher = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teacherClasses, setTeacherClasses] = useState({});

  // Fetch teachers from API
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8080/api/teachers");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTeachers(data);

        // Fetch classes for all teachers using new API
        await fetchAllTeachersClasses(data);
      } catch (err) {
        console.error("Error fetching teachers:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Fetch classes for all teachers using new API
  const fetchAllTeachersClasses = async (teachersData) => {
    try {
      const classPromises = teachersData.map(async (teacher) => {
        try {
          const response = await fetch(
            `http://localhost:8080/api/teachers/${teacher.teacherId}/classes`
          );
          if (response.ok) {
            const classes = await response.json();
            const classList = Array.isArray(classes)
              ? classes.map(
                  (c) => c.className || c.name || `Class ${c.classId}`
                )
              : [];
            return {
              teacherId: teacher.teacherId,
              classes: classList,
            };
          }
        } catch (error) {
          console.error(
            `Error fetching classes for teacher ${teacher.teacherId}:`,
            error
          );
        }
        return { teacherId: teacher.teacherId, classes: [] };
      });

      const results = await Promise.all(classPromises);
      const map = {};
      results.forEach((r) => {
        map[r.teacherId] = r.classes;
      });
      setTeacherClasses(map);
    } catch (error) {
      console.error("Error fetching teacher classes:", error);
    }
  };

  // Delete teacher
  const deleteTeacher = async (teacherId, teacherName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete teacher "${teacherName}"?`
      )
    )
      return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/teachers/${teacherId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setTeachers(
          teachers.filter((teacher) => teacher.teacherId !== teacherId)
        );
        alert(`Teacher "${teacherName}" deleted successfully`);
      } else {
        const errorData = await response.json();
        alert(
          `Failed to delete teacher: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error deleting teacher:", error);
      alert("Failed to delete teacher. Please try again.");
    }
  };

  // Handle view details – no id in URL, pass whole teacher
  const viewDetails = (teacher) => {
    navigate("/computeroperator/view-teacher-details", {
      state: { teacherId: teacher.teacherId },
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading teachers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Teachers</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="vt-container">
      <div className="vt-header">
        <h2 className="vt-title">All Teachers</h2>
        <div className="vt-header-buttons">
          <button
            className="vt-add-btn"
            onClick={() => navigate("/computeroperator/add-teacher")}
          >
            + Add Teacher
          </button>
          <button
            className="vt-refresh-btn"
            onClick={() => window.location.reload()}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {teachers.length === 0 ? (
        <div className="no-teachers">
          <p>No teachers found. Add your first teacher!</p>
          <button
            className="vt-add-btn"
            onClick={() => navigate("/computeroperator/add-teacher")}
          >
            + Add Teacher
          </button>
        </div>
      ) : (
        <div className="vt-table-wrap">
          <table className="vt-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Name</th>
                <th>Assigned Classes</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Experience</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {teachers.map((teacher, index) => {
                const classes = teacherClasses[teacher.teacherId] || [];
                return (
                  <tr key={teacher.teacherId}>
                    <td>{index + 1}</td>
                    <td>{teacher.name}</td>
                    <td className="vt-classes-cell">
                      {classes.length === 0 ? (
                        <span className="vt-class-item">Not Assigned</span>
                      ) : (
                        classes.map((cls, idx) => (
                          <div key={idx} className="vt-class-item">
                            {cls}
                          </div>
                        ))
                      )}
                    </td>
                    <td>{teacher.email}</td>
                    <td>{teacher.phone}</td>
                    <td>
                      {teacher.yearOfExperience
                        ? `${teacher.yearOfExperience} years`
                        : "-"}
                    </td>
                    <td className="actions-column">
                      <button
                        className="vt-view-btn"
                        onClick={() => viewDetails(teacher)}
                      >
                        View
                      </button>
                      <button
                        className="vt-update-btn"
                        onClick={() =>
                          navigate("/computeroperator/update-teacher", {
                            state: {
                              teacherId: teacher.teacherId,
                              teacher: teacher, // optional but useful
                            },
                          })
                        }
                      >
                        Update
                      </button>

                      <button
                        className="vt-delete-btn"
                        onClick={() =>
                          deleteTeacher(teacher.teacherId, teacher.name)
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default COViewTeacher;
