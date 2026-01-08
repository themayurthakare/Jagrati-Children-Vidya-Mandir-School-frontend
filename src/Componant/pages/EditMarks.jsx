import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/EditMarks.css";

/* ===== SUBJECTS BY CLASS CATEGORY ===== */
const SUBJECT_BY_CATEGORY = {
  PRIMARY: ["hindi", "english", "maths", "gk", "drawing"],
  MIDDLE: ["hindi", "english", "maths", "evs", "computer", "gk", "drawing"],
  SECONDARY: [
    "hindi",
    "english",
    "maths",
    "science",
    "socialScience",
    "sanskrit",
    "gk",
  ],
};

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

/* ===== CLASS NAME → CATEGORY ===== */
const getCategoryByClassName = (name = "") => {
  if (name.toLowerCase() === "primary") return "PRIMARY";
  if (/class\s?[1-5]/i.test(name)) return "MIDDLE";
  if (/class\s?[6-8]/i.test(name)) return "SECONDARY";
  return "SECONDARY";
};

export default function EditMarks() {
  const { marksId } = useParams();
  const navigate = useNavigate();

  const [marks, setMarks] = useState({});
  const [studentInfo, setStudentInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /* ================= FETCH MARKS ================= */
  useEffect(() => {
    const fetchMarks = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `http://localhost:8080/api/marks/${marksId}`
        );
        if (!res.ok) throw new Error("Failed to fetch marks");

        const data = await res.json();

        setMarks(data);
        setStudentInfo({
          name: data.studentName,
          className: data.className,
          examType: data.examType,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, [marksId]);

  /* ================= CLASS CATEGORY (STABLE) ================= */
  const category = useMemo(() => {
    return getCategoryByClassName(studentInfo.className);
  }, [studentInfo.className]);

  /* ================= ACTIVE SUBJECTS (FIXED) ================= */
  const activeSubjects = useMemo(() => {
    return SUBJECT_BY_CATEGORY[category] || [];
  }, [category]);

  /* ================= TOTAL MARKS ================= */
  const totalMarks = useMemo(() => {
    return activeSubjects.reduce(
      (sum, s) => sum + (Number(marks[s]) || 0),
      0
    );
  }, [marks, activeSubjects]);

  /* ================= PERCENTAGE ================= */
  const percentage = useMemo(() => {
    return activeSubjects.length
      ? (totalMarks / activeSubjects.length).toFixed(2)
      : 0;
  }, [totalMarks, activeSubjects]);

  /* ================= HANDLE INPUT ================= */
  const handleChange = (key, value) => {
    setMarks(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  /* ================= SAVE UPDATED MARKS ================= */
  const confirmSave = async () => {
    try {
      setSaving(true);
      setError("");

      const payload = {};
      activeSubjects.forEach(s => {
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

      setSuccess("Marks updated successfully ✅");

      setTimeout(() => {
        navigate("/teacherdashboard/view-marks");
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
      setShowConfirm(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading marks...</div>;
  }

  return (
    <div className="edit-marks-container">
      <h2>Edit Student Marks</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-toast">{success}</div>}

      {/* ===== STUDENT INFO ===== */}
      <div className="student-info">
        <p><strong>Name:</strong> {studentInfo.name}</p>
        <p><strong>Class:</strong> {studentInfo.className}</p>
        <p><strong>Exam:</strong> {studentInfo.examType}</p>
      </div>

      {/* ===== EDIT TABLE ===== */}
      <table className="edit-marks-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Marks</th>
          </tr>
        </thead>
        <tbody>
          {activeSubjects.map(key => (
            <tr key={key}>
              <td>{SUBJECT_LABELS[key]}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={marks[key] ?? ""}
                  onChange={e => handleChange(key, e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== PREVIEW ===== */}
      <div className="preview-box">
        <p><strong>Total:</strong> {totalMarks}</p>
        <p><strong>Percentage:</strong> {percentage}%</p>
        <p>
          <strong>Status:</strong>{" "}
          <span className={percentage >= 35 ? "pass" : "fail"}>
            {percentage >= 35 ? "PASS" : "FAIL"}
          </span>
        </p>
      </div>

      {/* ===== ACTIONS ===== */}
      <div className="btn-group">
        <button onClick={() => setShowConfirm(true)} disabled={saving}>
          Save Changes
        </button>

        <button
          className="cancel-btn"
          onClick={() => navigate("/teacherdashboard/view-marks")}
        >
          Cancel
        </button>
      </div>

      {/* ===== CONFIRM MODAL ===== */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Confirm Update</h3>
            <p>Are you sure you want to update marks?</p>

            <div className="modal-actions">
              <button onClick={confirmSave} disabled={saving}>
                {saving ? "Saving..." : "Yes, Save"}
              </button>
              <button onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
