import React, { useState, useEffect, useCallback, useMemo } from "react";
import "../styles/Addmarks.css";

/* ===== SUBJECTS BY CATEGORY ===== */
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
    { key: "evs", label: "EVS" },
    { key: "computer", label: "Computer" },
    { key: "gk", label: "GK" },
    { key: "drawing", label: "Drawing" },
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

/* ===== CLASS NAME → CATEGORY ===== */
const getCategoryByClassName = (name = "") => {
  const lower = name.toLowerCase();

  if (lower.includes("nursery") || lower.includes("lkg") || lower.includes("ukg"))
    return "PRIMARY";

  if (
    lower.includes("1st") ||
    lower.includes("2nd") ||
    lower.includes("3rd") ||
    lower.includes("4th") ||
    lower.includes("5th")
  )
    return "MIDDLE";

  if (lower.includes("6th") || lower.includes("7th") || lower.includes("8th"))
    return "SECONDARY";

  return null;
};

export default function TeacherAddMarks() {
  /* ================= AUTH ================= */
  const teacherId = localStorage.getItem("userId");

  /* ================= SESSION ================= */
  const [sessionId, setSessionId] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      // 1️⃣ Try localStorage first
      const savedId = localStorage.getItem("sessionId");
      if (savedId) {
        setSessionId(Number(savedId));
        setLoadingSession(false);
        return;
      }

      // 2️⃣ Fallback → active session from DB
      try {
        const res = await fetch("http://localhost:8080/api/sessions/getAll");
        const data = await res.json();

        const active = data.find((s) => s.active === true);
        if (active) {
          localStorage.setItem("sessionId", active.sessionId);
          setSessionId(active.sessionId);
        }
      } catch (e) {
        console.error("Session init failed", e);
      } finally {
        setLoadingSession(false);
      }
    };

    initSession();
  }, []);

  /* ================= STATE ================= */
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [rows, setRows] = useState([]);
  const [examType, setExamType] = useState("");
  const [saving, setSaving] = useState(false);

  /* ================= FETCH ASSIGNED CLASSES ================= */
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/teachers/${teacherId}/classes`
        );
        const data = await res.json();
        setClasses(data);
      } catch {
        setClasses([]);
      }
    };

    if (teacherId) fetchClasses();
  }, [teacherId]);

  /* ================= SUBJECTS ================= */
  const category = useMemo(() => {
    return selectedClass
      ? getCategoryByClassName(selectedClass.className)
      : null;
  }, [selectedClass]);

  const activeSubjects = useMemo(() => {
    return SUBJECT_BY_CATEGORY[category] || [];
  }, [category]);

  /* ================= FETCH STUDENTS ================= */
  const fetchStudents = useCallback(async () => {
    if (!teacherId || !selectedClass) return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/teachers/${teacherId}/class/${selectedClass.classId}/students`
      );
      const data = await res.json();

      const formatted = data.map((s, index) => {
        const row = {
          id: s.userId,
          srno: index + 1,
          name: s.name,
        };
        activeSubjects.forEach((sub) => (row[sub.key] = ""));
        return row;
      });

      setRows(formatted);
    } catch {
      setRows([]);
    }
  }, [teacherId, selectedClass, activeSubjects]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  /* ================= INPUT CHANGE ================= */
  const handleChange = (rowIndex, key, value) => {
    const updated = [...rows];
    updated[rowIndex][key] = value;
    setRows(updated);
  };

  /* ================= SAVE MARKS ================= */
  const handleSave = async () => {
    if (!teacherId) return alert("Teacher not logged in");
    if (!selectedClass) return alert("Please select class");
    if (!sessionId) return alert("Academic session not set");
    if (!examType) return alert("Please select exam");

    try {
      setSaving(true);

      const payload = rows.map((r) => ({
        studentId: r.id,
        teacherId: Number(teacherId),
        classId: Number(selectedClass.classId),
        sessionId: Number(sessionId),
        examType,
        ...Object.fromEntries(
          activeSubjects.map((s) => [s.key, Number(r[s.key]) || 0])
        ),
      }));

      const res = await fetch("http://localhost:8080/api/marks/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();
      alert("Marks saved successfully ✅");
    } catch {
      alert("Marks save failed ❌");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */
  if (loadingSession) {
    return <div className="marks-container">Loading academic session...</div>;
  }

  return (
    <div className="marks-container">
      <h2>Add Student Marks</h2>

      <div className="filter-row">
        <select
          value={selectedClass?.classId || ""}
          onChange={(e) =>
            setSelectedClass(
              classes.find((c) => c.classId === Number(e.target.value))
            )
          }
        >
          <option value="">Select Class</option>
          {classes.map((cls) => (
            <option key={cls.classId} value={cls.classId}>
              {cls.className}
            </option>
          ))}
        </select>

        {/* ✅ ONLY DROPDOWN UPDATED */}
        <select value={examType} onChange={(e) => setExamType(e.target.value)}>
          <option value="">Select Exam</option>

          <option disabled>── Exam Types ──</option>
          <option value="Quarterly">Quarterly</option>
          <option value="Half Yearly">Half Yearly</option>
          <option value="Annual">Annual</option>

          <option disabled>── Months ──</option>
          <option value="January">January</option>
          <option value="February">February</option>
          <option value="March">March</option>
          <option value="April">April</option>
          <option value="May">May</option>
          <option value="June">June</option>
          <option value="July">July</option>
          <option value="August">August</option>
          <option value="September">September</option>
          <option value="October">October</option>
          <option value="November">November</option>
          <option value="December">December</option>
        </select>
      </div>

      {rows.length > 0 && (
        <>
          <table className="marks-table">
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Student Name</th>
                {activeSubjects.map((sub) => (
                  <th key={sub.key}>{sub.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id}>
                  <td>{row.srno}</td>
                  <td>{row.name}</td>
                  {activeSubjects.map((sub) => (
                    <td key={sub.key}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row[sub.key]}
                        onChange={(e) =>
                          handleChange(i, sub.key, e.target.value)
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Marks"}
          </button>
        </>
      )}
    </div>
  );
}
