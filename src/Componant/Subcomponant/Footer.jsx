// import React from "react";
import React, { useState, useEffect } from "react";

import "./Footer.css";

const Footer = () => {
  const userRole = localStorage.getItem("useruserRole");
  const year = new Date().getFullYear();
  const [role, setRole] = useState(null);
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

  if (userRole === "admin") {
    return (
      <footer className="footer footer-minimal">
        <div className="footer-bottom">
          © {year} Jagrati Children Vidhya Mandir — All Rights Reserved.
        </div>
      </footer>
    );
  }

  return (
    <footer className="footer">
      <div className="footer-curve"></div>

      <div className="footer-container">
        <div className="footer-section">
          <h3>Jagrati Children Vidhya Mandir</h3>
          <p>
            Providing quality education with discipline, values and all-round
            development for every child. We believe in building a bright future.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/about">About Us</a>
            </li>
            <li>
              <a href="/academics">Academics</a>
            </li>
            <li>
              <a href="/gallery">Gallery</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>
          <p>
            <strong>Address:</strong>
            <br />
            Shankar Colony, Gol Phadiya, Lashkar, Gwalior, Madhya Pradesh
          </p>
          <p>
            <strong>Phone:</strong> +91 9827366274
          </p>
          <p>
            <strong>Email:</strong> jcvmschool@gmail.com
          </p>
        </div>

        <div className="footer-section">
          <h3>Find Us</h3>
          <iframe
            title="footer-map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28554.45047467563!2d78.163778!3d26.218287!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3976c6fe86e63abf%3A0x87f93cefb8c0e2f!2sGol%20Phadiya%2C%20Lashkar%2C%20Gwalior%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1730461473452!5m2!1sen!2sin"
            width="100%"
            height="150"
            style={{ border: 0, borderRadius: "10px" }}
            loading="lazy"
          />
        </div>
      </div>

      <div className="footer-bottom">
        © {year} Jagrati Children Vidhya Mandir — All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
