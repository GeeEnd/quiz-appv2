// backend/server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

// ---------------------
// Google Sheets Auth
// ---------------------
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

// ---------------------
// LOGIN
// ---------------------
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Users!A:E",
    });

    const rows = response.data.values || [];
    const userRow = rows
      .slice(1)
      .find((row) => row[3] === email && row[4] === password);

    if (!userRow)
      return res.status(401).json({ error: "Invalid email or password" });

    const user = {
      name: userRow[1],
      sectionCode: userRow[2],
      email: userRow[3],
    };

    res.json(user);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------
// REGISTER
// ---------------------
app.post("/api/register", async (req, res) => {
  const { name, section, email, password } = req.body;

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Users!A:E",
      valueInputOption: "RAW",
      requestBody: {
        values: [[new Date().toISOString(), name, section, email, password]],
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------
// GET QUESTIONS (shuffled)
// ---------------------
app.get("/api/questions", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Questions!A:H",
    });

    const rows = response.data.values || [];
    let questions = rows.slice(1).map((row) => ({
      ID: row[0],
      Question: row[1],
      ChoiceA: row[2],
      ChoiceB: row[3],
      ChoiceC: row[4],
      ChoiceD: row[5],
      Answer: row[6],
      Points: Number(row[7] || 1),
    }));

    // Shuffle
    questions = questions
      .map((q) => ({ value: q, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    res.json(questions);
  } catch (err) {
    console.error("Get questions error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------
// SAVE RESPONSES
// ---------------------
app.post("/api/responses", async (req, res) => {
  const {
    StudentName,
    StudentEmail,
    SectionCode,
    AnswersJson,
    Score,
    Switches,
  } = req.body;

  if (!StudentEmail || !AnswersJson) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  console.log("📦 Incoming request body:", req.body);

  try {
    let sectionCode = SectionCode;

    // fallback: lookup in Users sheet if missing
    if (!sectionCode) {
      const respUsers = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "Users!A:E",
      });
      const usersRows = respUsers.data.values || [];

      const normalize = (str) =>
        str?.trim().toLowerCase().replace(/\s+/g, "").replace(/[^\w@.]/g, "");

      const incomingEmail = normalize(StudentEmail);

      const matchedUser = usersRows.slice(1).find((row) => {
        const sheetEmail = normalize(row[3]); // Column D
        return sheetEmail === incomingEmail;
      });

      sectionCode = matchedUser ? matchedUser[2] || "N/A" : "N/A";
    }

    console.log("📌 Final SectionCode:", sectionCode);

    const newRow = [
      new Date().toISOString(),
      StudentName,
      StudentEmail,
      AnswersJson,
      Score,
      Switches || 0,
      sectionCode,
    ];

    console.log("➡ Writing row to Responses:", newRow);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Responses!A:G", // 7 columns
      valueInputOption: "RAW",
      requestBody: {
        values: [newRow],
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Save response error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------
// GET ALL RESPONSES
// ---------------------
app.get("/api/responses", async (req, res) => {
  try {
    const respResponses = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Responses!A:G", // 7 columns
    });

    const responsesRows = respResponses.data.values || [];

    const enhancedResponses = responsesRows.slice(1).map((r) => ({
      Timestamp: r[0],
      StudentName: r[1],
      StudentEmail: r[2],
      AnswersJson: r[3] ? JSON.parse(r[3]) : {},
      Score: r[4],
      Switches: r[5],
      SectionCode: r[6],
    }));

    res.json(enhancedResponses);
  } catch (err) {
    console.error("Get responses error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
