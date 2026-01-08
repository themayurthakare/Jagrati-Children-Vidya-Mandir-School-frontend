import React from "react";
import { NavLink, Routes, Route } from "react-router-dom";
import {
  FaChalkboardTeacher,
  FaUsers,
  FaClipboardList,
  FaFileAlt,
  FaEdit,
  FaChartBar,
} from "react-icons/fa";
import "../styles/TeacherDashboard.css";

import TeacherViewAssignedClasses from "./TeacherViewAssignedClasses";
import TeacherViewEnrolledStudents from "./TeacherViewEnrolledStudents";
import TeacherMarkAttendance from "./TeacherMarkAttendance";
import TeacherViewAttendanceReport from "./TeacherViewAttendanceReport";
import TeacherAddMarks from "./TeacherAddMarks";
import TeacherViewMarks from "./TeacherViewMarks";
// import EditMarks from "./EditMarks";

/* -------------------- Sidebar -------------------- */
const TeacherSidebar = () => {
  const navClass = ({ isActive }) =>
    isActive ? "nav-item active" : "nav-item";

  return (
    <aside className="teacher-sidebar">
      <nav className="menu">
        <NavLink to="/teacherdashboard/assigned-classes" className={navClass}>
          <FaChalkboardTeacher /> <span>View Assigned Classes</span>
        </NavLink>

        <NavLink to="/teacherdashboard/enrolled-students" className={navClass}>
          <FaUsers /> <span>View Enrolled Students</span>
        </NavLink>

        <NavLink to="/teacherdashboard/attendance" className={navClass}>
          <FaClipboardList /> <span>Mark & View Attendance</span>
        </NavLink>

        <NavLink to="/teacherdashboard/attendance-report" className={navClass}>
          <FaChartBar /> <span>View Attendance Report</span>
        </NavLink>

        <NavLink to="/teacherdashboard/add-marks" className={navClass}>
          <FaEdit /> <span>Add Student Marks</span>
        </NavLink>

        <NavLink to="/teacherdashboard/view-marks" className={navClass}>
          <FaFileAlt /> <span>View Marks</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        Logged in as <strong>Teacher</strong>
      </div>
    </aside>
  );
};

/* -------------------- Main Layout -------------------- */
const TeacherDashboard = () => {
  return (
    <div className="teacher-page">
      <TeacherSidebar />

      <main className="teacher-content">
        <Routes>
          <Route
            path="assigned-classes"
            element={<TeacherViewAssignedClasses />}
          />

          <Route
            path="enrolled-students"
            element={<TeacherViewEnrolledStudents />}
          />

          <Route path="attendance" element={<TeacherMarkAttendance />} />

          <Route
            path="attendance-report"
            element={<TeacherViewAttendanceReport />}
          />

          <Route path="add-marks" element={<TeacherAddMarks />} />

          <Route path="view-marks" element={<TeacherViewMarks />} />

          {/* <Route path="edit-marks/:marksId" element={<EditMarks />} /> */}

          {/* Default route */}
          <Route
            path=""
            element={
              <div className="page">
                <h3>Welcome to Teacher Dashboard</h3>
                <p>
                  Use the side menu to manage your classes, attendance, and
                  student marks.
                </p>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

export default TeacherDashboard;
