import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminStudentRegistration.css";

const initialForm = {
  name: "",
  admissionNo: "",
  admissionDate: "",
  password: "",
  fatherName: "",
  motherName: "",
  dob: "",
  studentPhone: "",
  email: "",
  parentPhone: "",
  address: "",
  gender: "",
  studentAadharNo: "",
  parentAadharNo: "",
  rte: "", // Changed to empty string
  tcNumber: "",
  ssmId: "",
  passoutClass: "",
  studentClassId: "",
};

const AdminStudentRegistration = ({
  onAddStudent,
  classes: classesProp = null,
  apiBase = "",
}) => {
  const base = apiBase || "http://localhost:8080";
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [classes, setClasses] = useState(classesProp || []);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!classesProp) {
      fetch(`${base}/api/classes/getAll`)
        .then((r) => r.json())
        .then((data) => {
          const arr = Array.isArray(data) ? data : [];
          setClasses(
            arr.map((c) =>
              c.classId != null
                ? { id: c.classId, name: c.className }
                : { id: c.id ?? c.value, name: c.name ?? c.label }
            )
          );
        })
        .catch(() => setClasses([]));
    } else {
      setClasses(
        (classesProp || []).map((c) =>
          c.classId != null
            ? { id: c.classId, name: c.className }
            : { id: c.id ?? c.value, name: c.name ?? c.label }
        )
      );
    }
  }, [classesProp, base]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.admissionNo.trim()) e.admissionNo = "Admission No is required";
    if (!form.admissionDate) e.admissionDate = "Admission date required";
    if (!form.password || form.password.length < 6)
      e.password = "Password must be 6+ characters";
    if (!/^[0-9]{8,15}$/.test(form.studentPhone))
      e.studentPhone = "Enter 8–15 digit phone";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      e.email = "Enter valid email";
    if (form.studentAadharNo && !/^[0-9]{12}$/.test(form.studentAadharNo))
      e.studentAadharNo = "Aadhar must be 12 digits";
    if (!form.studentClassId) e.studentClassId = "Select class";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  // Try to extract id from saved object or Location header
  const detectIdFromResponse = (res, saved) => {
    // prefer explicit id in response body
    if (saved) {
      const id = saved.userId ?? saved.id ?? saved.user_id ?? saved.id;
      if (id != null) return id;
    }
    // try Location header (e.g. /api/users/123)
    const loc = res?.headers ? res.headers.get("Location") : null;
    if (loc) {
      const parts = loc.split("/");
      const last = parts[parts.length - 1];
      if (/^\d+$/.test(last)) return Number(last);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      // re-calc messages from validate() because setErrors is async
      const eObj = {};
      if (!form.name.trim()) eObj.name = "Name is required";
      if (!form.admissionNo.trim())
        eObj.admissionNo = "Admission No is required";
      if (!form.admissionDate) eObj.admissionDate = "Admission date required";
      if (!form.password || form.password.length < 6)
        eObj.password = "Password must be 6+ characters";
      if (!/^[0-9]{8,15}$/.test(form.studentPhone))
        eObj.studentPhone = "Enter 8–15 digit phone";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
        eObj.email = "Enter valid email";
      if (form.studentAadharNo && !/^[0-9]{12}$/.test(form.studentAadharNo))
        eObj.studentAadharNo = "Aadhar must be 12 digits";
      if (!form.studentClassId) eObj.studentClassId = "Select class";

      const messages = Object.values(eObj);
      window.alert(
        "Please fix the following errors:\n\n" + messages.join("\n")
      );
      return;
    }

    setLoading(true);
    try {
      const cls = classes.find(
        (c) => String(c.id) === String(form.studentClassId)
      );
      const payload = {
        name: form.name,
        admissionNo: form.admissionNo,
        admissionDate: form.admissionDate,
        password: form.password,
        fatherName: form.fatherName,
        motherName: form.motherName,
        dob: form.dob,
        studentPhone: form.studentPhone,
        email: form.email,
        parentPhone: form.parentPhone,
        address: form.address,
        gender: form.gender,
        studentAadharNo: form.studentAadharNo,
        parentAadharNo: form.parentAadharNo,
        studentClass: cls ? String(cls.name) : String(form.studentClassId),
        rte: form.rte, // Keep as string "Yes" or "No"
        tcNumber: form.tcNumber,
        ssmId: form.ssmId,
        passoutClass: form.passoutClass,
        studentClassId: Number(form.studentClassId),
      };

      const res = await fetch(`${base}/api/users/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const saved = await res.json().catch(() => null);

      if (res.ok || res.status === 201) {
        const id = detectIdFromResponse(res, saved);
        if (id) {
          window.alert(
            `Student registered successfully (id: ${id}). Redirecting to upload page...`
          );
          // navigate to upload page and pass studentId in state
          navigate("/admindashboard/upload-docs", { state: { studentId: id } });
        } else {
          // no id returned — navigate and let user enter id manually
          window.alert(
            "Student registered. Please enter the student ID on upload page to upload documents."
          );
          navigate("/admindashboard/upload-docs");
        }

        // reset form
        setForm(initialForm);
        setErrors({});
        if (onAddStudent) onAddStudent(saved || payload);
      } else {
        const message =
          (saved && (saved.message || saved.error)) ||
          `Registration failed (status ${res.status})`;
        window.alert(message);
      }
    } catch (err) {
      console.error(err);
      window.alert(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sr-page">
      <div className="sr-card">
        <h2>Student Registration</h2>

        <form className="sr-form" onSubmit={handleSubmit}>
          <div className="row">
            <label>
              Full Name *
              <input name="name" value={form.name} onChange={handleChange} />
              {errors.name && (
                <small className="field-error">{errors.name}</small>
              )}
            </label>

            <label>
              Admission No *
              <input
                name="admissionNo"
                value={form.admissionNo}
                onChange={handleChange}
              />
              {errors.admissionNo && (
                <small className="field-error">{errors.admissionNo}</small>
              )}
            </label>
          </div>

          <div className="row">
            <label>
              Admission Date *
              <input
                type="date"
                name="admissionDate"
                value={form.admissionDate}
                onChange={handleChange}
              />
              {errors.admissionDate && (
                <small className="field-error">{errors.admissionDate}</small>
              )}
            </label>

            <label>
              Password *
              <div className="password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="show-btn"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <small className="field-error">{errors.password}</small>
              )}
            </label>
          </div>

          <div className="row">
            <label>
              Father Name
              <input
                name="fatherName"
                value={form.fatherName}
                onChange={handleChange}
              />
            </label>

            <label>
              Mother Name
              <input
                name="motherName"
                value={form.motherName}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="row">
            <label>
              DOB
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
              />
            </label>

            <label>
              Student Phone *
              <input
                name="studentPhone"
                value={form.studentPhone}
                onChange={handleChange}
              />
              {errors.studentPhone && (
                <small className="field-error">{errors.studentPhone}</small>
              )}
            </label>
          </div>

          <div className="row">
            <label>
              Email
              <input name="email" value={form.email} onChange={handleChange} />
              {errors.email && (
                <small className="field-error">{errors.email}</small>
              )}
            </label>

            <label>
              Parent Phone
              <input
                name="parentPhone"
                value={form.parentPhone}
                onChange={handleChange}
              />
            </label>
          </div>

          <label>
            Address
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows="2"
            />
          </label>

          <div className="row">
            <label>
              Gender
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              Student Aadhar No
              <input
                name="studentAadharNo"
                value={form.studentAadharNo}
                onChange={handleChange}
              />
              {errors.studentAadharNo && (
                <small className="field-error">{errors.studentAadharNo}</small>
              )}
            </label>
          </div>

          <div className="row">
            <label>
              Parent Aadhar No
              <input
                name="parentAadharNo"
                value={form.parentAadharNo}
                onChange={handleChange}
              />
            </label>

            {/* CHANGED: RTE as dropdown with Yes/No */}
            <label>
              RTE
              <select name="rte" value={form.rte} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </label>
          </div>

          <div className="row">
            <label>
              TC Number
              <input
                name="tcNumber"
                value={form.tcNumber}
                onChange={handleChange}
              />
            </label>

            <label>
              SSSM ID
              <input name="ssmId" value={form.ssmId} onChange={handleChange} />
            </label>
          </div>

          <div className="row">
            <label>
              Passout Class
              <input
                name="passoutClass"
                value={form.passoutClass}
                onChange={handleChange}
              />
            </label>

            <label>
              Class *
              <select
                name="studentClassId"
                value={form.studentClassId}
                onChange={handleChange}
              >
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.studentClassId && (
                <small className="field-error">{errors.studentClassId}</small>
              )}
            </label>
          </div>

          <div className="sr-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Registering..." : "Register Student"}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setForm(initialForm);
                setErrors({});
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

export default AdminStudentRegistration;
