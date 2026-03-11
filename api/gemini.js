import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("YOUR_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

async function getResumeScore(resumeText, jobDescription) {
  const prompt = `
    Act as an expert ATS (Applicant Tracking System). 
    Analyze the following resume against this job description.
    Resume: ${resumeText}
    Job Description: ${jobDescription}
    
    Provide a JSON response with:
    1. A score from 0-100.
    2. Top 3 missing keywords.
    3. Three actionable tips to improve the score.
  `;

  const result = await model.generateContent(prompt);
  console.log(result.response.text());
}