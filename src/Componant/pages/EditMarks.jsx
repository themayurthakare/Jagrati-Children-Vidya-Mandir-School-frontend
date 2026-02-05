import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/EditMarks.css";

/* ===== SUBJECTS BY CATEGORY (SAME AS ADD MARKS) ===== */
const SUBJECT_BY_CATEGORY = {
  PRIMARY: [
    { key: "hindi", label: "Hindi" },
    { key: "english", label: "English" },
    { key: "maths", label: "Maths" },
    { key: "gk", label: "GK" },
    { key: "drawing", label: "Drawing" },
  ],

  MIDDLE: [
    { key: "hindi", label: "Hindi" },
    { key: "english", label: "English" },
    { key: "maths", label: "Maths" },
    { key: "computer", label: "Computer" },
    { key: "gk", label: "GK" },
    { key: "drawing", label: "Drawing" },
    { key: "evs", label: "EVS" },
  ],

  SECONDARY: [
    { key: "hindi", label: "Hindi" },
    { key: "english", label: "English" },
    { key: "maths", label: "Maths" },
    { key: "science", label: "Science" },
    { key: "socialScience", label: "Social Science" },
    { key: "sanskrit", label: "Sanskrit" },
    { key: "gk", label: "GK" },
  ],
};

/* ===== CLASS → CATEGORY (SAME AS ADD MARKS) ===== */
const getCategoryByClassName = (name = "") => {
  const lower = name.toLowerCase();

  // Nursery / LKG / UKG
  if (
    lower.includes("nursery") ||
    lower.includes("lkg") ||
    lower.includes("ukg") ||
    lower.includes("primary")
  ) {
    return "PRIMARY";
  }

  // Class 1 to 5
  if (
    lower.includes("1st") ||
    lower.includes("2nd") ||
    lower.includes("3rd") ||
    lower.includes("4th") ||
    lower.includes("5th")
  ) {
    return "MIDDLE";
  }

  // Class 6 to 8
  if (lower.includes("6th") || lower.includes("7th") || lower.includes("8th")) {
    return "SECONDARY";
  }

  return null;
};

export default function EditMarks() {
  const { marksId } = useParams();
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

        const res = await fetch(`http://localhost:8080/api/marks/${marksId}`);
        if (!res.ok) throw new Error("Failed to fetch marks");

        const record = await res.json();

        // save all marks
        setMarks(record);

        // save student info
        setStudentInfo({
          name: record.studentName || "",
          className: record.className || "",
          examType: record.examType || "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, [marksId]);

  /* ================= CATEGORY & SUBJECTS ================= */
  const category = useMemo(
    () => getCategoryByClassName(studentInfo.className),
    [studentInfo.className],
  );

  const activeSubjects = SUBJECT_BY_CATEGORY[category] || [];

  /* ================= CHANGE ================= */
  const handleChange = (key, value) => {
    setMarks((prev) => ({ ...prev, [key]: value }));
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      // send ONLY allowed subjects
      const payload = {};
      activeSubjects.forEach((s) => {
        payload[s.key] = Number(marks[s.key]) || 0;
      });

      const res = await fetch(`http://localhost:8080/api/marks/${marksId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

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
        <p>
          <strong>Name:</strong> {studentInfo.name}
        </p>
        <p>
          <strong>Class:</strong> {studentInfo.className}
        </p>
        <p>
          <strong>Exam:</strong> {studentInfo.examType}
        </p>
      </div>

      <table className="edit-marks-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Marks</th>
          </tr>
        </thead>
        <tbody>
          {activeSubjects.map((sub) => (
            <tr key={sub.key}>
              <td>{sub.label}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={marks[sub.key] ?? ""}
                  onChange={(e) => handleChange(sub.key, e.target.value)}
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
          onClick={() => navigate("/teacherdashboard/view-marks")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
