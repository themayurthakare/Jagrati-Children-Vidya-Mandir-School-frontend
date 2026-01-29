import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./AdminStudentFeeDetails.css";

const Fees = () => {
  const location = useLocation();

  /* ---------------- AUTH ---------------- */
  const studentId = location.state?.studentId || localStorage.getItem("userId");
  const studentName = location.state?.studentName || "Student";

  /* ---------------- STATE ---------------- */
  const [fees, setFees] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    if (!studentId) {
      setError("No student selected.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Student info
        const studentRes = await fetch(
          `http://localhost:8080/api/users/${studentId}`
        );
        if (studentRes.ok) {
          const studentData = await studentRes.json();
          setStudentInfo(studentData);
        }

        // Fees
        const feeRes = await fetch(
          `http://localhost:8080/api/fees/user/${studentId}`
        );
        if (feeRes.ok) {
          const feeData = await feeRes.json();
          setFees(Array.isArray(feeData) ? feeData : [feeData]);
        } else {
          setFees([]);
        }

        // Transactions (read-only)
        const txRes = await fetch(
          `http://localhost:8080/api/transactions/user/${studentId}`
        );
        if (txRes.ok) {
          const txData = await txRes.json();
          setTransactions(Array.isArray(txData) ? txData : []);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        setError(err.message || "Failed to load fee details");
        setFees([]);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  /* ---------------- HELPERS ---------------- */
  const formatCurrency = (amount) =>
    `₹ ${parseFloat(amount || 0).toLocaleString("en-IN")}`;

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";

  const totalFees = fees.reduce((s, f) => s + (f.amount || 0), 0);
  const totalPaid = fees.reduce((s, f) => s + (f.paidAmount || 0), 0);
  const totalRemaining = fees.reduce(
    (s, f) => s + (f.remainingAmount || 0),
    0
  );

  /* ---------------- UI ---------------- */
  return (
    <div className="admin-fee-details-container">
      {/* HEADER */}
      <div className="admin-fee-header">
        <div className="header-left">
          <h2 className="page-title">Fee Details - {studentName}</h2>
        </div>

        {!loading && fees.length > 0 && (
          <div className="summary-stats">
            <div className="stat-item">
              <span>Total Fees:</span>
              <strong>{formatCurrency(totalFees)}</strong>
            </div>
            <div className="stat-item">
              <span>Paid:</span>
              <strong className="paid">
                {formatCurrency(totalPaid)}
              </strong>
            </div>
            <div className="stat-item">
              <span>Pending:</span>
              <strong className="pending">
                {formatCurrency(totalRemaining)}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* STUDENT INFO */}
      {studentInfo && (
        <div className="student-info-card">
          <div className="info-row">
            <span>Student ID:</span> {studentId}
          </div>
          <div className="info-row">
            <span>Name:</span> {studentInfo.name}
          </div>
          {studentInfo.admissionNo && (
            <div className="info-row">
              <span>Admission No:</span> {studentInfo.admissionNo}
            </div>
          )}
          {studentInfo.studentClass && (
            <div className="info-row">
              <span>Class:</span> {studentInfo.studentClass}
            </div>
          )}
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {/* FEE TABLE */}
      <div className="fee-table-container">
        {loading ? (
          <div className="loading-state">Loading fees...</div>
        ) : fees.length === 0 ? (
          <div className="empty-state">No fee records found.</div>
        ) : (
          <table className="fee-table">
            <thead>
              <tr>
                <th>Fee ID</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Payment Date</th>
                <th>Paid</th>
                <th>Remaining</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((f) => (
                <tr key={f.feesId}>
                  <td>{f.feesId}</td>
                  <td>{formatCurrency(f.amount)}</td>
                  <td>{formatDate(f.dueDate)}</td>
                  <td>
                    <span
                      className={`status-badge ${f.paymentStatus?.toLowerCase()}`}
                    >
                      {f.paymentStatus || "Pending"}
                    </span>
                  </td>
                  <td>{formatDate(f.paymentDate)}</td>
                  <td>{formatCurrency(f.paidAmount)}</td>
                  <td>{formatCurrency(f.remainingAmount)}</td>
                  <td className="text-center">
                    <span className="status-info">View Only</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* TRANSACTIONS TABLE (READ ONLY) */}
      <div className="section-header">
        <h3>Payment Transactions</h3>
      </div>

      <div className="transactions-table-container">
        {transactions.length === 0 ? (
          <div className="empty-state">
            No payment transactions found.
          </div>
        ) : (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr key={t.id || i}>
                  <td>{i + 1}</td>
                  <td>{formatCurrency(t.amount)}</td>
                  <td>{formatDate(t.paymentDate)}</td>
                  <td>{t.description || "Fee Payment"}</td>
                  <td>
                    <span
                      className={`status-badge ${t.status?.toLowerCase()}`}
                    >
                      {t.status || "SUCCESS"}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className="status-info">View Only</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Fees;
