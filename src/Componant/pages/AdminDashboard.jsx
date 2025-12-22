// src/Componant/pages/AdminDashboard.jsx
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

import AdminStudentRegistration from "./AdminStudentRegistration";
import ViewStudents from "./AdminViewStudents";
import AdminTeacherRegistration from "./AdminTeacherRegistration";
import AdminViewTeacher from "./AdminViewTeacher";
import AdminViewClasses from "./AdminViewClasses";
import AdminViewEnquiries from "./AdminViewEnquiries";
import AdminViewAttendance from "./AdminViewAttendance";
import AdminViewFees from "./AdminViewFees";
import AdminUploadStudentDocuments from "./AdminUploadStudentDocuments";
import AdminPrintStudentDetails from "./AdminPrintStudentDetails";
import ViewStudentDetails from "./AdminViewStudentDetails";
import AdminUpdateStudent from "./AdminUpdateStudent";
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
import AdminTeacherDocumentUpload from "./AdminTeacherDocumentUpload";
import AdminTeacherRegistrationReceipt from "./AdminTeacherRegistrationReceipt";
import AdminViewTeacherDetails from "./AdminViewTeacherDetails";
import AdminUpdateTeacher from "./AdminUpdateTeacher";
import TransactionReport from "./TransactionReport";
import StudentExcelExport from "./StudentExcelExport";

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
        <NavLink to="/admindashboard/add-student" className={navClass}>
          <FaUserPlus /> <span>Add Student</span>
        </NavLink>

        <NavLink to="/admindashboard/add-teacher" className={navClass}>
          <FaChalkboardTeacher /> <span>Add Teacher</span>
        </NavLink>

        <NavLink to="/admindashboard/view-students" className={navClass}>
          <FaUsers /> <span>View All Students</span>
        </NavLink>

        <NavLink to="/admindashboard/view-teachers" className={navClass}>
          <FaUsers /> <span>View All Teachers</span>
        </NavLink>

        <NavLink to="/admindashboard/view-classes" className={navClass}>
          <FaChalkboardTeacher /> <span>View Classes</span>
        </NavLink>

        <NavLink to="/admindashboard/view-attendance" className={navClass}>
          <FaClipboardList /> <span>View Attendance</span>
        </NavLink>

        <NavLink to="/admindashboard/view-fees" className={navClass}>
          <FaMoneyBillWave /> <span>Manage Fees</span>
        </NavLink>

        <NavLink to="/admindashboard/view-enquiries" className={navClass}>
          <FaUsers /> <span>View Enquiries</span>
        </NavLink>

        <NavLink to="/admindashboard/upload-student-excel" className={navClass}>
          <FaFileUpload /> <span>Upload Student Excel</span>
        </NavLink>

        <NavLink to="/admindashboard/notice" className={navClass}>
          <FaClipboardList /> <span>Notice Board</span>
        </NavLink>

        <NavLink to="/admindashboard/generate-id-cards" className={navClass}>
          <FaIdCard /> <span>Generate ID Card</span>
        </NavLink>

        <NavLink
          to="/admindashboard/students/export-excel"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <FaFileUpload /> <span>Export Student Excel</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        Logged in as <strong>Admin</strong>
      </div>
    </aside>
  );
};

/* Main dashboard */
const AdminDashboard = () => {
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
              element={<AdminStudentRegistration onAddStudent={addStudent} />}
            />
            <Route
              path="add-teacher"
              element={<AdminTeacherRegistration onAddTeacher={addTeacher} />}
            />
            <Route
              path="view-students"
              element={<ViewStudents students={students} />}
            />
            <Route
              path="view-teachers"
              element={
                <AdminViewTeacher teachers={teachers} onUpdate={updatePoints} />
              }
            />
            <Route path="view-classes" element={<AdminViewClasses />} />
            <Route path="view-attendance" element={<AdminViewAttendance />} />
            <Route path="view-fees" element={<AdminViewFees />} />
            <Route path="view-enquiries" element={<AdminViewEnquiries />} />
            <Route path="upload-student-excel" element={<AdminUploadExcel />} />

            <Route
              path="upload-docs"
              element={<AdminUploadStudentDocuments />}
            />
            <Route
              path="teacher-documents"
              element={<AdminTeacherDocumentUpload />}
            />
            <Route
              path="teacher-receipt"
              element={<AdminTeacherRegistrationReceipt />}
            />
            <Route
              path="view-teacher-details"
              element={<AdminViewTeacherDetails />}
            />
            <Route path="update-teacher" element={<AdminUpdateTeacher />} />
            <Route
              path="print-student"
              element={<AdminPrintStudentDetails />}
            />
            <Route path="view-details" element={<ViewStudentDetails />} />
            <Route path="update-student" element={<AdminUpdateStudent />} />
            <Route path="add-class" element={<AdminAddClass />} />
            <Route path="update-class" element={<AdminUpdateClass />} />
            <Route path="notice" element={<AdminNotice />} />
            <Route path="fee-details" element={<AdminStudentFeeDetails />} />
            <Route
              path="/generate-id-cards"
              element={<AdminStudentIdClass />}
            />
            <Route path="generate-admit-cards" element={<AdminPrintIdCard />} />
            <Route
              path="/generate-id-cards/print"
              element={<AdminIdCardPrint />}
            />
            <Route
              path="/generate-admit-card"
              element={<AdminAdmitCardPrint />}
            />
            <Route
              path="/admindashboard/generate-admit-card/print-all"
              element={<AdminAdmitCardPrintAll />}
            />

            <Route
              path="view-class-student"
              element={<AdminViewClassStudents />}
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
                  <h3>Welcome to Admin Dashboard</h3>
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

export default AdminDashboard;
