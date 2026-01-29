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
const StudentSidebar = ({ selectedSession }) => {
  const navClass = ({ isActive }) =>
    isActive ? "nav-item active" : "nav-item";

  return (
    <aside className="student-sidebar">
      <nav className="menu">
        <NavLink
          to="/user-dashboard/details"
          state={{ sessionId: selectedSession?.sessionId }}
          className={navClass}
        >
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

  const userId = location.state?.userId || localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  const [student, setStudent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  /* ---------------- Fetch Sessions ---------------- */
  const reloadSessions = () => {
    fetch("http://localhost:8080/api/sessions/getAll")
      .then((res) => res.json())
      .then((data) => {
        setSessions(data);

        const savedId = localStorage.getItem("sessionId");
        if (savedId) {
          const found = data.find(
            (s) => String(s.sessionId) === String(savedId)
          );
          if (found) setSelectedSession(found);
        }
      })
      .catch(() => console.log("Sessions API down 😴"));
  };

  useEffect(() => {
    reloadSessions();
  }, []);

  /* ---------------- Fetch Student ---------------- */
  useEffect(() => {
    if (!userId || userRole !== "student") return;

    fetch(`http://localhost:8080/api/users/basic/${userId}`)
      .then((res) => res.json())
      .then(setStudent)
      .catch(() => console.log("Student fetch failed"));
  }, [userId, userRole]);

  if (!userId || userRole !== "student") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="student-page">
      <StudentSidebar selectedSession={selectedSession} />

      <main className="student-content">
        <div className="welcome-box">
          {student ? (
            <>Welcome <span className="bold">{student.name}</span></>
          ) : (
            "Loading student vibes..."
          )}
        </div>

        {/* ---------------- SESSION SELECT ---------------- */}
        {/* <div
          className="session-select"
          style={{ display: "flex", gap: 10, alignItems: "center" }}
        >
          <label style={{ fontSize: 13 }}>Yearly Sessions</label>

          <select
            value={selectedSession?.sessionId || ""}
            onChange={(e) => {
              const id = e.target.value;

              const found = sessions.find(
                (s) => String(s.sessionId) === String(id)
              );

              setSelectedSession(found || null);

              if (found) {
                localStorage.setItem("sessionId", found.sessionId);
              } else {
                localStorage.removeItem("sessionId");
              }
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
              <option key={s.sessionId} value={s.sessionId}>
                {s.name}
              </option>
            ))}
          </select>

          <button
            onClick={reloadSessions}
            title="Reload sessions"
            style={{
              padding: "6px 8px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "white",
              cursor: "pointer",
            }}
          >
            ↻
          </button>
        </div> */}

        {/* ---------------- ROUTES ---------------- */}
        <Routes>
          <Route path="details" element={<StudentDetails />} />
          <Route
            path="attendance"
            element={
              <StudentAttendance
                userId={userId}
                sessionId={selectedSession?.sessionId}
              />
            }
          />
          <Route
            path="fees"
            element={
              <StudentFees
                userId={userId}
                sessionId={selectedSession?.sessionId}
              />
            }
          />
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
