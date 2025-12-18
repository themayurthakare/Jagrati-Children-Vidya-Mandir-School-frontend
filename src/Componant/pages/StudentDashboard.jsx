import React, { useEffect, useState } from "react";
import {
  NavLink,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { FaUser, FaClipboardList, FaMoneyBillWave } from "react-icons/fa";
import "./studentDashboard.css";

import StudentDetails from "./StudentDetails";
import StudentAttendance from "./Attendance";
import StudentFees from "./Fees";

/* -------------------- Sidebar -------------------- */
const StudentSidebar = () => {
  const navClass = ({ isActive }) =>
    isActive ? "nav-item active" : "nav-item";

  return (
    <aside className="student-sidebar">
      <nav className="menu">
        <NavLink to="/user-dashboard/details" className={navClass}>
          <FaUser /> <span>My Details</span>
        </NavLink>

        <NavLink to="/user-dashboard/attendance" className={navClass}>
          <FaClipboardList /> <span>Attendance</span>
        </NavLink>

        <NavLink to="/user-dashboard/fees" className={navClass}>
          <FaMoneyBillWave /> <span>Fees</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        Logged in as <strong>Student</strong>
      </div>
    </aside>
  );
};

/* -------------------- Dashboard -------------------- */
export default function StudentDashboard() {
  const location = useLocation();
  const [student, setStudent] = useState(null);

  // ✅ SAFE userId (state OR storage)
  const userId = location.state?.userId || localStorage.getItem("userId");

  // ✅ Hooks MUST run first
  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:8080/api/students/${userId}`)
      .then((res) => res.json())
      .then(setStudent)
      .catch(() => console.log("Backend on chai break ☕"));
  }, [userId]);

  // ✅ Redirect AFTER hooks
  if (!userId) return <Navigate to="/login" replace />;

  return (
    <div className="student-page">
      <StudentSidebar />

      <main className="student-content">
        <div className="welcome-box">
          {student ? (
            <>
              Welcome <span className="bold">{student.name}</span>
            </>
          ) : (
            "Loading student vibes..."
          )}
        </div>

        <Routes>
          <Route
            path="details"
            element={<StudentDetails student={student} />}
          />
          <Route
            path="attendance"
            element={<StudentAttendance userId={userId} />}
          />
          <Route path="fees" element={<StudentFees userId={userId} />} />
          <Route
            index
            element={
              <div className="page">
                <h3>Student Dashboard</h3>
                <p>Select an option from the sidebar.</p>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
