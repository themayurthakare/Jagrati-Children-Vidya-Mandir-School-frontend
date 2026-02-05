import React, { useEffect, useState } from "react";
import "../styles/Attendance.css";

const TeacherMarkAttendance = () => {
  const teacherId = localStorage.getItem("userId");

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [recentAttendance, setRecentAttendance] = useState([]);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [alreadyMarked, setAlreadyMarked] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingStatus, setEditingStatus] = useState("");

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

  /* ================= FETCH STUDENTS ================= */
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

  /* ================= CHECK ALREADY MARKED ================= */
  const checkAlreadyMarked = async (classId, date) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/attendance/check/${classId}/${date}`
      );
      if (res.ok) {
        const data = await res.json();
        setAlreadyMarked(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= LOAD ATTENDANCE BY CLASS + DATE ================= */
  const loadAttendanceByClassAndDate = async (classId, date) => {
    if (!classId || !date) return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/attendance/class/${classId}/date/${date}`
      );

      if (res.ok) {
        const data = await res.json();
        setRecentAttendance(data);
      } else {
        setRecentAttendance([]);
      }
    } catch (err) {
      console.error(err);
      setRecentAttendance([]);
    }
  };

  /* ================= CLASS CHANGE ================= */
  const handleClassChange = async (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);

    await fetchStudentsByClass(classId);
    await checkAlreadyMarked(classId, selectedDate);
    await loadAttendanceByClassAndDate(classId, selectedDate);
  };

  /* ================= DATE CHANGE ================= */
  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);

    if (selectedClassId) {
      await checkAlreadyMarked(selectedClassId, date);
      await loadAttendanceByClassAndDate(selectedClassId, date);
    }
  };

  /* ================= REFRESH BUTTON ================= */
  const handleRefresh = async () => {
    if (!selectedClassId) return;

    setAttendance({});
    await fetchStudentsByClass(selectedClassId);
    await checkAlreadyMarked(selectedClassId, selectedDate);
    await loadAttendanceByClassAndDate(selectedClassId, selectedDate);
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

      if (alreadyMarked) {
        alert("⚠️ Attendance already marked for this class & date!");
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
          date: selectedDate,
        })
      );

      const res = await fetch("http://localhost:8080/api/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Attendance save failed");
      }

      alert("Attendance saved successfully ✅");

      setAttendance({});
      await checkAlreadyMarked(selectedClassId, selectedDate);
      await loadAttendanceByClassAndDate(selectedClassId, selectedDate);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ================= EDIT MODE ================= */
  const handleEditClick = (rec) => {
    setEditingId(rec.attendanceId);
    setEditingStatus(rec.status);
  };

  const handleEditSave = async () => {
    try {
      if (!editingId) return;

      const res = await fetch(
        `http://localhost:8080/api/attendance/edit/${editingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: editingStatus }),
        }
      );

      if (!res.ok) throw new Error("Update failed");

      alert("Attendance updated ✅");

      setEditingId(null);
      setEditingStatus("");

      await loadAttendanceByClassAndDate(selectedClassId, selectedDate);
    } catch (err) {
      alert("Edit failed ❌");
    }
  };

  return (
    <div className="attendance-container">
      <h2 className="page-title">Mark Attendance</h2>

      {error && <div className="error-message">{error}</div>}

      {/* ============ CLASS + DATE + REFRESH ============ */}
      <div className="filter-row" style={{ display: "flex", gap: 10 }}>
        <select value={selectedClassId} onChange={handleClassChange}>
          <option value="">Select Class</option>
          {classes.map((cls) => (
            <option key={cls.classId} value={cls.classId}>
              {cls.className}
            </option>
          ))}
        </select>

        <input type="date" value={selectedDate} onChange={handleDateChange} />

        <button
          type="button"
          title="Refresh attendance"
          onClick={handleRefresh}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #ccc",
            cursor: "pointer",
            background: "#fff",
          }}
        >
          🔄
        </button>
      </div>

      {alreadyMarked && (
        <div style={{ marginTop: 10, color: "red", fontWeight: "bold" }}>
          ⚠️ Attendance already marked for this class & date!
        </div>
      )}

      {/* ============ MARK TABLE ============ */}
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
                          disabled={alreadyMarked}
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
                          disabled={alreadyMarked}
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
          disabled={saving || students.length === 0 || alreadyMarked}
        >
          {saving ? "Saving..." : "Save Attendance"}
        </button>
      </div>

      {/* ============ RECENT ATTENDANCE ============ */}
      <div className="attendance-card">
        <h3>Attendance Records ({selectedDate})</h3>

        <table className="attendance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Student</th>
              <th>Class</th>
              <th>Status</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {recentAttendance.length > 0 ? (
              recentAttendance.map((rec, index) => (
                <tr key={index}>
                  <td>{new Date(rec.date).toLocaleDateString()}</td>
                  <td>{rec.studentName}</td>
                  <td>{rec.className}</td>
                  <td>
                    {editingId === rec.attendanceId ? (
                      <select
                        value={editingStatus}
                        onChange={(e) => setEditingStatus(e.target.value)}
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                      </select>
                    ) : (
                      rec.status
                    )}
                  </td>
                  <td>
                    {editingId === rec.attendanceId ? (
                      <button onClick={handleEditSave}>Save</button>
                    ) : (
                      <button onClick={() => handleEditClick(rec)}>Edit</button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No attendance records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherMarkAttendance;
