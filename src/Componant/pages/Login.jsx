import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        localStorage.setItem("userRole", "student");
        localStorage.setItem("userId", data.userId);
        window.dispatchEvent(new Event("auth-change"));
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
        localStorage.setItem("userRole", "parent");
        localStorage.setItem("userId", data.userId);
        window.dispatchEvent(new Event("auth-change"));
        navigate("/parent-dashboard", { state: { userId: data.userId } });
        return;
      }

      // ---------- TEACHER ----------
      response = await fetch(
        "http://localhost:8080/api/teachers/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, password }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("userRole", "teacher");
        localStorage.setItem("userId", data.teacherId);
        window.dispatchEvent(new Event("auth-change"));
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
        localStorage.setItem("userRole", "admin");
        // localStorage.setItem("userId", data.userId);
        window.dispatchEvent(new Event("auth-change"));
        navigate("/admindashboard", { state: { userId: data.userId } });
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
