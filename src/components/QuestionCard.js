import React from "react";
import { Typography, Radio, RadioGroup, FormControlLabel, Paper } from "@mui/material";

export default function QuestionCard({ q, selected, onSelect }) {
  const choiceLetters = ["A", "B", "C", "D"];

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {q.Question}
      </Typography>

      <RadioGroup
        value={selected}
        onChange={(e) => onSelect(q.ID, e.target.value)}
      >
        {choiceLetters.map((letter) => (
          <FormControlLabel
            key={letter}
            value={letter}
            control={<Radio />}
            label={q[`Choice${letter}`]} // ✅ fixed here
          />
        ))}
      </RadioGroup>
    </Paper>
  );
}
