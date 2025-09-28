import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  LinearProgress,
} from "@mui/material";
import QuestionCard from "../components/QuestionCard";
import ScoreCard from "./ScoreCard";

export default function QuizLayout({
  user,
  logout,
  message,
  submitted,
  loadingScore,
  score,
  tabSwitchCount,
  questions,
  currentIndex,
  answers,
  handleSelect,
  handlePrevious,
  handleNext,
  handleSubmit,
}) {
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // Timer state in seconds (1 hour = 3600s)
  const [timeLeft, setTimeLeft] = useState(3600);
  const [locked, setLocked] = useState(false);

  // Countdown effect
  useEffect(() => {
    if (submitted) return; // stop countdown if already submitted
    if (timeLeft <= 0) {
      setLocked(true);
      setTimeLeft(0);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  // Format timer as HH:MM:SS
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">Quiz App</Typography>
        <Button variant="outlined" color="secondary" onClick={logout}>
          Logout
        </Button>
      </Box>

      {/* Timer display */}
      {!submitted && (
        <Alert severity={locked ? "error" : "info"} sx={{ mb: 2 }}>
          Time Left: {formatTime(timeLeft)} {locked && "⏰ Time's up! Quiz is locked."}
        </Alert>
      )}

      {message && (
        <Alert severity={message.startsWith("✅") ? "success" : "error"} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      {submitted || locked ? (
        loadingScore ? (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Calculating your score...</Typography>
            <LinearProgress sx={{ height: 8, borderRadius: 5 }} />
          </Box>
        ) : (
          <ScoreCard
            user={user}
            score={score}
            tabSwitchCount={tabSwitchCount}
            questions={questions}
            answers={answers}
          />
        )
      ) : (
        <>
          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 10, borderRadius: 5 }}
            />
            <Typography variant="body2" sx={{ mt: 0.5, textAlign: "center" }}>
              Question {currentIndex + 1} of {questions.length}
            </Typography>
          </Box>

          <QuestionCard
            q={currentQuestion}
            selected={answers[currentQuestion.ID] || ""}
            onSelect={locked ? undefined : handleSelect} // disable selection if locked
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handlePrevious}
              disabled={currentIndex === 0 || locked} // disable if locked
            >
              Previous
            </Button>

            {currentIndex < questions.length - 1 ? (
              <Button variant="contained" onClick={handleNext} disabled={locked}>
                Next
              </Button>
            ) : (
              <Button variant="contained" color="primary" onClick={handleSubmit} disabled={locked}>
                Submit Quiz
              </Button>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
