// src/includes/useQuizLogic.js
import { useState, useEffect } from "react";
import { getQuestions, saveResponse, getStudentResponse } from "../services/sheetsdb";

const shuffleArray = (array) =>
  array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

export default function useQuizLogic(user) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [started, setStarted] = useState(false);
  const [loadingScore, setLoadingScore] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

useEffect(() => {
  const loadQuestions = async () => {
    try {
      const q = await getQuestions();
      setQuestions(shuffleArray(q));

      // ✅ Check if student already submitted
      const response = await getStudentResponse(user.Email || user.email);
      if (response?.Score) {
        setScore(parseInt(response.Score));
        setSubmitted(true);
        setAnswers(JSON.parse(response.AnswersJson || "{}"));
        setMessage("✅ You have already completed the quiz.");
      }
    } catch (err) {
      console.error("❌ Failed to load questions or response:", err);
      setMessage("❌ Failed to load quiz.");
    }
  };

  if (user?.email) {
    loadQuestions();
  }
}, [user]);


  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const handleSelect = (id, choice) => {
    setAnswers((prev) => ({ ...prev, [id]: choice }));
  };

    const isCurrentQuestionAnswered = () => {
  const currentQuestion = questions[currentIndex];
  return answers[currentQuestion?.ID] !== undefined && answers[currentQuestion.ID] !== "";
};

const handleNext = () => {
  if (!isCurrentQuestionAnswered()) {
    setMessage("⚠ Please answer the current question before proceeding.");
    return;
  }
  if (currentIndex < questions.length - 1) {
    setCurrentIndex(currentIndex + 1);
    setMessage(""); // clear any previous warning
  }
};


  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };


const handleSubmit = async () => {
  if (!isCurrentQuestionAnswered()) {
    setMessage("⚠ Please answer the final question before submitting.");
    return;
  }

  try {
    setLoadingScore(true);
    let calculatedScore = 0;
    questions.forEach((q) => {
      if (answers[q.ID] === q.Answer) {
        calculatedScore += parseInt(q.Points || 1);
      }
    });

    await saveResponse({
      StudentName: user.name, // make sure lowercase
      StudentEmail: user.email,
      AnswersJson: JSON.stringify(answers), // string
      Score: calculatedScore,
      Switches: tabSwitchCount,
    });

    setScore(calculatedScore);
    setSubmitted(true);
    setLoadingScore(false);
    setMessage("✅ Quiz submitted successfully!");
  } catch (err) {
    console.error("❌ Failed to save responses:", err);
    setMessage("❌ Failed to submit quiz.");
    setLoadingScore(false);
  }
};



  return {
    questions,
    answers,
    currentIndex,
    submitted,
    score,
    message,
    started,
    loadingScore,
    tabSwitchCount,
    setStarted,
    handleSelect,
    handleNext,
    handlePrevious,
    handleSubmit,
  };
}
