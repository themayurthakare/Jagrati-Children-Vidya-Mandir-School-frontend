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

        // student
        const studentRes = await fetch(
          `http://localhost:8080/api/users/${studentId}`
        );
        if (studentRes.ok) {
          setStudentInfo(await studentRes.json());
        }

        // fees
        const feeRes = await fetch(
          `http://localhost:8080/api/fees/user/${studentId}`
        );
        if (feeRes.ok) {
          const data = await feeRes.json();
          setFees(Array.isArray(data) ? data : [data]);
        } else {
          setFees([]);
        }

        // transactions
        const txRes = await fetch(
          `http://localhost:8080/api/transactions/user/${studentId}`
        );
        if (txRes.ok) {
          const data = await txRes.json();
          setTransactions(Array.isArray(data) ? data : []);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        setError("Failed to load fee details");
        setFees([]);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  /* ---------------- HELPERS ---------------- */
  const formatCurrency = (amt) =>
    `₹ ${parseFloat(amt || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    })}`;

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
              <span className="stat-value">
                {formatCurrency(totalFees)}
              </span>
            </div>
            <div className="stat-item">
              <span>Paid:</span>
              <span className="stat-value paid">
                {formatCurrency(totalPaid)}
              </span>
            </div>
            <div className="stat-item">
              <span>Pending:</span>
              <span className="stat-value pending">
                {formatCurrency(totalRemaining)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* STUDENT INFO */}
      {studentInfo && (
        <div className="student-info-card">
          <div className="info-row">
            <span className="info-label">Student ID:</span>
            <span className="info-value">{studentId}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Name:</span>
            <span className="info-value">{studentInfo.name}</span>
          </div>
          {studentInfo.admissionNo && (
            <div className="info-row">
              <span className="info-label">Admission No:</span>
              <span className="info-value">{studentInfo.admissionNo}</span>
            </div>
          )}
          {studentInfo.studentClass && (
            <div className="info-row">
              <span className="info-label">Class:</span>
              <span className="info-value">{studentInfo.studentClass}</span>
            </div>
          )}
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {/* -------- FEE STRUCTURE TABLE (SAME AS ADMIN) -------- */}
      <div className="section-header">
        <h3>Fee Structure</h3>
      </div>

      <div className="fee-table-container">
        {loading ? (
          <div className="loading-state">Loading fee details...</div>
        ) : fees.length === 0 ? (
          <div className="empty-state">No fee records found.</div>
        ) : (
          <div className="table-wrapper">
            <table className="fee-table">
              <thead>
                <tr>
                  <th>Fee ID</th>
                  <th>Total Amount</th>
                  <th>Paid</th>
                  <th>Remaining</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee) => (
                  <tr key={fee.feesId}>
                    <td className="text-center">{fee.feesId}</td>
                    <td className="text-right amount">
                      {formatCurrency(fee.amount)}
                    </td>
                    <td className="text-right paid">
                      {formatCurrency(fee.paidAmount)}
                    </td>
                    <td className="text-right remaining">
                      {formatCurrency(fee.remainingAmount)}
                    </td>
                    <td className="text-center1">
                      <span
                        className={`status-badge ${fee.paymentStatus?.toLowerCase()}`}
                      >
                        {fee.paymentStatus || "Pending"}
                      </span>
                    </td>
                    <td className="text-center1">
                      <span className="status-info">View Only</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* -------- TRANSACTIONS TABLE (SAME AS ADMIN) -------- */}
      <div className="section-header">
        <h3>Payment Transactions</h3>
      </div>

      <div className="transactions-table-container">
        {transactions.length === 0 ? (
          <div className="empty-state">
            No payment transactions found.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Amount</th>
                  <th>Payment Date</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, i) => (
                  <tr key={t.id || i}>
                    <td className="text-center1">{i + 1}</td>
                    <td className="text-right amount">
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="text-center1">
                      {formatDate(t.paymentDate)}
                    </td>
                    <td className="text-center1">
                      {t.description || "Fee Payment"}
                    </td>
                    <td className="text-center">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Fees;
