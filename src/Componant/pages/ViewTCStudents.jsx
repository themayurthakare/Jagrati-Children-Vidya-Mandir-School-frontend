import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./AdminViewStudents.css";

const ViewTCStudents = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  // 🔥 LOAD TC STUDENTS
  const loadStudents = () => {
    setLoading(true);
    fetch(`http://localhost:8080/api/tc/all`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        const studentsArray = Array.isArray(data) ? data : [];
        setStudents(studentsArray);
        setFilteredStudents(studentsArray);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setStudents([]);
        setFilteredStudents([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // 🔍 SEARCH
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStudents(students);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = students.filter(
        (student) =>
          (student.name && student.name.toLowerCase().includes(term)) ||
          (student.admissionNo &&
            student.admissionNo.toLowerCase().includes(term)) ||
          (student.studentPhone && student.studentPhone.includes(term)) ||
          (student.className && student.className.toLowerCase().includes(term))
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  // 🗓 DATE FORMATTER
  const formatDate = (date) => {
    if (!date) return "-";
    try {
      return new Date(date).toLocaleDateString("en-IN");
    } catch {
      return date;
    }
  };

  return (
    <div className="vs-container">
      <div className="vs-header">
        <h2 className="vs-title">TC Issued Students</h2>

        {/* SEARCH BAR */}
        <div className="vs-search-bar">
          <div className="vs-search-input-group">
            <input
              type="text"
              className="vs-search-input"
              placeholder="Search TC students..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <span className="vs-search-icon">🔍</span>
            {searchTerm && (
              <button className="vs-search-clear" onClick={clearSearch}>
                ×
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="vs-search-count">
              {filteredStudents.length} of {students.length} students
            </div>
          )}
        </div>

        <div className="vs-header-buttons">
          <button className="vs-refresh-btn" onClick={loadStudents}>
            ↻ Refresh
          </button>
        </div>
      </div>

      <div className="vs-table-wrap">
        <table className="vs-table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Name</th>
              <th>Class Name</th>
              <th>Admission No</th>
              <th>Phone</th>
              <th>TC Issue Date</th>
              <th>Reprint TC</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="vs-empty">
                  Loading...
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="7" className="vs-empty">
                  {searchTerm
                    ? `No TC students found matching "${searchTerm}"`
                    : "No TC students found."}
                </td>
              </tr>
            ) : (
              filteredStudents.map((s, index) => (
                <tr key={s.tcId}>
                  <td>{index + 1}</td>
                  <td>{s.name ?? "-"}</td>
                  <td>{s.className ?? "-"}</td>
                  <td>{s.admissionNo ?? "-"}</td>
                  <td>{s.studentPhone ?? "-"}</td>
                  <td>{formatDate(s.tcIssueDate)}</td>

                  {/* REPRINT TC */}
                  <td>
                    <button
                      className="vs-view-btn"
                      onClick={() =>
                        navigate("/admindashboard/generate-tc", {
                          state: { tcId: s.tcId },
                        })
                      }
                    >
                      Reprint
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

export default ViewTCStudents;
