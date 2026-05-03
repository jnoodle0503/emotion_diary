import { api } from './api';

async function generateContent(prompt) {
  const response = await api.generateAIContent(prompt);
  return response.text.trim();
}

// Generates a character name in Korean, then translates it to English.
export async function generateAndTranslateCharacterName(i18nInstance) {
  try {
    // 1. Generate character name in Korean
    const generationPrompt = i18nInstance.t("ai_character_generation_prompt");
    const koreanName = await generateContent(generationPrompt);

    // 2. Translate the generated name to English
    const translationPrompt = i18nInstance.t(
      "ai_character_translation_prompt",
      {
        characterName: koreanName,
      }
    );
    const englishName = await generateContent(translationPrompt);

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
    return await generateContent(prompt);
  } catch (error) {
    console.error("Error generating AI feedback:", error);
    return "AI 피드백을 생성하는 중에 오류가 발생했어요. 잠시 후 다시 시도해주세요.";
  }
}
