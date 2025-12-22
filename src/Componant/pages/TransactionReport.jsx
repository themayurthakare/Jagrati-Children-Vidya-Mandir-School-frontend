import React, { useEffect, useState, useCallback, useContext } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SessionContext } from "./SessionContext";
import "./TransactionReport.css";

const TransactionReport = () => {
  const { selectedSession } = useContext(SessionContext);
  const sessionId = selectedSession?.id;

  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [filterType, setFilterType] = useState("day");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");

  const fetchTransactions = useCallback(() => {
    if (!sessionId) {
      setTransactions([]);
      setFiltered([]);
      return;
    }

    fetch(
      `http://localhost:8080/api/transactions/${sessionId}/getAllUsingSessionId`
    )
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setTransactions(list);
        setFiltered(list);
      })
      .catch(() => {
        setTransactions([]);
        setFiltered([]);
      });
  }, [sessionId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const applyFilter = () => {
    let result = [...transactions];

    if (filterType === "day" && day) {
      result = result.filter((t) => t.paymentDate?.substring(0, 10) === day);
    }

    if (filterType === "month" && month) {
      result = result.filter((t) => t.paymentDate?.substring(0, 7) === month);
    }

    setFiltered(result);
  };

  const resetFilter = () => {
    setDay("");
    setMonth("");
    setFiltered(transactions);
  };

  const totalAmount = filtered.reduce(
    (sum, t) => sum + Number(t.amount || 0),
    0
  );

  const downloadExcel = () => {
    if (filtered.length === 0) {
      alert("No data to download");
      return;
    }

    const excelData = filtered.map((t, index) => ({
      "Sr No": index + 1,
      "Receipt No": t.receiptNumber,
      Amount: `Rs. ${t.amount}`,
      "Payment Mode": t.paymentMode,
      Status: t.status,
      "Payment Date": t.paymentDate?.substring(0, 10),
      Description: t.description,
      Remarks: t.remarks,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `Transaction_Report_Session_${sessionId}.xlsx`
    );
  };

  const downloadPDF = () => {
    if (filtered.length === 0) {
      alert("No data to download");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");

    doc.setFontSize(16);
    doc.text(
      `Transaction Report (${selectedSession?.name || "Session"})`,
      14,
      15
    );

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    const columns = ["Sr No", "Receipt No", "Amount", "Mode", "Status", "Date"];

    const rows = filtered.map((t, index) => [
      index + 1,
      t.receiptNumber,
      `Rs. ${t.amount}`,
      t.paymentMode,
      t.status,
      t.paymentDate?.substring(0, 10),
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 28,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [40, 167, 69] },
    });

    const finalY = doc.lastAutoTable.finalY || 28;
    doc.setFontSize(11);
    doc.text(`Total Collection: Rs. ${totalAmount}`, 14, finalY + 10);

    doc.save(`Transaction_Report_Session_${sessionId}.pdf`);
  };

  return (
    <div className="report-container">
      <h2>
        Transaction Report {selectedSession ? `(${selectedSession.name})` : ""}
      </h2>

      {!sessionId && (
        <p style={{ color: "red", marginBottom: 10 }}>
          Please select a session from dashboard.
        </p>
      )}

      <div className="filter-box">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          disabled={!sessionId}
        >
          <option value="day">Day-wise</option>
          <option value="month">Month-wise</option>
        </select>

        {filterType === "day" && (
          <input
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            disabled={!sessionId}
          />
        )}

        {filterType === "month" && (
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            disabled={!sessionId}
          />
        )}

        <button onClick={applyFilter} disabled={!sessionId}>
          Apply
        </button>
        <button onClick={resetFilter} disabled={!sessionId}>
          Reset
        </button>
        <button
          className="excel-btn"
          onClick={downloadExcel}
          disabled={!sessionId}
        >
          ⬇ Excel
        </button>
        <button className="pdf-btn" onClick={downloadPDF} disabled={!sessionId}>
          ⬇ PDF
        </button>
      </div>

      <table className="report-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Receipt</th>
            <th>Amount</th>
            <th>Mode</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="6" className="no-data">
                No transactions found
              </td>
            </tr>
          ) : (
            filtered.map((t, index) => (
              <tr key={t.id}>
                <td>{index + 1}</td>
                <td>{t.receiptNumber}</td>
                <td>₹ {t.amount}</td>
                <td>{t.paymentMode}</td>
                <td>{t.status}</td>
                <td>{t.paymentDate?.substring(0, 10)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="total-box">
        <strong>Total Collection:</strong> ₹ {totalAmount}
      </div>
    </div>
  );
};

export default TransactionReport;
