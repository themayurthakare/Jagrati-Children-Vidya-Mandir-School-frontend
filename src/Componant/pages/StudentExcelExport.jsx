import React, { useContext, useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { SessionContext } from "./SessionContext";

import "./StudentExcelExport.css";

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

  const { selectedSession } = useContext(SessionContext);
  const sessionId = selectedSession?.id;

  /* ================= FETCH STUDENTS ================= */
  useEffect(() => {
    fetch(`http://localhost:8080/api/users/${sessionId}/getAll`)
      .then((res) => res.json())
      .then((data) => {
        setStudents(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* ================= FETCH CLASSES ================= */
  useEffect(() => {
    fetch(`http://localhost:8080/api/classes/${sessionId}/getAll`)
      .then((res) => res.json())
      .then((data) => setClasses(data || []))
      .catch(() => {});
  }, []);

  /* ================= FILTER ================= */
  const filteredStudents = useMemo(() => {
    if (selectedClass === "All") return students;
    return students.filter(
      (s) => String(s.studentClassId) === String(selectedClass)
    );
  }, [students, selectedClass]);

  /* ================= COLUMNS ================= */
  const allColumns = useMemo(() => {
    if (!students.length) return [];
    return Object.keys(students[0]).filter((k) => k !== "password");
  }, [students]);

  /* ================= SELECT ALL ================= */
  const handleSelectAll = () => {
    const v = !selectAll;
    setSelectAll(v);
    const obj = {};
    allColumns.forEach((c) => (obj[c] = v));
    setSelectedColumns(obj);
  };

  const handleColumnChange = (c) =>
    setSelectedColumns((p) => ({ ...p, [c]: !p[c] }));

  useEffect(() => {
    const cnt = allColumns.filter((c) => selectedColumns[c]).length;
    setSelectAll(cnt === allColumns.length && allColumns.length > 0);
  }, [selectedColumns, allColumns]);

  /* ================= CLASS NAME ================= */
  const getClassName = (id) => {
    if (id === "All") return "All";
    const f = classes.find((c) => String(c.classId) === String(id));
    return f ? f.className : id;
  };

  /* ================= PDF EXPORT ================= */
  const exportPdf = () => {
    const cols = allColumns.filter((c) => selectedColumns[c]);
    if (!cols.length) return alert("Select at least one column");

    const doc = new jsPDF("l", "pt", "a4");
    doc.setFontSize(16);
    doc.text("Student Master Report", 40, 40);
    doc.setFontSize(11);
    doc.text(`Class : ${getClassName(selectedClass)}`, 40, 60);

    autoTable(doc, {
      head: [cols.map((c) => COLUMN_LABELS[c] || c)],
      body: filteredStudents.map((s) => cols.map((c) => String(s[c] ?? ""))),
      startY: 80,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    });

    doc.save(`Students_${getClassName(selectedClass)}.pdf`);
  };

  /* ================= EXCEL EXPORT ================= */
  const exportExcel = () => {
    const cols = allColumns.filter((c) => selectedColumns[c]);
    if (!cols.length) return alert("Select at least one column");

    const data = filteredStudents.map((s) => {
      const row = {};
      cols.forEach((c) => {
        row[COLUMN_LABELS[c] || c] = s[c];
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      `Students_${getClassName(selectedClass)}.xlsx`
    );
  };

  const selectedCount = Object.values(selectedColumns).filter(Boolean).length;

  if (loading) return <p style={{ padding: 20 }}>Loading students...</p>;

  return (
    <div className="student-excel-export">
      <h2 className="student-title">Student Export (PDF / Excel)</h2>

      {/* FILTER */}
      <div className="class-filter">
        <label className="filter-label">Filter by Class</label>
        <select
          className="class-select"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="All">All</option>
          {classes.map((c) => (
            <option key={c.classId} value={c.classId}>
              {c.className}
            </option>
          ))}
        </select>
      </div>

      {/* COLUMNS */}
      <div className="column-selection">
        <div className="column-selection-header">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
          />
          <label>
            Select All ({selectedCount}/{allColumns.length})
          </label>
        </div>

        <div className="column-checkboxes">
          {allColumns.map((c) => (
            <label key={c} className="column-item">
              <input
                type="checkbox"
                checked={selectedColumns[c] || false}
                onChange={() => handleColumnChange(c)}
              />
              <span>{COLUMN_LABELS[c] || c}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="export-stats">
        <span>{filteredStudents.length} students</span>
        <span>{selectedCount} columns</span>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          className="download-btn"
          disabled={!selectedCount}
          onClick={exportPdf}
        >
          📄 Download PDF
        </button>

        <button
          className="download-btn"
          disabled={!selectedCount}
          onClick={exportExcel}
        >
          📊 Download Excel
        </button>
      </div>
    </div>
  );
};

export default StudentPdfExport;
