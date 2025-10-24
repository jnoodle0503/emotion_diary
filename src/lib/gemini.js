import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error(
    "VITE_GEMINI_API_KEY is not defined in the environment variables."
  );
}

const genAI = new GoogleGenerativeAI(apiKey);

// Define the list of models to try in order
// Updated model names as of January 2025
// The correct format is without "-latest" suffix for v1beta API
const MODELS = [
  "gemini-2.0-flash-exp",      // Experimental Gemini 2.0
  "gemini-exp-1206",            // Experimental model
  "models/gemini-1.5-flash",    // Stable 1.5 Flash with "models/" prefix
  "models/gemini-1.5-pro",      // Stable 1.5 Pro with "models/" prefix
  "gemini-1.5-flash-8b",        // Smaller 8B parameter model
];

// Function to generate content with fallback models
async function generateContentWithFallback(prompt) {
  for (const modelName of MODELS) {
    console.log(`Attempting to use model: ${modelName}`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      console.log(`✅ Successfully used model: ${modelName}`);
      return result.response;
    } catch (error) {
      console.error(`❌ Error with model ${modelName}:`, error.message);

      // Check if the error is related to model not found, token exhaustion, or rate limiting
      const shouldRetry =
        error.status === 404 || // Model not found - try next model
        error.status === 429 || // Rate limit - try next model
        error.message?.includes('not found') ||
        error.message?.includes('not supported');

      if (shouldRetry) {
        console.log(`⏭️ Trying next model due to error: ${error.status || 'unknown'}`);
        continue; // Try the next model
      } else {
        // If it's another type of error (like API key invalid), re-throw it
        console.error(`🚫 Non-recoverable error with model ${modelName}`);
        throw error;
      }
    }
  }
  throw new Error("All Gemini models failed to generate content. Please check your API key and internet connection.");
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
