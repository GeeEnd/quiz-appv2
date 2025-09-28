// // src/pages/TeacherDashboard.js
// import React, { useEffect, useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import {
//   Box,
//   Typography,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   CircularProgress,
// } from "@mui/material";
// import { getResponses, getQuestions } from "../services/sheetsdb";
// import { useNavigate } from "react-router-dom";

// export default function TeacherDashboard() {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const [responses, setResponses] = useState([]);
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // Fetch responses and questions
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [respData, qData] = await Promise.all([getResponses(), getQuestions()]);
//         setResponses(respData);
//         setQuestions(qData.sort((a, b) => a.ID - b.ID)); // Keep questions as array
//       } catch (err) {
//         console.error("Frontend fetch error:", err);
//         setError("❌ Failed to fetch data.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   // Parse answers safely
//   const parseAnswers = (answersJson) => {
//     try {
//       return typeof answersJson === "string" ? JSON.parse(answersJson) : answersJson;
//     } catch {
//       return {};
//     }
//   };

//   // CSV Export
//   const handleExportCSV = () => {
//     if (!responses.length || !questions.length) return;

//     const headers = ["Timestamp", "Student Name", "Student Email", ...questions.map(q => `Q${q.ID}`), "Score"];
//     const rows = responses.map(r => {
//       const answers = parseAnswers(r.AnswersJson);
//       let totalScore = 0;
//       const answerRow = questions.map(q => {
//         const studentAnswer = answers[q.ID] || "";
//         if (studentAnswer === q.Answer) totalScore += parseInt(q.Points || 1);
//         return studentAnswer;
//       });
//       return [r.Timestamp, r.StudentName, r.StudentEmail, ...answerRow, totalScore];
//     });

//     const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.setAttribute("href", url);
//     link.setAttribute("download", "student_responses.csv");
//     link.click();
//   };

//   return (
//     <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
//       <Typography variant="h4" sx={{ mb: 3 }}>
//         Welcome, {user.name} (Teacher)!
//       </Typography>
//       <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
//         <Button variant="contained" color="secondary" onClick={handleLogout}>
//           Logout
//         </Button>
//         <Button variant="contained" color="primary" onClick={handleExportCSV}>
//           Export CSV
//         </Button>
//       </Box>

//       {loading ? (
//         <CircularProgress />
//       ) : error ? (
//         <Typography color="error">{error}</Typography>
//       ) : (
//         <TableContainer component={Paper}>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>Timestamp</TableCell>
//                 <TableCell>Student Name</TableCell>
//                 <TableCell>Student Email</TableCell>
//                 {questions.map((q) => (
//                   <TableCell key={q.ID}>Q{q.ID}</TableCell>
//                 ))}
//                 <TableCell>Score</TableCell>
//                 <TableCell>Switches</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {responses.map((r, idx) => {
//                 const answers = parseAnswers(r.AnswersJson);
//                 let totalScore = 0;
//                 return (
//                   <TableRow key={idx}>
//                     <TableCell>{r.Timestamp}</TableCell>
//                     <TableCell>{r.StudentName}</TableCell>
//                     <TableCell>{r.StudentEmail}</TableCell>
//                     {questions.map((q) => {
//                       const studentAnswer = answers[q.ID] || "";
//                       const isCorrect = studentAnswer === q.Answer;
//                       if (isCorrect) totalScore += parseInt(q.Points || 1);
//                       return (
//                         <TableCell
//                           key={q.ID}
//                           sx={{ color: isCorrect ? "green" : "red", fontWeight: "bold" }}
//                         >
//                           {studentAnswer}
//                         </TableCell>
//                       );
//                     })}
//                     <TableCell>{totalScore}</TableCell>
//                      <TableCell>{Switches}</TableCell>
//                   </TableRow>
//                 );
//               })}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       )}
//     </Box>
//   );
// }

import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import { getResponses, getQuestions } from "../services/sheetsdb";
import { useNavigate } from "react-router-dom";

// Excel export
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [responses, setResponses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [respData, qData] = await Promise.all([getResponses(), getQuestions()]);
        setResponses(respData);
        setQuestions(qData.sort((a, b) => a.ID - b.ID));
      } catch (err) {
        console.error("Frontend fetch error:", err);
        setError("❌ Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const parseAnswers = (answersJson) => {
    try {
      return typeof answersJson === "string" ? JSON.parse(answersJson) : answersJson;
    } catch {
      return {};
    }
  };

  // Excel export with colors
  const handleExportExcel = () => {
    const ws_data = [
      ["Timestamp", "Student Name", "Student Email", ...questions.map(q => `Q${q.ID}`), "Score", "Switches"]
    ];

    responses.forEach(r => {
      const answers = parseAnswers(r.AnswersJson);
      let totalScore = 0;
      const row = [r.Timestamp, r.StudentName, r.StudentEmail];

      questions.forEach(q => {
        const studentAnswer = answers[q.ID] || "";
        const isCorrect = studentAnswer === q.Answer;
        if (isCorrect) totalScore += parseInt(q.Points || 1);

        // We'll store answer + mark correct/wrong in text, Excel cell styling will be added later
        row.push((isCorrect ? " ✔" : " ❌"));
      });

      row.push(totalScore);
      row.push(r.Switches || 0);
      ws_data.push(row);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Apply color styles
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = 1; R <= range.e.r; ++R) { // skip header
      for (let C = 3; C < 3 + questions.length; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = ws[cellAddress];
        if (!cell) continue;
        if (cell.v.includes("✔")) {
          cell.s = { fill: { fgColor: { rgb: "C6EFCE" } }, font: { color: { rgb: "006100" } } }; // green
        } else if (cell.v.includes("❌")) {
          cell.s = { fill: { fgColor: { rgb: "FFC7CE" } }, font: { color: { rgb: "9C0006" } } }; // red
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, "Responses");
    XLSX.writeFile(wb, "student_responses.xlsx");
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Welcome, {user.name} (Teacher)!
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
        <Button variant="contained" color="primary" onClick={handleExportExcel}>
          Export Excel
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                
                <TableCell>Student Name</TableCell>
                <TableCell>Student Email</TableCell>
                {questions.map(q => <TableCell key={q.ID}>Q{q.ID}</TableCell>)}
                <TableCell>Score</TableCell>
                <TableCell>Switches</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {responses.map((r, idx) => {
                const answers = parseAnswers(r.AnswersJson);
                let totalScore = 0;
                return (
                  <TableRow key={idx}>
                    <TableCell>{r.Timestamp}</TableCell>
                    <TableCell>{r.StudentName}</TableCell>
                    <TableCell>{r.StudentEmail}</TableCell>
                    {questions.map(q => {
                      const studentAnswer = answers[q.ID] || "";
                      const isCorrect = studentAnswer === q.Answer;
                      if (isCorrect) totalScore += parseInt(q.Points || 1);
                      return (
                        <TableCell key={q.ID} sx={{ color: isCorrect ? "green" : "red" }}>
                          {studentAnswer}
                        </TableCell>
                      );
                    })}
                    <TableCell>{totalScore}</TableCell>
                   <TableCell>{r.Switches !== undefined ? r.Switches : 0}</TableCell>

                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
