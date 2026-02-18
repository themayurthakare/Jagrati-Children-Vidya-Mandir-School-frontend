import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AdminPrintMarksheet.css";

const AdminPrintMarksheet = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { sessionId, studentId, className } = location.state || {};

  const [student, setStudent] = useState(null);
  const [session, setSession] = useState(null);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);

    const fetchStudent = fetch(
      `http://localhost:8080/api/users/${sessionId}/${studentId}`,
    ).then((res) => res.json());

    const fetchSession = fetch(
      `http://localhost:8080/api/sessions/${sessionId}`,
    ).then((res) => res.json());

    const fetchMarks = fetch(
      `http://localhost:8080/api/marks/student/${studentId}?sessionId=${sessionId}`,
    ).then((res) => res.json());

    Promise.all([fetchStudent, fetchSession, fetchMarks])
      .then(([studentData, sessionData, marksData]) => {
        setStudent(studentData);
        setSession(sessionData);

        // Filter marks for only Quarterly, Half Yearly, and Annual exam types
        const filteredMarks = marksData.filter((mark) =>
          ["Quarterly", "Half Yearly", "Annual"].includes(mark.examType),
        );
        setMarks(filteredMarks);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (sessionId && studentId) fetchData();
  }, [sessionId, studentId]);

  // Helper function to get marks by exam type and subject
  const getMarksByExamType = (examType, subject, field) => {
    const examMarks = marks.find((m) => m.examType === examType);
    if (!examMarks) return "";

    const subjectField = `${subject.toLowerCase()}${field}`;
    return examMarks[subjectField] || "";
  };

  // Helper function to get additional subject marks (grades)
  const getAdditionalMarks = (examType, subject) => {
    const examMarks = marks.find((m) => m.examType === examType);
    if (!examMarks) return "";

    const subjectField = `${subject.toLowerCase()}Theory`;
    return examMarks[subjectField] || "";
  };

  // Calculate total marks for each exam type (sum of all subject totals)
  const calculateExamTotal = (examType) => {
    const examMarks = marks.find((m) => m.examType === examType);
    if (!examMarks) return "";

    // Sum up all subject totals for this exam
    const total =
      (examMarks.hindiTotal || 0) +
      (examMarks.englishTotal || 0) +
      (examMarks.mathsTotal || 0) +
      (examMarks.evsTotal || 0);

    return total;
  };

  // Calculate theory total for each exam type
  const calculateExamTheoryTotal = (examType) => {
    const examMarks = marks.find((m) => m.examType === examType);
    if (!examMarks) return "";

    const theoryTotal =
      (examMarks.hindiTheory || 0) +
      (examMarks.englishTheory || 0) +
      (examMarks.mathsTheory || 0) +
      (examMarks.evsTheory || 0);

    return theoryTotal;
  };

  // Calculate project total for each exam type
  const calculateExamProjectTotal = (examType) => {
    const examMarks = marks.find((m) => m.examType === examType);
    if (!examMarks) return "";

    const projectTotal =
      (examMarks.hindiProject || 0) +
      (examMarks.englishProject || 0) +
      (examMarks.mathsProject || 0) +
      (examMarks.evsProject || 0);

    return projectTotal;
  };

  // Calculate maximum totals
  const calculateMaxTotals = () => {
    const quarterlyMarks = marks.find((m) => m.examType === "Quarterly");
    if (!quarterlyMarks) return { theory: 0, project: 0, total: 0 };

    const theoryTotal =
      (quarterlyMarks.hindiTheoryOutOf || 0) +
      (quarterlyMarks.englishTheoryOutOf || 0) +
      (quarterlyMarks.mathsTheoryOutOf || 0) +
      (quarterlyMarks.evsTheoryOutOf || 0);

    const projectTotal =
      (quarterlyMarks.hindiProjectOutOf || 0) +
      (quarterlyMarks.englishProjectOutOf || 0) +
      (quarterlyMarks.mathsProjectOutOf || 0) +
      (quarterlyMarks.evsProjectOutOf || 0);

    const totalTotal =
      (quarterlyMarks.hindiTotalOutOf || 0) +
      (quarterlyMarks.englishTotalOutOf || 0) +
      (quarterlyMarks.mathsTotalOutOf || 0) +
      (quarterlyMarks.evsTotalOutOf || 0);

    return { theory: theoryTotal, project: projectTotal, total: totalTotal };
  };
  // Calculate percentage for each exam type
  const calculateExamPercentage = (examType) => {
    const examMarks = marks.find((m) => m.examType === examType);
    return examMarks?.percentage ? examMarks.percentage.toFixed(2) : "";
  };

  const calculateExamGrade = (examType) => {
    const percentage = calculateExamPercentage(examType);
    return getGradeFromPercentage(percentage);
  };
  // Convert percentage → grade (based on marksheet table)
  const getGradeFromPercentage = (percentage) => {
    if (percentage === "" || percentage === null || percentage === undefined)
      return "";

    const p = parseFloat(percentage);

    if (p >= 86) return "A+";
    if (p >= 76) return "A";
    if (p >= 66) return "B+";
    if (p >= 56) return "B";
    if (p >= 51) return "C+";
    if (p >= 46) return "C";
    if (p >= 33) return "D";
    return "F";
  };

  // Calculate maximum percentage
  const calculateMaxPercentage = () => {
    const maxTotals = calculateMaxTotals();
    const quarterlyMarks = marks.find((m) => m.examType === "Quarterly");
    if (!quarterlyMarks) return "";

    // Assuming total maximum marks is 400 (4 subjects * 100)
    return ((maxTotals.total / 400) * 100).toFixed(2);
  };

  // Get Quarterly marks for Maximum column
  const quarterlyMarks = marks.find((m) => m.examType === "Quarterly");
  const maxTotals = calculateMaxTotals();
  const maxPercentage = calculateMaxPercentage();

  if (loading) return <div>Loading...</div>;
  if (!student || !session) return <div>No data found</div>;

  return (
    <>
      {/* CONTROLS */}
      <div className="ms-controls">
        <button onClick={() => window.print()} className="ms-btn print">
          🖨 Print
        </button>
        <button onClick={fetchData} className="ms-btn refresh">
          🔄 Refresh
        </button>
        <button onClick={() => navigate(-1)} className="ms-btn back">
          ← Back
        </button>
      </div>

      <div className="ms-page-wrapper">
        <div className="ms-page">
          <div className="ms-recognized">(Recognized by M.P. Government)</div>
          <div className="ms-school-name">
            JAGRATI CHILDREN VIDHIYA MANDIR SCHOOL
          </div>
          <div className="ms-school-address">
            SHANKAR COLONY, A.B. ROAD, GOL PAHADIYA, LASHKAR, GWALIOR (M.P.) -
            474001
          </div>
          <div className="ms-class-session">
            CLASS <b>{className || student.studentClassId}</b> : Academic
            Session {session.name}
          </div>
          <div className="ms-dise">(School Dise-code : 23040504429)</div>

          {/* TOP INFO */}
          <table className="ms-top-table">
            <tbody>
              <tr>
                <th>Roll No.</th>
                <th>Admission No.</th>
                <th>SSSM ID</th>
                <th>Aadhar No.</th>
              </tr>
              <tr>
                <td>{student.userId}</td>
                <td>{student.admissionNo}</td>
                <td>{student.ssmId}</td>
                <td>{student.studentAadharNo}</td>
              </tr>
            </tbody>
          </table>

          {/* STUDENT DETAILS */}
          <table className="ms-student-table">
            <tbody>
              <tr>
                <th colSpan="4">STUDENT DETAILS</th>
              </tr>
              <tr>
                <td className="ms-label">Student Name :</td>
                <td colSpan="3">{student.name}</td>
              </tr>
              <tr>
                <td className="ms-label">Father's Name :</td>
                <td colSpan="3">{student.fatherName}</td>
              </tr>
              <tr>
                <td className="ms-label">Mother's name :</td>
                <td>{student.motherName}</td>
                <td className="ms-label">Date of Birth :</td>
                <td>{student.dob}</td>
              </tr>
              <tr>
                <td className="ms-label">Medium :</td>
                <td colSpan="3">ENGLISH</td>
              </tr>
            </tbody>
          </table>

          <div className="ms-marksheet-title">MARK SHEET</div>

          {/* MARKS TABLE */}
          <table className="ms-marks-table">
            <colgroup>
              <col style={{ width: "14%" }} /> {/* SUBJECT */}
              <col style={{ width: "8.5%" }} /> {/* Max THEORY */}
              <col style={{ width: "8.5%" }} /> {/* Max PROJECT */}
              <col style={{ width: "7.5%" }} /> {/* Max TOTAL */}
              <col style={{ width: "8.5%" }} /> {/* Quarterly THEORY */}
              <col style={{ width: "8.5%" }} /> {/* Quarterly PROJECT */}
              <col style={{ width: "7.5%" }} /> {/* Quarterly TOTAL */}
              <col style={{ width: "8.5%" }} /> {/* Half Yearly THEORY */}
              <col style={{ width: "8.5%" }} /> {/* Half Yearly PROJECT */}
              <col style={{ width: "7.5%" }} /> {/* Half Yearly TOTAL */}
              <col style={{ width: "8.5%" }} /> {/* Annual THEORY */}
              <col style={{ width: "8.5%" }} /> {/* Annual PROJECT */}
              <col style={{ width: "7.5%" }} /> {/* Annual TOTAL */}
            </colgroup>

            <thead>
              <tr>
                <th rowSpan="2">SUBJECT</th>
                <th colSpan="3">Maximum</th>
                <th colSpan="3">Quarterly</th>
                <th colSpan="3">Half Yearly</th>
                <th colSpan="3">Annual</th>
              </tr>
              <tr>
                <th>THEORY</th>
                <th>PROJECT</th>
                <th>TOTAL</th>
                <th>THEORY</th>
                <th>PROJECT</th>
                <th>TOTAL</th>
                <th>THEORY</th>
                <th>PROJECT</th>
                <th>TOTAL</th>
                <th>THEORY</th>
                <th>PROJECT</th>
                <th>TOTAL</th>
              </tr>
            </thead>

            <tbody>
              {/* Hindi Row */}
              <tr>
                <td>Hindi</td>

                {/* Maximum Marks */}
                <td>{quarterlyMarks?.hindiTheoryOutOf || ""}</td>
                <td>{quarterlyMarks?.hindiProjectOutOf || ""}</td>
                <td>{quarterlyMarks?.hindiTotalOutOf || ""}</td>

                {/* Quarterly Marks */}
                <td>{getMarksByExamType("Quarterly", "Hindi", "Theory")}</td>
                <td>{getMarksByExamType("Quarterly", "Hindi", "Project")}</td>
                <td>{getMarksByExamType("Quarterly", "Hindi", "Total")}</td>

                {/* Half Yearly Marks */}
                <td>{getMarksByExamType("Half Yearly", "Hindi", "Theory")}</td>
                <td>{getMarksByExamType("Half Yearly", "Hindi", "Project")}</td>
                <td>{getMarksByExamType("Half Yearly", "Hindi", "Total")}</td>

                {/* Annual Marks */}
                <td>{getMarksByExamType("Annual", "Hindi", "Theory")}</td>
                <td>{getMarksByExamType("Annual", "Hindi", "Project")}</td>
                <td>{getMarksByExamType("Annual", "Hindi", "Total")}</td>
              </tr>

              {/* English Row */}
              <tr>
                <td>English</td>

                {/* Maximum Marks */}
                <td>{quarterlyMarks?.englishTheoryOutOf || ""}</td>
                <td>{quarterlyMarks?.englishProjectOutOf || ""}</td>
                <td>{quarterlyMarks?.englishTotalOutOf || ""}</td>

                {/* Quarterly Marks */}
                <td>{getMarksByExamType("Quarterly", "English", "Theory")}</td>
                <td>{getMarksByExamType("Quarterly", "English", "Project")}</td>
                <td>{getMarksByExamType("Quarterly", "English", "Total")}</td>

                {/* Half Yearly Marks */}
                <td>
                  {getMarksByExamType("Half Yearly", "English", "Theory")}
                </td>
                <td>
                  {getMarksByExamType("Half Yearly", "English", "Project")}
                </td>
                <td>{getMarksByExamType("Half Yearly", "English", "Total")}</td>

                {/* Annual Marks */}
                <td>{getMarksByExamType("Annual", "English", "Theory")}</td>
                <td>{getMarksByExamType("Annual", "English", "Project")}</td>
                <td>{getMarksByExamType("Annual", "English", "Total")}</td>
              </tr>

              {/* Mathematics Row */}
              <tr>
                <td>Mathematics</td>

                {/* Maximum Marks */}
                <td>{quarterlyMarks?.mathsTheoryOutOf || ""}</td>
                <td>{quarterlyMarks?.mathsProjectOutOf || ""}</td>
                <td>{quarterlyMarks?.mathsTotalOutOf || ""}</td>

                {/* Quarterly Marks */}
                <td>{getMarksByExamType("Quarterly", "Maths", "Theory")}</td>
                <td>{getMarksByExamType("Quarterly", "Maths", "Project")}</td>
                <td>{getMarksByExamType("Quarterly", "Maths", "Total")}</td>

                {/* Half Yearly Marks */}
                <td>{getMarksByExamType("Half Yearly", "Maths", "Theory")}</td>
                <td>{getMarksByExamType("Half Yearly", "Maths", "Project")}</td>
                <td>{getMarksByExamType("Half Yearly", "Maths", "Total")}</td>

                {/* Annual Marks */}
                <td>{getMarksByExamType("Annual", "Maths", "Theory")}</td>
                <td>{getMarksByExamType("Annual", "Maths", "Project")}</td>
                <td>{getMarksByExamType("Annual", "Maths", "Total")}</td>
              </tr>

              {/* E.V.S. Row */}
              <tr>
                <td>E.V.S.</td>

                {/* Maximum Marks */}
                <td>{quarterlyMarks?.evsTheoryOutOf || ""}</td>
                <td>{quarterlyMarks?.evsProjectOutOf || ""}</td>
                <td>{quarterlyMarks?.evsTotalOutOf || ""}</td>

                {/* Quarterly Marks */}
                <td>{getMarksByExamType("Quarterly", "Evs", "Theory")}</td>
                <td>{getMarksByExamType("Quarterly", "Evs", "Project")}</td>
                <td>{getMarksByExamType("Quarterly", "Evs", "Total")}</td>

                {/* Half Yearly Marks */}
                <td>{getMarksByExamType("Half Yearly", "Evs", "Theory")}</td>
                <td>{getMarksByExamType("Half Yearly", "Evs", "Project")}</td>
                <td>{getMarksByExamType("Half Yearly", "Evs", "Total")}</td>

                {/* Annual Marks */}
                <td>{getMarksByExamType("Annual", "Evs", "Theory")}</td>
                <td>{getMarksByExamType("Annual", "Evs", "Project")}</td>
                <td>{getMarksByExamType("Annual", "Evs", "Total")}</td>
              </tr>

              {/* GRAND TOTAL ROW - Shows all 12 columns as in screenshot */}
              <tr className="ms-grand-total-row">
                <td>
                  <strong>GRAND TOTAL</strong>
                </td>
                {/* Maximum Section - 3 columns */}
                <td>
                  <strong>{maxTotals.theory}</strong>
                </td>
                <td>
                  <strong>{maxTotals.project}</strong>
                </td>
                <td>
                  <strong>{maxTotals.total}</strong>
                </td>

                {/* Quarterly Section - 3 columns */}
                <td>
                  <strong>{calculateExamTheoryTotal("Quarterly")}</strong>
                </td>
                <td>
                  <strong>{calculateExamProjectTotal("Quarterly")}</strong>
                </td>
                <td>
                  <strong>{calculateExamTotal("Quarterly")}</strong>
                </td>

                {/* Half Yearly Section - 3 columns */}
                <td>
                  <strong>{calculateExamTheoryTotal("Half Yearly")}</strong>
                </td>
                <td>
                  <strong>{calculateExamProjectTotal("Half Yearly")}</strong>
                </td>
                <td>
                  <strong>{calculateExamTotal("Half Yearly")}</strong>
                </td>

                {/* Annual Section - 3 columns */}
                <td>
                  <strong>{calculateExamTheoryTotal("Annual")}</strong>
                </td>
                <td>
                  <strong>{calculateExamProjectTotal("Annual")}</strong>
                </td>
                <td>
                  <strong>{calculateExamTotal("Annual")}</strong>
                </td>
              </tr>
              {/* PERCENTAGE ROW */}
              <tr className="ms-percentage-row">
                <td>
                  <strong>PERCENTAGE</strong>
                </td>
                <td colSpan="3">
                  <strong>{maxPercentage}%</strong>
                </td>
                <td colSpan="3">
                  <strong>{calculateExamPercentage("Quarterly")}%</strong>
                </td>
                <td colSpan="3">
                  <strong>{calculateExamPercentage("Half Yearly")}%</strong>
                </td>
                <td colSpan="3">
                  <strong>{calculateExamPercentage("Annual")}%</strong>
                </td>
              </tr>

              {/* GRADE ROW */}
              <tr className="ms-grade-row">
                <td>
                  <strong>GRADE</strong>
                </td>
                <td colSpan="3">
                  <strong>{getGradeFromPercentage(maxPercentage)}</strong>
                </td>
                <td colSpan="3">
                  <strong>{calculateExamGrade("Quarterly")}</strong>
                </td>
                <td colSpan="3">
                  <strong>{calculateExamGrade("Half Yearly")}</strong>
                </td>
                <td colSpan="3">
                  <strong>{calculateExamGrade("Annual")}</strong>
                </td>
              </tr>

              {/* ADDITIONAL SUBJECT HEADER */}
              <tr>
                <td
                  rowSpan="2"
                  className="ms-bold"
                  style={{
                    verticalAlign: "middle",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  ADDITIONAL SUBJECT
                </td>
              </tr>

              <tr>
                {/* Maximum sub-headers */}
                <td style={{ fontWeight: "bold" }}>G.K.</td>
                <td style={{ fontWeight: "bold" }}>COMP</td>
                <td style={{ fontWeight: "bold" }}>DRAW</td>

                {/* Quarterly sub-headers */}
                <td style={{ fontWeight: "bold" }}>G.K.</td>
                <td style={{ fontWeight: "bold" }}>COMP</td>
                <td style={{ fontWeight: "bold" }}>DRAW</td>

                {/* Half Yearly sub-headers */}
                <td style={{ fontWeight: "bold" }}>G.K.</td>
                <td style={{ fontWeight: "bold" }}>COMP</td>
                <td style={{ fontWeight: "bold" }}>DRAW</td>

                {/* Annual sub-headers */}
                <td style={{ fontWeight: "bold" }}>G.K.</td>
                <td style={{ fontWeight: "bold" }}>COMP</td>
                <td style={{ fontWeight: "bold" }}>DRAW</td>
              </tr>

              {/* ADDITIONAL SUBJECT VALUES ROW - Now showing grades instead of numbers */}
              <tr>
                <td
                  rowSpan="2"
                  className="ms-bold"
                  style={{
                    verticalAlign: "middle",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  GRADE
                </td>
                <td>
                  <strong>A+</strong>
                </td>
                <td>
                  <strong>A+</strong>
                </td>
                <td>
                  <strong>A+</strong>
                </td>
                {/* Quarterly Values - Show grades from API */}
                <td>
                  <strong>
                    {getAdditionalMarks("Quarterly", "gk") || "A+"}
                  </strong>
                </td>
                <td>
                  <strong>
                    {getAdditionalMarks("Quarterly", "computer") || "A+"}
                  </strong>
                </td>
                <td>
                  <strong>
                    {getAdditionalMarks("Quarterly", "drawing") || "A+"}
                  </strong>
                </td>
                {/* Half Yearly Values - Show grades from API */}
                <td>
                  <strong>
                    {getAdditionalMarks("Half Yearly", "gk") || "A+"}
                  </strong>
                </td>
                <td>
                  <strong>
                    {getAdditionalMarks("Half Yearly", "computer") || "A+"}
                  </strong>
                </td>
                <td>
                  <strong>
                    {getAdditionalMarks("Half Yearly", "drawing") || "A+"}
                  </strong>
                </td>
                {/* Annual Values - Show grades from API */}
                <td>
                  <strong>{getAdditionalMarks("Annual", "gk") || "A+"}</strong>
                </td>
                <td>
                  <strong>
                    {getAdditionalMarks("Annual", "computer") || "A+"}
                  </strong>
                </td>
                <td>
                  <strong>
                    {getAdditionalMarks("Annual", "drawing") || "A+"}
                  </strong>
                </td>
              </tr>

              {/* ADDITIONAL SUBJECT GRADE ROW - This is now removed as we're showing grades directly above */}
            </tbody>
          </table>

          {/* GRADE SYSTEM */}
          <table className="ms-grade-result">
            <tbody>
              <tr>
                <th colSpan="8">GRADE SYSTEM</th>
                <th colSpan="4">RESULT</th>
              </tr>
              <tr>
                <td>GRADE</td>
                <td>A+</td>
                <td>A</td>
                <td>B+</td>
                <td>B</td>
                <td>C+</td>
                <td>C</td>
                <td>D</td>
                <td colSpan="4" rowSpan="2" className="ms-result">
                  {getGradeFromPercentage(calculateExamPercentage("Annual")) ===
                  "F"
                    ? "FAIL"
                    : "PASS"}
                </td>
              </tr>
              <tr>
                <td>PERCENTAGE</td>
                <td>86-100</td>
                <td>76-85</td>
                <td>66-75</td>
                <td>56-65</td>
                <td>51-55</td>
                <td>46-50</td>
                <td>33-45</td>
              </tr>
            </tbody>
          </table>

          {/* SIGNATURE SECTION */}
          <div className="ms-signature-section">
            <div className="ms-sign-box">
              <div className="ms-sign-line"></div>
              <div className="ms-sign-label">Class Teacher Signature</div>
            </div>

            <div className="ms-sign-box">
              <div className="ms-sign-line"></div>
              <div className="ms-sign-label">Parent Signature</div>
            </div>

            <div className="ms-sign-box">
              <div className="ms-sign-line"></div>
              <div className="ms-sign-label">Principal Signature</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPrintMarksheet;
