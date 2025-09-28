// // src/services/sheetsdb.js
// const BASE_URL = process.env.REACT_APP_SHEETDB_BASE_URL;
// console.log("BASE_URL =", BASE_URL);

// const headers = {
//   "Content-Type": "application/json",
// };

// // ----------------------
// // LOGIN
// // ----------------------
// export const loginUser = async ({ email, password }) => {
//   const resp = await fetch(
//     `${process.env.REACT_APP_SHEETDB_BASE_URL}/search?sheet=Users&Email=${encodeURIComponent(email)}&Password=${encodeURIComponent(password)}`,
//     { headers: { "Content-Type": "application/json" } }
//   );

//   if (!resp.ok) throw new Error("❌ Failed to login");

//   const data = await resp.json();
//   return data.length > 0 ? data[0] : null;
// };



// // ----------------------
// // USERS
// // ----------------------
// export const registerUser = async ({ name, section, email, password }) => {
//   const resp = await fetch(`${BASE_URL}?sheet=Users`, {
//     method: "POST",
//     headers,
//     body: JSON.stringify({
//       data: [
//         {
//           Timestamp: new Date().toISOString(),
//           Name: name,
//           Section: section,
//           Email: email,
//           Password: password,
//         },
//       ],
//     }),
//   });

//   if (!resp.ok) throw new Error("❌ Failed to register user");
//   return resp.json();
// };

// export const getUsers = async () => {
//   const resp = await fetch(`${BASE_URL}?sheet=Users`, { headers });
//   if (!resp.ok) throw new Error("❌ Failed to fetch users");
//   return resp.json();
// };

// // ----------------------
// // QUESTIONS
// // ----------------------
// export const getQuestions = async () => {
//   const resp = await fetch(`${BASE_URL}?sheet=Questions`, { headers });
//   if (!resp.ok) throw new Error("❌ Failed to fetch questions");

//   const data = await resp.json();

//   return data.map((q) => ({
//     ID: q.ID,
//     Question: q.Question,
//     "Choice A": q["Choice A"],
//     "Choice B": q["Choice B"],
//     "Choice C": q["Choice C"],
//     "Choice D": q["Choice D"],
//     Answer: q.Answer,
//     Points: q.Points,
//   }));
// };

// // ----------------------
// // RESPONSES
// // ----------------------
// export const saveResponse = async ({ studentName, studentEmail, answers, score }) => {
//   const resp = await fetch(`${BASE_URL}?sheet=Responses`, {
//     method: "POST",
//     headers,
//     body: JSON.stringify({
//       data: [
//         {
//           Timestamp: new Date().toISOString(),
//           StudentName: studentName,
//           StudentEmail: studentEmail,
//           AnswersJson: JSON.stringify(answers),
//           Score: score,
//         },
//       ],
//     }),
//   });

//   if (!resp.ok) throw new Error("❌ Failed to save response");
//   return resp.json();
// };
// src/services/sheetsdb.js
const headers = { "Content-Type": "application/json" };
const BASE_API = "/api"; // proxy handles port forwarding in dev

// LOGIN
export const loginUser = async ({ email, password }) => {
  const resp = await fetch(`${BASE_API}/login`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email, password }),
  });

  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.error || "❌ Invalid email or password");
  }

  return resp.json(); // returns user object from backend
};

// REGISTER
export const registerUser = async ({ name, section, email, password }) => {
  const resp = await fetch(`${BASE_API}/register`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name, section, email, password }),
  });

  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.error || "❌ Failed to register user");
  }

  return resp.json();
};

// GET QUESTIONS
export const getQuestions = async () => {
  const resp = await fetch(`${BASE_API}/questions`);
  if (!resp.ok) throw new Error("❌ Failed to fetch questions");
  return resp.json();
};

// SAVE RESPONSES
// SAVE RESPONSES
export const saveResponse = async (responseData) => {
  const resp = await fetch("/api/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      StudentName: responseData.StudentName,
      StudentEmail: responseData.StudentEmail,
      AnswersJson: responseData.AnswersJson, // must be string
      Score: responseData.Score,
      Switches: responseData.Switches || 0,
    }),
  });

  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.error || "❌ Failed to save responses");
  }

  return resp.json();
};



export async function getStudentResponse(email) {
  const all = await getResponses(); // assumes this returns an array of responses
  return all.find((r) => r.StudentEmail === email);
}


export const getResponses = async () => {
  const resp = await fetch("/api/responses"); // new GET endpoint
  if (!resp.ok) throw new Error("❌ Failed to fetch responses");
  return resp.json();
};