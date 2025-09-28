
// // src/pages/QuizPage.js
// import React, { useState, useEffect } from "react";
// import { useAuth } from "../context/AuthContext";
// import { getQuestions, saveResponse } from "../services/sheetsdb";

// import {
//   Box,
//   Typography,
//   Button,
//   Alert,
//   LinearProgress,
//   Paper,
// } from "@mui/material";
// import QuestionCard from "../components/QuestionCard";

// // Utility to shuffle questions
// const shuffleArray = (array) =>
//   array
//     .map((value) => ({ value, sort: Math.random() }))
//     .sort((a, b) => a.sort - b.sort)
//     .map(({ value }) => value);

// export default function QuizPage() {
//   const { user } = useAuth();
//   const {  loading } = useAuth();

//   const [questions, setQuestions] = useState([]);
//   const [answers, setAnswers] = useState({});
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [submitted, setSubmitted] = useState(false);
//   const [score, setScore] = useState(0);
//   const [message, setMessage] = useState("");
//   const [started, setStarted] = useState(false);
// const { logout } = useAuth();
// const [loadingScore, setLoadingScore] = useState(false);

//   const [tabSwitchCount, setTabSwitchCount] = useState(0); // Track tab switches

//   // Load and shuffle questions
//   useEffect(() => {
//     const loadQuestions = async () => {
//       try {
//         const q = await getQuestions();
//         setQuestions(shuffleArray(q));
//       } catch (err) {
//         console.error("❌ Failed to load questions:", err);
//         setMessage("❌ Failed to load questions.");
//       }
//     };
//     loadQuestions();
//   }, []);

//   // Detect tab switches
//   useEffect(() => {
//     const handleVisibilityChange = () => {
//       if (document.hidden) {
//         setTabSwitchCount((prev) => prev + 1);
//         // Optional: alert the student
//         // alert("⚠ You switched tabs! This will be tracked.");
//       }
//     };
//     document.addEventListener("visibilitychange", handleVisibilityChange);
//     return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
//   }, []);

//   if (!user) return <Typography>Please log in to take the quiz.</Typography>;
//   if (questions.length === 0) return <Typography>Loading questions...</Typography>;

//   const currentQuestion = questions[currentIndex];
//   const progress = ((currentIndex + 1) / questions.length) * 100;

//   const handleSelect = (id, choice) => {
//     setAnswers((prev) => ({ ...prev, [id]: choice }));
//   };

//   const handleNext = () => {
//     if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
//   };

//   const handlePrevious = () => {
//     if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
//   };
// const handleSubmit = async () => {
//   try {
//     setLoadingScore(true); // Start loading
//     let calculatedScore = 0;
//     questions.forEach((q) => {
//       if (answers[q.ID] === q.Answer) {
//         calculatedScore += parseInt(q.Points || 1);
//       }
//     });

//     await saveResponse({
//       Timestamp: new Date().toISOString(),
//       StudentName: user.Name || user.name,
//       StudentEmail: user.Email || user.email,
//       AnswersJson: JSON.stringify(answers),
//       Score: calculatedScore,
//       Switches: tabSwitchCount,
//     });

//     setTimeout(() => {
//       setScore(calculatedScore);
//       setSubmitted(true);
//       setLoadingScore(false);
//       setMessage("✅ Quiz submitted successfully!");
//     }, 3000); // Simulate 3-second delay
//   } catch (err) {
//     console.error("❌ Failed to save responses:", err);
//     setMessage("❌ Failed to submit quiz.");
//     setLoadingScore(false);
//   }
// };

// if (loading) return <Typography>Loading user session...</Typography>;
// if (!user) return <Typography>Please log in to take the quiz.</Typography>;

//   // -------------------
//   // START SCREEN
//   // -------------------
//   if (!started) {
//     return (
      
//       <Box sx={{ maxWidth: 700, mx: "auto", p: 3 }}>
//         <Paper sx={{ p: 4, textAlign: "center" }}>
//           <Typography variant="h4" sx={{ mb: 2 }}>
//             Welcome, {user.Name || user.name}!
//           </Typography>
//           <Typography variant="body1" sx={{ mb: 3 }}>
//             Please read the instructions before starting the quiz:
//           </Typography>
//           <Typography variant="body2" sx={{ textAlign: "left", mb: 3 }}>
//             1. The quiz contains {questions.length} questions. <br />
//             2. Each question has only one correct answer. <br />
//             3. You cannot go back to change answers after submitting the quiz. <br />
//             4. Your answers will be saved automatically when you submit. <br />
//             5. Switching tabs will be tracked.
//           </Typography>
//           <Button variant="contained" color="primary" onClick={() => setStarted(true)}>
//             Start Quiz
//           </Button>
//         </Paper>
//       </Box>
//     );
//   }

//   // -------------------
//   // QUIZ SCREEN
//   // -------------------
//  return (
//   <Box sx={{ maxWidth: 700, mx: "auto", p: 3 }}>
//     {/* Top bar with logout */}
//     <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
//       <Typography variant="h6">Quiz App</Typography>
//       <Button variant="outlined" color="secondary" onClick={logout}>
//         Logout
//       </Button>
//     </Box>

//     {/* Alert message */}
//     {message && (
//       <Alert severity={message.startsWith("✅") ? "success" : "error"} sx={{ mb: 2 }}>
//         {message}
//       </Alert>
//     )}

//     {/* Quiz in progress */}
//     {!submitted ? (
//       <>
//         {/* Progress bar */}
//         <Box sx={{ mb: 2 }}>
//           <LinearProgress
//             variant="determinate"
//             value={progress}
//             sx={{ height: 10, borderRadius: 5 }}
//           />
//           <Typography variant="body2" sx={{ mt: 0.5, textAlign: "center" }}>
//             Question {currentIndex + 1} of {questions.length}
//           </Typography>
//           {/* <Typography variant="body2" sx={{ textAlign: "center", mt: 1, color: "red" }}>
//             Tab switches: {tabSwitchCount}
//           </Typography> */}
//         </Box>

//         {/* Current question */}
//         <QuestionCard
//           q={currentQuestion}
//           selected={answers[currentQuestion.ID] || ""}
//           onSelect={handleSelect}
//         />

//         {/* Navigation buttons */}
//         <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
//           <Button
//             variant="outlined"
//             onClick={handlePrevious}
//             disabled={currentIndex === 0}
//           >
//             Previous
//           </Button>

//           {currentIndex < questions.length - 1 ? (
//             <Button variant="contained" onClick={handleNext}>
//               Next
//             </Button>
//           ) : (
//             <Button variant="contained" color="primary" onClick={handleSubmit}>
//               Submit Quiz
//             </Button>
//           )}
//         </Box>
//       </>
//     ) : (
//       <>
//         {/* Loading spinner or score card */}
//         {loadingScore ? (
//           <Box sx={{ textAlign: "center", mt: 4 }}>
//             <Typography variant="h6" sx={{ mb: 2 }}>Calculating your score...</Typography>
//             <LinearProgress sx={{ height: 8, borderRadius: 5 }} />
//           </Box>
//         ) : (
//           <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: "center" }}>
//             <Typography variant="h5" sx={{ mb: 2 }}>🎉 Quiz Completed!</Typography>
//             <Typography variant="h6">Your Score:</Typography>
//             <Typography variant="h3" color="primary" sx={{ mt: 1 }}>
//               {score}
//             </Typography>
//             <Typography variant="body2" sx={{ mt: 2 }}>
//               Tab switches during quiz: {tabSwitchCount}
//             </Typography>
//           </Paper>
//         )}
//       </>
//     )}
//   </Box>
// );
// }

// src/pages/QuizPage.js
// src/pages/QuizPage.js
import React from "react";
import { useAuth } from "../context/AuthContext";
import useQuizLogic from "../includes/useQuizLogic";
import StartScreen from "../includes/StartScreen";
import QuizLayout from "../includes/QuizLayout";
import { Typography } from "@mui/material";

export default function QuizPage() {
  const { user, logout, loading } = useAuth();
  const quiz = useQuizLogic(user);

  if (loading) return <Typography>Loading user session...</Typography>;
  if (!user) return <Typography>Please log in to take the quiz.</Typography>;
  if (quiz.questions.length === 0) return <Typography>Loading questions...</Typography>;

  // ✅ If already submitted, show score directly
  if (quiz.submitted) {
    return (
      <QuizLayout
        user={user}
        logout={logout}
        message={quiz.message}
        submitted={true}
        loadingScore={quiz.loadingScore}
        score={quiz.score}
        tabSwitchCount={quiz.tabSwitchCount}
        questions={quiz.questions}
        answers={quiz.answers}
        currentIndex={quiz.currentIndex}
        handleSelect={quiz.handleSelect}
        handlePrevious={quiz.handlePrevious}
        handleNext={quiz.handleNext}
        handleSubmit={quiz.handleSubmit}
      />
    );
  }

  // ✅ If not started yet, show instructions
  if (!quiz.started) {
    return (
      <StartScreen
        user={user}
        questions={quiz.questions}
        onStart={() => quiz.setStarted(true)}
      />
    );
  }

  // ✅ Otherwise, show quiz layout
  return (
    <QuizLayout
      user={user}
      logout={logout}
      message={quiz.message}
      submitted={false}
      loadingScore={quiz.loadingScore}
      score={quiz.score}
      tabSwitchCount={quiz.tabSwitchCount}
      questions={quiz.questions}
      answers={quiz.answers}
      currentIndex={quiz.currentIndex}
      handleSelect={quiz.handleSelect}
      handlePrevious={quiz.handlePrevious}
      handleNext={quiz.handleNext}
      handleSubmit={quiz.handleSubmit}
    />
  );
}
