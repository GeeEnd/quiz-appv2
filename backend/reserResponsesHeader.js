import dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

// Google Sheets Auth
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

async function resetResponsesHeader() {
  try {
    const headerRow = [
      [
        "Timestamp",
        "StudentName",
        "StudentEmail",
        "AnswersJson",
        "Score",
        "Switches",
        "SectionCode",
      ],
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: "Responses!A1:G1",
      valueInputOption: "RAW",
      requestBody: {
        values: headerRow,
      },
    });

    console.log("✅ Responses sheet header reset successfully!");
  } catch (err) {
    console.error("❌ Error resetting header:", err);
  }
}

resetResponsesHeader();
