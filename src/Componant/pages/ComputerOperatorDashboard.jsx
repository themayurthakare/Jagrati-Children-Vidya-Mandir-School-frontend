import React, { useState } from "react";
import { NavLink, Routes, Route } from "react-router-dom";
import {
  FaUserPlus,
  FaChalkboardTeacher,
  FaUsers,
  FaFileUpload,
  FaMoneyBillWave,
  FaClipboardList,
  FaIdCard,
} from "react-icons/fa";

import "./AdminDashboard.css";

import AdminViewTeacher from "./AdminViewTeacher";
import AdminViewClasses from "./AdminViewClasses";
import AdminViewEnquiries from "./AdminViewEnquiries";
import AdminViewAttendance from "./AdminViewAttendance";
import AdminPrintStudentDetails from "./AdminPrintStudentDetails";

import AdminAddClass from "./AdminAddClass";
import AdminUpdateClass from "./AdminUpdateClass";
import AdminUploadExcel from "./AdminUploadExcel";
import AdminNotice from "./AdminNotice";
import AdminViewClassStudents from "./AdminViewClassStudents";
import AdminStudentFeeDetails from "./AdminStudentFeeDetails";

import { SessionProvider, SessionContext } from "./SessionContext";
import { useContext } from "react";
import AdminStudentIdClass from "./AdminStudentIdClass";
import AdminPrintIdCard from "./AdminPrintIdCard";
import AdminIdCardPrint from "./AdminIdCardPrint";
import AdminIdCardPrintAll from "./AdminIdCardPrintAll";
import AdminAdmitCardPrint from "./AdminAdmitCardPrint";
import AdminAdmitCardPrintAll from "./AdminAdmitCardPrintAll";
import AdminTeacherRegistrationReceipt from "./AdminTeacherRegistrationReceipt";
import AdminViewTeacherDetails from "./AdminViewTeacherDetails";
import AdminUpdateTeacher from "./AdminUpdateTeacher";
import TransactionReport from "./TransactionReport";
import StudentExcelExport from "./StudentExcelExport";
import OperatorViewFees from "./OperatorViewFees";
import ComputerOperatorStudentRegistration from "./ComputerOperatorStudentRegistration";
import ComputerOperatorUploadStudentDocuments from "./ComputerOperatorUploadStudentDocuments";
import COTeacherRegistration from "./COTeacherRegistration";
import COTeacherDocumentUpload from "./COTeacherDocumentUpload";
import COViewStudents from "./COViewStudents";
import COUpdateStudent from "./COUpdateStudent";
import COViewStudentDetails from "./COViewStudentDetails";
import COViewTeacher from "./COViewTeacher";
import COViewTeacherDetails from "./COViewTeacherDetails";
import COUpdateTeacher from "./COUpdateTeacher";
import COViewClasses from "./COViewClasses";
import COAddClass from "./COAddClass";
import COUpdateClass from "./COUpdateClass";
import COViewClassStudents from "./COViewClassStudents";
import COStudentFeeDetails from "./COStudentFeeDetails";
import COViewEnquiries from "./COViewEnquiries";
import COStudentIdClass from "./COStudentIdClass";
import COIdCardPrint from "./COIdCardPrint";
import COPrintIdCard from "./COPrintIdCard";

const SessionSelect = () => {
  const { sessions, selectedSession, setSelectedSession, reloadSessions } =
    useContext(SessionContext);

  return (
    <div
      className="session-select"
      style={{ display: "flex", gap: 10, alignItems: "center" }}
    >
      <label style={{ fontSize: 13, marginRight: 6 }}>Yearly Sessions</label>
      <select
        value={selectedSession ? selectedSession.id : ""}
        onChange={(e) => {
          const id = e.target.value;
          const found = sessions.find((s) => String(s.id) === String(id));
          setSelectedSession(found || null);
        }}
        style={{
          padding: "6px 8px",
          borderRadius: 6,
          border: "1px solid #ccc",
          minWidth: 180,
        }}
      >
        <option value="">-- Select session --</option>
        {sessions.map((s) => (
          <option key={s.id ?? s.name} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={reloadSessions}
        style={{
          padding: "6px 8px",
          borderRadius: 6,
          border: "1px solid #ccc",
          background: "white",
          cursor: "pointer",
        }}
        title="Reload sessions"
      >
        ↻
      </button>
    </div>
  );
};

/* Sidebar (unchanged) */
const Sidebar = () => {
  const navClass = ({ isActive }) =>
    isActive ? "nav-item active" : "nav-item";

  return (
    <aside className="admin-sidebar">
      <nav className="menu">
        <NavLink to="/computeroperator/add-student" className={navClass}>
          <FaUserPlus /> <span>Add Student</span>
        </NavLink>

        <NavLink to="/computeroperator/add-teacher" className={navClass}>
          <FaChalkboardTeacher /> <span>Add Teacher</span>
        </NavLink>

        <NavLink to="/computeroperator/view-students" className={navClass}>
          <FaUsers /> <span>View All Students</span>
        </NavLink>

        <NavLink to="/computeroperator/view-teachers" className={navClass}>
          <FaUsers /> <span>View All Teachers</span>
        </NavLink>

        <NavLink to="/computeroperator/view-classes" className={navClass}>
          <FaChalkboardTeacher /> <span>View Classes</span>
        </NavLink>

        <NavLink to="/computeroperator/view-attendance" className={navClass}>
          <FaClipboardList /> <span>View Attendance</span>
        </NavLink>

        <NavLink to="/computeroperator/view-fees" className={navClass}>
          <FaMoneyBillWave /> <span>Manage Fees</span>
        </NavLink>

        <NavLink to="/computeroperator/view-enquiries" className={navClass}>
          <FaUsers /> <span>View Enquiries</span>
        </NavLink>

        <NavLink
          to="/computeroperator/upload-student-excel"
          className={navClass}
        >
          <FaFileUpload /> <span>Upload Student Excel</span>
        </NavLink>

        <NavLink to="/computeroperator/notice" className={navClass}>
          <FaClipboardList /> <span>Notice Board</span>
        </NavLink>

        <NavLink to="/computeroperator/generate-id-cards" className={navClass}>
          <FaIdCard /> <span>Generate ID Card</span>
        </NavLink>

        <NavLink
          to="/computeroperator/students/export-excel"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <FaFileUpload /> <span>Export Student Excel</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        Logged in as <strong>Computer Operator</strong>
      </div>
    </aside>
  );
};

/* Main dashboard */
const ComputerOperatorDashboard = () => {
  // local state examples (you already had these)
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const addTeacher = (t) => setTeachers((prev) => [t, ...prev]);
  const addStudent = (studentData) => {
    const newStudent = {
      id: Date.now(),
      admissionNo: studentData.admissionNo,
      name: studentData.name,
      dob: studentData.dob,
    };
    setStudents((prev) => [newStudent, ...prev]);
  };
  const updatePoints = (id, val) =>
    setTeachers((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, points: Math.max(0, t.points + val) } : t
      )
    );

  return (
    <div className="admin-page">
      <SessionProvider apiBase="http://localhost:8080">
        <Sidebar />

        <main className="admin-content">
          <Routes>
            <Route
              path="add-student"
              element={
                <ComputerOperatorStudentRegistration
                  onAddStudent={addStudent}
                />
              }
            />
            <Route
              path="add-teacher"
              element={<COTeacherRegistration onAddTeacher={addTeacher} />}
            />
            <Route
              path="view-students"
              element={<COViewStudents students={students} />}
            />
            <Route
              path="view-teachers"
              element={
                <COViewTeacher teachers={teachers} onUpdate={updatePoints} />
              }
            />
            <Route path="view-classes" element={<COViewClasses />} />
            <Route path="view-attendance" element={<AdminViewAttendance />} />
            <Route path="view-fees" element={<OperatorViewFees />} />
            <Route path="view-enquiries" element={<COViewEnquiries />} />
            <Route path="upload-student-excel" element={<AdminUploadExcel />} />

            <Route
              path="upload-docs"
              element={<ComputerOperatorUploadStudentDocuments />}
            />
            <Route
              path="teacher-documents"
              element={<COTeacherDocumentUpload />}
            />
            <Route
              path="teacher-receipt"
              element={<AdminTeacherRegistrationReceipt />}
            />
            <Route
              path="view-teacher-details"
              element={<COViewTeacherDetails />}
            />
            <Route path="update-teacher" element={<COUpdateTeacher />} />
            <Route
              path="print-student"
              element={<AdminPrintStudentDetails />}
            />
            <Route path="view-details" element={<COViewStudentDetails />} />
            <Route path="update-student" element={<COUpdateStudent />} />
            <Route path="add-class" element={<COAddClass />} />
            <Route path="update-class" element={<COUpdateClass />} />
            <Route path="notice" element={<AdminNotice />} />
            <Route path="fee-details" element={<COStudentFeeDetails />} />
            <Route path="generate-id-cards" element={<COStudentIdClass />} />
            <Route path="generate-admit-cards" element={<COPrintIdCard />} />
            <Route path="generate-id-cards/print" element={<COIdCardPrint />} />
            <Route
              path="generate-admit-card"
              element={<AdminAdmitCardPrint />}
            />
            <Route
              path="generate-admit-card/print-all"
              element={<AdminAdmitCardPrintAll />}
            />

            <Route
              path="view-class-student"
              element={<COViewClassStudents />}
            />
            <Route
              path="generate-id-cards/print-all"
              element={<AdminIdCardPrintAll />}
            />
            <Route path="transactions" element={<TransactionReport />} />
            <Route
              path="students/export-excel"
              element={<StudentExcelExport />}
            />
            <Route
              path=""
              element={
                <div className="page" style={{ padding: 20 }}>
                  <h3>Welcome to Computer Operator Dashboard</h3>
                  <p style={{ marginBottom: 12 }}>
                    Use the side menu to manage students and teachers.
                  </p>

                  {/* Session selector is placed only on the index page */}
                  <div style={{ marginTop: 8 }}>
                    <SessionSelect />
                  </div>
                </div>
              }
            />
          </Routes>
        </main>
      </SessionProvider>
    </div>
  );
};

export default ComputerOperatorDashboard;
