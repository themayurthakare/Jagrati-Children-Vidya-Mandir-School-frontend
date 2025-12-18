import { useState, useEffect } from "react";
import "../styles/ViewMarks.css";

export default function ViewMarks() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [examFilter, setExamFilter] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Get teacher ID from localStorage
  const teacherId = localStorage.getItem("teacherId");

  // Fetch marks data from API
  useEffect(() => {
    if (!teacherId) {
      setError("Teacher not authenticated. Please login again.");
      setLoading(false);
      return;
    }
    fetchMarksData();
  }, [teacherId]);

  const fetchMarksData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/teachers/marks/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch marks data");
      }

      const marksData = await response.json();
      setStudents(marksData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtered data
  const filteredStudents = students.filter(
    (s) =>
      (classFilter === "" || s.class === classFilter) &&
      (examFilter === "" || s.exam === examFilter)
  );

  const getUniqueClasses = () => {
    const classes = [...new Set(students.map(s => s.class))];
    return classes.sort();
  };

  const getUniqueExams = () => {
    const exams = [...new Set(students.map(s => s.exam))];
    return exams.sort();
  };

  if (loading) {
    return (
      <div className="view-container">
        <h2 className="view-title">View Marks</h2>
        <div className="loading">Loading marks data...</div>
      </div>
    );
  }

  return (
    <div className="view-container">
      <h2 className="view-title">View Marks</h2>

      {error && (
        <div className="error-message">
          {error}
          <button className="retry-btn" onClick={fetchMarksData}>
            Retry
          </button>
        </div>
      )}

      {/* FILTERS */}
      <div className="filter-row">
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
        >
          <option value="">All Classes</option>
          {getUniqueClasses().map(cls => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>

        <select
          value={examFilter}
          onChange={(e) => setExamFilter(e.target.value)}
        >
          <option value="">All Exams</option>
          {getUniqueExams().map(exam => (
            <option key={exam} value={exam}>{exam}</option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="view-table">
          <thead>
            <tr>
              <th>Sr. No</th>
              <th>Student Name</th>
              <th>Class</th>
              <th>Exam</th>
              <th>Percentage</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s, i) => (
              <tr key={s.id}>
                <td>{i + 1}</td>
                <td>{s.name || s.studentName}</td>
                <td>{s.class || `${s.className} - ${s.section}`}</td>
                <td>{s.exam}</td>
                <td>{s.percentage}%</td>
                <td className={s.remarks === "Pass" ? "pass" : "fail"}>
                  {s.remarks || (s.percentage >= 40 ? "Pass" : "Fail")}
                </td>
                <td>
                  <button className="report-btn" onClick={() => setSelectedStudent(s)}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}

            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan="7" className="no-data">
                  No records found for selected filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* SIMPLE REPORT CARD MODAL (No separate component needed) */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="report-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedStudent.name}</h3>
              <button className="close-btn" onClick={() => setSelectedStudent(null)}>
                ×
              </button>
            </div>
            
            <div className="report-content">
              <p><strong>Class:</strong> {selectedStudent.class}</p>
              <p><strong>Exam:</strong> {selectedStudent.exam}</p>
              <p><strong>Percentage:</strong> {selectedStudent.percentage}%</p>
              <p className={`remarks ${selectedStudent.remarks?.toLowerCase()}`}>
                <strong>Remarks:</strong> {selectedStudent.remarks || (selectedStudent.percentage >= 40 ? "Pass" : "Fail")}
              </p>
            </div>
            
            <button 
              className="print-btn" 
              onClick={() => window.print()}
            >
              Print Report Card
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
