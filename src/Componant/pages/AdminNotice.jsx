// AdminNotice.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminNotice.css";
import { SessionContext } from "./SessionContext"; // adjust path if needed

const AdminNotice = () => {
  const navigate = useNavigate();
  const { selectedSession } = useContext(
    SessionContext || { selectedSession: null }
  );

  const [notices, setNotices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [noticeData, setNoticeData] = useState({
    noticeId: null,
    title: "",
    subject: "",
    message: "",
    date: "",
    issuedBy: "",
  });

  const API_BASE = "http://localhost:8080/api/notices";

  // Date helpers
  const normalizeDateForInput = (value) => {
    if (!value) return "";
    if (typeof value === "string" && value.includes("T"))
      return value.split("T")[0];
    return value;
  };

  const normalizeDateForApi = (value) => {
    if (!value) return null;
    if (value.includes("T")) return value.split("T")[0];
    return value;
  };

  // Load notices for selected session
  useEffect(() => {
    const fetchNotices = async () => {
      if (!selectedSession || !selectedSession.id) {
        setNotices([]);
        return;
      }

      setLoading(true);
      try {
        const sessionId = selectedSession.id;
        const url = `${API_BASE}/${sessionId}/getAllUsingSessionId`;
        const response = await fetch(url, {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          const text = await response.text().catch(() => "");
          throw new Error(
            `Failed to load notices (${response.status}) ${text}`
          );
        }

        const data = await response.json();
        // support array or wrapped responses
        let noticesList = [];
        if (Array.isArray(data)) noticesList = data;
        else if (data && Array.isArray(data.content))
          noticesList = data.content;
        else if (data && data.data && Array.isArray(data.data))
          noticesList = data.data;
        else if (data && typeof data === "object") {
          const vals = Object.values(data);
          if (Array.isArray(vals[0])) noticesList = vals[0];
        }

        setNotices(Array.isArray(noticesList) ? noticesList : []);
      } catch (err) {
        console.error("Error fetching notices:", err);
        alert(`Error loading notices: ${err.message}`);
        setNotices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, [selectedSession]);

  // Input handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNoticeData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setNoticeData({
      noticeId: null,
      title: "",
      subject: "",
      message: "",
      date: "",
      issuedBy: "",
    });
  };

  // Create / Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSession || !selectedSession.id) {
      alert(
        "Please select a session from the dashboard before creating a notice."
      );
      return;
    }

    // basic validation
    if (
      !noticeData.title ||
      !noticeData.subject ||
      !noticeData.message ||
      !noticeData.date ||
      !noticeData.issuedBy
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const sessionId = selectedSession.id;
      const { noticeId, ...rest } = noticeData;
      const payload = { ...rest, date: normalizeDateForApi(rest.date) };

      if (!noticeId) {
        // create
        const url = `${API_BASE}/${sessionId}/save`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(txt || `Create failed: ${res.status}`);
        }

        const saved = await res.json().catch(() => null);
        setNotices((prev) => [saved || payload, ...prev]);
        alert("Notice created successfully!");
      } else {
        // update (PUT /api/notices/{id})
        const id = parseInt(noticeId, 10);
        if (isNaN(id)) throw new Error("Invalid notice ID");
        const updatePayload = { noticeId: id, ...payload };

        const res = await fetch(`${API_BASE}/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(updatePayload),
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(txt || `Update failed: ${res.status}`);
        }

        const updated = await res.json().catch(() => null);
        setNotices((prev) =>
          prev.map((n) => (n.noticeId === updated.noticeId ? updated : n))
        );
        alert("Notice updated successfully!");
      }

      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error("Save error:", err);
      alert(err.message || "Error saving notice");
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const deleteNotice = async (noticeId) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;
    setLoading(true);
    try {
      const id = parseInt(noticeId, 10);
      if (isNaN(id)) throw new Error("Invalid notice ID");

      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Delete failed: ${res.status}`);
      }

      setNotices((prev) => prev.filter((n) => n.noticeId !== noticeId));
      alert("Notice deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.message || "Error deleting notice");
    } finally {
      setLoading(false);
    }
  };

  // Edit: populate form
  const editNotice = (notice) => {
    setNoticeData({
      noticeId: notice.noticeId,
      title: notice.title || "",
      subject: notice.subject || "",
      message: notice.message || "",
      date: normalizeDateForInput(notice.date),
      issuedBy: notice.issuedBy || "",
    });
    setShowForm(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const normalized = normalizeDateForInput(dateString);
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(normalized).toLocaleDateString("en-US", options);
    } catch {
      return dateString;
    }
  };

  const printNotice = (notice) => {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${
      notice.title
    }</title><style>
      @page{margin:20mm}body{font-family:Times,serif;margin:0;padding:0;background:white}
      .print-container{width:210mm;min-height:297mm;margin:0 auto;padding:20mm;box-sizing:border-box}
      .header{text-align:center;margin-bottom:30px}.school-name{font-size:28pt;font-weight:700;margin:0;text-transform:uppercase}
      .notice-label{font-size:22pt;margin:10px 0 20px;color:#333;border-bottom:3px double #000;padding-bottom:15px}
      .notice-title{text-align:center;font-size:18pt;text-decoration:underline;margin:30px 0}
      .notice-body{font-size:12pt;line-height:1.8;text-align:justify;margin:30px 0;white-space:pre-wrap}
      .footer{margin-top:80px;display:flex;justify-content:space-between}.signature-line{width:200px;height:1px;border-bottom:1px solid #000;margin:0 auto 5px}
      .print-date{text-align:right;margin-top:10px;font-size:10pt;color:#666}
      </style></head><body>
      <div class="print-container"><div class="header"><h1 class="school-name">JAGRATI CHILDREN VIDHYA MANDIR</h1><h2 class="notice-label">OFFICIAL NOTICE</h2></div>
      <div class="notice-content"><div class="notice-meta"><p><strong>Date:</strong> ${formatDate(
        notice.date
      )}</p>${
      notice.subject ? `<p><strong>Subject:</strong> ${notice.subject}</p>` : ""
    }</div>
      <h3 class="notice-title">${notice.title}</h3><div class="notice-body">${(
      notice.message || ""
    ).replace(/\n/g, "<br>")}</div>
      <div class="footer"><div class="issued-by"><p><strong>Issued By:</strong></p><p>${
        notice.issuedBy || ""
      }</p><p>${formatDate(notice.date)}</p></div>
      <div class="signature"><div class="signature-line"></div><p>Authorized Signature</p></div></div><div class="print-date">Printed on: ${new Date().toLocaleDateString()}</div></div></div>
      </body></html>`);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const getTodayDate = () => new Date().toISOString().split("T")[0];

  // If no session selected, show friendly message and button to dashboard index
  if (!selectedSession || !selectedSession.id) {
    return (
      <div className="notice-container" style={{ padding: 20 }}>
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <h3>No session selected</h3>
          <p>
            Please select a session from the Admin Dashboard home page to view
            or manage notices.
          </p>
          <div style={{ marginTop: 12 }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/admindashboard")}
            >
              Go to Dashboard (select session)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notice-container">
      <div className="notice-header">
        <div className="header-left">
          <h2 className="notice-title">Notice Board</h2>
          <p className="notice-count">
            Total Notices: {notices.length} {loading ? "(Loading...)" : ""}
          </p>
        </div>
        <div className="header-right">
          <button
            className="notice-add-btn"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <span className="btn-icon">+</span> Create New Notice
          </button>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {noticeData.noticeId ? "Edit Notice" : "Create New Notice"}
              </h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="notice-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>
                    Title <span className="required">*</span>
                  </label>
                  <input
                    name="title"
                    value={noticeData.title}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Subject <span className="required">*</span>
                  </label>
                  <input
                    name="subject"
                    value={noticeData.subject}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={noticeData.date}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    max={getTodayDate()}
                  />
                </div>

                <div className="form-group">
                  <label>
                    Issued By <span className="required">*</span>
                  </label>
                  <input
                    name="issuedBy"
                    value={noticeData.issuedBy}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>
                    Message <span className="required">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={noticeData.message}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows="8"
                    required
                  />
                  <div className="char-count">
                    {noticeData.message.length} characters
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading
                    ? "Processing..."
                    : noticeData.noticeId
                    ? "Update Notice"
                    : "Create Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="notices-section">
        {loading && notices.length === 0 ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading notices...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No Notices Found</h3>
            <p>Create your first notice to get started</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              Create First Notice
            </button>
          </div>
        ) : (
          <div className="notices-grid">
            {notices.map((notice) => (
              <div key={notice.noticeId} className="notice-card">
                <div className="card-header">
                  <div className="card-title-section">
                    <h3 className="card-title">{notice.title}</h3>
                    {notice.subject && (
                      <span className="card-subject">#{notice.subject}</span>
                    )}
                  </div>
                  <span className="card-date">{formatDate(notice.date)}</span>
                </div>

                <div className="card-body">
                  <p className="card-message">
                    {notice.message && notice.message.length > 200
                      ? notice.message.substring(0, 200) + "..."
                      : notice.message}
                  </p>
                </div>

                <div className="card-footer">
                  <div className="footer-left">
                    <div className="issued-by">
                      <strong>Issued By:</strong> {notice.issuedBy}
                    </div>
                  </div>

                  <div className="footer-right">
                    <button
                      className="icon-btn2 edit-btn1"
                      onClick={() => editNotice(notice)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className="icon-btn2 print-btn2"
                      onClick={() => printNotice(notice)}
                    >
                      Print
                    </button>
                    <button
                      className="icon-btn2 delete-btn1"
                      onClick={() => deleteNotice(notice.noticeId)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotice;
