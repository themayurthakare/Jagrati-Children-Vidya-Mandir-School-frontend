import React, { useEffect, useState } from "react";
import "./AdminViewAttendance.css";

const Attendance = () => {
  // 🔐 studentId from login
  const studentId = localStorage.getItem("userId");

  const [attendances, setAttendances] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [classes, setClasses] = useState([]);

  // date filter
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* ---------------- Fetch Classes ---------------- */
  useEffect(() => {
    fetch("http://localhost:8080/api/classes/getAll")
      .then((res) => res.json())
      .then((data) => setClasses(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const getClassName = (classId) => {
    const c = classes.find(
      (x) => x.classId === classId || x.id === classId
    );
    return c ? c.className || c.name : "-";
  };

  /* ---------------- Fetch Attendance ---------------- */
  useEffect(() => {
    if (!studentId) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // student info
        const studentRes = await fetch(
          `http://localhost:8080/api/users/${studentId}`
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
          `http://localhost:8080/api/attendance/user/${studentId}`
        );
        if (!attRes.ok) {
          setAttendances([]);
          setFiltered([]);
          return;
        }

        const arr = await attRes.json();
        const sorted = (Array.isArray(arr) ? arr : []).sort(
          (a, b) => new Date(b.date) - new Date(a.date)
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
  }, [studentId, classes]);

  /* ---------------- Filters ---------------- */
  const applyDateFilter = () => {
    if (!fromDate && !toDate) {
      setFiltered(attendances);
      return;
    }

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

  const summary = {
    total: filtered.length,
    present: filtered.filter(
      (a) => a.status?.toUpperCase() === "PRESENT"
    ).length,
  };

  const percentage =
    summary.total > 0
      ? ((summary.present / summary.total) * 100).toFixed(1)
      : 0;

  /* ---------------- UI ---------------- */
  return (
    <div className="ava-container">
      <h2>My Attendance</h2>

      {error && <div className="error-msg">{error}</div>}

      {studentInfo && (
        <div className="student-info">
          <div><strong>Name:</strong> {studentInfo.name}</div>
          <div><strong>Class:</strong> {studentInfo.className}</div>
          <div><strong>Admission No:</strong> {studentInfo.admissionNo}</div>
        </div>
      )}

      {attendances.length > 0 && (
        <div className="date-filter">
          <h4>Filter by Date</h4>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          <button onClick={applyDateFilter}>Filter</button>
          <button onClick={clearDateFilter}>Clear</button>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="summary">
          <div>Total: <strong>{summary.total}</strong></div>
          <div>Present: <strong>{summary.present}</strong></div>
          <div>Attendance: <strong>{percentage}%</strong></div>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading attendance…</div>
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
