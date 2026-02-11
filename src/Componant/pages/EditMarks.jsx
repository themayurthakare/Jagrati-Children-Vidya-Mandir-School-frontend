import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/EditMarks.css";

/* ===== SUBJECT CONFIG ===== */
const SUBJECT_BY_CATEGORY = {
  PRIMARY: [
    { key: "hindi", label: "Hindi", hasProject: true },
    { key: "english", label: "English", hasProject: true },
    { key: "maths", label: "Maths", hasProject: true },
    { key: "gk", label: "GK", hasProject: false },
    { key: "drawing", label: "Drawing", hasProject: false },
  ],

  MIDDLE: [
    { key: "hindi", label: "Hindi", hasProject: true },
    { key: "english", label: "English", hasProject: true },
    { key: "maths", label: "Maths", hasProject: true },
    { key: "computer", label: "Computer", hasProject: false },
    { key: "gk", label: "GK", hasProject: false },
    { key: "drawing", label: "Drawing", hasProject: false },
    { key: "evs", label: "EVS", hasProject: true },
  ],

  SECONDARY: [
    { key: "hindi", label: "Hindi", hasProject: true },
    { key: "english", label: "English", hasProject: true },
    { key: "maths", label: "Maths", hasProject: true },
    { key: "science", label: "Science", hasProject: true },
    { key: "socialScience", label: "Social Science", hasProject: true },
    { key: "sanskrit", label: "Sanskrit", hasProject: true },
    { key: "gk", label: "GK", hasProject: false },
  ],
};

/* ===== CLASS → CATEGORY ===== */
const getCategoryByClassName = (name = "") => {
  const lower = name.toLowerCase();

  if (
    lower.includes("nursery") ||
    lower.includes("lkg") ||
    lower.includes("ukg") ||
    lower.includes("primary")
  ) {
    return "PRIMARY";
  }

  if (
    lower.includes("1st") ||
    lower.includes("2nd") ||
    lower.includes("3rd") ||
    lower.includes("4th") ||
    lower.includes("5th")
  ) {
    return "MIDDLE";
  }

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

        setMarks(record);

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
    [studentInfo.className]
  );

  const activeSubjects = SUBJECT_BY_CATEGORY[category] || [];

  /* ================= CHANGE ================= */
  const handleChange = (field, value) => {
    setMarks((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const payload = {};

      activeSubjects.forEach((sub) => {
        const theoryField = `${sub.key}Theory`;
        const projectField = `${sub.key}Project`;

        payload[theoryField] = Number(marks[theoryField]) || 0;

        if (sub.hasProject) {
          payload[projectField] = Number(marks[projectField]) || 0;
        }
      });

      const res = await fetch(`http://localhost:8080/api/marks/${marksId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update marks");

      alert("Marks Updated Successfully ✅");
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
            <th>Theory</th>
            <th>Project</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {activeSubjects.map((sub) => {
            const theoryField = `${sub.key}Theory`;
            const projectField = `${sub.key}Project`;

            const theoryVal = Number(marks[theoryField]) || 0;
            const projectVal = sub.hasProject
              ? Number(marks[projectField]) || 0
              : 0;

            const totalVal = theoryVal + projectVal;

            return (
              <tr key={sub.key}>
                <td>{sub.label}</td>

                {/* THEORY */}
                <td>
                  <input
                    type="number"
                    min="0"
                    max="80"
                    value={marks[theoryField] ?? ""}
                    onChange={(e) => handleChange(theoryField, e.target.value)}
                  />
                </td>

                {/* PROJECT */}
                <td>
                  {sub.hasProject ? (
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={marks[projectField] ?? ""}
                      onChange={(e) =>
                        handleChange(projectField, e.target.value)
                      }
                    />
                  ) : (
                    <span style={{ color: "gray" }}>N/A</span>
                  )}
                </td>

                {/* TOTAL */}
                <td>
                  <strong>{totalVal}</strong>
                </td>
              </tr>
            );
          })}
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
