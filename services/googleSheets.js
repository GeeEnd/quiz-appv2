import { gapi } from "gapi-script";

const CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
const API_KEY = "YOUR_API_KEY";
const SHEET_ID = "YOUR_SHEET_ID"; // from Google Sheet URL
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

export const initClient = () => {
  return new Promise((resolve, reject) => {
    gapi.load("client:auth2", () => {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: [
            "https://sheets.googleapis.com/$discovery/rest?version=v4",
          ],
          scope: SCOPES,
        })
        .then(() => {
          resolve(gapi);
        })
        .catch((err) => reject(err));
    });
  });
};

export const getQuestions = async () => {
  const response = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Questions!A2:H", // skip headers
  });
  return response.result.values;
};

export const saveResponse = async (student, answers, score) => {
  await gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Responses!A:D",
    valueInputOption: "RAW",
    resource: {
      values: [[student, ...answers, score]],
    },
  });
};
