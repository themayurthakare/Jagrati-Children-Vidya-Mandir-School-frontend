import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminViewTeacher.css";

const AdminViewTeacher = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classNames, setClassNames] = useState({});

  // Fetch teachers from API
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8080/api/teachers/all");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTeachers(data);

        // Extract unique class IDs and fetch class names
        const uniqueClassIds = [
          ...new Set(data.map((teacher) => teacher.classId).filter((id) => id)),
        ];
        await fetchClassNames(uniqueClassIds);
      } catch (err) {
        console.error("Error fetching teachers:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Fetch class names for the class IDs
  const fetchClassNames = async (classIds) => {
    if (classIds.length === 0) return;

    try {
      const classPromises = classIds.map(async (classId) => {
        try {
          const response = await fetch(
            `http://localhost:8080/api/classes/${classId}`
          );
          if (response.ok) {
            const classData = await response.json();
            return {
              id: classId,
              name: classData.className || `Class ${classId}`,
            };
          }
        } catch (error) {
          console.error(`Error fetching class ${classId}:`, error);
        }
        return { id: classId, name: `Class ${classId}` };
      });

      const classResults = await Promise.all(classPromises);
      const classMap = {};
      classResults.forEach((result) => {
        classMap[result.id] = result.name;
      });
      setClassNames(classMap);
    } catch (error) {
      console.error("Error fetching class names:", error);
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
        // Remove from state
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

  // Handle view details
  const viewDetails = (teacher) => {
    navigate(`/admindashboard/view-teacher/${teacher.teacherId}`, {
      state: { teacher },
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
            onClick={() => navigate("/admindashboard/add-teacher")}
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
            onClick={() => navigate("/admindashboard/add-teacher")}
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
                <th>Class</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Experience</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {teachers.map((teacher, index) => (
                <tr key={teacher.teacherId}>
                  <td>{index + 1}</td>
                  <td>{teacher.name}</td>
                  <td>
                    {teacher.classId
                      ? classNames[teacher.classId] ||
                        `Class ${teacher.classId}`
                      : "Not Assigned"}
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
                        navigate(
                          `/admindashboard/update-teacher/${teacher.teacherId}`
                        )
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminViewTeacher;
