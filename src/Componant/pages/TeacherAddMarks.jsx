import { useState, useEffect } from "react";
import "../styles/Addmarks.css";

export default function AddMarksList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch students data from API
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:8080/api/teachers/${localStorage.getItem(
          "userId"
        )}/students`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("Non-OK response body:", text);
        throw new Error("Failed to fetch students");
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Expected JSON, got:", text);
        throw new Error("Server did not return JSON");
      }

      const students = await response.json();

      // Transform API data to match table structure
      const formattedRows = students.map((student, index) => ({
        id: student.id,
        srno: index + 1,
        name: student.name || student.studentName || "",
        marathi: "",
        hindi: "",
        english: "",
        math: "",
        science: "",
      }));

      setRows(formattedRows);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        id: `new-${Date.now()}`, // Temp ID for new rows
        srno: rows.length + 1,
        name: "",
        marathi: "",
        hindi: "",
        english: "",
        math: "",
        science: "",
      },
    ]);
  };

  const handleSave = async () => {
    const teacherId = localStorage.getItem("userId");

    try {
      setSaving(true);
      setError("");

      // Filter out empty rows and validate
      const validRows = rows
        // only existing students: skip rows whose id starts with "new-"
        .filter(
          (row) => !(typeof row.id === "string" && row.id.startsWith("new-"))
        )
        .filter((row) => {
          const hasMarks =
            row.marathi || row.hindi || row.english || row.math || row.science;
          return hasMarks;
        })
        .map((row) => ({
          studentId: row.id,
          marathi: parseInt(row.marathi, 10) || 0,
          hindi: parseInt(row.hindi, 10) || 0,
          english: parseInt(row.english, 10) || 0,
          math: parseInt(row.math, 10) || 0,
          science: parseInt(row.science, 10) || 0,
        }));

      if (validRows.length === 0) {
        setError("No valid marks to save");
        return;
      }

      const response = await fetch(
        "http://localhost:8080/api/teachers/marks/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teacherId,
            marks: validRows,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to save marks";
        try {
          const errorData = await response.json();
          if (errorData.message) errorMessage = errorData.message;
        } catch {
          // ignore JSON parse errors and use default
        }
        throw new Error(errorMessage);
      }

      alert("Marks saved successfully ✅");
      // Optionally refresh:
      // fetchStudents();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="marks-container">
        <h2 className="marks-title">Add Student Marks</h2>
        <div className="loading">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="marks-container">
      <h2 className="marks-title">Add Student Marks</h2>

      {error && (
        <div className="error-message">
          {error}
          <button className="retry-btn" onClick={fetchStudents}>
            Retry
          </button>
        </div>
      )}

      <div className="table-wrapper">
        <table className="marks-table">
          <thead>
            <tr>
              <th>Sr No</th>
              <th>Student Name</th>
              <th>Marathi</th>
              <th>Hindi</th>
              <th>English</th>
              <th>Math</th>
              <th>Science</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id || index}>
                <td>{row.srno}</td>
                <td>
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) =>
                      handleChange(index, "name", e.target.value)
                    }
                    disabled={
                      row.id &&
                      typeof row.id === "string" &&
                      !row.id.startsWith("new-")
                    } // Disable for existing students
                    className={
                      row.id &&
                      typeof row.id === "string" &&
                      !row.id.startsWith("new-")
                        ? "disabled"
                        : ""
                    }
                  />
                </td>
                {["marathi", "hindi", "english", "math", "science"].map(
                  (sub) => (
                    <td key={sub}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row[sub] || ""}
                        onChange={(e) =>
                          handleChange(index, sub, e.target.value)
                        }
                        className="marks-input"
                      />
                    </td>
                  )
                )}
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => {
                      const updated = rows.filter((_, i) => i !== index);
                      setRows(updated.map((r, i) => ({ ...r, srno: i + 1 })));
                    }}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Buttons */}
      <div className="btn-group">
        <button className="add-btn" onClick={addRow} disabled={saving}>
          Add Student
        </button>

        <button
          className="save-btn"
          onClick={handleSave}
          disabled={saving || rows.length === 0}
        >
          {saving ? "Saving..." : "Save Marks"}
        </button>
      </div>
    </div>
  );
}
