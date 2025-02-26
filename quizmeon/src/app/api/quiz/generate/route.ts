import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Helper function to set a timeout
 * @param ms Timeout in milliseconds
 * @returns A promise that rejects with a timeout error
 */
const timeoutPromise = (ms: number): Promise<never> =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Request Timeout")), ms)
  );

/**
 * POST API Handler
 * @param req Next.js Request object
 * @returns JSON response containing quiz data or an error
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { title, difficulty, numQuestions } = body;

    if (!title || !difficulty || !numQuestions || numQuestions <= 0) {
      return NextResponse.json(
        { error: "Title, difficulty, and a valid number of questions are required" },
        { status: 400 }
      );
    }

    const prompt = `Generate a quiz with the description of '${title}' with difficulty '${difficulty}' containing ${numQuestions} questions.
    Each question should have:
    - A question statement
    - Exactly 4 options (in an array)
    - One correct answer (which must be one of the options)
    
    Return ONLY valid JSON formatted like this inside triple backticks:
    \`\`\`json
    {
      "title": <title>,
      "difficulty": "${difficulty}",
      "questions": [
        {
          "question": "Sample Question?",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswer": "Option 1"
        }
      ]
    }
    \`\`\`
    Do not include any extra text before or after the JSON block.
    
    Rules to follow while generating the quiz:
    -based off of the given description pick an apporopriate title for the quiz
    -questions should be based off of the description
    -questions should be of the given difficulty, for easy make it in such a way that someone with a basic understanding of the topic can answer it, for intermediate make it in such a way that someone with a good understanding of the topic can answer it, for hard make it in such a way that someone with an expert understanding of the topic can answer it
    -questions should be unique and it can be of various types like find the incorrect or correct statemnet, odd one out, or other types of questions if applicable
    -questions should be clear and concise and should not be ambiguous and should not have any spelling or grammatical errors 
    -the answer shoould always be correct and should be only one of the options
    -YOU NEED TO MAKE SURE ITS IN JSON FORMAT AND THE JSON IS VALID
    -DO NOT INCLUDE ANY EXTRA TEXT BEFORE OR AFTER THE JSON BLOCK
    `;
    

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Set a timeout of 10 seconds (10000ms)
    const response = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise(10000),
    ]);

    // Extract the raw response text
    const rawTextResponse = await (response as any).response.text();
    console.log("Raw textResponse:", rawTextResponse);

    // Extract JSON from triple backticks
    const jsonMatch = rawTextResponse.match(/```json([\s\S]*?)```/);
    const textResponse = jsonMatch ? jsonMatch[1].trim() : rawTextResponse.trim();

    console.log("Extracted textResponse:", textResponse);

    if (!textResponse) {
      return NextResponse.json(
        { error: "Invalid response from Gemini API" },
        { status: 500 }
      );
    }

    let quizData;
    try {
      quizData = JSON.parse(textResponse);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON response from Gemini API" },
        { status: 500 }
      );
    }

    return NextResponse.json(quizData);
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: error.message === "Request Timeout" ? "Request timed out" : "Internal Server Error",
      },
      { status: error.message === "Request Timeout" ? 504 : 500 }
    );
  }
}
