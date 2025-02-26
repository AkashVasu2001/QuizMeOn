"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SCORE_STORAGE_KEY = "quizScore";
const QUIZ_STORAGE_KEY = "quizData";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuizData {
  title: string;
  difficulty: string;
  questions: Question[];
}

export default function QuizResult() {
  const [quizTitle, setQuizTitle] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Retrieve the stored quiz title safely
    const storedTitleJSON = localStorage.getItem(QUIZ_STORAGE_KEY);
    if (storedTitleJSON) {
      try {
        const storedData: QuizData = JSON.parse(storedTitleJSON);
        setQuizTitle(storedData.title || "Unknown Quiz");
      } catch (error) {
        console.error("Error parsing stored quiz data:", error);
      }
    }

    // Retrieve the stored score
    const storedScore = localStorage.getItem(SCORE_STORAGE_KEY);
    if (storedScore) {
      setScore(parseInt(storedScore, 10));
    }
  }, []);

  const handleShare = async () => {
    if (!quizTitle) {
      alert("No quiz found to share.");
      return;
    }

    try {
      const quizDataJSON = localStorage.getItem(QUIZ_STORAGE_KEY);
      if (!quizDataJSON) {
        alert("Quiz data not found!");
        return;
      }

      const quizData: QuizData = JSON.parse(quizDataJSON);

      const response = await fetch("/api/quiz/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to save quiz");

      // Copy link with saved quiz ID
      const shareUrl = `${window.location.origin}/quiz/${result.quizId}`;
      navigator.clipboard.writeText(
        `Take the ${quizTitle} quiz here: ${shareUrl}`
      );
      alert("Quiz saved & link copied to clipboard! Share it with your friends.");
    } catch (error) {
      console.error("Error sharing quiz:", error);
      alert("Failed to share quiz. Please try again.");
    }
  };

  const handleRetry = () => {
    localStorage.removeItem(SCORE_STORAGE_KEY);
    localStorage.removeItem("userAnswers");
    router.push("/quiz");
  };

  const handleHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#F9DBBD]">
      <h1 className="text-5xl text-[#450920] font-bold text-center">Quiz Me On</h1>
      <br />
      <br />
      <br />
      <h2 className="text-2xl font-semibold text-[#A53860]">
        {quizTitle || "Quiz"}
      </h2>

      {score !== null ? (
        <p className="text-2xl mt-4 text-[#450920]">
          Your Score: <span className="font-bold text-[#DA627D]">{score}</span>
        </p>
      ) : (
        <p className="text-xl mt-4 text-[#450920]">
          No result found. Try taking a quiz!
        </p>
      )}

      <div className="mt-8 flex gap-6">
        <button
          onClick={handleRetry}
          className="px-5 py-2 text-lg bg-[#A53860] text-white rounded-md shadow-lg hover:bg-[#DA627D] transition-all"
        >
          Retake Quiz
        </button>

        <button
          onClick={handleShare}
          className="px-5 py-2 text-lg bg-[#A53860] text-white rounded-md shadow-lg hover:bg-[#DA627D] transition-all"
        >
          Share the quiz
        </button>
        <button
          onClick={handleHome}
          className="px-5 py-2 text-lg bg-[#A53860] text-white rounded-md shadow-lg hover:bg-[#DA627D] transition-all"
        >
          Generate New Quiz
        </button>
      </div>
    </div>
  );
}
