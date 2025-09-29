import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error(
    "VITE_GEMINI_API_KEY is not defined in the environment variables."
  );
}

const genAI = new GoogleGenerativeAI(apiKey);

// Define the list of models to try in order
const MODELS = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"];

// Function to generate content with fallback models
async function generateContentWithFallback(prompt) {
  for (const modelName of MODELS) {
    console.log(`Attempting to use model: ${modelName}`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response;
    } catch (error) {
      console.error(`Error with model ${modelName}:`, error);
      console.error(`Error status: ${error.status}, Error name: ${error.name}`); // Full error object logged
      // Check if the error is related to token exhaustion or rate limiting
      // This is a placeholder for actual error checking.
      // In a real scenario, you'd parse the error object for specific codes/messages.
      if (error.status === 429) {
        console.log(`Retrying with next model due to token/rate limit error: ${modelName}`);
        continue; // Try the next model
      } else {
        // If it's another type of error, re-throw it
        throw error;
      }
    }
  }
  throw new Error("All Gemini models failed to generate content.");
}

// Generates a character name in Korean, then translates it to English.
export async function generateAndTranslateCharacterName(i18nInstance) {
  try {
    // 1. Generate character name in Korean
    const generationPrompt = i18nInstance.t("ai_character_generation_prompt");
    let response = await generateContentWithFallback(generationPrompt);
    const koreanName = response.text().trim();

    // 2. Translate the generated name to English
    const translationPrompt = i18nInstance.t(
      "ai_character_translation_prompt",
      {
        characterName: koreanName,
      }
    );
    response = await generateContentWithFallback(translationPrompt);
    const englishName = response.text().trim();

    return { ko: koreanName, en: englishName };
  } catch (error) {
    console.error("Error generating and translating character name:", error);
    // Return a default character name pair in case of an error
    return {
      ko: "미래에서 온 로봇",
      en: "A robot from the future",
    };
  }
}

export async function getAIFeedback(diaryText, characterName, i18nInstance) {
  const prompt = i18nInstance.t("ai_feedback_prompt", {
    characterName: characterName,
    diaryText: diaryText,
    interpolation: { escapeValue: false }, // Allow HTML in translations if needed
  });

  try {
    const response = await generateContentWithFallback(prompt);
    const text = response.text();
    return text.trim();
  } catch (error) {
    console.error("Error generating AI feedback:", error);
    return "AI 피드백을 생성하는 중에 오류가 발생했어요. 잠시 후 다시 시도해주세요.";
  }
}
