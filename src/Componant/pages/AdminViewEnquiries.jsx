import React, { useEffect, useState } from "react";
import "./AdminViewEnquiries.css";

const AdminViewEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadEnquiries();
  }, []);

  const loadEnquiries = () => {
    setLoading(true);
    fetch("http://localhost:8080/api/enquiries/getAll")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => setEnquiries(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Failed to load enquiries:", err);
        setEnquiries([]);
      })
      .finally(() => setLoading(false));
  };

  // format ISO date (yyyy-mm-dd) safely
  const fmtDate = (iso) => {
    if (!iso) return "-";
    // If it's already yyyy-mm-dd string, return as is; otherwise try to create Date
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
    try {
      const d = new Date(iso);
      if (isNaN(d)) return iso;
      return d.toISOString().slice(0, 10);
    } catch {
      return iso;
    }
  };

  // Delete enquiry function
  const deleteEnquiry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this enquiry?"))
      return;

    setDeletingId(id);

    try {
      const res = await fetch(`http://localhost:8080/api/enquiries/${id}`, {
        method: "DELETE",
      });

      if (res.status === 204 || res.ok) {
        alert("Enquiry deleted successfully.");
        loadEnquiries();
      } else {
        alert("Failed to delete enquiry.");
      }
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Error deleting enquiry.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="enq-container">
      <div className="enq-header">
        <h2 className="enq-title">All Enquiries</h2>
      </div>

      <div className="enq-table-wrap">
        <table className="enq-table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Parent Name</th>
              <th>Contact No</th>
              <th>Enquiry Date</th>
              <th>Message</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="enq-empty">
                  Loading...
                </td>
              </tr>
            ) : enquiries.length === 0 ? (
              <tr>
                <td colSpan="6" className="enq-empty">
                  No enquiries found.
                </td>
              </tr>
            ) : (
              enquiries.map((e, idx) => (
                <tr key={e.enquiryId ?? idx}>
                  <td>{idx + 1}</td>
                  <td>{e.parentName ?? "-"}</td>
                  <td>{e.contactNo ?? "-"}</td>
                  <td>{fmtDate(e.enquiryDate ?? e.date ?? "")}</td>
                  <td className="enq-message-cell">
                    {e.enquiryMessage ?? e.message ?? "-"}
                  </td>
                  <td>
                    <button
                      className={`enq-delete-btn ${
                        deletingId === e.enquiryId ? "deleting" : ""
                      }`}
                      onClick={() => deleteEnquiry(e.enquiryId)}
                      disabled={deletingId === e.enquiryId}
                    >
                      {deletingId === e.enquiryId ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminViewEnquiries;
