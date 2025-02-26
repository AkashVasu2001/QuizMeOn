"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SCORE_STORAGE_KEY = "quizScore";
const QUIZ_STORAGE_KEY = "quizData";
const USER_ANSWERS_KEY = "userAnswers";

export default function QuizResult() {
  const [quizTitle, setQuizTitle] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [questions, setQuestions] = useState<
    { question: string; options: string[]; correctAnswer: string }[]
  >([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const router = useRouter();

  useEffect(() => {
    // Retrieve the stored quiz title and questions
    const storedQuizJSON = localStorage.getItem(QUIZ_STORAGE_KEY);
    if (storedQuizJSON) {
      try {
        const storedQuiz = JSON.parse(storedQuizJSON);
        if (storedQuiz && storedQuiz.title && storedQuiz.questions) {
          setQuizTitle(storedQuiz.title);
          setQuestions(storedQuiz.questions);
        } else {
          console.error("Invalid quiz data:", storedQuiz);
        }
      } catch (error) {
        console.error("Error parsing stored quiz JSON:", error);
      }
    } else {
      console.warn("No quiz data found in localStorage.");
    }

    // Retrieve the stored score
    const storedScore = localStorage.getItem(SCORE_STORAGE_KEY);
    if (storedScore) {
      setScore(parseInt(storedScore, 10));
    } else {
      console.warn("No stored score found in localStorage.");
    }

    // Retrieve the stored user answers
    const storedAnswersJSON = localStorage.getItem(USER_ANSWERS_KEY);
    if (storedAnswersJSON) {
      try {
        setUserAnswers(JSON.parse(storedAnswersJSON));
      } catch (error) {
        console.error("Error parsing stored user answers JSON:", error);
      }
    } else {
      console.warn("No stored answers found in localStorage.");
    }
  }, []);

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
          onClick={handleHome}
          className="px-5 py-2 text-lg bg-[#A53860] text-white rounded-md shadow-lg hover:bg-[#DA627D] transition-all"
        >
          Generate New Quiz
        </button>
      </div>

      {/* Display Questions and Answers */}
      <div className="mt-10 w-full max-w-3xl bg-white p-6 shadow-lg rounded-lg">
        <h3 className="text-xl font-bold text-[#450920] text-center mb-4">Your Answers</h3>
        {questions.length > 0 ? (
          questions.map((q, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === q.correctAnswer;

            return (
              <div key={index} className="mb-4 p-4 border rounded-md">
                <p className="text-lg font-semibold text-[#A53860]">{index + 1}. {q.question}</p>
                <p className="text-md text-[#450920]">
                  <span className="font-semibold">Your Answer: </span>
                  <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                    {userAnswer || "No Answer"}
                  </span>
                </p>
                <p className="text-md text-[#450920]">
                  <span className="font-semibold">Correct Answer: </span>
                  <span className="text-green-600">{q.correctAnswer}</span>
                </p>
              </div>
            );
          })
        ) : (
          <p className="text-center text-lg">No questions available.</p>
        )}
      </div>
    </div>
  );
}
