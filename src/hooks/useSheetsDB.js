// src/hooks/useSheetsDB.js
import { useEffect, useState } from "react";
import { getQuestions, saveResponse } from "../services/sheetsdb";

export default function useSheetsDB() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const qs = await getQuestions();
        setQuestions(qs);
      } catch (err) {
        console.error("Error loading questions", err);
      }
    };
    load();
  }, []);

  const submitResponses = async (user, answers, score) => {
    try {
      await saveResponse({
        studentName: user.name,
        studentEmail: user.email,
        answers,
        score,
      });
    } catch (err) {
      console.error("Error saving responses", err);
    }
  };

  return { questions, submitResponses };
}
