import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./AdminUpdateTeacher.css";
import { SessionContext } from "./SessionContext";

const AdminUpdateTeacher = ({ apiBase = "http://localhost:8080" }) => {
  const navigate = useNavigate();
  const { teacherId: paramTeacherId } = useParams();
  const { selectedSession } = useContext(SessionContext);
  const sessionId = selectedSession?.id;
  const location = useLocation();

  const teacherId =
    paramTeacherId ||
    location.state?.teacherId ||
    location.state?.teacher?.teacherId ||
    location.state?.teacher?.id;

  // Document types configuration for teachers
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

  // Classes state
  const [classOptions, setClassOptions] = useState([]);

  // Teacher form state - Added classNames
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
    panNo: "",
    designation: "",
    subject: "",
    classNames: [], // Added this field
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

  // Fetch classes when session changes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch(`${apiBase}/api/classes/${sessionId}/getAll`);
        if (!res.ok) throw new Error("Failed to fetch classes");
        const data = await res.json();
        setClassOptions(data || []);
      } catch (err) {
        console.error("Class fetch error:", err);
      }
    };

    if (sessionId) {
      fetchClasses();
    }
  }, [sessionId, apiBase]);

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

        // Extract class names from teacher data if they exist
        let teacherClassNames = [];
        if (teacherData.classes && Array.isArray(teacherData.classes)) {
          teacherClassNames = teacherData.classes
            .map((cls) => cls.className || cls.name)
            .filter(Boolean);
        } else if (
          teacherData.classNames &&
          Array.isArray(teacherData.classNames)
        ) {
          teacherClassNames = teacherData.classNames;
        }

        // Update form with fetched data
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
          panNo: teacherData.panNo || "",
          designation: teacherData.designation || "",
          subject: teacherData.subject || "",
          classNames: teacherClassNames, // Set the class names
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

  // Fetch existing documents
  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${apiBase}/api/teacher-documents/${teacherId}`);
      if (res.ok) {
        const data = await res.json();
        const docsArray = Array.isArray(data) ? data : [];
        setExistingDocs(docsArray);

        // Initialize docs state with existing files
        const initialDocs = {};
        docsArray.forEach((doc) => {
          const docType = DOC_TYPES.find(
            (d) => d.endpoint === doc.docType || d.endpoint === doc.type,
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
    if (!form.classNames || form.classNames.length === 0) {
      newErrors.classNames = "At least one class must be selected";
    }

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

  // Upload single document
  const uploadDocument = async (key) => {
    const docType = DOC_TYPES.find((d) => d.key === key);
    if (!docType || !docs[key]?.file) return;

    setDocStatus((prev) => ({
      ...prev,
      [key]: { uploading: true, ok: false, error: null },
    }));

    try {
      const url = `${apiBase}/api/teacher-documents/update/${teacherId}/${docType.endpoint}`;
      const formData = new FormData();
      formData.append("file", docs[key].file);

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
      (key) => docs[key]?.file && !docs[key]?.exists,
    );

    let allSuccess = true;

    for (const key of filesToUpload) {
      const success = await uploadDocument(key);
      if (!success) allSuccess = false;
    }

    setUploadingDocs(false);

    if (allSuccess) {
      window.alert("Documents uploaded successfully!");
      await fetchDocuments();
    } else {
      window.alert(
        "Some documents failed to upload. Please check individual file status.",
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
        classNames: form.classNames, // Include classNames in payload
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
        classNames: form.classNames, // Include classNames in payload
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
        (key) => docs[key]?.file && !docs[key]?.exists,
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
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        dateOfBirth: "",
        yearOfExperience: "",
        educationalDetails: "",
        aadharNo: "",
        address: "",
        panNo: "",
        designation: "",
        subject: "",
        classNames: [], // Reset classNames too
      });

      setErrors({});
      setUpdateSuccess(false);
    }
  };

  // Handle back navigation
  const handleBackToList = () => {
    const hasChanges = Object.keys(form).some((key) => {
      if (key === "password") return false;
      return form[key] !== "";
    });

    const hasNewDocs = Object.keys(docs).some(
      (key) => docs[key]?.file && !docs[key]?.exists,
    );

    if (
      (hasChanges || hasNewDocs) &&
      !window.confirm(
        "You have unsaved changes. Are you sure you want to leave?",
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

      {/* Teacher Details Tab */}
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
              <label className="required">Assign Classes</label>
              <select
                multiple
                name="classNames"
                className="form-input"
                value={form.classNames}
                onChange={(e) => {
                  const selected = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value,
                  );
                  setForm((prev) => ({
                    ...prev,
                    classNames: selected,
                  }));
                  // Clear error for classNames
                  if (errors.classNames) {
                    setErrors((prev) => ({ ...prev, classNames: undefined }));
                  }
                }}
                style={{ minHeight: "120px" }}
              >
                {classOptions.length === 0 ? (
                  <option disabled>Loading classes...</option>
                ) : (
                  classOptions.map((cls) => (
                    <option key={cls.classId} value={cls.className}>
                      {cls.className}
                    </option>
                  ))
                )}
              </select>
              {errors.classNames && (
                <div className="error-message">{errors.classNames}</div>
              )}
              <small>Hold Ctrl (Windows) or Cmd (Mac) to select multiple</small>
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

      {/* Documents Tab - Your existing documents tab code remains the same */}
      {activeTab === "documents" && (
        <div className="documents-container">
          {/* Your existing documents tab JSX */}
          {/* ... */}
        </div>
      )}
    </div>
  );
};

export default AdminUpdateTeacher;
