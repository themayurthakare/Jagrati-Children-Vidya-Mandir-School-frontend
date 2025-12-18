import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminUploadExcel.css";

const AdminUploadExcel = ({ apiBase = "http://localhost:8080" }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState([]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  // Validate file
  const validateFile = (file) => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
    ];

    if (!validTypes.includes(file.type)) {
      alert("Please select an Excel file (.xlsx, .xls) or CSV file");
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      alert("File size should not exceed 10MB");
      return false;
    }

    return true;
  };

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle browse button click
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Process Excel file
  const processFile = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    setUploading(true);
    setProgress(0);
    setResults(null);
    setErrors([]);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`${apiBase}/api/users/uploadExcel`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const data = await response.json();

      // Map API response to our expected format
      // API returns: totalRows, inserted, skipped, errors
      const totalRows = data.totalRows || 0;
      const inserted = data.inserted || 0;
      const skipped = data.skipped || 0;
      const apiErrors = data.errors || [];

      setResults({
        total: totalRows,
        success: inserted,
        failed: skipped,
        errors: apiErrors,
        message: `Processed ${totalRows} rows: ${inserted} inserted, ${skipped} skipped`,
      });

      // Show appropriate message
      if (inserted > 0) {
        alert(
          `Successfully inserted ${inserted} student(s)!${
            skipped > 0 ? ` ${skipped} record(s) were skipped.` : ""
          }`
        );
      } else {
        alert(
          `No students were inserted. ${skipped} record(s) were skipped. Check the results for errors.`
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedFile(null);
    setResults(null);
    setErrors([]);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Close results
  const closeResults = () => {
    setResults(null);
    setErrors([]);
  };

  // Handle back navigation
  const handleBack = () => {
    if (
      selectedFile &&
      !window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      )
    ) {
      return;
    }
    navigate(-1);
  };

  if (uploading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <div className="loading-text">Uploading... {progress}%</div>
      </div>
    );
  }

  return (
    <div className="upload-excel-container">
      <div className="upload-excel-header">
        <h2>Upload Students via Excel</h2>
        <button className="back-btn" onClick={handleBack}>
          ← Back
        </button>
      </div>

      <div className="upload-card">
        {/* File Upload Area */}
        <div
          className={`file-upload-area ${dragOver ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="file-upload-icon">📊</div>
          <div className="file-upload-text">Upload Students Excel File</div>
          <div className="file-upload-subtext">
            Drag & drop your Excel file here or click to browse
          </div>
          <div className="file-upload-subtext">
            Supported formats: .xlsx, .xls, .csv (Max 10MB)
          </div>
          <button className="file-upload-btn" onClick={handleBrowseClick}>
            Browse Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="file-input"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
        </div>

        {/* Selected File */}
        {selectedFile && (
          <div className="selected-file">
            <div className="file-info">
              <div className="file-name">
                📄 {selectedFile.name}
                <span className="file-size">
                  ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              </div>
              <button className="remove-file-btn" onClick={removeFile}>
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="instructions">
          <h4>Instructions:</h4>
          <ul>
            <li>
              Excel file must have headers: name, admissionNo, email,
              studentPhone, studentClassId
            </li>
            <li>Phone must be exactly 10 digits</li>
            <li>Ensure class IDs exist in the system</li>
            <li>Review the upload results carefully</li>
          </ul>
        </div>

        {/* Upload Actions */}
        <div className="upload-actions">
          <button
            className="reset-btn"
            onClick={resetForm}
            disabled={uploading || (!selectedFile && !results)}
          >
            Reset
          </button>
          <button
            className="upload-btn"
            onClick={processFile}
            disabled={uploading || !selectedFile}
          >
            {uploading ? (
              <>
                <span className="loading-spinner-small"></span>
                Uploading...
              </>
            ) : (
              "Upload Students Excel File"
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="results-section">
          <div className="results-card">
            <div className="results-header">
              <h3>Upload Results</h3>
              <button className="close-results-btn" onClick={closeResults}>
                ×
              </button>
            </div>

            {/* Summary Message */}
            <div className="result-message">
              <p>
                <strong>Summary:</strong> {results.message}
              </p>
            </div>

            <div className="results-grid">
              <div className="result-item">
                <div className="result-label">Total Rows Processed</div>
                <div className="result-value result-neutral">
                  {results.total}
                </div>
              </div>
              <div className="result-item">
                <div className="result-label">Successfully Inserted</div>
                <div className="result-value result-success">
                  {results.success}
                </div>
              </div>
              <div className="result-item">
                <div className="result-label">Skipped/Failed</div>
                <div className="result-value result-error">
                  {results.failed}
                </div>
              </div>
              <div className="result-item">
                <div className="result-label">Success Rate</div>
                <div className="result-value result-warning">
                  {results.total > 0
                    ? Math.round((results.success / results.total) * 100)
                    : 0}
                  %
                </div>
              </div>
            </div>

            {/* Errors List */}
            {results.errors && results.errors.length > 0 && (
              <div className="errors-section">
                <h4 style={{ marginBottom: "16px", color: "#333" }}>
                  Skipped Records ({results.errors.length})
                </h4>
                <div className="error-list">
                  {results.errors.map((error, index) => (
                    <div key={index} className="error-item">
                      <div className="error-row">
                        <strong>Row {index + 1}:</strong>{" "}
                        {error.data
                          ? JSON.stringify(error.data)
                          : "Data not available"}
                      </div>
                      {error.error && (
                        <div className="error-message">
                          Error: {error.error}
                        </div>
                      )}
                      {error.reason && (
                        <div className="error-message">
                          Reason: {error.reason}
                        </div>
                      )}
                      {error.message && (
                        <div className="error-message">
                          Message: {error.message}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Another Button */}
            <div className="upload-another-section">
              <button
                className="reset-btn"
                onClick={resetForm}
                style={{ width: "100%" }}
              >
                Upload Another File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUploadExcel;
