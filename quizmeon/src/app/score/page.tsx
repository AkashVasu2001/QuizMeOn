"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SCORE_STORAGE_KEY = "quizScore";
const QUIZ_STORAGE_KEY = "quizData";
const USER_ANSWERS_KEY = "userAnswers";

export default function QuizResult() {
  const [quizTitle, setQuizTitle] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [quizData, setQuizData] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Retrieve stored quiz title
    const storedTitleJSON = localStorage.getItem(QUIZ_STORAGE_KEY);
    if (storedTitleJSON) {
      try {
        const storedTitle = JSON.parse(storedTitleJSON);
        if (storedTitle && storedTitle.title) {
          setQuizTitle(storedTitle.title);
        }
      } catch (error) {
        console.error("Error parsing stored title JSON:", error);
      }
    }

    // Retrieve stored score
    const storedScore = localStorage.getItem(SCORE_STORAGE_KEY);
    if (storedScore) {
      setScore(parseInt(storedScore, 10));
    }

    // Retrieve stored quiz data
    const storedQuizData = localStorage.getItem(QUIZ_STORAGE_KEY);
    if (storedQuizData) {
      try {
        setQuizData(JSON.parse(storedQuizData));
      } catch (error) {
        console.error("Error parsing stored quiz data:", error);
      }
    }

    // Retrieve user answers
    const storedUserAnswers = localStorage.getItem(USER_ANSWERS_KEY);
    if (storedUserAnswers) {
      try {
        setUserAnswers(JSON.parse(storedUserAnswers));
      } catch (error) {
        console.error("Error parsing stored user answers:", error);
      }
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

      const response = await fetch("/api/quiz/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: quizDataJSON,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to save quiz");

      const shareUrl = `${window.location.origin}/quiz/${result.quizId}`;
      navigator.clipboard.writeText(`Take the ${quizTitle} quiz here: ${shareUrl}`);
      alert("Quiz saved & link copied to clipboard! Share it with your friends.");
    } catch (error) {
      console.error("Error sharing quiz:", error);
      alert("Failed to share quiz. Please try again.");
    }
  };

  const handleRetry = () => {
    localStorage.removeItem(SCORE_STORAGE_KEY);
    localStorage.removeItem(USER_ANSWERS_KEY);
    router.push("/quiz");
  };

  const handleHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#F9DBBD]">
      <h1 className="text-5xl text-[#450920] font-bold text-center">Quiz Me On</h1>
      <h2 className="text-2xl font-semibold text-[#A53860] mt-4">{quizTitle || "Quiz"}</h2>

      {score !== null ? (
        <p className="text-2xl mt-4 text-[#450920]">
          Your Score: <span className="font-bold text-[#DA627D]">{score}</span>
        </p>
      ) : (
        <p className="text-xl mt-4 text-[#450920]">No result found. Try taking a quiz!</p>
      )}

      {/* Display full quiz with answers */}
      {quizData && userAnswers && (
        <div className="mt-8 w-full max-w-3xl bg-white p-6 rounded-lg shadow-md">
          {quizData.questions.map((question: any, index: number) => (
            <div key={index} className="mb-6">
              <h3 className="text-lg font-bold text-[#450920]">
                {index + 1}. {question.question}
              </h3>
              <ul className="mt-2">
                {question.options.map((option: string, optIndex: number) => (
                  <li
                    key={optIndex}
                    className={`p-2 rounded-md mt-1 ${
                      option === question.correctAnswer
                        ? "bg-green-300"
                        : option === userAnswers[index]
                        ? "bg-red-300"
                        : "bg-gray-100"
                    }`}
                  >
                    {option}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm font-medium text-[#A53860]">
                Your Answer: {userAnswers[index]}
              </p>
              <p className="text-sm font-medium text-green-700">
                Correct Answer: {question.correctAnswer}
              </p>
            </div>
          ))}
        </div>
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
