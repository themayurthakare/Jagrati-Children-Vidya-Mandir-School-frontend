import { useState, useEffect } from "react";
import "../styles/Addmarks.css";

export default function AddMarksList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Get teacher ID from localStorage (set during login)
  const teacherId = localStorage.getItem("teacherId");

  // Fetch students data from API
  useEffect(() => {
    if (!teacherId) {
      setError("Teacher not authenticated. Please login again.");
      setLoading(false);
      return;
    }
    fetchStudents();
  }, [teacherId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/teachers/${teacherId}/students`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch students");
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
    if (!teacherId) {
      setError("Teacher not authenticated");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // Filter out empty rows and validate
      const validRows = rows
        .filter(row => row.id && row.id !== `new-${row.id}`) // Only existing students
        .filter(row => {
          const hasMarks = row.marathi || row.hindi || row.english || row.math || row.science;
          return hasMarks && !isNaN(parseInt(row.marathi)) === false; // At least one mark
        })
        .map(row => ({
          studentId: row.id,
          marathi: parseInt(row.marathi) || 0,
          hindi: parseInt(row.hindi) || 0,
          english: parseInt(row.english) || 0,
          math: parseInt(row.math) || 0,
          science: parseInt(row.science) || 0,
        }));

      if (validRows.length === 0) {
        setError("No valid marks to save");
        return;
      }

      const response = await fetch("/api/teachers/marks/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          teacherId,
          marks: validRows,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save marks");
      }

      alert("Marks saved successfully ✅");
      // Refresh data to show updated marks (optional)
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
                    onChange={(e) => handleChange(index, "name", e.target.value)}
                    disabled={row.id && row.id.indexOf('new-') !== 0} // Disable for existing students
                    className={row.id && row.id.indexOf('new-') !== 0 ? "disabled" : ""}
                  />
                </td>
                {["marathi", "hindi", "english", "math", "science"].map((sub) => (
                  <td key={sub}>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={row[sub] || ""}
                      onChange={(e) => handleChange(index, sub, e.target.value)}
                      className="marks-input"
                    />
                  </td>
                ))}
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
