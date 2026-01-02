import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const EXPIRY_MS = 2 * 60 * 60 * 1000; // 2 hours

const Login = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const setAuth = (role, userId) => {
    const expiresAt = Date.now() + EXPIRY_MS;
    localStorage.setItem("userRole", role);
    if (userId != null) {
      localStorage.setItem("userId", userId);
    }
    localStorage.setItem("authExpiresAt", String(expiresAt));
    window.dispatchEvent(new Event("auth-change"));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ---------- STUDENT ----------
      let response = await fetch("http://localhost:8080/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admissionNo: phone, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setAuth("student", data.userId);
        navigate("/user-dashboard", {
          state: { userId: data.userId },
        });
        return;
      }

      // ---------- PARENT ----------
      response = await fetch("http://localhost:8080/api/parents/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setAuth("parent", data.userId);
        navigate("/parent-dashboard", { state: { userId: data.userId } });
        return;
      }

      // ---------- TEACHER ----------
      response = await fetch("http://localhost:8080/api/teachers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setAuth("teacher", data.teacherId);
        navigate("/teacherdashboard", { state: { userId: data.teacherId } });
        return;
      }

      // ---------- ADMIN ----------
      response = await fetch("http://localhost:8080/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setAuth("admin", data.userId);
        navigate("/admindashboard", { state: { userId: data.userId } });
        return;
      }
      // ---------- Computer operator ----------
      response = await fetch(
        "http://localhost:8080/api/computeroperator/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber: phone, password }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAuth("computeroperator", data.userId);
        navigate("/computeroperator", { state: { userId: data.userId } });
        return;
      }

      alert("Invalid credentials. Enter valid details..");
    } catch (err) {
      alert("Server down......");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">School Login</h2>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="login-input"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />

          <button className="login-btn" disabled={loading}>
            {loading ? "Please wait....." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
