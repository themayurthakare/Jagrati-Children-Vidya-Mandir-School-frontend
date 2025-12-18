import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminTeacherRegistration.css";

/*
Props:
 - onAddTeacher (optional): function(teacherObject) => updates parent state
 - classes (optional): [{id, name}] used to pick classId
 - apiBase (optional): base URL, e.g. "/api"
*/

const initialForm = {
  classId: "",
  name: "",
  email: "",
  phone: "",
  password: "",
};

const AdminTeacherRegistration = ({
  onAddTeacher,
  classes: classesProp = null,
  apiBase = "",
}) => {
  const [form, setForm] = useState(initialForm);
  const [classes, setClasses] = useState(classesProp || []);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!classesProp && apiBase) {
      fetch(`${apiBase}/classes`)
        .then((r) => r.json())
        .then((data) => setClasses(data || []))
        .catch(() => setClasses([]));
    }
  }, [classesProp, apiBase]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.classId) e.classId = "Select a class";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email";
    if (!form.phone || !/^[0-9]{10,15}$/.test(form.phone))
      e.phone = "Enter 10–15 digit phone";
    if (!form.password || form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        classId: form.classId,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      };

      if (apiBase) {
        const res = await fetch(`${apiBase}/teachers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok || res.status === 201) {
          const body = await res.json().catch(() => null);
          const created =
            body && (body.id || body.email)
              ? body
              : { id: Date.now(), ...payload };
          if (typeof onAddTeacher === "function") onAddTeacher(created);
          setSuccessMsg("Teacher registered successfully.");
          setForm(initialForm);
        } else {
          const body = await res.json().catch(() => ({}));
          setErrors({ form: body.message || "Registration failed" });
        }
      } else {
        // local fallback (no backend)
        const created = { id: Date.now(), ...payload };
        if (typeof onAddTeacher === "function") onAddTeacher(created);
        setSuccessMsg("Teacher registered (local).");
        setForm(initialForm);
        navigate("/admin/view-teacher-points");
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
            <input name="email" value={form.email} onChange={handleChange} />
            {errors.email && (
              <small className="field-error">{errors.email}</small>
            )}
          </label>

          <label>
            Phone *
            <input name="phone" value={form.phone} onChange={handleChange} />
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
            Class *
            <select name="classId" value={form.classId} onChange={handleChange}>
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.classId && (
              <small className="field-error">{errors.classId}</small>
            )}
          </label>

          <div className="tr-actions full">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Registering..." : "Register Teacher"}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setForm(initialForm);
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
