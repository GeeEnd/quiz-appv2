import { useState } from "react";

export default function useQuiz() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const selectAnswer = (id, choice) => {
    setAnswers((prev) => ({ ...prev, [id]: choice }));
  };

  const markSubmitted = () => setSubmitted(true);

  return { answers, submitted, selectAnswer, markSubmitted };
}
