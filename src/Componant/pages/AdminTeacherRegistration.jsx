import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "./SessionContext";
import "./AdminTeacherRegistration.css";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  educationalDetails: "",
  yearOfExperience: "",
  dateOfBirth: "",
  aadharNo: "",
  address: "",
  classNames: [],
};

const AdminTeacherRegistration = ({
  onAddTeacher,
  classes: classesProp = null,
  apiBase = "http://localhost:8080/api",
}) => {
  const [form, setForm] = useState(initialForm);
  const [classes, setClasses] = useState(classesProp || []);
  const [selectedClassNames, setSelectedClassNames] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const { selectedSession } = useContext(SessionContext);
  const sessionId = selectedSession?.id;

  const navigate = useNavigate();

  useEffect(() => {
    if (!classesProp && apiBase) {
      fetch(`${apiBase}/classes/${sessionId}/getAll`)
        .then((r) => r.json())
        .then((data) => setClasses(data || []))
        .catch(() => setClasses([]));
    }
  }, [classesProp, apiBase]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email";
    if (!form.phone || !/^[0-9]{10,15}$/.test(form.phone))
      e.phone = "Enter 10–15 digit phone";
    if (!form.password || form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (!form.educationalDetails.trim())
      e.educationalDetails = "Educational details required";
    if (!form.yearOfExperience || form.yearOfExperience < 0)
      e.yearOfExperience = "Valid experience required";
    if (!form.dateOfBirth || !/^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth))
      e.dateOfBirth = "Date in YYYY-MM-DD format";
    if (!form.aadharNo.trim()) e.aadharNo = "Aadhaar number required";
    if (!form.address.trim()) e.address = "Address required";
    if (selectedClassNames.length === 0)
      e.classNames = "Select at least one class";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleClassChange = (e) => {
    const options = Array.from(e.target.selectedOptions);
    const selectedNames = options
      .map((option) => option.value)
      .filter((name) => name);
    setSelectedClassNames(selectedNames);
    setErrors((p) => ({ ...p, classNames: undefined }));
  };

  const removeClass = (classNameToRemove) => {
    setSelectedClassNames((prev) =>
      prev.filter((name) => name !== classNameToRemove)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        educationalDetails: form.educationalDetails.trim(),
        yearOfExperience: parseInt(form.yearOfExperience),
        dateOfBirth: form.dateOfBirth,
        aadharNo: form.aadharNo.trim(),
        address: form.address.trim(),
        classNames: selectedClassNames,
      };

      const res = await fetch(`${apiBase}/teachers/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok || res.status === 201) {
        const body = await res.json().catch(() => null);
        const teacherId = body?.teacherId || body?.id || Date.now();

        if (typeof onAddTeacher === "function") {
          onAddTeacher(body || { teacherId, ...payload });
        }

        setSuccessMsg(
          "Teacher registered successfully! Redirecting to documents..."
        );
        setForm(initialForm);
        setSelectedClassNames([]);

        // REDIRECT TO DOCUMENT UPLOAD
        setTimeout(() => {
          navigate(`/admindashboard/teacher-documents?teacherId=${teacherId}`);
        }, 1500);
      } else {
        const body = await res.json().catch(() => ({}));
        setErrors({ form: body.message || "Registration failed" });
      }
    } catch (err) {
      setErrors({ form: err.message || "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tr-page">
      <div className="tr-card">
        <h2>Teacher Registration</h2>

        {errors.form && <div className="tr-error">{errors.form}</div>}
        {successMsg && <div className="tr-success">{successMsg}</div>}

        <form className="tr-form" onSubmit={handleSubmit}>
          <label>
            Full Name *
            <input name="name" value={form.name} onChange={handleChange} />
            {errors.name && (
              <small className="field-error">{errors.name}</small>
            )}
          </label>

          <label>
            Email *
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
            />
            {errors.email && (
              <small className="field-error">{errors.email}</small>
            )}
          </label>

          <label>
            Phone *
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              type="tel"
            />
            {errors.phone && (
              <small className="field-error">{errors.phone}</small>
            )}
          </label>

          <label className="full">
            Password *
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && (
              <small className="field-error">{errors.password}</small>
            )}
          </label>

          <label className="full">
            Educational Details
            <input
              name="educationalDetails"
              value={form.educationalDetails}
              onChange={handleChange}
              placeholder="e.g., M.A. B.Ed"
            />
            {errors.educationalDetails && (
              <small className="field-error">{errors.educationalDetails}</small>
            )}
          </label>

          <label>
            Years of Experience
            <input
              name="yearOfExperience"
              type="number"
              min="0"
              value={form.yearOfExperience}
              onChange={handleChange}
            />
            {errors.yearOfExperience && (
              <small className="field-error">{errors.yearOfExperience}</small>
            )}
          </label>

          <label className="full">
            Date of Birth (YYYY-MM-DD)
            <input
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={handleChange}
            />
            {errors.dateOfBirth && (
              <small className="field-error">{errors.dateOfBirth}</small>
            )}
          </label>

          <label>
            Aadhaar Number *
            <input
              name="aadharNo"
              value={form.aadharNo}
              onChange={handleChange}
            />
            {errors.aadharNo && (
              <small className="field-error">{errors.aadharNo}</small>
            )}
          </label>

          <label className="full">
            Address *
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows="2"
            />
            {errors.address && (
              <small className="field-error">{errors.address}</small>
            )}
          </label>

          <label className="full">
            Select Classes * (Hold Ctrl for multiple)
            <select
              multiple
              value={selectedClassNames}
              onChange={handleClassChange}
              className="class-multi-select"
              size="6"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.className}>
                  {c.className}
                </option>
              ))}
            </select>
            {errors.classNames && (
              <small className="field-error">{errors.classNames}</small>
            )}
            {selectedClassNames.length > 0 && (
              <div className="selected-classes">
                <small className="field-info">
                  Selected ({selectedClassNames.length}):
                  {selectedClassNames.map((name, idx) => (
                    <span key={name} className="class-tag">
                      {name}
                      <button
                        type="button"
                        className="remove-class"
                        onClick={() => removeClass(name)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </small>
              </div>
            )}
          </label>

          <div className="tr-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Registering..." : "Register Teacher"}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setForm(initialForm);
                setSelectedClassNames([]);
                setErrors({});
                setSuccessMsg("");
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminTeacherRegistration;
