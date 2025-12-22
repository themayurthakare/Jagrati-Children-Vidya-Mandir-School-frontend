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
  rte: "",
  tcNumber: "",
  ssmId: "",
  passoutClass: "",
  studentClassId: "",
  // New Fields
  caste: "",
  subCaste: "",
  religion: "",
  apaarId: "",
  panNo: "",
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
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
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

  const detectIdFromResponse = (res, saved) => {
    if (saved) {
      const id = saved.userId ?? saved.id ?? saved.user_id;
      if (id != null) return id;
    }
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
      window.alert("Please fix the errors highlighted in the form.");
      return;
    }

    setLoading(true);
    try {
      const cls = classes.find(
        (c) => String(c.id) === String(form.studentClassId)
      );
      const payload = {
        ...form,
        studentClass: cls ? String(cls.name) : String(form.studentClassId),
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
        window.alert(`Successfully registered! ID: ${id || "N/A"}`);
        navigate("/admindashboard/upload-docs", { state: { studentId: id } });
        setForm(initialForm);
        if (onAddStudent) onAddStudent(saved || payload);
      } else {
        window.alert(saved?.message || "Registration failed");
      }
    } catch (err) {
      window.alert("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sr-page">
      <div className="sr-card">
        <h2>Student Admission</h2>

        <form className="sr-form" onSubmit={handleSubmit}>
          {/* Row 1 */}
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

          {/* Row 2 */}
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
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <small className="field-error">{errors.password}</small>
            )}
          </label>

          {/* Row 3 */}
          <label>
            Father's Name
            <input
              name="fatherName"
              value={form.fatherName}
              onChange={handleChange}
            />
          </label>
          <label>
            Mother's Name
            <input
              name="motherName"
              value={form.motherName}
              onChange={handleChange}
            />
          </label>

          {/* Row 4 */}
          <label>
            Date of Birth
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
            />
          </label>
          <label>
            Phone Number
            <input
              name="studentPhone"
              value={form.studentPhone}
              onChange={handleChange}
            />
            {errors.studentPhone && (
              <small className="field-error">{errors.studentPhone}</small>
            )}
          </label>

          {/* Row 5 */}
          <label>
            Email
            <input name="email" value={form.email} onChange={handleChange} />
            {errors.email && (
              <small className="field-error">{errors.email}</small>
            )}
          </label>
          <label>
            Parent Phone Number
            <input
              name="parentPhone"
              value={form.parentPhone}
              onChange={handleChange}
            />
          </label>

          {/* Full Width Row */}
          <label className="full">
            Address
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows="2"
            />
          </label>

          {/* Row 6 */}
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

          {/* Row 7 */}
          <label>
            Parent Aadhar No
            <input
              name="parentAadharNo"
              value={form.parentAadharNo}
              onChange={handleChange}
            />
          </label>
          <label>
            RTE
            <select name="rte" value={form.rte} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </label>

          {/* Row 8 - New Fields */}
          <label>
            Caste
            <input
              name="caste"
              value={form.caste}
              onChange={handleChange}
              placeholder="e.g. General, OBC"
            />
          </label>
          <label>
            Sub-Caste
            <input
              name="subCaste"
              value={form.subCaste}
              onChange={handleChange}
            />
          </label>

          {/* Row 9 - New Fields */}
          <label>
            Religion
            <input
              name="religion"
              value={form.religion}
              onChange={handleChange}
            />
          </label>
          <label>
            APAAR ID
            <input
              name="apaarId"
              value={form.apaarId}
              onChange={handleChange}
            />
          </label>

          {/* Row 10 */}
          <label>
            PAN No
            <input name="panNo" value={form.panNo} onChange={handleChange} />
          </label>
          <label>
            TC Number
            <input
              name="tcNumber"
              value={form.tcNumber}
              onChange={handleChange}
            />
          </label>

          {/* Row 11 */}
          <label>
            SSSM ID
            <input name="ssmId" value={form.ssmId} onChange={handleChange} />
          </label>
          <label>
            Passout Class
            <input
              name="passoutClass"
              value={form.passoutClass}
              onChange={handleChange}
            />
          </label>

          {/* Row 12 */}
          <label className="full">
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

          <div className="sr-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Registering..." : "Register Student"}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setForm(initialForm)}
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
