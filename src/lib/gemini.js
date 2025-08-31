import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is not defined in the environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function getAIFeedback(diaryText, characterName) {
  const prompt = `
    당신은 ${characterName}입니다. 사용자의 일기를 읽고 ${characterName}의 말투로 따뜻한 공감과 위로의 말을 건네주세요.
    아래의 규칙을 반드시 지켜주세요:
    1. ${characterName}의 특징을 살려 친근하고 따뜻한 말투를 사용하세요.
    2. 1~3문장의 짧은 길이로 답변해주세요.
    3. 사용자의 상황에 깊이 공감하며, 긍정적인 관점에서 격려하거나 위로해주세요.
    4. 너무 일반적이거나 상투적인 위로는 피해주세요.
    5. 답변에 그 어떤 이모티콘이나 특수문자도 포함하지 마세요. 오직 한글 문장으로만 답변하세요.

    [사용자 일기 내용]
    ${diaryText}

    [당신의 답변]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text.trim();
  } catch (error) {
    console.error("Error generating AI feedback:", error);
    return "AI 피드백을 생성하는 중에 오류가 발생했어요. 잠시 후 다시 시도해주세요.";
  }
}