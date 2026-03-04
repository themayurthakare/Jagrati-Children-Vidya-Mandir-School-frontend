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
  }, [classesProp, apiBase, sessionId]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";

    if (!form.email) {
      e.email = "Email is required";
    } else if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z.-]+\.[A-Za-z]{2,}$/.test(form.email)
    ) {
      e.email = "Enter a valid email format (example: abc@gmail.com)";
    }

    if (!form.phone || !/^[0-9]{10,15}$/.test(form.phone))
      e.phone = "Enter 10–15 digit phone";

    if (!form.password || form.password.length < 6)
      e.password = "Password must be at least 6 characters";

    if (!form.educationalDetails.trim())
      e.educationalDetails = "Educational details required";

    if (!form.yearOfExperience || form.yearOfExperience < 0)
      e.yearOfExperience = "Valid experience required";

    if (!form.dateOfBirth) {
      e.dateOfBirth = "Date of Birth is required";
    } else {
      const selectedDate = new Date(form.dateOfBirth);
      const today = new Date();

      // Remove time part
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        e.dateOfBirth = "Future date is not allowed";
      }
    }

    // Aadhar validation - exactly 12 digits
    if (!form.aadharNo.trim()) {
      e.aadharNo = "Aadhaar number is required";
    } else if (form.aadharNo.length !== 12) {
      e.aadharNo = "Aadhaar number must be exactly 12 digits";
    } else if (!/^\d{12}$/.test(form.aadharNo)) {
      e.aadharNo = "Aadhaar number must contain only digits";
    }

    if (!form.address.trim()) e.address = "Address required";

    if (selectedClassNames.length === 0)
      e.classNames = "Select at least one class";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      // Allow only alphabets and spaces
      const onlyAlphabets = value.replace(/[^A-Za-z\s]/g, "");
      setForm((p) => ({ ...p, name: onlyAlphabets }));
    } else if (name === "aadharNo") {
      // Allow only numbers & enforce exactly 12 digits
      const onlyNumbers = value.replace(/\D/g, "");
      // Limit to 12 digits max
      const limitedNumbers = onlyNumbers.slice(0, 12);
      setForm((p) => ({ ...p, aadharNo: limitedNumbers }));
    } else if (name === "phone") {
      const onlyNumbers = value.replace(/\D/g, "").slice(0, 10);
      setForm((p) => ({ ...p, phone: onlyNumbers }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }

    // Clear error for this field
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
      prev.filter((name) => name !== classNameToRemove),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      const firstErrorField = Object.keys(errors)[0];
      const firstErrorMsg = errors[firstErrorField];
      window.alert(firstErrorMsg || "Please fix the form errors.");
      return;
    }

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

      const text = await res.text();

      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { message: text };
      }

      if (res.ok) {
        const teacherId = data?.teacherId ?? data?.id;

        window.alert(data?.message || "Teacher registered successfully!");

        setForm(initialForm);
        setSelectedClassNames([]);

        setTimeout(() => {
          navigate(`/admindashboard/teacher-documents?teacherId=${teacherId}`);
        }, 800);

        if (onAddTeacher) onAddTeacher(data);
      } else {
        // 🔥 Always show backend message first
        const msg =
          data?.message || data?.error || text || "Registration failed";

        window.alert(msg);
      }
    } catch (err) {
      window.alert("Network error: " + err.message);
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
              maxLength="10"
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
            Educational Details *
            <select
              name="educationalDetails"
              value={form.educationalDetails}
              onChange={handleChange}
            >
              <option value="">Select Qualification</option>
              <option value="B.A. B.Ed">B.A. B.Ed</option>
              <option value="M.A. B.Ed">M.A. B.Ed</option>
              <option value="B.Sc B.Ed">B.Sc B.Ed</option>
            </select>
            {errors.educationalDetails && (
              <small className="field-error">{errors.educationalDetails}</small>
            )}
          </label>

          <label>
            Years of Experience *
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
            Date of Birth *
            <input
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
            />
            {errors.dateOfBirth && (
              <small className="field-error">{errors.dateOfBirth}</small>
            )}
          </label>

          <label>
            Aadhaar Number *
            <input
              name="aadharNo"
              type="text"
              inputMode="numeric"
              value={form.aadharNo}
              onChange={handleChange}
              placeholder="Enter 12-digit Aadhaar number"
              maxLength="12"
            />
            {errors.aadharNo && (
              <small className="field-error">{errors.aadharNo}</small>
            )}
            {form.aadharNo &&
              form.aadharNo.length > 0 &&
              form.aadharNo.length !== 12 && (
                <small
                  className="field-warning"
                  style={{
                    color: "#f57c00",
                    display: "block",
                    marginTop: "4px",
                  }}
                >
                  {form.aadharNo.length}/12 digits entered
                </small>
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
                <option key={c.classId || c.id} value={c.className}>
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
