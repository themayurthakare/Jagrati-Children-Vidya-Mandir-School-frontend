import React, { useState, useEffect } from "react";
import "../styles/Attendencereport.css";

const Attendencereport = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    date: "",
    className: "",
  });
  const [summary, setSummary] = useState({ present: 0, absent: 0 });

  // ================= FETCH ATTENDANCE =================
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("http://localhost:8080/api/attendance", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const text = await response.text();
          console.error("Non-OK response body:", text);
          throw new Error("Failed to fetch attendance");
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const text = await response.text();
          console.error("Expected JSON, got:", text);
          throw new Error("Server did not return JSON");
        }

        const data = await response.json();
        setReportData(data);
        calculateSummary(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  // ================= SUMMARY =================
  const calculateSummary = (data) => {
    const present = data.filter((item) => item.status === "Present").length;
    const absent = data.filter((item) => item.status === "Absent").length;
    setSummary({ present, absent });
  };

  // ================= FILTERS =================
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = () => {
    let filtered = reportData;

    if (filters.date) {
      filtered = filtered.filter(
        (item) =>
          new Date(item.date).toISOString().split("T")[0] === filters.date
      );
    }

    if (filters.className) {
      filtered = filtered.filter((item) =>
        (item.className || `${item.class}-${item.section}`).includes(
          filters.className
        )
      );
    }

    calculateSummary(filtered);
  };

  const filteredData = reportData.filter((item) => {
    if (
      filters.date &&
      new Date(item.date).toISOString().split("T")[0] !== filters.date
    ) {
      return false;
    }

    if (
      filters.className &&
      !(item.className || `${item.class}-${item.section}`).includes(
        filters.className
      )
    ) {
      return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="report-container">
        <h2 className="page-title">Attendance Report</h2>
        <div className="loading">Loading attendance report...</div>
      </div>
    );
  }

  return (
    <div className="report-container">
      <h2 className="page-title">Attendance Report</h2>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* FILTER SECTION */}
      <div className="filter-card">
        <div className="filter-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <label>Class</label>
          <input
            type="text"
            name="className"
            placeholder="e.g., 10A"
            value={filters.className}
            onChange={handleFilterChange}
          />
        </div>

        <button className="filter-btn" onClick={handleSearch}>
          Search
        </button>
        <button
          className="clear-btn"
          onClick={() => {
            setFilters({ date: "", className: "" });
            calculateSummary(reportData);
          }}
        >
          Clear
        </button>
      </div>

      {/* SUMMARY */}
      <div className="summary">
        <div className="summary-box present">
          <h3>Present</h3>
          <p>{summary.present}</p>
        </div>
        <div className="summary-box absent">
          <h3>Absent</h3>
          <p>{summary.absent}</p>
        </div>
        <div className="summary-box total">
          <h3>Total</h3>
          <p>{summary.present + summary.absent}</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        {filteredData.length === 0 ? (
          <div className="no-data">
            No attendance records found for selected filters
          </div>
        ) : (
          <table className="report-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={row.id || index}>
                  <td>{new Date(row.date).toLocaleDateString()}</td>
                  <td>{row.student || row.studentName}</td>
                  <td>{row.className || `${row.class}-${row.section}`}</td>
                  <td
                    className={
                      row.status === "Present"
                        ? "present-text"
                        : "absent-text"
                    }
                  >
                    {row.status}
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

export default Attendencereport;