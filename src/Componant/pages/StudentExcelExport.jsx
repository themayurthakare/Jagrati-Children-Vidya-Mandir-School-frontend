import React, { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./StudentExcelExport.css";

/* ============================
   COLUMN LABELS (JSON → UI)
============================ */
const COLUMN_LABELS = {
  userId: "User ID",
  name: "Student Name",
  admissionNo: "Admission No",
  admissionDate: "Admission Date",
  fatherName: "Father Name",
  motherName: "Mother Name",
  dob: "Date of Birth",
  studentPhone: "Student Phone",
  parentPhone: "Parent Phone",
  email: "Email",
  address: "Address",
  gender: "Gender",
  studentAadharNo: "Student Aadhar",
  parentAadharNo: "Parent Aadhar",
  rte: "RTE",
  tcNumber: "TC Number",
  ssmId: "SSM ID",
  passoutClass: "Passout Class",
  studentClassId: "Class ID",
  caste: "Caste",
  subCaste: "Sub Caste",
  religion: "Religion",
  apaarId: "APAAR ID",
  panNo: "PAN No",
};

const StudentPdfExport = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState({});
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ============================
     FETCH STUDENTS
  ============================ */
  useEffect(() => {
    fetch("http://localhost:8080/api/users/getAll")
      .then((res) => res.json())
      .then((data) => {
        setStudents(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Student API error", err);
        setLoading(false);
      });
  }, []);

  /* ============================
     FETCH CLASSES
  ============================ */
  useEffect(() => {
    fetch("http://localhost:8080/api/classes/getAll")
      .then((res) => res.json())
      .then((data) => setClasses(data || []))
      .catch((err) => console.error("Class API error", err));
  }, []);

  /* ============================
     FILTER STUDENTS BY CLASS
  ============================ */
  const filteredStudents = useMemo(() => {
    if (selectedClass === "All") return students;

    return students.filter(
      (s) => String(s.studentClassId) === String(selectedClass)
    );
  }, [students, selectedClass]);

  /* ============================
     AVAILABLE COLUMNS
  ============================ */
  const allColumns = useMemo(() => {
    if (!students.length) return [];
    return Object.keys(students[0]).filter(
      (key) => key !== "password" // hide sensitive data
    );
  }, [students]);

  /* ============================
     SELECT ALL LOGIC
  ============================ */
  const handleSelectAll = () => {
    const val = !selectAll;
    setSelectAll(val);

    const updated = {};
    allColumns.forEach((c) => (updated[c] = val));
    setSelectedColumns(updated);
  };

  const handleColumnChange = (col) => {
    setSelectedColumns((prev) => ({ ...prev, [col]: !prev[col] }));
  };

  useEffect(() => {
    const checked = allColumns.filter((c) => selectedColumns[c]).length;
    setSelectAll(checked === allColumns.length && allColumns.length > 0);
  }, [selectedColumns, allColumns]);

  /* ============================
     PDF GENERATION
  ============================ */
  const generatePdf = () => {
    const selectedCols = allColumns.filter((c) => selectedColumns[c]);

    if (selectedCols.length === 0) {
      alert("Please select at least one column");
      return;
    }

    const doc = new jsPDF("l", "pt", "a4");

    doc.setFontSize(18);
    doc.text("Student Master Report", 40, 40);

    doc.setFontSize(11);
    doc.text(`Class : ${getClassName(selectedClass)}`, 40, 62);
    doc.text(`Total Students : ${filteredStudents.length}`, 40, 78);

    const tableHead = selectedCols.map((c) => COLUMN_LABELS[c] || c);

    const tableBody = filteredStudents.map((s) =>
      selectedCols.map((c) => String(s[c] ?? ""))
    );

    autoTable(doc, {
      head: [tableHead],
      body: tableBody,
      startY: 100,
      styles: { fontSize: 9 },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        halign: "center",
      },
      alternateRowStyles: { fillColor: [241, 245, 249] },
    });

    doc.save(
      `Students_${getClassName(selectedClass)}_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`
    );
  };

  /* ============================
     GET CLASS NAME BY ID
  ============================ */
  const getClassName = (id) => {
    if (id === "All") return "All";
    const found = classes.find((c) => String(c.classId) === String(id));
    return found ? found.className : id;
  };

  const selectedCount = Object.values(selectedColumns).filter(Boolean).length;

  if (loading) {
    return <p style={{ padding: 20 }}>Loading students...</p>;
  }

  return (
    <div className="student-excel-export">
      <h2 className="student-title">Student PDF Export</h2>

      {/* CLASS FILTER */}
      <div className="class-filter">
        <label className="filter-label">Filter by Class</label>

        <select
          className="class-select"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="All">All</option>
          {classes.map((cls) => (
            <option key={cls.classId} value={cls.classId}>
              {cls.className}
            </option>
          ))}
        </select>

        <p className="filter-count">
          Showing <strong>{filteredStudents.length}</strong> students
        </p>
      </div>

      {/* COLUMN SELECTION */}
      <div className="column-selection">
        <div className="column-selection-header">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
          />
          <label>
            Select All Columns ({selectedCount}/{allColumns.length})
          </label>
        </div>

        <div className="column-checkboxes">
          {allColumns.map((col) => (
            <label key={col} className="column-item">
              <input
                type="checkbox"
                checked={selectedColumns[col] || false}
                onChange={() => handleColumnChange(col)}
              />
              <span>{COLUMN_LABELS[col] || col}</span>
            </label>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="export-stats">
        <span>{selectedCount} columns selected</span>
        <span>{filteredStudents.length} students</span>
      </div>

      {/* DOWNLOAD */}
      <button
        className="download-btn"
        disabled={selectedCount === 0}
        onClick={generatePdf}
      >
        📄 Download PDF
      </button>
    </div>
  );
};

export default StudentPdfExport;
