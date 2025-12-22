import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./AdminUpdateTeacher.css";

const AdminUpdateTeacher = ({ apiBase = "http://localhost:8080" }) => {
  const navigate = useNavigate();
  const { teacherId: paramTeacherId } = useParams();
  const location = useLocation();

  const teacherId =
    paramTeacherId ||
    location.state?.teacherId ||
    location.state?.teacher?.teacherId ||
    location.state?.teacher?.id;

  // Document types configuration for teachers - Updated based on your backend
  const DOC_TYPES = [
    { key: "teacherPhoto", label: "Teacher Photo", endpoint: "TEACHER_PHOTO" },
    {
      key: "teacherAadhar",
      label: "Teacher Aadhar",
      endpoint: "TEACHER_AADHAR",
    },
    { key: "teacherPan", label: "PAN Card", endpoint: "TEACHER_PAN" },
    {
      key: "teacherDegree",
      label: "Degree Certificate",
      endpoint: "TEACHER_DEGREE",
    },
    {
      key: "teacherCertificate",
      label: "Experience / Other Certificate",
      endpoint: "TEACHER_CERTIFICATE",
    },
  ];

  // Teacher form state - Updated to match your JSON structure
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    dateOfBirth: "",
    yearOfExperience: "",
    educationalDetails: "",
    aadharNo: "",
    address: "",
    panNo: "", // Added as optional field
    designation: "", // Added as optional field
    subject: "", // Added as optional field
  });

  // Documents state
  const [docs, setDocs] = useState({});
  const [docStatus, setDocStatus] = useState({});
  const [existingDocs, setExistingDocs] = useState([]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // Fetch teacher data and documents
  useEffect(() => {
    if (!teacherId) {
      setTimeout(() => navigate(-1), 2000);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Try multiple teacher endpoints
        const endpoints = [
          `${apiBase}/api/teachers/${teacherId}`,
          `${apiBase}/api/teachers/get/${teacherId}`,
          `${apiBase}/api/teachers/getById/${teacherId}`,
        ];

        let teacherData = null;
        for (const endpoint of endpoints) {
          try {
            const res = await fetch(endpoint);
            if (res.ok) {
              teacherData = await res.json();
              break;
            }
          } catch (err) {
            continue;
          }
        }

        if (!teacherData) {
          throw new Error("Teacher not found");
        }

        // Update form with fetched data - Only fields from your JSON
        setForm({
          name: teacherData.name || "",
          email: teacherData.email || "",
          phone: teacherData.phone || "",
          password: "",
          dateOfBirth: teacherData.dateOfBirth
            ? teacherData.dateOfBirth.split("T")[0]
            : "",
          yearOfExperience: teacherData.yearOfExperience || "",
          educationalDetails: teacherData.educationalDetails || "",
          aadharNo: teacherData.aadharNo || "",
          address: teacherData.address || "",
          panNo: teacherData.panNo || "", // Optional
          designation: teacherData.designation || "", // Optional
          subject: teacherData.subject || "", // Optional
        });

        // Fetch existing documents
        await fetchDocuments();
      } catch (err) {
        console.error("Error fetching data:", err);
        window.alert(`Failed to load teacher data: ${err.message}`);
        navigate("/admindashboard/view-teachers");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teacherId, apiBase, navigate]);

  // Fetch existing documents - UPDATED ENDPOINT
  const fetchDocuments = async () => {
    try {
      // Using the correct endpoint for teacher documents
      const res = await fetch(`${apiBase}/api/teacher-documents/${teacherId}`);
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
    if (!form.email) newErrors.email = "Email is required";
    if (!form.phone) newErrors.phone = "Phone is required";

    // Format validations
    if (form.phone && !/^[0-9]{10}$/.test(form.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (form.aadharNo && !/^[0-9]{12}$/.test(form.aadharNo)) {
      newErrors.aadharNo = "Aadhar must be 12 digits";
    }

    if (form.panNo && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNo)) {
      newErrors.panNo = "PAN format invalid (e.g., ECPPG4538J)";
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

  // Upload single document - UPDATED ENDPOINT
  const uploadDocument = async (key) => {
    const docType = DOC_TYPES.find((d) => d.key === key);
    if (!docType || !docs[key]?.file) return;

    setDocStatus((prev) => ({
      ...prev,
      [key]: { uploading: true, ok: false, error: null },
    }));

    try {
      // Using the correct endpoint: /api/teacher-documents/update/{teacherId}/{docType}
      const url = `${apiBase}/api/teacher-documents/update/${teacherId}/${docType.endpoint}`;
      const formData = new FormData();
      formData.append("file", docs[key].file);
      // Note: Removed the extra docType append as it might not be needed

      const res = await fetch(url, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
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

  // Handle form submission (teacher details)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      window.alert("Please fix the errors in the form before submitting.");
      return;
    }

    setUpdating(true);
    setUpdateSuccess(false);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        yearOfExperience: form.yearOfExperience,
        educationalDetails: form.educationalDetails,
        aadharNo: form.aadharNo,
        address: form.address,
        panNo: form.panNo,
        designation: form.designation,
        subject: form.subject,
        teacherId: teacherId,
      };

      // Only include password if it was changed (non-empty)
      if (form.password && form.password.trim() !== "") {
        payload.password = form.password;
      }

      // Try multiple update endpoints
      const updateEndpoints = [
        `${apiBase}/api/teachers/update/${teacherId}`,
        `${apiBase}/api/teachers/${teacherId}`,
        `${apiBase}/api/teachers/update`,
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
          navigate("/admindashboard/view-teachers");
        }, 1500);
      } else {
        throw new Error("Failed to update teacher on all endpoints");
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
    // First save teacher details
    const formValid = validateForm();
    if (!formValid) {
      window.alert("Please fix teacher details errors before saving.");
      return;
    }

    setUpdating(true);

    try {
      // Save teacher details
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        yearOfExperience: form.yearOfExperience,
        educationalDetails: form.educationalDetails,
        aadharNo: form.aadharNo,
        address: form.address,
        panNo: form.panNo,
        designation: form.designation,
        subject: form.subject,
        teacherId: teacherId,
      };

      if (form.password && form.password.trim() !== "") {
        payload.password = form.password;
      }

      const updateEndpoints = [
        `${apiBase}/api/teachers/update/${teacherId}`,
        `${apiBase}/api/teachers/${teacherId}`,
        `${apiBase}/api/teachers/update`,
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
        throw new Error("Failed to update teacher details");
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
          navigate("/admindashboard/view-teachers");
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
    navigate("/admindashboard/view-teachers");
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        Loading teacher data...
      </div>
    );
  }

  return (
    <div className="update-container">
      <div className="update-header">
        <h2>Update Teacher</h2>
        <button
          className="update-back-btn"
          onClick={handleBackToList}
          disabled={updating || uploadingDocs}
        >
          ← Back to Teacher List
        </button>
      </div>

      <div className="info-message">
        Updating teacher: <strong>{form.name}</strong> (ID: {teacherId})
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
            Teacher Details
          </button>
          <button
            className={`tab ${activeTab === "documents" ? "active" : ""}`}
            onClick={() => setActiveTab("documents")}
          >
            Documents {existingDocs.length > 0 && `(${existingDocs.length})`}
          </button>
        </div>
      </div>

      {/* Teacher Details Tab - Simplified to match your JSON */}
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
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="required">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter 10-digit phone"
                  maxLength="10"
                />
                {errors.phone && (
                  <div className="error-message">{errors.phone}</div>
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
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  className="form-input"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Year of Experience</label>
                <input
                  type="number"
                  name="yearOfExperience"
                  className="form-input"
                  value={form.yearOfExperience}
                  onChange={handleChange}
                  placeholder="Years of experience"
                  min="0"
                  max="50"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Educational Details</label>
              <textarea
                name="educationalDetails"
                className="form-textarea"
                value={form.educationalDetails}
                onChange={handleChange}
                placeholder="Enter educational qualifications"
                rows="2"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Aadhar No</label>
                <input
                  type="text"
                  name="aadharNo"
                  className="form-input"
                  value={form.aadharNo}
                  onChange={handleChange}
                  placeholder="Enter 12-digit Aadhar"
                  maxLength="12"
                />
                {errors.aadharNo && (
                  <div className="error-message">{errors.aadharNo}</div>
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
                rows="2"
              />
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
                  "Update Teacher"
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
                        {existingDoc.url && (
                          <a
                            href={existingDoc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view-existing-btn"
                          >
                            View
                          </a>
                        )}
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

export default AdminUpdateTeacher;
