import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AdminUpdateStudent.css";

const AdminUpdateStudent = ({ apiBase = "http://localhost:8080" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const studentId = location.state?.studentId;

  // Document types configuration
  const DOC_TYPES = [
    {
      key: "studentAadhar",
      label: "Student Aadhar",
      endpoint: "STUDENT_AADHAR",
    },
    { key: "ssmId", label: "SSM ID", endpoint: "SSSMID_CARD" },
    { key: "studentPhoto", label: "Student Photo", endpoint: "STUDENT_PHOTO" },
    {
      key: "birthCertificate",
      label: "Birth Certificate",
      endpoint: "BIRTH_CERTIFICATE",
    },
    {
      key: "incomeCertificate",
      label: "Income Certificate",
      endpoint: "INCOME_CERTIFICATE",
    },
    { key: "tc", label: "Transfer Certificate (TC)", endpoint: "TC" },
    { key: "bankPassbook", label: "Bank Passbook", endpoint: "BANK_PASSBOOK" },
    { key: "domicile", label: "Domicile Certificate", endpoint: "DOMICILE" },
    { key: "parentAadhar", label: "Parent Aadhar", endpoint: "PARENT_AADHAR" },
  ];

  // Student form state
  const [form, setForm] = useState({
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
  });

  // Documents state
  const [docs, setDocs] = useState({});
  const [docStatus, setDocStatus] = useState({});
  const [existingDocs, setExistingDocs] = useState([]);

  const [classes, setClasses] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("details"); // "details" or "documents"

  // Fetch student data and documents
  useEffect(() => {
    if (!studentId) {
      setTimeout(() => navigate(-1), 2000);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch classes
        const classesRes = await fetch(`${apiBase}/api/classes/getAll`);
        if (classesRes.ok) {
          const classesData = await classesRes.json();
          setClasses(Array.isArray(classesData) ? classesData : []);
        }

        // Fetch student data
        const endpoints = [
          `${apiBase}/api/users/${studentId}`,
          `${apiBase}/api/users/get/${studentId}`,
          `${apiBase}/api/users/getById/${studentId}`,
        ];

        let studentData = null;
        for (const endpoint of endpoints) {
          try {
            const res = await fetch(endpoint);
            if (res.ok) {
              studentData = await res.json();
              break;
            }
          } catch (err) {
            continue;
          }
        }

        if (!studentData) {
          throw new Error("Student not found");
        }

        // Update form with fetched data
        setForm({
          name: studentData.name || "",
          admissionNo: studentData.admissionNo || "",
          admissionDate: studentData.admissionDate
            ? studentData.admissionDate.split("T")[0]
            : "",
          password: "",
          fatherName: studentData.fatherName || "",
          motherName: studentData.motherName || "",
          dob: studentData.dob ? studentData.dob.split("T")[0] : "",
          studentPhone: studentData.studentPhone || "",
          email: studentData.email || "",
          parentPhone: studentData.parentPhone || "",
          address: studentData.address || "",
          gender: studentData.gender || "",
          studentAadharNo: studentData.studentAadharNo || "",
          parentAadharNo: studentData.parentAadharNo || "",
          rte: studentData.rte || "",
          tcNumber: studentData.tcNumber || "",
          ssmId: studentData.ssmId || "",
          passoutClass: studentData.passoutClass || "",
          studentClassId: studentData.studentClassId || "",
        });

        // Fetch existing documents
        await fetchDocuments();
      } catch (err) {
        console.error("Error fetching data:", err);
        window.alert(`Failed to load student data: ${err.message}`);
        navigate("/admindashboard/view-students");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, apiBase, navigate]);

  // Fetch existing documents
  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${apiBase}/api/documents/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        const docsArray = Array.isArray(data) ? data : [];
        setExistingDocs(docsArray);

        // Initialize docs state with existing files
        const initialDocs = {};
        docsArray.forEach((doc) => {
          const docType = DOC_TYPES.find(
            (d) => d.endpoint === doc.docType || d.endpoint === doc.type
          );
          if (docType) {
            initialDocs[docType.key] = {
              fileName: doc.fileName || doc.filename,
              url: doc.url || doc.path,
              exists: true,
            };
          }
        });
        setDocs(initialDocs);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.admissionNo.trim())
      newErrors.admissionNo = "Admission No is required";
    if (!form.admissionDate)
      newErrors.admissionDate = "Admission date is required";
    if (!form.studentPhone)
      newErrors.studentPhone = "Student phone is required";
    if (!form.email) newErrors.email = "Email is required";
    if (!form.studentClassId) newErrors.studentClassId = "Class is required";

    // Format validations
    if (form.studentPhone && !/^[0-9]{10}$/.test(form.studentPhone)) {
      newErrors.studentPhone = "Enter a valid 10-digit phone number";
    }

    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (form.studentAadharNo && !/^[0-9]{12}$/.test(form.studentAadharNo)) {
      newErrors.studentAadharNo = "Aadhar must be 12 digits";
    }

    if (form.parentPhone && !/^[0-9]{10}$/.test(form.parentPhone)) {
      newErrors.parentPhone = "Enter a valid 10-digit phone number";
    }

    if (form.parentAadharNo && !/^[0-9]{12}$/.test(form.parentAadharNo)) {
      newErrors.parentAadharNo = "Parent Aadhar must be 12 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Reset success state when form is edited
    if (updateSuccess) {
      setUpdateSuccess(false);
    }
  };

  // Handle document file changes
  const handleFileChange = (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    setDocs((prev) => ({
      ...prev,
      [key]: {
        file,
        fileName: file.name,
        exists: false,
      },
    }));

    setDocStatus((prev) => ({
      ...prev,
      [key]: { uploading: false, ok: false, error: null },
    }));
  };

  // Upload single document
  const uploadDocument = async (key) => {
    const docType = DOC_TYPES.find((d) => d.key === key);
    if (!docType || !docs[key]?.file) return;

    setDocStatus((prev) => ({
      ...prev,
      [key]: { uploading: true, ok: false, error: null },
    }));

    try {
      const url = `${apiBase}/api/documents/update/${studentId}/${docType.endpoint}`;
      const formData = new FormData();
      formData.append("file", docs[key].file);
      formData.append("docType", docType.endpoint);

      const res = await fetch(url, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        setDocStatus((prev) => ({
          ...prev,
          [key]: { uploading: false, ok: true, error: null },
        }));
        return true;
      } else {
        const errorText = await res.text();
        throw new Error(errorText || `Status: ${res.status}`);
      }
    } catch (err) {
      setDocStatus((prev) => ({
        ...prev,
        [key]: { uploading: false, ok: false, error: err.message },
      }));
      return false;
    }
  };

  // Upload all selected documents
  const uploadAllDocuments = async () => {
    setUploadingDocs(true);

    const filesToUpload = Object.keys(docs).filter(
      (key) => docs[key]?.file && !docs[key]?.exists
    );

    let allSuccess = true;

    for (const key of filesToUpload) {
      const success = await uploadDocument(key);
      if (!success) allSuccess = false;
    }

    setUploadingDocs(false);

    if (allSuccess) {
      window.alert("All documents uploaded successfully!");
      await fetchDocuments(); // Refresh documents list
    } else {
      window.alert(
        "Some documents failed to upload. Please check individual file status."
      );
    }

    return allSuccess;
  };

  // Handle form submission (student details)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      window.alert("Please fix the errors in the form before submitting.");
      return;
    }

    setUpdating(true);
    setUpdateSuccess(false);

    try {
      // Find class name for the selected class ID
      const selectedClass = classes.find(
        (c) =>
          String(c.classId) === String(form.studentClassId) ||
          String(c.id) === String(form.studentClassId)
      );

      const payload = {
        ...form,
        studentClass: selectedClass
          ? selectedClass.className || selectedClass.name
          : "",
        studentClassId: Number(form.studentClassId),
        id: studentId,
        userId: studentId,
      };

      // Only include password if it was changed (non-empty)
      if (!form.password) {
        delete payload.password;
      }

      // Try multiple update endpoints
      const updateEndpoints = [
        `${apiBase}/api/users/update/${studentId}`,
        `${apiBase}/api/users/${studentId}`,
        `${apiBase}/api/users/update`,
      ];

      let success = false;
      let responseData = null;

      for (const endpoint of updateEndpoints) {
        try {
          const res = await fetch(endpoint, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (res.ok || res.status === 200) {
            success = true;
            responseData = await res.json();
            break;
          }
        } catch (err) {
          continue;
        }
      }

      if (success) {
        setUpdateSuccess(true);
        setForm((prev) => ({ ...prev, password: "" }));

        // Auto-navigate after 1.5 seconds
        setTimeout(() => {
          navigate("/admindashboard/view-students");
        }, 1500);
      } else {
        throw new Error("Failed to update student on all endpoints");
      }
    } catch (err) {
      console.error("Update error:", err);
      window.alert(`Update failed: ${err.message || "Please try again"}`);
    } finally {
      setUpdating(false);
    }
  };

  // Handle save all (details + documents)
  const handleSaveAll = async () => {
    // First save student details
    const formValid = validateForm();
    if (!formValid) {
      window.alert("Please fix student details errors before saving.");
      return;
    }

    setUpdating(true);

    try {
      // Save student details
      const selectedClass = classes.find(
        (c) =>
          String(c.classId) === String(form.studentClassId) ||
          String(c.id) === String(form.studentClassId)
      );

      const payload = {
        ...form,
        studentClass: selectedClass
          ? selectedClass.className || selectedClass.name
          : "",
        studentClassId: Number(form.studentClassId),
        id: studentId,
        userId: studentId,
      };

      if (!form.password) {
        delete payload.password;
      }

      const updateEndpoints = [
        `${apiBase}/api/users/update/${studentId}`,
        `${apiBase}/api/users/${studentId}`,
        `${apiBase}/api/users/update`,
      ];

      let detailsSuccess = false;
      for (const endpoint of updateEndpoints) {
        try {
          const res = await fetch(endpoint, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (res.ok || res.status === 200) {
            detailsSuccess = true;
            break;
          }
        } catch (err) {
          continue;
        }
      }

      if (!detailsSuccess) {
        throw new Error("Failed to update student details");
      }

      // Then upload documents if any
      const hasNewDocuments = Object.keys(docs).some(
        (key) => docs[key]?.file && !docs[key]?.exists
      );

      let docsSuccess = true;
      if (hasNewDocuments) {
        docsSuccess = await uploadAllDocuments();
      }

      if (detailsSuccess && docsSuccess) {
        setUpdateSuccess(true);
        setForm((prev) => ({ ...prev, password: "" }));

        setTimeout(() => {
          navigate("/admindashboard/view-students");
        }, 1500);
      }
    } catch (err) {
      console.error("Save all error:", err);
      window.alert(`Save failed: ${err.message || "Please try again"}`);
    } finally {
      setUpdating(false);
    }
  };

  // Handle form reset
  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all changes?")) {
      window.location.reload();
    }
  };

  // Handle back navigation
  const handleBackToList = () => {
    const hasChanges = Object.keys(form).some((key) => {
      if (key === "password") return false;
      return true;
    });

    const hasNewDocs = Object.keys(docs).some(
      (key) => docs[key]?.file && !docs[key]?.exists
    );

    if (
      (hasChanges || hasNewDocs) &&
      !window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      )
    ) {
      return;
    }
    navigate("/admindashboard/view-students");
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        Loading student data...
      </div>
    );
  }

  return (
    <div className="update-container">
      <div className="update-header">
        <h2>Update Student</h2>
        <button
          className="update-back-btn"
          onClick={handleBackToList}
          disabled={updating || uploadingDocs}
        >
          ← Back to Student List
        </button>
      </div>

      <div className="info-message">
        Updating student: <strong>{form.name}</strong> (ID: {studentId})
        <br />
        <small style={{ color: "#7f8c8d", fontSize: "0.9em" }}>
          Leave password field empty to keep current password
        </small>
      </div>

      {/* Tabs for Details and Documents */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            Student Details
          </button>
          <button
            className={`tab ${activeTab === "documents" ? "active" : ""}`}
            onClick={() => setActiveTab("documents")}
          >
            Documents {existingDocs.length > 0 && `(${existingDocs.length})`}
          </button>
        </div>
      </div>

      {/* Student Details Tab */}
      {activeTab === "details" && (
        <div className="update-form-container">
          <form className="update-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="required">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <div className="error-message">{errors.name}</div>
                )}
              </div>

              <div className="form-group">
                <label className="required">Admission No</label>
                <input
                  type="text"
                  name="admissionNo"
                  className="form-input"
                  value={form.admissionNo}
                  onChange={handleChange}
                  placeholder="Enter admission number"
                />
                {errors.admissionNo && (
                  <div className="error-message">{errors.admissionNo}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="required">Admission Date</label>
                <input
                  type="date"
                  name="admissionDate"
                  className="form-input"
                  value={form.admissionDate}
                  onChange={handleChange}
                />
                {errors.admissionDate && (
                  <div className="error-message">{errors.admissionDate}</div>
                )}
              </div>

              <div className="form-group">
                <label>Password (Leave empty to keep current)</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-input"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Father's Name</label>
                <input
                  type="text"
                  name="fatherName"
                  className="form-input"
                  value={form.fatherName}
                  onChange={handleChange}
                  placeholder="Enter father's name"
                />
              </div>

              <div className="form-group">
                <label>Mother's Name</label>
                <input
                  type="text"
                  name="motherName"
                  className="form-input"
                  value={form.motherName}
                  onChange={handleChange}
                  placeholder="Enter mother's name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  className="form-input"
                  value={form.dob}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="required">Student Phone</label>
                <input
                  type="tel"
                  name="studentPhone"
                  className="form-input"
                  value={form.studentPhone}
                  onChange={handleChange}
                  placeholder="Enter 10-digit phone"
                  maxLength="10"
                />
                {errors.studentPhone && (
                  <div className="error-message">{errors.studentPhone}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="required">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <div className="error-message">{errors.email}</div>
                )}
              </div>

              <div className="form-group">
                <label>Parent Phone</label>
                <input
                  type="tel"
                  name="parentPhone"
                  className="form-input"
                  value={form.parentPhone}
                  onChange={handleChange}
                  placeholder="Enter parent phone"
                  maxLength="10"
                />
                {errors.parentPhone && (
                  <div className="error-message">{errors.parentPhone}</div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                className="form-textarea"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter complete address"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  className="form-select"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Student Aadhar No</label>
                <input
                  type="text"
                  name="studentAadharNo"
                  className="form-input"
                  value={form.studentAadharNo}
                  onChange={handleChange}
                  placeholder="Enter 12-digit Aadhar"
                  maxLength="12"
                />
                {errors.studentAadharNo && (
                  <div className="error-message">{errors.studentAadharNo}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Parent Aadhar No</label>
                <input
                  type="text"
                  name="parentAadharNo"
                  className="form-input"
                  value={form.parentAadharNo}
                  onChange={handleChange}
                  placeholder="Enter parent Aadhar"
                  maxLength="12"
                />
                {errors.parentAadharNo && (
                  <div className="error-message">{errors.parentAadharNo}</div>
                )}
              </div>

              <div className="form-group">
                <label>RTE</label>
                <input
                  type="text"
                  name="rte"
                  className="form-input"
                  value={form.rte}
                  onChange={handleChange}
                  placeholder="Enter RTE status"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>TC Number</label>
                <input
                  type="text"
                  name="tcNumber"
                  className="form-input"
                  value={form.tcNumber}
                  onChange={handleChange}
                  placeholder="Enter TC number"
                />
              </div>

              <div className="form-group">
                <label>SSSM ID</label>
                <input
                  type="text"
                  name="ssmId"
                  className="form-input"
                  value={form.ssmId}
                  onChange={handleChange}
                  placeholder="Enter SSM ID"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Passout Class</label>
                <input
                  type="text"
                  name="passoutClass"
                  className="form-input"
                  value={form.passoutClass}
                  onChange={handleChange}
                  placeholder="Enter passout class"
                />
              </div>

              <div className="form-group">
                <label className="required">Class</label>
                <select
                  name="studentClassId"
                  className="form-select"
                  value={form.studentClassId}
                  onChange={handleChange}
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option
                      key={cls.classId || cls.id}
                      value={cls.classId || cls.id}
                    >
                      {cls.className || cls.name}
                    </option>
                  ))}
                </select>
                {errors.studentClassId && (
                  <div className="error-message">{errors.studentClassId}</div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="reset-btn"
                onClick={handleReset}
                disabled={updating || uploadingDocs}
              >
                Reset
              </button>

              <button
                type="submit"
                className={`update-btn ${
                  updateSuccess ? "update-btn-success" : "update-btn-primary"
                }`}
                disabled={updating || uploadingDocs}
              >
                {updating ? (
                  <>
                    <span className="loading-spinner-small"></span>
                    Updating...
                  </>
                ) : updateSuccess ? (
                  <>✓ Updated Successfully!</>
                ) : (
                  "Update Details"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === "documents" && (
        <div className="documents-container">
          <div className="documents-info">
            <p>
              Upload or update documents for <strong>{form.name}</strong>
            </p>
            {existingDocs.length > 0 && (
              <p className="existing-docs-info">
                {existingDocs.length} document(s) already uploaded
              </p>
            )}
          </div>

          <div className="documents-grid">
            {DOC_TYPES.map((docType) => {
              const doc = docs[docType.key];
              const existingDoc = existingDocs.find(
                (d) =>
                  d.docType === docType.endpoint || d.type === docType.endpoint
              );
              const status = docStatus[docType.key];

              return (
                <div key={docType.key} className="document-item">
                  <label className="document-label">
                    {docType.label}
                    {existingDoc && (
                      <span className="existing-badge">✓ Uploaded</span>
                    )}
                  </label>

                  <div className="document-input-group">
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, docType.key)}
                      className="document-input"
                      disabled={uploadingDocs}
                    />

                    <button
                      type="button"
                      className="upload-single-btn"
                      onClick={() => uploadDocument(docType.key)}
                      disabled={!doc?.file || uploadingDocs}
                    >
                      Upload
                    </button>
                  </div>

                  <div className="document-info">
                    {doc?.file ? (
                      <div className="file-info">
                        <span className="file-name">{doc.fileName}</span>
                        <span className="file-size">
                          ({(doc.file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    ) : existingDoc ? (
                      <div className="existing-file-info">
                        <span className="existing-file-name">
                          {existingDoc.fileName || existingDoc.filename}
                        </span>
                      </div>
                    ) : (
                      <span className="no-file">No file selected</span>
                    )}
                  </div>

                  {status && (
                    <div className="document-status">
                      {status.uploading && (
                        <span className="status-uploading">Uploading...</span>
                      )}
                      {status.ok && (
                        <span className="status-success">✓ Uploaded</span>
                      )}
                      {status.error && (
                        <span className="status-error">
                          Error: {status.error}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="documents-actions">
            <button
              type="button"
              className="upload-all-btn"
              onClick={uploadAllDocuments}
              disabled={
                uploadingDocs ||
                !Object.keys(docs).some((key) => docs[key]?.file)
              }
            >
              {uploadingDocs ? (
                <>
                  <span className="loading-spinner-small"></span>
                  Uploading Documents...
                </>
              ) : (
                "Upload All Selected Documents"
              )}
            </button>

            <button
              type="button"
              className="save-all-btn"
              onClick={handleSaveAll}
              disabled={updating || uploadingDocs}
            >
              {updating ? (
                <>
                  <span className="loading-spinner-small"></span>
                  Saving All Changes...
                </>
              ) : (
                "Save All (Details + Documents)"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUpdateStudent;
