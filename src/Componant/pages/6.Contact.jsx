import React, { useState } from "react";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebook,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import "./Contact.css";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const sendEnquiry = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // ISO date string "YYYY-MM-DD" for LocalDate
      const today = new Date().toISOString().slice(0, 10);

      const response = await fetch("http://localhost:8080/api/enquiries/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentName: form.name,
          contactNo: form.phone,
          enquiryDate: today, // LocalDate yyyy-MM-dd
          enquiryMessage: form.message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit enquiry");
      }

      alert("Enquiry sent successfully!");
      setForm({ name: "", phone: "", message: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to send enquiry. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-section">
      {/* Page Header */}
      <div className="contact-hero">
        <h1>Get in Touch</h1>
        <p>
          Feel free to reach us for any queries related to admission or school
          information.
        </p>
      </div>

      {/* Main Content */}
      <div className="contact-wrapper">
        {/* Contact Info + Social Media */}
        <div className="contact-info">
          <h3>Contact Details</h3>

          <p>
            <FaPhoneAlt /> <a href="tel:+91 9827366274">+91 9827366274</a>
          </p>
          <p>
            <FaEnvelope />{" "}
            <a href="mailto:Jcvmschool@gmail.com">Jcvmschool@gmail.com</a>
          </p>
          <p>
            <FaMapMarkerAlt /> Shankar Colony, Gol Phadiya, Lashkar, Gwalior, MP
          </p>

          <div className="social-icons">
            <a href="https://www.facebook.com/share/1C78EBCJNC/">
              <FaFacebook />
            </a>
            <a href="https://www.instagram.com/j.c.v.mschool?utm_source=qr&igsh=Z3oxOTJsMmI4eDE1">
              <FaInstagram />
            </a>
            <a href="http://www.youtube.com/@rajeshkushwah4224">
              <FaYoutube />
            </a>
          </div>
        </div>

        {/* Form */}
        <form className="contact-form" onSubmit={sendEnquiry}>
          <h3>Send Us a Message</h3>

          <input
            type="text"
            name="name"
            placeholder="Your Full Name"
            required
            value={form.name}
            onChange={handleChange}
          />

          <input
            type="tel"
            name="phone"
            placeholder="Your Phone Number"
            required
            value={form.phone}
            onChange={handleChange}
          />

          <textarea
            name="message"
            rows="5"
            placeholder="Type your message here..."
            required
            value={form.message}
            onChange={handleChange}
          ></textarea>

          <button type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>

      {/* Google Map */}
      <div className="map-box">
        <h3>Locate Us</h3>
        <iframe
          title="school-map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28554.45047467563!2d78.163778!3d26.218287!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3976c6fe86e63abf%3A0x87f93cefb8c0e2f!2sGol%20Phadiya%2C%20Lashkar%2C%20Gwalior%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1730461473452!5m2!1sen!2sin"
          loading="lazy"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default Contact;
