import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AdminStudentFeeDetails.css";
import { SessionContext } from "./SessionContext";

const AdminStudentFeeDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { selectedSession } = useContext(
    SessionContext || { selectedSession: null }
  );

  const studentId = location.state?.studentId;
  const studentName = location.state?.studentName || "Student";
  const [className, setClassName] = useState("");
  const [fees, setFees] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentInfo, setStudentInfo] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [classFees, setClassFees] = useState(null);
  const [creatingFees, setCreatingFees] = useState(false);

  const fetchClassName = async (classId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/classes/${classId}`);
      if (res.ok) {
        const data = await res.json();
        setClassName(data.className || data.name || data.standard || "");
      }
    } catch (err) {
      console.error("Failed to fetch class name", err);
    }
  };

  const fetchData = async () => {
    if (!studentId) {
      setError("No student selected.");
      setLoading(false);
      return;
    }

    if (!selectedSession || !selectedSession.id) {
      setError("Please select a session from the dashboard first.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setRefreshing(true);
      setError("");

      const studentResponse = await fetch(
        `http://localhost:8080/api/users/${studentId}`
      );
      if (studentResponse.ok) {
        const studentData = await studentResponse.json();
        setStudentInfo(studentData);

        if (studentData.studentClassId) {
          await fetchClassFees(studentData.studentClassId);
          await fetchClassName(studentData.studentClassId);
        }
      }

      const feeResponse = await fetch(
        `http://localhost:8080/api/fees/user/${studentId}`
      );

      if (feeResponse.ok) {
        const feeData = await feeResponse.json();
        setFees(Array.isArray(feeData) ? feeData : [feeData]);
      } else if (feeResponse.status === 404) {
        setFees([]);
      }

      const sessionId = selectedSession.id;
      const transactionResponse = await fetch(
        `http://localhost:8080/api/transactions/${sessionId}/getAllUsingSessionId`
      );

      if (transactionResponse.ok) {
        const transactionData = await transactionResponse.json();

        let transactionsList = [];

        if (Array.isArray(transactionData)) {
          transactionsList = transactionData;
        } else if (transactionData && Array.isArray(transactionData.content)) {
          transactionsList = transactionData.content;
        } else if (
          transactionData &&
          transactionData.data &&
          Array.isArray(transactionData.data)
        ) {
          transactionsList = transactionData.data;
        } else if (transactionData && typeof transactionData === "object") {
          const vals = Object.values(transactionData);
          if (Array.isArray(vals[0])) {
            transactionsList = vals[0];
          }
        }

        const studentTransactions = transactionsList.filter(
          (transaction) => transaction.userId === studentId
        );

        setTransactions(
          Array.isArray(studentTransactions) ? studentTransactions : []
        );
      } else {
        console.log("No transactions found or API error");
        setTransactions([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load data");
      setFees([]);
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchClassFees = async (classId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/classes/${classId}`
      );
      if (response.ok) {
        const classData = await response.json();

        const feesAmount =
          classData.fees ||
          classData.feeAmount ||
          classData.classFees ||
          classData.annualFees ||
          0;
        setClassFees(parseFloat(feesAmount));
      }
    } catch (err) {
      console.error("Error fetching class fees:", err);
      setClassFees(null);
    }
  };

  const createFeeStructure = async () => {
    if (!studentId) {
      setError("Student missing");
      return false;
    }

    try {
      setCreatingFees(true);
      setError("");

      let feeAmount = Number(classFees);
      if (!feeAmount || feeAmount <= 0) {
        feeAmount = 10000;
      }

      const feePayload = {
        amount: feeAmount,
        paidAmount: 0.0,
        remainingAmount: feeAmount,
        paymentStatus: "UNPAID",
        userId: Number(studentId),
      };

      const response = await fetch("http://localhost:8080/api/fees/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feePayload),
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || "Failed to save fees");
      }

      const savedFee = await response.json();

      setFees([savedFee]);

      return true;
    } catch (err) {
      console.error("Fee save error:", err);
      setError(err.message || "Fee creation failed");
      return false;
    } finally {
      setCreatingFees(false);
    }
  };

  useEffect(() => {
    const checkAndCreateFeeStructure = async () => {
      if (loading || creatingFees) return;

      if (studentInfo && fees.length === 0 && !error) {
        console.log("Student has no fee structure. Creating automatically...");
        await createFeeStructure();

        fetchData();
      }
    };

    checkAndCreateFeeStructure();
  }, [loading, studentInfo, fees, error]);

  useEffect(() => {
    fetchData();
  }, [studentId, selectedSession]);

  if (!selectedSession || !selectedSession.id) {
    return (
      <div className="admin-fee-details-container" style={{ padding: 20 }}>
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <h3>No session selected</h3>
          <p>
            Please select a session from the Admin Dashboard home page to view
            or manage fee details.
          </p>
          <div style={{ marginTop: 12 }}>
            <button
              className="back-btn"
              onClick={() => navigate("/admindashboard")}
            >
              Go to Dashboard (select session)
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "₹ 0";
    return `₹ ${parseFloat(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const calculateFeeTotals = () => {
    let totalFees = 0;

    fees.forEach((fee) => {
      const amount = parseFloat(fee.amount) || 0;
      totalFees += amount;
    });

    return totalFees;
  };

  const calculateTransactionTotal = () => {
    return transactions
      .filter(
        (transaction) =>
          transaction.status && transaction.status.toLowerCase() === "success"
      )
      .reduce(
        (sum, transaction) => sum + (parseFloat(transaction.amount) || 0),
        0
      );
  };

  const calculateRemainingAmount = () => {
    const totalFees = calculateFeeTotals();
    const totalPaid = calculateTransactionTotal();
    return Math.max(0, totalFees - totalPaid);
  };

  const getFeeWithCalculatedPaidAmount = (fee) => {
    const feeId = fee.feesId;
    const feeAmount = parseFloat(fee.amount) || 0;

    const feeTransactions = transactions.filter(
      (t) => t.description && t.description.includes(feeId.toString())
    );

    let paidAmount = 0;

    if (feeTransactions.length > 0) {
      paidAmount = feeTransactions
        .filter((t) => t.status && t.status.toLowerCase() === "success")
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    } else {
      const totalFees = calculateFeeTotals();
      const totalPaid = calculateTransactionTotal();
      if (totalFees > 0) {
        paidAmount = (feeAmount / totalFees) * totalPaid;
      }
    }

    const remaining = Math.max(0, feeAmount - paidAmount);

    return {
      ...fee,
      calculatedPaidAmount: paidAmount,
      calculatedRemaining: remaining,
      calculatedStatus:
        paidAmount >= feeAmount
          ? "Paid"
          : paidAmount > 0
          ? "Partial"
          : "Pending",
    };
  };

  const totalFees = calculateFeeTotals();
  const totalPaid = calculateTransactionTotal();
  const totalRemaining = calculateRemainingAmount();
  const paymentPercentage = Math.round((totalPaid / totalFees) * 100) || 0;

  const goBack = () => {
    navigate(-1);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handlePayFees = async (fee) => {
    const feeWithCalculations = getFeeWithCalculatedPaidAmount(fee);
    const remaining = feeWithCalculations.calculatedRemaining;

    if (remaining > 0) {
      const paymentAmount = prompt(
        `Enter payment amount for Fee ID: ${fee.feesId}\n\n` +
          `Fee Amount: ${formatCurrency(fee.amount)}\n` +
          `Already Paid: ${formatCurrency(
            feeWithCalculations.calculatedPaidAmount
          )}\n` +
          `Remaining: ${formatCurrency(remaining)}\n\n` +
          `Enter amount to pay (max: ${formatCurrency(remaining)}):`,
        formatCurrency(remaining).replace("₹ ", "")
      );

      if (paymentAmount && !isNaN(parseFloat(paymentAmount))) {
        const amount = parseFloat(paymentAmount);
        if (amount > 0 && amount <= remaining) {
          try {
            const sessionId = selectedSession.id;

            const transactionData = {
              amount: amount,
              paymentMode: "CASH",
              description: `Payment for Fee ID: ${fee.feesId} - Student: ${studentName}`,
              remarks: `Paid for ${studentName}'s fee (ID: ${studentId})`,

              userId: parseInt(studentId),
            };

            const response = await fetch(
              `http://localhost:8080/api/transactions/${sessionId}/save`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(transactionData),
              }
            );

            if (response.ok) {
              alert(`Payment of ${formatCurrency(amount)} saved successfully!`);

              fetchData();
            } else {
              const errorText = await response.text().catch(() => "");
              throw new Error(
                `Failed to save payment: ${response.status} ${errorText}`
              );
            }
          } catch (err) {
            alert(`Error saving payment: ${err.message}`);
          }
        } else {
          alert(
            `Please enter a valid amount between 0 and ${formatCurrency(
              remaining
            )}`
          );
        }
      }
    }
  };
  const printReceipt = (transaction, studentName) => {
    const win = window.open("", "_blank");

    const totalFees = calculateFeeTotals();
    const totalPaid = calculateTransactionTotal();
    const totalRemaining = calculateRemainingAmount();
    const paymentProgress = Math.round((totalPaid / totalFees) * 100) || 0;
    const generatedDate = new Date().toLocaleString("en-IN");

    const makeReceiptHtml = () => `
    <div class="receipt">
      <div class="center mt mb"><b>JAGRATI CHILDREN VIDYA MANDIR</b></div>
      <div class="center mb"><b>FEE PAYMENT RECEIPT</b></div>
      <div class="center mb">Session: ${
        selectedSession.name || selectedSession.id
      }</div>

      <div class="mt">
        <span class="label">Student:</span> ${studentName || "N/A"}
      </div>
      <div>
        <span class="label">Admission No:</span> ${
          studentInfo?.admissionNo || "N/A"
        }
      </div>
      <div>
        <span class="label">Class:</span> ${className || "N/A"}
      </div>

      <div class="line"></div>

      <div>
        <span class="label">Transaction ID:</span> ${
          transaction.id || transaction.transactionId || "N/A"
        }
      </div>
      <div>
        <span class="label">Receipt No:</span> ${
          transaction.receiptNumber || "N/A"
        }
      </div>
      <div>
        <span class="label">Date:</span> ${formatDate(transaction.paymentDate)}
      </div>

      <div class="line"></div>

      <div class="mt mb"><span class="label">Payment Details:</span></div>

      <div>
        <span class="label">Amount:</span> ${formatCurrency(transaction.amount)}
      </div>
      <div>
        <span class="label">Payment Mode:</span> ${
          transaction.paymentMode || "CASH"
        }
      </div>
     
      <div>
        <span class="label">Description:</span> ${
          transaction.description || "School fees"
        }
      </div>
      <div>
        <span class="label">Status:</span> ${transaction.status || "SUCCESS"}
      </div>
      <div>
        <span class="label">Remarks:</span> ${
          transaction.remarks || "Paid at school counter"
        }
      </div>

      <div class="line"></div>

      <div class="mt">
        <span class="label">Total Fees:</span>
        <span class="right">${formatCurrency(totalFees)}</span>
      </div>
      <div>
        <span class="label">Total Paid:</span>
        <span class="right">${formatCurrency(totalPaid)}</span>
      </div>
      <div>
        <span class="label">Remaining:</span>
        <span class="right">${formatCurrency(totalRemaining)}</span>
      </div>
      <div>
        <span class="label">Payment Progress:</span>
        <span class="right">${paymentProgress}%</span>
      </div>

      <div class="center mt mb" style="margin-top:22px;">
        Thank You for Your Payment!
      </div>

      <div class="center" style="font-size:10px; margin-top:10px;">
        Generated on ${generatedDate}
      </div>
    </div>
  `;

    win.document.write(`
    <html>
      <head>
        <title>FEE PAYMENT RECEIPT</title>
        <style>
          @page { margin: 10mm; }
          body {
            font-family: "Courier New", monospace;
            font-size: 12px;
            margin: 0;
            padding: 0;
          }
          .page {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            gap: 10mm;              
            padding: 10mm 12mm;    
          }
          .receipt {
            width: 80mm;
            min-height: 160mm;     
            border: 1px solid black;
            padding: 12px 12px;  
            box-sizing: border-box;
          }
          .center { text-align: center; }
          .line { border-top: 1px dashed #000; margin: 8px 0; }
          .mt { margin-top: 8px; }  /* slightly more vertical spacing */
          .mb { margin-bottom: 8px; }
          .label { font-weight: bold; }
          .right { float: right; }
        </style>
      </head>
      <body>
        <div class="page">
          ${makeReceiptHtml()}
          ${makeReceiptHtml()}
        </div>
      </body>
    </html>
  `);

    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const getStatusClass = (status) => {
    if (!status) return "pending";

    const statusLower = status.toLowerCase();
    if (
      statusLower === "success" ||
      statusLower === "completed" ||
      statusLower === "paid"
    ) {
      return "success";
    } else if (statusLower === "pending") {
      return "pending";
    } else if (statusLower === "failed" || statusLower === "cancelled") {
      return "failed";
    }
    return "pending";
  };

  const getFeeStatusClass = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "paid") return "paid";
    if (statusLower === "partial") return "partial";
    return "pending";
  };

  return (
    <div className="admin-fee-details-container">
      <div className="admin-fee-header">
        <div className="header-left">
          <div className="button-group">
            <button className="back-btn" onClick={goBack}>
              ← Back
            </button>
            <button
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={refreshing || loading}
            >
              {refreshing ? (
                <span className="refresh-icon spinning">⟳</span>
              ) : (
                <span className="refresh-icon">⟳</span>
              )}
              Refresh
            </button>
          </div>
          <div>
            <h2 className="page-title">Fee Details - {studentName}</h2>
            <div className="session-info">
              <span className="session-label">Session:</span>
              <span className="session-value">
                {selectedSession.name || selectedSession.id}
              </span>
            </div>
          </div>
        </div>

        {!loading && !error && fees.length > 0 && (
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Total Fees:</span>
              <span className="stat-value">{formatCurrency(totalFees)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Paid:</span>
              <span className="stat-value paid">
                {formatCurrency(totalPaid)} ({paymentPercentage}%)
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pending:</span>
              <span className="stat-value pending">
                {formatCurrency(totalRemaining)}
              </span>
            </div>
          </div>
        )}
      </div>

      {studentInfo && (
        <div className="student-info-card">
          <div className="info-row">
            <span className="info-label">Student ID:</span>
            <span className="info-value">{studentId}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Name:</span>
            <span className="info-value">{studentInfo.name || "N/A"}</span>
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
              <span className="info-value">{className || "N/A"}</span>
            </div>
          )}
          <div className="info-row">
            <span className="info-label">Total Transactions:</span>
            <span className="info-value">{transactions.length}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Current Session:</span>
            <span className="info-value">
              {selectedSession.name || selectedSession.id}
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {(loading || refreshing || creatingFees) && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>
            {creatingFees
              ? "Creating fee structure..."
              : refreshing
              ? "Refreshing data..."
              : "Loading data..."}
          </p>
        </div>
      )}

      <div className="section-header">
        <h3>Fee Structure</h3>
      </div>

      <div className="fee-table-container">
        {loading || creatingFees ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>
              {creatingFees
                ? "Creating fee structure automatically..."
                : "Loading fee details..."}
            </p>
          </div>
        ) : fees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <div className="empty-icon">⏳</div>
              <h3>Creating Fee Structure...</h3>
              <p>
                This student doesn't have a fee structure yet. The system is
                automatically creating one with the class fee amount.
              </p>
            </div>
          </div>
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
                {fees.map((fee) => {
                  const feeWithCalculations =
                    getFeeWithCalculatedPaidAmount(fee);

                  return (
                    <tr key={fee.feesId}>
                      <td className="text-center">{fee.feesId}</td>
                      <td className="text-right amount">
                        {formatCurrency(fee.amount)}
                      </td>
                      <td className="text-right paid">
                        {formatCurrency(
                          feeWithCalculations.calculatedPaidAmount
                        )}
                      </td>
                      <td className="text-right remaining">
                        {formatCurrency(
                          feeWithCalculations.calculatedRemaining
                        )}
                      </td>
                      <td className="text-center">
                        <span
                          className={`status-badge ${getFeeStatusClass(
                            feeWithCalculations.calculatedStatus
                          )}`}
                        >
                          {feeWithCalculations.calculatedStatus}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          className="pay-fees-btn"
                          onClick={() => handlePayFees(fee)}
                          disabled={
                            feeWithCalculations.calculatedRemaining === 0
                          }
                        >
                          {feeWithCalculations.calculatedRemaining === 0
                            ? "Paid"
                            : "Pay Fees"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="section-header">
        <h3>Payment Transactions</h3>
      </div>

      <div className="transactions-table-container">
        {loading ? (
          <div className="loading-state">
            <p>Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <p>No payment transactions found for this student.</p>
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
                {transactions.map((transaction, index) => (
                  <tr key={transaction.id || transaction.transactionId}>
                    <td className="text-center">{index + 1}</td>
                    <td className="text-right amount">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="text-center">
                      {formatDate(transaction.paymentDate)}
                    </td>
                    <td className="text-center">
                      {transaction.description || "Fee Payment"}
                    </td>
                    <td className="text-center">
                      <span
                        className={`status-badge ${getStatusClass(
                          transaction.status
                        )}`}
                      >
                        {transaction.status || "Pending"}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        className="print-btn"
                        onClick={() => printReceipt(transaction, studentName)}
                      >
                        Print Receipt
                      </button>
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

export default AdminStudentFeeDetails;
