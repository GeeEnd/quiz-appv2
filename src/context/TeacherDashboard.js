
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
  };// TXT export for Test Checker / Item Analyzer

  
// ✅ TXT export for Test Checker / Item Analyzer
const handleExportTxt = () => {
  if (!questions || questions.length === 0) return;

  // 1️⃣ Build Answer Key (line 1)
  const answerKey =
    "00000" + questions.map((q) => (q.Answer ? q.Answer : "-")).join("");

  // 2️⃣ Build Item Numbers (line 2, all "1"s)
  const itemLine = "00000" + "1".repeat(questions.length);

  // 3️⃣ Build & sort Student Responses
  const studentLines = responses
    .map((r, idx) => {
      const answers = parseAnswers(r.AnswersJson);
      const answerString = questions
        .map((q) => (answers[q.ID] ? answers[q.ID] : "-"))
        .join("");

      // Always pad StudentID to 5 digits
      const studentId = String(r.ID ?? idx).padStart(5, "0");

      return { studentId, line: `${studentId}${answerString}` };
    })
    // 🔑 Sort numerically by StudentID so analyzer can read it
    .sort((a, b) => Number(a.studentId) - Number(b.studentId))
    .map((entry) => entry.line);

  // 4️⃣ Combine all lines
  const lines = [answerKey, itemLine, ...studentLines];

  // 5️⃣ Export as text file
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "responses.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};


  const handleExportExcel = () => {
    const ws_data = [
      [
        "Timestamp",
        "Student Name",
        "Student Email",
        "SectionCode", // ✅ Correct column
        ...questions.map((q) => `Q${q.ID}`),
        "Score",
        "Switches",
      ],
    ];

    responses.forEach((r) => {
      const answers = parseAnswers(r.AnswersJson);
      let totalScore = 0;

      // Base row with SectionCode
      const row = [
        r.Timestamp,
        r.StudentName,
        r.StudentEmail,
        r.SectionCode || "N/A", // ✅ SectionCode
      ];

      // Add answers with ✔ / ❌
      questions.forEach((q) => {
        const studentAnswer = answers[q.ID] || "";
        const isCorrect = studentAnswer === q.Answer;
        if (isCorrect) totalScore += parseInt(q.Points || 1);

        row.push(`${studentAnswer} ${isCorrect ? "✔" : "❌"}`);
      });

      // Add final Score + Switches
      row.push(r.Score || totalScore);
      row.push(r.Switches || 0);

      ws_data.push(row);
    });

    // Build Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Apply colors to answers
    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let R = 1; R <= range.e.r; ++R) {
      for (let C = 4; C < 4 + questions.length; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = ws[cellAddress];
        if (!cell) continue;

        if (cell.v.includes("✔")) {
          cell.s = {
            fill: { fgColor: { rgb: "C6EFCE" } },
            font: { color: { rgb: "006100" } },
          }; // green
        } else if (cell.v.includes("❌")) {
          cell.s = {
            fill: { fgColor: { rgb: "FFC7CE" } },
            font: { color: { rgb: "9C0006" } },
          }; // red
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
        <Button variant="contained" color="success" onClick={handleExportTxt}>
  Export TXT
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
                <TableCell>SectionCode</TableCell>
                {questions.map((q) => (
                  <TableCell key={q.ID}>Q{q.ID}</TableCell>
                ))}
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
                    <TableCell>{r.SectionCode || "N/A"}</TableCell>
                    {questions.map((q) => {
                      const studentAnswer = answers[q.ID] || "";
                      const isCorrect = studentAnswer === q.Answer;
                      if (isCorrect) totalScore += parseInt(q.Points || 1);
                      return (
                        <TableCell
                          key={q.ID}
                          sx={{ color: isCorrect ? "green" : "red" }}
                        >
                          {studentAnswer}
                        </TableCell>
                      );
                    })}
                    <TableCell>{totalScore}</TableCell>
                    <TableCell>
                      {r.Switches !== undefined ? r.Switches : 0}
                    </TableCell>
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
