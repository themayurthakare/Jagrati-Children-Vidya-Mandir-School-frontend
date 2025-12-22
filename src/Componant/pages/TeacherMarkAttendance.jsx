import React, { useState, useEffect } from "react";
import "../styles/Attendance.css";

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [recentAttendance, setRecentAttendance] = useState([]);

  // Fetch students and recent attendance
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch students
      const studentsRes = await fetch(
        `http://localhost:8080/api/teachers/${localStorage.getItem(
          "userId"
        )}/students`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!studentsRes.ok) throw new Error("Failed to fetch students");

      const studentsData = await studentsRes.json();
      setStudents(studentsData);

      // Fetch recent attendance
      const attendanceRes = await fetch(
        `http://localhost:8080/api/teachers/${localStorage.getItem(
          "userId"
        )}/attendance`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json();
        setRecentAttendance(attendanceData.slice(0, 5)); // Last 5 records
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (studentId, status) => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      setError("");

      const teacherId = localStorage.getItem("userId");

      const attendanceData = Object.entries(attendance).map(
        ([studentId, status]) => ({
          studentId: parseInt(studentId, 10),
          status,
          date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
          teacherId,
        })
      );

      const response = await fetch("http://localhost:8080/api/teachers/mark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attendanceData),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Non-OK response body:", text);
        throw new Error("Failed to save attendance");
      }

      alert("Attendance saved successfully ✅");
      setAttendance({}); // Reset form
      fetchData(); // Refresh recent attendance
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="attendance-container">
        <h2 className="page-title">Mark & View Attendance</h2>
        <div className="loading">Loading attendance data...</div>
      </div>
    );
  }

  return (
    <div className="attendance-container">
      <h2 className="page-title">Mark & View Attendance</h2>

      {error && (
        <div className="error-message">
          {error}
          <button className="retry-btn" onClick={fetchData}>
            Retry
          </button>
        </div>
      )}

      {/* MARK ATTENDANCE */}
      <div className="attendance-card">
        <h3>Mark Attendance (Today)</h3>
        <div className="table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((stu, index) => (
                <tr key={stu.id}>
                  <td>{index + 1}</td>
                  <td>{stu.name || stu.studentName}</td>
                  <td className="radio-cell">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name={`attendance-${stu.id}`}
                        value="Present"
                        checked={attendance[stu.id] === "Present"}
                        onChange={() => handleChange(stu.id, "Present")}
                      />
                      Present
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name={`attendance-${stu.id}`}
                        value="Absent"
                        checked={attendance[stu.id] === "Absent"}
                        onChange={() => handleChange(stu.id, "Absent")}
                      />
                      Absent
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          className="save-btn"
          onClick={handleSaveAttendance}
          disabled={saving || Object.keys(attendance).length === 0}
        >
          {saving ? "Saving..." : "Save Attendance"}
        </button>
      </div>

      {/* VIEW RECENT ATTENDANCE */}
      <div className="attendance-card">
        <h3>Recent Attendance</h3>
        <div className="table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAttendance.length > 0 ? (
                recentAttendance.map((record, index) => (
                  <tr key={index}>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>{record.studentName}</td>
                    <td className={record.status.toLowerCase()}>
                      {record.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-data">
                    No attendance records yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
