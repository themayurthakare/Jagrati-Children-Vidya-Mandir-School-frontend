import React, { useEffect, useState } from "react";
import "./AdminViewAttendance.css";

const Attendance = () => {
  /* ---------------- AUTH ---------------- */
  const studentId = localStorage.getItem("userId");

  /* ---------------- SESSION ---------------- */
  const [sessionId, setSessionId] = useState(localStorage.getItem("sessionId"));

  /* ---------------- STATE ---------------- */
  const [attendances, setAttendances] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [classes, setClasses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* ---------------- AUTO ACTIVE SESSION ---------------- */
  useEffect(() => {
    if (sessionId) return;

    const loadSession = async () => {
      const res = await fetch("http://localhost:8080/api/sessions/getAll");
      const sessions = await res.json();
      const active =
        sessions.find((s) => s.active) || sessions.find((s) => s.isActive);

      if (active) {
        const sid = active.sessionId || active.id;
        setSessionId(sid);
        localStorage.setItem("sessionId", sid);
      }
    };

    loadSession();
  }, [sessionId]);

  /* ---------------- CLASSES ---------------- */
  useEffect(() => {
    if (!sessionId) return;

    fetch(`http://localhost:8080/api/classes/${sessionId}/getAll`)
      .then((res) => res.json())
      .then((data) => setClasses(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [sessionId]);

  const getClassName = (classId) => {
    const c = classes.find(
      (x) =>
        String(x.classId) === String(classId) ||
        String(x.id) === String(classId),
    );
    return c ? c.className || c.name : "-";
  };

  /* ---------------- DATA ---------------- */
  useEffect(() => {
    if (!studentId || !sessionId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // student info
        const studentRes = await fetch(
          `http://localhost:8080/api/users/${sessionId}/${studentId}`,
        );
        if (!studentRes.ok) throw new Error("Student not found");
        const student = await studentRes.json();

        setStudentInfo({
          name: student.name,
          admissionNo: student.admissionNo,
          className: getClassName(student.studentClassId),
        });

        // attendance
        const attRes = await fetch(
          `http://localhost:8080/api/attendance/user/${studentId}`,
        );

        const arr = attRes.ok ? await attRes.json() : [];
        const sorted = (Array.isArray(arr) ? arr : []).sort(
          (a, b) => new Date(b.date) - new Date(a.date),
        );

        setAttendances(sorted);
        setFiltered(sorted);
      } catch (err) {
        setError(err.message || "Failed to load attendance");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, sessionId, classes]);

  /* ---------------- FILTER ---------------- */
  const applyDateFilter = () => {
    const f = attendances.filter((a) => {
      const d = new Date(a.date);
      if (fromDate && d < new Date(fromDate)) return false;
      if (toDate && d > new Date(toDate + "T23:59:59")) return false;
      return true;
    });
    setFiltered(f);
  };

  const clearDateFilter = () => {
    setFromDate("");
    setToDate("");
    setFiltered(attendances);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const total = filtered.length;
  const present = filtered.filter(
    (a) => a.status?.toUpperCase() === "PRESENT",
  ).length;
  const percentage = total ? ((present / total) * 100).toFixed(1) : 0;

  /* ---------------- UI ---------------- */
  return (
    <div className="ava-container">
      <h2>My Attendance</h2>

      {error && <div className="error-msg">{error}</div>}

      {studentInfo && (
        <div className="student-info">
          <h3>Student Details</h3>
          <div className="info-grid">
            <div>
              <strong>Name:</strong> {studentInfo.name}
            </div>
            <div>
              <strong>Class:</strong> {studentInfo.className}
            </div>
            <div>
              <strong>Admission No:</strong> {studentInfo.admissionNo}
            </div>
          </div>
        </div>
      )}

      {attendances.length > 0 && (
        <div className="date-filter">
          <h4>Filter by Date</h4>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <button onClick={applyDateFilter}>Filter</button>
          <button onClick={clearDateFilter}>Clear</button>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="summary">
          <div>
            Total Records: <strong>{total}</strong>
          </div>
          <div>
            Present: <strong>{present}</strong>
          </div>
          <div>
            Attendance: <strong>{percentage}%</strong>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading attendance...</div>
      ) : filtered.length === 0 ? (
        <div className="no-data">No attendance records found.</div>
      ) : (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => (
              <tr key={a.attendanceId || i}>
                <td>{i + 1}</td>
                <td>{formatDate(a.date)}</td>
                <td>{a.status}</td>
                <td>{a.remarks || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Attendance;
