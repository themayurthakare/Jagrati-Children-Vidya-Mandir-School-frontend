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

const EXAMS = ["Monthly Exam", "Midsem", "Final"];

/* ===== CLASS NAME → CATEGORY ===== */
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

export default function TeacherAddMarks() {
  /* ================= AUTH ================= */
  const teacherId = localStorage.getItem("userId");

  // ✅ FINAL SAFE SESSION HANDLING (Admin + Teacher compatible)
  let sessionId = null;
  try {
    const activeSession = JSON.parse(localStorage.getItem("activeSession"));
    const selectedSession = JSON.parse(localStorage.getItem("selectedSession"));

    sessionId =
      activeSession?.id ||
      activeSession?.sessionId ||
      selectedSession?.id ||
      selectedSession?.sessionId ||
      null;
  } catch (e) {
    sessionId = null;
  }

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
          `http://localhost:8080/api/teachers/${teacherId}/classes`,
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setClasses(data);
      } catch {
        setClasses([]);
      }
    };

    if (teacherId) fetchClasses();
  }, [teacherId]);

  /* ================= SUBJECTS BY SELECTED CLASS ================= */
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
        `http://localhost:8080/api/teachers/${teacherId}/class/${selectedClass.classId}/students`,
      );

      if (!res.ok) {
        setRows([]);
        return;
      }

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
    if (!teacherId) {
      alert("Teacher not logged in");
      return;
    }

    if (!selectedClass?.classId) {
      alert("Please select class");
      return;
    }

    if (!sessionId) {
      alert("Kindly select an academic session to continue.");
      return;
    }

    if (!examType) {
      alert("Please select exam");
      return;
    }

    if (rows.length === 0) {
      alert("No students found");
      return;
    }

    try {
      setSaving(true);

      const payload = rows.map((r) => ({
        studentId: r.id,
        teacherId: Number(teacherId),
        classId: Number(selectedClass.classId),
        sessionId: Number(sessionId),
        examType,
        ...Object.fromEntries(
          activeSubjects.map((s) => [s.key, Number(r[s.key]) || 0]),
        ),
      }));

      console.log("FINAL MARKS PAYLOAD:", payload);

      const res = await fetch("http://localhost:8080/api/marks/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("SAVE MARKS ERROR:", err);
        alert("Marks save failed ❌");
        return;
      }

      alert("Marks saved successfully ✅");
    } catch (e) {
      console.error(e);
      alert("Server error");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="marks-container">
      <h2>Add Student Marks</h2>

      {/* ✅ Active session display */}
      <div style={{ marginBottom: 10, fontSize: 14 }}>
        <b>Active Session:</b>{" "}
        {sessionName ? sessionName : "Not Active (Contact Admin)"}
      </div>

      <div className="filter-row">
        <select
          value={selectedClass?.classId || ""}
          onChange={(e) =>
            setSelectedClass(
              classes.find((c) => c.classId === Number(e.target.value)),
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

        <select value={examType} onChange={(e) => setExamType(e.target.value)}>
          <option value="">Select Exam</option>
          {EXAMS.map((ex) => (
            <option key={ex} value={ex}>
              {ex}
            </option>
          ))}
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
