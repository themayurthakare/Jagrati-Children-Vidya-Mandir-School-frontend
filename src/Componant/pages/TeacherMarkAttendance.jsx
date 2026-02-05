import React, { useEffect, useState } from "react";
import "../styles/Attendance.css";

const TeacherMarkAttendance = () => {
  const teacherId = localStorage.getItem("userId");

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [recentAttendance, setRecentAttendance] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ================= FETCH CLASSES ================= */
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/teachers/${teacherId}/classes`
        );
        if (!res.ok) throw new Error("Failed to fetch classes");
        const data = await res.json();
        setClasses(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchClasses();
  }, [teacherId]);

  /* ================= FETCH RECENT ATTENDANCE ================= */
  useEffect(() => {
    const fetchRecentAttendance = async () => {
      try {
        const res = await fetch(
          "http://localhost:8080/api/attendance/today"
        );
        if (res.ok) {
          const data = await res.json();
          setRecentAttendance(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchRecentAttendance();
  }, []);

  /* ================= FETCH STUDENTS BY CLASS ================= */
  const fetchStudentsByClass = async (classId) => {
    if (!classId) {
      setStudents([]);
      return;
    }

    try {
      setLoading(true);
      setAttendance({});
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

  /* ================= CLASS CHANGE ================= */
  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    fetchStudentsByClass(classId);
  };

  /* ================= ATTENDANCE CHANGE ================= */
  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  /* ================= SAVE ATTENDANCE ================= */
  const handleSaveAttendance = async () => {
    try {
      if (!selectedClassId) {
        setError("Please select a class");
        return;
      }

      if (Object.keys(attendance).length === 0) {
        setError("Please mark attendance before saving");
        return;
      }

      setSaving(true);
      setError("");

      const payload = Object.entries(attendance).map(
        ([studentId, status]) => ({
          userId: Number(studentId),
          classId: Number(selectedClassId),
          status,
          date: new Date().toISOString().split("T")[0],
        })
      );

      const res = await fetch(
        "http://localhost:8080/api/attendance/mark",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Attendance save failed");
      }

      alert("Attendance saved successfully ✅");
      setAttendance({});
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="attendance-container">
      <h2 className="page-title">Mark Attendance</h2>

      {error && <div className="error-message">{error}</div>}

      {/* ============ CLASS DROPDOWN ============ */}
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

      {/* ============ MARK ATTENDANCE TABLE ============ */}
      <div className="attendance-card">
        <h3>Students Attendance</h3>

        {loading ? (
          <p>Loading students...</p>
        ) : (
          <table className="attendance-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="3">No students found</td>
                </tr>
              ) : (
                students.map((stu, index) => (
                  <tr key={stu.userId}>
                    <td>{index + 1}</td>
                    <td>{stu.name}</td>
                    <td>
                      <label>
                        <input
                          type="radio"
                          name={`attendance-${stu.userId}`}
                          checked={attendance[stu.userId] === "Present"}
                          onChange={() =>
                            handleAttendanceChange(stu.userId, "Present")
                          }
                        />
                        Present
                      </label>

                      <label style={{ marginLeft: "15px" }}>
                        <input
                          type="radio"
                          name={`attendance-${stu.userId}`}
                          checked={attendance[stu.userId] === "Absent"}
                          onChange={() =>
                            handleAttendanceChange(stu.userId, "Absent")
                          }
                        />
                        Absent
                      </label>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        <button
          className="save-btn"
          onClick={handleSaveAttendance}
          disabled={saving || students.length === 0}
        >
          {saving ? "Saving..." : "Save Attendance"}
        </button>
      </div>

      {/* ============ RECENT ATTENDANCE TABLE ============ */}
      <div className="attendance-card">
        <h3>Recent Attendance</h3>

        <table className="attendance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Student</th>
              <th>Class</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {recentAttendance.length > 0 ? (
              recentAttendance.map((rec, index) => (
                <tr key={index}>
                  <td>{new Date(rec.date).toLocaleDateString()}</td>
                  <td>{rec.studentName}</td>
                  <td>{rec.className}</td>
                  <td>{rec.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No attendance records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherMarkAttendance;