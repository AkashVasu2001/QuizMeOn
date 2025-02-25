"use client";

import { useEffect, useState, Suspense, lazy } from "react";

const QuizComponent = lazy(() => import("./Quiz"));

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
};

type QuizData = {
  title: string;
  difficulty: string;
};

const QUIZ_STORAGE_KEY = "quizData";

export default function QuizPage() {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedQuiz = localStorage.getItem(QUIZ_STORAGE_KEY);

      if (savedQuiz) {
        try {
          const parsedQuiz = JSON.parse(savedQuiz);
          setQuizData({ title: parsedQuiz.title, difficulty: parsedQuiz.difficulty });
          setQuizQuestions(parsedQuiz.questions);
          console.log("Loaded quiz data from storage:", parsedQuiz);
        } catch (error) {
          console.error("Error parsing stored quiz data:", error);
          localStorage.removeItem(QUIZ_STORAGE_KEY);
          fetchQuiz();
        }
      } else {
        fetchQuiz();
      }
    }
  }, []);

  const fetchQuiz = async () => {
    try {
      console.log("Fetching quiz...");
      const response = await fetch("/api/quiz");

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched quiz data:", data);

      if (!data || !data.questions || data.questions.length === 0) {
        console.warn("Fetched quiz data is empty.");
        return;
      }

      setQuizData({ title: data.title, difficulty: data.difficulty });
      setQuizQuestions(data.questions);
      localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to fetch quiz:", error);
    }
  };

  if (!quizData || quizQuestions.length === 0) {
    return <div className="text-center text-lg">Loading Quiz...</div>;
  }

  return (
    <Suspense fallback={<div className="text-center text-lg">Loading Quiz...</div>}>
      <QuizComponent quizData={quizData} quizQuestions={quizQuestions} />
    </Suspense>
  );
}
