// src/includes/StartScreen.js
import React from "react";
import { Box, Paper, Typography, Button } from "@mui/material";

export default function StartScreen({ user, questions, onStart }) {
  return (
    <Box sx={{ maxWidth: 700, mx: "auto", p: 3 }}>
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Welcome, {user.Name || user.name}!
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Please read the instructions before starting the quiz:
        </Typography>
        <Typography variant="body2" sx={{ textAlign: "left", mb: 3 }}>
          1. The quiz contains {questions.length} questions. <br />
          2. Each question has only one correct answer. <br />
          3. You cannot go back to change answers after submitting the quiz. <br />
          4. Your answers will be saved automatically when you submit. <br />
          5. Switching tabs will be tracked.
        </Typography>
        <Button variant="contained" color="primary" onClick={onStart}>
          Start Quiz
        </Button>
      </Paper>
    </Box>
  );
}
