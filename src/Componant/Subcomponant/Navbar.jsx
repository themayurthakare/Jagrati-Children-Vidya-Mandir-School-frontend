import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";
import logo from "../../media/logo.jpeg";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";

const Navbar = ({ logoText = "J.C.V.M" }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  //  Sync role from localStorage
  const syncRole = () => {
    const storedRole = localStorage.getItem("userRole");
    setRole(storedRole);
  };

  useEffect(() => {
    syncRole(); // on first load

    //  listen for login/logout
    window.addEventListener("auth-change", syncRole);

    return () => {
      window.removeEventListener("auth-change", syncRole);
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("authExpiresAt");

    // notify navbar
    window.dispatchEvent(new Event("auth-change"));

    navigate("/login");
  };

  const goToDashboard = () => {
    if (role === "student" || role === "parent") navigate("/user-dashboard");
    if (role === "teacher") navigate("/teacherdashboard");
    if (role === "admin") navigate("/admindashboard");
  };

  const isAdmin = role === "admin";

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="Logo" className="logo" />
        <span className="logo-text">{logoText}</span>
      </div>

      <button className="menu-button" onClick={toggleMenu}>
        ☰
      </button>

      <ul className={`navbar-links ${isMenuOpen ? "open" : ""}`}>
        {!isAdmin && (
          <>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/academics">Academics</Link>
            </li>
            <li>
              <Link to="/gallery">Gallery</Link>
            </li>
            <li>
              <Link to="/contact" className="contact-link">
                Contact
              </Link>
            </li>
          </>
        )}

        {role ? (
          <>
            <li>
              <button
                onClick={goToDashboard}
                className="nav-action-btn dashboard-btn"
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="nav-action-btn logout-btn"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link to="/login" className="nav-action-btn login-btn">
              Login
            </Link>
          </li>
        )}
      </ul>

      {!isAdmin && (
        <div className="social-icons social-desktop">
          <FaFacebook />
          <FaInstagram />
          <FaYoutube />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
