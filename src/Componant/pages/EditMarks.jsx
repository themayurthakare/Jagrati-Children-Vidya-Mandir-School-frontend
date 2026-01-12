import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/EditMarks.css";

/* ===== SUBJECT LABELS ===== */
const SUBJECT_LABELS = {
  marathi: "Marathi",
  hindi: "Hindi",
  english: "English",
  maths: "Maths",
  science: "Science",
  socialScience: "Social Science",
  evs: "EVS",
  computer: "Computer",
  gk: "GK",
  drawing: "Drawing",
  sanskrit: "Sanskrit",
};

export default function EditMarks() {
  // ✅ CORRECT PARAM
  const { marksId } = useParams();
  console.log("ROUTE PARAMS:", { marksId });

  const navigate = useNavigate();

  const [marks, setMarks] = useState({});
  const [studentInfo, setStudentInfo] = useState({
    name: "",
    className: "",
    examType: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ================= FETCH MARKS ================= */
  useEffect(() => {
    if (!marksId) return;

    const fetchMarks = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `http://localhost:8080/api/marks/${marksId}`
        );
        if (!res.ok) throw new Error("Failed to fetch marks");

        const record = await res.json();
        console.log("RECORD FROM API:", record);

        setMarks(record);
        setStudentInfo({
          name: record.studentName,
          className: record.className,
          examType: record.examType,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, [marksId]);

  const subjects = Object.keys(SUBJECT_LABELS);

  const handleChange = (key, value) => {
    setMarks((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const payload = {};
      subjects.forEach((s) => {
        payload[s] = Number(marks[s]) || 0;
      });

      const res = await fetch(
        `http://localhost:8080/api/marks/${marksId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to update marks");

      navigate("/teacherdashboard/view-marks");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading marks...</div>;

  return (
    <div className="edit-marks-container">
      <h2>Edit Student Marks</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="student-info">
        <p><strong>Name:</strong> {studentInfo.name}</p>
        <p><strong>Class:</strong> {studentInfo.className}</p>
        <p><strong>Exam:</strong> {studentInfo.examType}</p>
      </div>

      <table className="edit-marks-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Marks</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((key) => (
            <tr key={key}>
              <td>{SUBJECT_LABELS[key]}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={marks[key] ?? ""}
                  onChange={(e) =>
                    handleChange(key, e.target.value)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="btn-group">
        <button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button
          className="cancel-btn"
          onClick={() =>
            navigate("/teacherdashboard/view-marks")
          }
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
