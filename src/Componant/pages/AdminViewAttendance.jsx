import React, { useContext, useState, useEffect } from "react";
import "./AdminViewAttendance.css";
import { SessionContext } from "./SessionContext";

const AdminViewAttendance = () => {
  const [userId, setUserId] = useState("");
  const [attendances, setAttendances] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [classes, setClasses] = useState([]); // Store all classes

  const { selectedSession } = useContext(SessionContext);
  const sessionId = selectedSession?.id;

  // date filter state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Fetch all classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/classes/${sessionId}/getAll`
        );
        if (res.ok) {
          const data = await res.json();
          setClasses(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load classes:", err);
      }
    };

    fetchClasses();
  }, []);

  // Function to get class name by ID - fixed eqeqeq warning using strict equality
  const getClassName = (classId) => {
    if (!classId) return "N/A";
    const classObj = classes.find(
      (c) => c.classId === classId || c.id === classId
    );
    return classObj ? classObj.className || classObj.name : `Class ${classId}`;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    setStudentInfo(null);

    const id = userId?.toString().trim();
    if (!id) {
      setError("Please enter a student ID to search.");
      setAttendances([]);
      setFiltered([]);
      return;
    }
    if (!/^\d+$/.test(id)) {
      setError("Student ID must be a positive integer.");
      setAttendances([]);
      setFiltered([]);
      return;
    }

    setLoading(true);
    try {
      // First get student info
      const studentRes = await fetch(
        `http://localhost:8080/api/users/${sessionId}/${id}`
      );
      if (studentRes.ok) {
        const studentData = await studentRes.json();
        setStudentInfo({
          name: studentData.name || "Unknown",
          classId: studentData.studentClassId || null,
          className: getClassName(studentData.studentClassId),
          admissionNo: studentData.admissionNo || "N/A",
        });
      } else {
        throw new Error("Student not found");
      }

      // Then get attendance
      const attendanceRes = await fetch(
        `http://localhost:8080/api/attendance/user/${id}`,
        {
          headers: { Accept: "application/json" },
        }
      );

      if (!attendanceRes.ok) {
        if (attendanceRes.status === 404) {
          setAttendances([]);
          setFiltered([]);
          return;
        }
        throw new Error(`Server responded with ${attendanceRes.status}`);
      }

      const data = await attendanceRes.json();
      const arr = Array.isArray(data) ? data : [];

      // Sort by date (newest first)
      const sortedAttendances = arr.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setAttendances(sortedAttendances);
      setFiltered(sortedAttendances);
      setFromDate("");
      setToDate("");
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to fetch data. Please check the student ID.");
      setAttendances([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (isoDate) => {
    if (!isoDate) return "-";
    try {
      const date = new Date(isoDate);
      if (isNaN(date)) return isoDate;
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return isoDate;
    }
  };

  // Format status
  const formatStatus = (status) => {
    if (!status) return "-";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // Apply date filter
  const applyDateFilter = () => {
    if (!fromDate && !toDate) {
      setFiltered(attendances);
      return;
    }

    const filteredArr = attendances.filter((a) => {
      const d = a.date ? new Date(a.date) : null;
      if (!d) return false;

      if (fromDate) {
        const from = new Date(fromDate);
        if (d < from) return false;
      }

      if (toDate) {
        const to = new Date(toDate + "T23:59:59");
        if (d > to) return false;
      }

      return true;
    });

    setFiltered(filteredArr);
  };

  // Clear date filter
  const clearDateFilter = () => {
    setFromDate("");
    setToDate("");
    setFiltered(attendances);
  };

  // Calculate summary
  const calculateSummary = () => {
    const total = filtered.length;
    const present = filtered.filter(
      (a) => a.status && a.status.toUpperCase() === "PRESENT"
    ).length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    return { total, present, percentage };
  };

  const summary = calculateSummary();

  return (
    <div className="ava-container">
      <h2>Student Attendance Search</h2>

      {/* Search Form */}
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Enter Student ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-btn" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <div className="error-msg">{error}</div>}

      {/* Student Info */}
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

      {/* Date Filter */}
      {attendances.length > 0 && (
        <div className="date-filter">
          <h4>Filter by Date</h4>
          <div className="date-inputs">
            <div>
              <label>From:</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <label>To:</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="filter-btns">
              <button type="button" onClick={applyDateFilter}>
                Filter
              </button>
              <button type="button" onClick={clearDateFilter}>
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Summary */}
      {filtered.length > 0 && (
        <div className="summary">
          <h4>Attendance Summary</h4>
          <div className="summary-items">
            <div>
              <span>Total Records:</span> <strong>{summary.total}</strong>
            </div>
            <div>
              <span>Present:</span> <strong>{summary.present}</strong>
            </div>
            <div>
              <span>Attendance:</span> <strong>{summary.percentage}%</strong>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      {loading ? (
        <div className="loading">Loading attendance records...</div>
      ) : filtered.length === 0 && attendances.length > 0 ? (
        <div className="no-data">No records match the selected date range.</div>
      ) : filtered.length > 0 ? (
        <div className="table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Date</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((att, index) => (
                <tr key={att.attendanceId || index}>
                  <td>{index + 1}</td>
                  <td>{formatDate(att.date)}</td>
                  <td>{formatStatus(att.status)}</td>
                  <td>{att.remarks || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : attendances.length === 0 && studentInfo ? (
        <div className="no-data">
          No attendance records found for this student.
        </div>
      ) : null}
    </div>
  );
};

export default AdminViewAttendance;
