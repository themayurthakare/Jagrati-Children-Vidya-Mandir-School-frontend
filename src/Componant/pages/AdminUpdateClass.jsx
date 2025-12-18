import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AdminUpdateClass.css";

const AdminUpdateClass = ({ apiBase = "http://localhost:8080" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const classId = location.state?.classId;

  // Form state
  const [form, setForm] = useState({
    className: "",
    fees: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch class data
  useEffect(() => {
    if (!classId) {
      setErrorMessage("No class ID provided. Redirecting...");
      setTimeout(() => navigate("/admindashboard/view-classes"), 2000);
      return;
    }

    const fetchClass = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        // Try multiple endpoints for fetching class
        const endpoints = [
          `${apiBase}/api/classes/${classId}`,
          `${apiBase}/api/classes/get/${classId}`,
          `${apiBase}/api/classes/getById/${classId}`,
        ];

        let classData = null;
        for (const endpoint of endpoints) {
          try {
            const res = await fetch(endpoint);
            if (res.ok) {
              classData = await res.json();
              break;
            }
          } catch (err) {
            continue;
          }
        }

        if (!classData) {
          throw new Error("Class not found");
        }

        setForm({
          className: classData.className || "",
          fees: classData.fees || "",
        });
      } catch (err) {
        console.error("Error fetching class:", err);
        setErrorMessage(`Failed to load class: ${err.message}`);
        setTimeout(() => navigate("/admindashboard/view-classes"), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchClass();
  }, [classId, apiBase, navigate]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!form.className.trim()) {
      newErrors.className = "Class name is required";
    } else if (form.className.length < 2) {
      newErrors.className = "Class name must be at least 2 characters";
    }

    if (!form.fees) {
      newErrors.fees = "Fees is required";
    } else if (isNaN(form.fees) || Number(form.fees) < 0) {
      newErrors.fees = "Please enter a valid positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // For fees field, remove non-numeric characters except decimal point
    if (name === "fees") {
      // Allow only numbers and one decimal point
      const filteredValue = value.replace(/[^\d.]/g, "");
      // Ensure only one decimal point
      const parts = filteredValue.split(".");
      if (parts.length > 2) {
        return; // Don't update if multiple decimal points
      }

      setForm((prev) => ({ ...prev, [name]: filteredValue }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Clear success message when form is edited
    if (success) {
      setSuccess(false);
    }

    // Clear error message
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setErrorMessage("Please fix the errors in the form before submitting.");
      return;
    }

    setUpdating(true);
    setErrorMessage("");

    try {
      const payload = {
        classId: Number(classId),
        className: form.className.trim(),
        fees: Number(form.fees),
      };

      // Try multiple possible update endpoints
      const updateEndpoints = [
        `${apiBase}/api/classes/update/${classId}`,
        `${apiBase}/api/classes/${classId}`,
        `${apiBase}/api/classes/update`,
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
        setSuccess(true);

        // Navigate to class list after 1.5 seconds
        setTimeout(() => {
          navigate("/admindashboard/view-classes");
        }, 1500);
      } else {
        throw new Error(
          "Failed to update class. Please check your backend endpoint."
        );
      }
    } catch (err) {
      console.error("Update class error:", err);
      setErrorMessage(
        err.message || "Failed to update class. Please try again."
      );
    } finally {
      setUpdating(false);
    }
  };

  // Handle form reset
  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all changes?")) {
      // Reload the class data
      window.location.reload();
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (
      (form.className || form.fees) &&
      !window.confirm(
        "You have unsaved changes. Are you sure you want to go back?"
      )
    ) {
      return;
    }
    navigate("/admindashboard/view-classes");
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        Loading class data...
      </div>
    );
  }

  return (
    <div className="update-class-container">
      <div className="update-class-header">
        <h2>Update Class</h2>
        <button className="back-btn" onClick={handleBack}>
          ← Back to Classes
        </button>
      </div>

      {success && (
        <div className="success-message">
          <span>
            ✓ Class updated successfully! Redirecting to class list...
          </span>
          <button
            onClick={() => {
              setSuccess(false);
              navigate("/admindashboard/view-classes");
            }}
          >
            ×
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="error-alert">
          <span>⚠️ {errorMessage}</span>
        </div>
      )}

      <div className="class-info">
        Updating Class ID: <strong>{classId}</strong>
      </div>

      <div className="update-class-card">
        <form className="update-class-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="required">Class Name</label>
            <input
              type="text"
              name="className"
              className="form-input"
              value={form.className}
              onChange={handleChange}
              placeholder="Enter class name (e.g., Class 10, Nursery)"
              disabled={updating || success}
            />
            {errors.className && (
              <div className="error-message">{errors.className}</div>
            )}
          </div>

          <div className="form-group">
            <label className="required">Fees (₹)</label>
            <input
              type="text"
              name="fees"
              className="form-input"
              value={form.fees}
              onChange={handleChange}
              placeholder="Enter fees amount"
              disabled={updating || success}
            />
            {errors.fees && <div className="error-message">{errors.fees}</div>}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="reset-btn"
              onClick={handleReset}
              disabled={updating || success}
            >
              Reset
            </button>

            <button
              type="submit"
              className={`update-btn ${success ? "update-success" : ""}`}
              disabled={updating || success}
            >
              {updating ? (
                <>
                  <span className="loading-spinner-small"></span>
                  Updating...
                </>
              ) : success ? (
                "✓ Updated!"
              ) : (
                "Update Class"
              )}
            </button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: "24px", color: "#666", fontSize: "0.9rem" }}>
        <p>
          <strong>Note:</strong>
        </p>
        <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
          <li>Make sure the class name is unique</li>
          <li>Fees should be entered in Indian Rupees (₹)</li>
          <li>Changes will affect all students in this class</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminUpdateClass;
