import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ViewMarks.css";

export default function ViewMarks() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [examFilter, setExamFilter] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchMarksData();
  }, []);

  const fetchMarksData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:8080/api/marks");
      if (!response.ok) throw new Error("Failed to fetch marks data");

      const data = await response.json();

      const formatted = data.map((m, index) => {
        const percentage =
          m.percentage ??
          (m.totalMarks && m.maxMarks
            ? Math.round((m.totalMarks / m.maxMarks) * 100)
            : 0);

        return {
          id: m.id,
          name: m.studentName || m.userName || "N/A",
          className: m.className || "N/A",
          exam: m.examType || "N/A",
          percentage,
          remarks: percentage >= 40 ? "Pass" : "Fail",
        };
      });

      setStudents(formatted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      (classFilter === "" || s.className === classFilter) &&
      (examFilter === "" || s.exam === examFilter)
  );

  const classes = [...new Set(students.map((s) => s.className))];
  const exams = [...new Set(students.map((s) => s.exam))];

  if (loading) {
    return <div className="loading">Loading marks data...</div>;
  }

  return (
    <div className="view-container">
      <h2 className="view-title">View Marks</h2>

      {error && <div className="error-message">{error}</div>}

      {/* FILTERS */}
      <div className="filter-row">
        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
          <option value="">All Classes</option>
          {classes.map((cls) => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>

        <select value={examFilter} onChange={(e) => setExamFilter(e.target.value)}>
          <option value="">All Exams</option>
          {exams.map((exam) => (
            <option key={exam} value={exam}>{exam}</option>
          ))}
        </select>
      </div>

      {/* TABLE */}
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
              <td>{s.name}</td>
              <td>{s.className}</td>
              <td>{s.exam}</td>
              <td>{s.percentage}%</td>
              <td className={s.percentage >= 40 ? "pass" : "fail"}>
                {s.remarks}
              </td>
              <td className="action-cell">
                <button
                  className="report-btn"
                  onClick={() => setSelectedStudent(s)}
                >
                  View
                </button>

                <button
                  className="edit-btn"
                  onClick={() => navigate(`/teacherdashboard/edit-marks/${s.id}`)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}

          {filteredStudents.length === 0 && (
            <tr>
              <td colSpan="7" className="no-data">No records found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* MODAL (unchanged) */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="report-card" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedStudent.name}</h3>
            <p>Class: {selectedStudent.className}</p>
            <p>Exam: {selectedStudent.exam}</p>
            <p>Percentage: {selectedStudent.percentage}%</p>
            <button onClick={() => setSelectedStudent(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}