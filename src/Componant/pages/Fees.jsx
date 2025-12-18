// // src/Component/pages/Fees.jsx
// import React, { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import "./AdminViewFees.css"; // reusing the same design

// const Fees = () => {
//   const [studentClasses, setStudentClasses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // hook MUST be at top level
//   const location = useLocation();

//   // ---------- helper: NO hooks inside ----------
//   const getStudentId = () => {
//     // 1) From navigation state (if you navigated with state: { studentId })
//     if (location.state && location.state.studentId) {
//       return location.state.studentId;
//     }

//     // 2) From localStorage "user" object
//     try {
//       const userData = JSON.parse(localStorage.getItem("user") || "{}");
//       if (userData.id) return userData.id;
//       if (userData.userId) return userData.userId;
//     } catch (err) {
//       console.error("Error reading user from localStorage:", err);
//     }

//     // 3) From simple localStorage key "userId"
//     const storedId = localStorage.getItem("userId");
//     if (storedId) return storedId;

//     return null;
//   };

//   const studentId = getStudentId();

//   const loadStudentFees = async () => {
//     if (!studentId) {
//       setError("Student information not found. Please login again.");
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       // 1. Get student to know the class
//       const studentRes = await fetch(
//         `http://localhost:8080/api/users/${studentId}`
//       );
//       if (!studentRes.ok) {
//         throw new Error("Failed to fetch student details");
//       }
//       const studentData = await studentRes.json();
//       const studentClassId =
//         studentData.studentClassId || studentData.studentClass;

//       if (!studentClassId) {
//         setError("No class assigned to student.");
//         setLoading(false);
//         return;
//       }

//       // 2. Get all classes
//       const classRes = await fetch("http://localhost:8080/api/classes/getAll");
//       if (!classRes.ok) {
//         throw new Error("Failed to fetch classes");
//       }
//       const allClasses = await classRes.json();

//       // 3. Find this student's class
//       const studentClass = Array.isArray(allClasses)
//         ? allClasses.find(
//             (c) =>
//               c.classId === studentClassId ||
//               c.id === studentClassId ||
//               String(c.classId) === String(studentClassId) ||
//               String(c.id) === String(studentClassId)
//           )
//         : null;

//       if (studentClass) {
//         setStudentClasses([studentClass]);
//       } else {
//         setError(`Class not found for student. Class ID: ${studentClassId}`);
//         setStudentClasses([]);
//       }
//     } catch (err) {
//       console.error("Failed to load student fees:", err);
//       setError(`Failed to load fees: ${err.message}`);
//       setStudentClasses([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatCurrency = (amount) => {
//     if (amount === null || amount === undefined) return "₹ 0";
//     return `₹ ${parseInt(amount, 10).toLocaleString("en-IN")}`;
//   };

//   useEffect(() => {
//     loadStudentFees();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [studentId]);

//   if (!studentId) {
//     return (
//       <div className="fees-container">
//         <div className="fees-error">
//           <h3>❌ Please Login</h3>
//           <p>Student information not found. Please login to view fees details.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="fees-container">
//       <div className="fees-header">
//         <h2 className="fees-title">My Fees Details</h2>
//         <button
//           className="fees-refresh-btn"
//           onClick={loadStudentFees}
//           disabled={loading}
//         >
//           {loading ? "Refreshing..." : "Refresh"}
//         </button>
//       </div>

//       {error && (
//         <div className="fees-error">
//           <p>{error}</p>
//           <button
//             className="error-retry-btn"
//             onClick={loadStudentFees}
//             disabled={loading}
//           >
//             Retry
//           </button>
//         </div>
//       )}

//       <div className="fees-table-container">
//         {loading ? (
//           <div className="loading-state">
//             <p>Loading your fees details...</p>
//           </div>
//         ) : studentClasses.length === 0 ? (
//           <div className="empty-state">
//             <p>No fees information available.</p>
//           </div>
//         ) : (
//           <table className="fees-table">
//             <thead>
//               <tr>
//                 <th>Sr. No.</th>
//                 <th>Class Name</th>
//                 <th>Annual Fees</th>
//                 <th>Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {studentClasses.map((c, index) => (
//                 <tr key={c.classId || c.id}>
//                   <td className="text-center">{index + 1}</td>
//                   <td>
//                     <div className="class-name">
//                       {c.className || "Unnamed Class"}
//                     </div>
//                   </td>
//                   <td className="text-left fees-amount">
//                     {formatCurrency(c.fees)}
//                   </td>
//                   <td className="text-center">
//                     <span className="status-info">View Only</span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Fees;





import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AdminStudentFeeDetails.css";

const Fees = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get student ID from navigation state
  const studentId = location.state?.studentId || localStorage.getItem("userId");
  const studentName = location.state?.studentName || "Student";

  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentInfo, setStudentInfo] = useState(null);

  // Fetch student details and fee information
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

        // Fetch student information
        const studentResponse = await fetch(
          `http://localhost:8080/api/users/${studentId}`
        );
        if (studentResponse.ok) {
          const studentData = await studentResponse.json();
          setStudentInfo(studentData);
        }

        // Fetch fee information
        const feeResponse = await fetch(
          `http://localhost:8080/api/fees/user/${studentId}`
        );

        if (!feeResponse.ok) {
          if (feeResponse.status === 404) {
            setFees([]); // No fees found
            return;
          }
          throw new Error(`Failed to fetch fee details: ${feeResponse.status}`);
        }

        const feeData = await feeResponse.json();
        setFees(Array.isArray(feeData) ? feeData : [feeData]);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load fee details");
        setFees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not Paid";
    try {
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(dateString).toLocaleDateString("en-IN", options);
    } catch (error) {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "₹ 0";
    return `₹ ${parseInt(amount).toLocaleString("en-IN")}`;
  };

  // Calculate totals
  const calculateTotals = () => {
    const totalFees = fees.reduce(
      (sum, fee) => sum + (parseInt(fee.amount) || 0),
      0
    );
    const totalPaid = fees.reduce(
      (sum, fee) => sum + (parseInt(fee.paidAmount) || 0),
      0
    );
    const totalRemaining = fees.reduce(
      (sum, fee) => sum + (parseInt(fee.remainingAmount) || 0),
      0
    );

    return { totalFees, totalPaid, totalRemaining };
  };

  const { totalFees, totalPaid, totalRemaining } = calculateTotals();

  // Handle back navigation
  const goBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Handle mark as paid
  const markAsPaid = (feeId) => {
    if (window.confirm("Mark this fee as paid?")) {
      alert(
        "This would update the payment status to 'Paid' via API.\nFee ID: " +
          feeId
      );
      // Implement API call to update payment status
    }
  };

  // Handle add payment
  const addPayment = (feeId) => {
    alert("This would open a payment form for Fee ID: " + feeId);
    // Implement payment form
  };

  return (
    <div className="admin-fee-details-container">
      {/* Header */}
      <div className="admin-fee-header">
        <div className="header-left">
          {/* <button className="back-btn" onClick={goBack}>
            ← Back
          </button> */}
          <h2 className="page-title">Fee Details - {studentName}</h2>
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
                {formatCurrency(totalPaid)}
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

      {/* Student Info */}
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
              <span className="info-value">{studentInfo.studentClass}</span>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Fee Details */}
      <div className="fee-table-container">
        {loading ? (
          <div className="loading-state">
            <p>Loading fee details...</p>
          </div>
        ) : fees.length === 0 ? (
          <div className="empty-state">
            <p>No fee records found for this student.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="fee-table">
              <thead>
                <tr>
                  <th>Fee ID</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                  <th>Paid Amount</th>
                  <th>Remaining</th>
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
                    <td>{formatDate(fee.dueDate)}</td>
                    <td>
                      <span
                        className={`status-badge ${fee.paymentStatus?.toLowerCase()}`}
                      >
                        {fee.paymentStatus || "Pending"}
                      </span>
                    </td>
                    <td>{formatDate(fee.paymentDate)}</td>
                    <td className="text-right paid">
                      {formatCurrency(fee.paidAmount)}
                    </td>
                    <td className="text-right remaining">
                      {formatCurrency(fee.remainingAmount)}
                    </td>
                    <td>
                      <div className="fee-actions">
                        {fee.paymentStatus?.toLowerCase() !== "paid" &&
                          fee.remainingAmount > 0 && (
                            <>
                              {/* <button
                                className="mark-paid-btn"
                                onClick={() => markAsPaid(fee.feesId)}
                              >
                                Mark Paid
                              </button> */}
                              {/* <button
                                className="add-payment-btn"
                                onClick={() => addPayment(fee.feesId)}
                              >
                                Add Payment
                              </button> */}
                            </>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Summary */}
      {fees.length > 0 && (
        <div className="fee-summary">
          <div className="summary-row">
            <span className="summary-label">Total Records:</span>
            <span className="summary-value">{fees.length}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Overall Status:</span>
            <span
              className={`summary-value ${
                totalRemaining === 0 ? "fully-paid" : "pending"
              }`}
            >
              {totalRemaining === 0 ? "Fully Paid" : "Payment Due"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;
