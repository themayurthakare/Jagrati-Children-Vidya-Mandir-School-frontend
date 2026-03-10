import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./MarksheetClass6to8.css";

const COMarksheetClass6to8 = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { sessionId, studentId, className } = location.state || {};

  const [student, setStudent] = useState(null);
  const [session, setSession] = useState(null);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Subject visibility - Class 6-8: Science, Social Science, Sanskrit are shown
  // These are always true for Class 6-8, so we don't need setter functions
  const [showScience] = useState(true);
  const [showSocialScience] = useState(true);
  const [showSanskrit] = useState(true);
  // GK is always shown

  const fetchData = useCallback(() => {
    if (!sessionId || !studentId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const fetchStudent = fetch(
      `http://localhost:8080/api/users/${sessionId}/${studentId}`,
    ).then((res) => {
      if (!res.ok) throw new Error("Failed to fetch student");
      return res.json();
    });

    const fetchSession = fetch(
      `http://localhost:8080/api/sessions/${sessionId}`,
    ).then((res) => {
      if (!res.ok) throw new Error("Failed to fetch session");
      return res.json();
    });

    const fetchMarks = fetch(
      `http://localhost:8080/api/marks/student/${studentId}?sessionId=${sessionId}`,
    ).then((res) => {
      if (!res.ok) throw new Error("Failed to fetch marks");
      return res.json();
    });

    Promise.all([fetchStudent, fetchSession, fetchMarks])
      .then(([studentData, sessionData, marksData]) => {
        setStudent(studentData);
        setSession(sessionData);

        // Keep only Quarterly, Half Yearly, Annual
        const filteredMarks = marksData.filter((mark) =>
          ["Quarterly", "Half Yearly", "Annual"].includes(mark.examType),
        );
        setMarks(filteredMarks);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, [sessionId, studentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper to get a mark by exam type, subject and field
  const getMarksByExamType = (examType, subject, field) => {
    const examMarks = marks.find((m) => m.examType === examType);
    if (!examMarks) return "";

    // Handle special case for Social Science
    let subjectKey = subject.toLowerCase();
    if (subject === "SocialScience") subjectKey = "socialScience";

    const subjectField = `${subjectKey}${field}`;
    return examMarks[subjectField] || "";
  };

  // Helper to get a grade for additional subjects
  const getAdditionalMarks = (examType, subject) => {
    const examMarks = marks.find((m) => m.examType === examType);
    if (!examMarks) return "";
    const subjectField = `${subject.toLowerCase()}Theory`;
    return examMarks[subjectField] || "";
  };

  // Total marks for an exam
  const calculateExamTotal = (examType) => {
    const examMarks = marks.find((m) => m.examType === examType);
    if (!examMarks) return "";
    let total =
      (examMarks.hindiTotal || 0) +
      (examMarks.englishTotal || 0) +
      (examMarks.mathsTotal || 0);
    if (showScience) total += examMarks.scienceTotal || 0;
    if (showSocialScience) total += examMarks.socialScienceTotal || 0;
    if (showSanskrit) total += examMarks.sanskritTotal || 0;
    return total;
  };

  // Theory total
  const calculateExamTheoryTotal = (examType) => {
    const examMarks = marks.find((m) => m.examType === examType);
    if (!examMarks) return "";
    let total =
      (examMarks.hindiTheory || 0) +
      (examMarks.englishTheory || 0) +
      (examMarks.mathsTheory || 0);
    if (showScience) total += examMarks.scienceTheory || 0;
    if (showSocialScience) total += examMarks.socialScienceTheory || 0;
    if (showSanskrit) total += examMarks.sanskritTheory || 0;
    return total;
  };

  // Project total
  const calculateExamProjectTotal = (examType) => {
    const examMarks = marks.find((m) => m.examType === examType);
    if (!examMarks) return "";
    let total =
      (examMarks.hindiProject || 0) +
      (examMarks.englishProject || 0) +
      (examMarks.mathsProject || 0);
    if (showScience) total += examMarks.scienceProject || 0;
    if (showSocialScience) total += examMarks.socialScienceProject || 0;
    if (showSanskrit) total += examMarks.sanskritProject || 0;
    return total;
  };

  // Maximum possible totals
  const calculateMaxTotals = () => {
    const q = marks.find((m) => m.examType === "Quarterly");
    if (!q) return { theory: 0, project: 0, total: 0 };

    let theory =
      (q.hindiTheoryOutOf || 0) +
      (q.englishTheoryOutOf || 0) +
      (q.mathsTheoryOutOf || 0);
    let project =
      (q.hindiProjectOutOf || 0) +
      (q.englishProjectOutOf || 0) +
      (q.mathsProjectOutOf || 0);
    let total =
      (q.hindiTotalOutOf || 0) +
      (q.englishTotalOutOf || 0) +
      (q.mathsTotalOutOf || 0);

    if (showScience) {
      theory += q.scienceTheoryOutOf || 0;
      project += q.scienceProjectOutOf || 0;
      total += q.scienceTotalOutOf || 0;
    }
    if (showSocialScience) {
      theory += q.socialScienceTheoryOutOf || 0;
      project += q.socialScienceProjectOutOf || 0;
      total += q.socialScienceTotalOutOf || 0;
    }
    if (showSanskrit) {
      theory += q.sanskritTheoryOutOf || 0;
      project += q.sanskritProjectOutOf || 0;
      total += q.sanskritTotalOutOf || 0;
    }

    return { theory, project, total };
  };

  // Percentage for an exam
  const calculateExamPercentage = (examType) => {
    const examMarks = marks.find((m) => m.examType === examType);
    return examMarks?.percentage ? examMarks.percentage.toFixed(2) : "";
  };

  const calculateExamGrade = (examType) => {
    const percentage = calculateExamPercentage(examType);
    return getGradeFromPercentage(percentage);
  };

  // Grade from percentage
  const getGradeFromPercentage = (percentage) => {
    if (!percentage) return "";
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

  // Overall max percentage
  const calculateMaxPercentage = () => {
    const maxTotals = calculateMaxTotals();
    let totalMaxMarks = 300; // Hindi, English, Maths
    if (showScience) totalMaxMarks += 100;
    if (showSocialScience) totalMaxMarks += 100;
    if (showSanskrit) totalMaxMarks += 100;
    return ((maxTotals.total / totalMaxMarks) * 100).toFixed(2);
  };

  const quarterlyMarks = marks.find((m) => m.examType === "Quarterly");
  const maxTotals = calculateMaxTotals();
  const maxPercentage = calculateMaxPercentage();

  // Additional subjects for Class 6-8: GK only
  const additionalSubjects = [{ label: "G.K.", key: "gk", show: true }].filter(
    (subj) => subj.show,
  );

  if (loading) return <div className="loading">Loading marksheet...</div>;
  if (!student || !session) return <div className="error">No data found</div>;

  return (
    <>
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
          {/* School header */}
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

          {/* Top info table */}
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

          {/* Student details */}
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

          {/* Main marks table */}
          <table className="ms-marks-table">
            <colgroup>
              <col style={{ width: "14%" }} />
              <col style={{ width: "8.5%" }} />
              <col style={{ width: "8.5%" }} />
              <col style={{ width: "7.5%" }} />
              <col style={{ width: "8.5%" }} />
              <col style={{ width: "8.5%" }} />
              <col style={{ width: "7.5%" }} />
              <col style={{ width: "8.5%" }} />
              <col style={{ width: "8.5%" }} />
              <col style={{ width: "7.5%" }} />
              <col style={{ width: "8.5%" }} />
              <col style={{ width: "8.5%" }} />
              <col style={{ width: "7.5%" }} />
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
              {/* Main academic subjects */}
              <tr>
                <td>Hindi</td>
                <td>{quarterlyMarks?.hindiTheoryOutOf || ""}</td>
                <td>{quarterlyMarks?.hindiProjectOutOf || ""}</td>
                <td>{quarterlyMarks?.hindiTotalOutOf || ""}</td>
                <td>{getMarksByExamType("Quarterly", "Hindi", "Theory")}</td>
                <td>{getMarksByExamType("Quarterly", "Hindi", "Project")}</td>
                <td>{getMarksByExamType("Quarterly", "Hindi", "Total")}</td>
                <td>{getMarksByExamType("Half Yearly", "Hindi", "Theory")}</td>
                <td>{getMarksByExamType("Half Yearly", "Hindi", "Project")}</td>
                <td>{getMarksByExamType("Half Yearly", "Hindi", "Total")}</td>
                <td>{getMarksByExamType("Annual", "Hindi", "Theory")}</td>
                <td>{getMarksByExamType("Annual", "Hindi", "Project")}</td>
                <td>{getMarksByExamType("Annual", "Hindi", "Total")}</td>
              </tr>
              <tr>
                <td>English</td>
                <td>{quarterlyMarks?.englishTheoryOutOf || ""}</td>
                <td>{quarterlyMarks?.englishProjectOutOf || ""}</td>
                <td>{quarterlyMarks?.englishTotalOutOf || ""}</td>
                <td>{getMarksByExamType("Quarterly", "English", "Theory")}</td>
                <td>{getMarksByExamType("Quarterly", "English", "Project")}</td>
                <td>{getMarksByExamType("Quarterly", "English", "Total")}</td>
                <td>
                  {getMarksByExamType("Half Yearly", "English", "Theory")}
                </td>
                <td>
                  {getMarksByExamType("Half Yearly", "English", "Project")}
                </td>
                <td>{getMarksByExamType("Half Yearly", "English", "Total")}</td>
                <td>{getMarksByExamType("Annual", "English", "Theory")}</td>
                <td>{getMarksByExamType("Annual", "English", "Project")}</td>
                <td>{getMarksByExamType("Annual", "English", "Total")}</td>
              </tr>
              <tr>
                <td>Mathematics</td>
                <td>{quarterlyMarks?.mathsTheoryOutOf || ""}</td>
                <td>{quarterlyMarks?.mathsProjectOutOf || ""}</td>
                <td>{quarterlyMarks?.mathsTotalOutOf || ""}</td>
                <td>{getMarksByExamType("Quarterly", "Maths", "Theory")}</td>
                <td>{getMarksByExamType("Quarterly", "Maths", "Project")}</td>
                <td>{getMarksByExamType("Quarterly", "Maths", "Total")}</td>
                <td>{getMarksByExamType("Half Yearly", "Maths", "Theory")}</td>
                <td>{getMarksByExamType("Half Yearly", "Maths", "Project")}</td>
                <td>{getMarksByExamType("Half Yearly", "Maths", "Total")}</td>
                <td>{getMarksByExamType("Annual", "Maths", "Theory")}</td>
                <td>{getMarksByExamType("Annual", "Maths", "Project")}</td>
                <td>{getMarksByExamType("Annual", "Maths", "Total")}</td>
              </tr>

              {/* Science Row */}
              {showScience && (
                <tr>
                  <td>Science</td>
                  <td>{quarterlyMarks?.scienceTheoryOutOf || ""}</td>
                  <td>{quarterlyMarks?.scienceProjectOutOf || ""}</td>
                  <td>{quarterlyMarks?.scienceTotalOutOf || ""}</td>
                  <td>
                    {getMarksByExamType("Quarterly", "Science", "Theory")}
                  </td>
                  <td>
                    {getMarksByExamType("Quarterly", "Science", "Project")}
                  </td>
                  <td>{getMarksByExamType("Quarterly", "Science", "Total")}</td>
                  <td>
                    {getMarksByExamType("Half Yearly", "Science", "Theory")}
                  </td>
                  <td>
                    {getMarksByExamType("Half Yearly", "Science", "Project")}
                  </td>
                  <td>
                    {getMarksByExamType("Half Yearly", "Science", "Total")}
                  </td>
                  <td>{getMarksByExamType("Annual", "Science", "Theory")}</td>
                  <td>{getMarksByExamType("Annual", "Science", "Project")}</td>
                  <td>{getMarksByExamType("Annual", "Science", "Total")}</td>
                </tr>
              )}

              {/* Social Science Row */}
              {showSocialScience && (
                <tr>
                  <td>Social Science</td>
                  <td>{quarterlyMarks?.socialScienceTheoryOutOf || ""}</td>
                  <td>{quarterlyMarks?.socialScienceProjectOutOf || ""}</td>
                  <td>{quarterlyMarks?.socialScienceTotalOutOf || ""}</td>
                  <td>
                    {getMarksByExamType("Quarterly", "SocialScience", "Theory")}
                  </td>
                  <td>
                    {getMarksByExamType(
                      "Quarterly",
                      "SocialScience",
                      "Project",
                    )}
                  </td>
                  <td>
                    {getMarksByExamType("Quarterly", "SocialScience", "Total")}
                  </td>
                  <td>
                    {getMarksByExamType(
                      "Half Yearly",
                      "SocialScience",
                      "Theory",
                    )}
                  </td>
                  <td>
                    {getMarksByExamType(
                      "Half Yearly",
                      "SocialScience",
                      "Project",
                    )}
                  </td>
                  <td>
                    {getMarksByExamType(
                      "Half Yearly",
                      "SocialScience",
                      "Total",
                    )}
                  </td>
                  <td>
                    {getMarksByExamType("Annual", "SocialScience", "Theory")}
                  </td>
                  <td>
                    {getMarksByExamType("Annual", "SocialScience", "Project")}
                  </td>
                  <td>
                    {getMarksByExamType("Annual", "SocialScience", "Total")}
                  </td>
                </tr>
              )}

              {/* Sanskrit Row */}
              {showSanskrit && (
                <tr>
                  <td>Sanskrit</td>
                  <td>{quarterlyMarks?.sanskritTheoryOutOf || ""}</td>
                  <td>{quarterlyMarks?.sanskritProjectOutOf || ""}</td>
                  <td>{quarterlyMarks?.sanskritTotalOutOf || ""}</td>
                  <td>
                    {getMarksByExamType("Quarterly", "Sanskrit", "Theory")}
                  </td>
                  <td>
                    {getMarksByExamType("Quarterly", "Sanskrit", "Project")}
                  </td>
                  <td>
                    {getMarksByExamType("Quarterly", "Sanskrit", "Total")}
                  </td>
                  <td>
                    {getMarksByExamType("Half Yearly", "Sanskrit", "Theory")}
                  </td>
                  <td>
                    {getMarksByExamType("Half Yearly", "Sanskrit", "Project")}
                  </td>
                  <td>
                    {getMarksByExamType("Half Yearly", "Sanskrit", "Total")}
                  </td>
                  <td>{getMarksByExamType("Annual", "Sanskrit", "Theory")}</td>
                  <td>{getMarksByExamType("Annual", "Sanskrit", "Project")}</td>
                  <td>{getMarksByExamType("Annual", "Sanskrit", "Total")}</td>
                </tr>
              )}

              {/* Grand total row */}
              <tr className="ms-grand-total-row">
                <td>
                  <strong>GRAND TOTAL</strong>
                </td>
                <td>
                  <strong>{maxTotals.theory}</strong>
                </td>
                <td>
                  <strong>{maxTotals.project}</strong>
                </td>
                <td>
                  <strong>{maxTotals.total}</strong>
                </td>
                <td>
                  <strong>{calculateExamTheoryTotal("Quarterly")}</strong>
                </td>
                <td>
                  <strong>{calculateExamProjectTotal("Quarterly")}</strong>
                </td>
                <td>
                  <strong>{calculateExamTotal("Quarterly")}</strong>
                </td>
                <td>
                  <strong>{calculateExamTheoryTotal("Half Yearly")}</strong>
                </td>
                <td>
                  <strong>{calculateExamProjectTotal("Half Yearly")}</strong>
                </td>
                <td>
                  <strong>{calculateExamTotal("Half Yearly")}</strong>
                </td>
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

              {/* Percentage row */}
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

              {/* Grade row */}
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

              {/* ADDITIONAL SUBJECTS SECTION - GK only */}
              {additionalSubjects.length > 0 && (
                <>
                  {/* Row with ADDITIONAL SUBJECT label spanning two rows */}
                  <tr>
                    <td
                      rowSpan="2"
                      className="ms-bold"
                      style={{
                        verticalAlign: "middle",
                        backgroundColor: "#f2f2f2",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      ADDITIONAL SUBJECT
                    </td>
                  </tr>

                  {/* Sub-header row - G.K. headers under each section */}
                  <tr className="additional-subject-headers">
                    <td
                      style={{
                        fontWeight: "bold",
                        backgroundColor: "#f2f2f2",
                        textAlign: "center",
                      }}
                    >
                      G.K.
                    </td>
                    <td
                      style={{
                        fontWeight: "bold",
                        backgroundColor: "#f2f2f2",
                        textAlign: "center",
                      }}
                    >
                      G.K.
                    </td>
                    <td
                      style={{
                        fontWeight: "bold",
                        backgroundColor: "#f2f2f2",
                        textAlign: "center",
                      }}
                    >
                      G.K.
                    </td>
                    <td
                      style={{
                        fontWeight: "bold",
                        backgroundColor: "#f2f2f2",
                        textAlign: "center",
                      }}
                    >
                      G.K.
                    </td>
                  </tr>

                  {/* Values row - GRADE and actual values */}
                  <tr className="grade-values-row">
                    <td
                      className="ms-bold"
                      style={{
                        verticalAlign: "middle",
                        backgroundColor: "#f2f2f2",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      GRADE
                    </td>

                    {/* Maximum value - A+ */}
                    <td style={{ textAlign: "center", fontWeight: "bold" }}>
                      <strong>A+</strong>
                    </td>

                    {/* Quarterly value */}
                    <td style={{ textAlign: "center", fontWeight: "bold" }}>
                      <strong>
                        {getAdditionalMarks("Quarterly", "gk") || "A+"}
                      </strong>
                    </td>

                    {/* Half Yearly value */}
                    <td style={{ textAlign: "center", fontWeight: "bold" }}>
                      <strong>
                        {getAdditionalMarks("Half Yearly", "gk") || "A+"}
                      </strong>
                    </td>

                    {/* Annual value */}
                    <td style={{ textAlign: "center", fontWeight: "bold" }}>
                      <strong>
                        {getAdditionalMarks("Annual", "gk") || "A+"}
                      </strong>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>

          {/* Grade system and result */}
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

          {/* Signatures */}
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

export default COMarksheetClass6to8;
