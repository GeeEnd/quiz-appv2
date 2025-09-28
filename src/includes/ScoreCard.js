// src/includes/ScoreCard.js
import React from "react";
import { Paper, Typography } from "@mui/material";

export default function ScoreCard({ user, score, tabSwitchCount, questions, answers }) {
  const correctCount = questions.filter(
    (q) => answers[q.ID] === q.Answer
  ).length;

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: "center" }}>
      <Typography variant="h5" sx={{ mb: 2 }}>🎉 Quiz Completed!</Typography>

      {/* <Typography variant="body1" sx={{ mb: 1 }}>
        Student: <strong>{user.Name || user.name}</strong>
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        Email: <strong>{user.Email || user.email}</strong>
      </Typography> */}

      <Typography variant="body1" sx={{ mb: 1 }}>
        Total Questions: <strong>{questions.length}</strong>
      </Typography>
      {/* <Typography variant="body1" sx={{ mb: 1 }}>
        Correct Answers: <strong>{correctCount}</strong>
      </Typography> */}

      <Typography variant="h6" sx={{ mt: 2 }}>Your Final Score:</Typography>
      <Typography variant="h3" color="primary" sx={{ mt: 1 }}>
        {score}
      </Typography>

      {/* <Typography variant="body2" sx={{ mt: 2 }}>
        Tab switches during quiz: {tabSwitchCount}
      </Typography> */}
    </Paper>
  );
}
