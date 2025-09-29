export const dummyAiCharacterNames = [
  "미래에서 온 로봇",
  "중세시대 무법자",
  "우주 탐험가",
  "숲속의 현자",
  "바다의 수호자",
  "시간 여행자",
];

export const dummyDiaries = [
  {
    id: 1,
    date: "2024-05-20",
    emotion: ["기쁨", "설렘"],
    content: "오늘은 오랫동안 기다려온 프로젝트를 성공적으로 마쳤다. 팀원들과 함께 노력한 결과물이 드디어 빛을 보게 되어 정말 기쁘고 설렌다. 이 성취감을 동력 삼아 다음 목표를 향해 나아갈 것이다.",
    ai_character_name: "미래에서 온 로봇",
    ai_feedback: "분석 결과, 당신의 오늘 감정은 '성취감'과 '기대감'으로 측정됩니다. 목표 달성은 긍정적 에너지의 원천입니다. 이 에너지를 다음 단계로 전환하는 데 집중하세요. 시스템 최적화 완료."
  },
  {
    id: 2,
    date: "2024-05-20",
    emotion: ["슬픔"],
    content: "친한 친구와 사소한 오해로 다퉜다. 마음이 너무 무겁고 슬프다. 먼저 손 내밀어 화해하고 싶은데, 용기가 나지 않는다.",
    ai_character_name: "숲속의 현자",
    ai_feedback: "친구와의 다툼으로 마음의 숲이 흐려졌군요. 슬픔은 자연스러운 감정의 비입니다. 비가 그친 뒤에는 맑은 하늘이 찾아오듯, 용기를 내어 먼저 손을 내밀어 보세요. 진심은 언제나 길을 찾습니다."
  },
  {
    id: 3,
    date: "2024-05-18",
    emotion: ["분노", "불안"],
    content: "예상치 못한 문제로 계획이 틀어져서 화가 난다. 모든 것이 내 통제 밖으로 벗어나는 것 같아 불안하다.",
    ai_character_name: "중세시대 무법자",
    ai_feedback: "계획이 틀어져 분노와 불안에 휩싸였군. 혼돈의 시대에선 통제 불능이 일상이지. 하지만 그 속에서도 너의 길을 개척할 수 있다. 작은 승리부터 쟁취하며 다시 전진하라!"
  },
  {
    id: 4,
    date: "2024-05-19",
    emotion: ["평온"],
    content: "오랜만에 혼자만의 시간을 가졌다. 조용한 카페에서 책을 읽으니 마음이 편안해진다. 이런 여유가 필요했다.",
    ai_character_name: "바다의 수호자",
    ai_feedback: "고요한 파도처럼 평온한 하루를 보내셨군요. 자신을 위한 시간은 마음의 바다를 정화하는 소중한 순간입니다. 이 평화를 오래도록 간직하세요."
  },
  {
    id: 5,
    date: "2024-05-17",
    emotion: ["피곤함"],
    content: "야근이 계속되니 몸이 천근만근이다. 피로가 쌓여서 아무것도 하기 싫다. 쉬고 싶다.",
    ai_character_name: "우주 탐험가",
    ai_feedback: "지구의 중력이 당신을 짓누르는군요. 피로도는 현재 임계치에 도달했습니다. 에너지를 재충전할 시간이 필요합니다. 잠시 모든 임무를 중단하고 휴식 모드로 전환하세요."
  },
  {
    id: 6,
    date: "2024-05-15",
    emotion: ["기쁨"],
    content: "친구가 깜짝 생일 파티를 열어줬다. 전혀 예상 못했는데 감동받았다. 정말 행복한 하루였다.",
    ai_character_name: "시간 여행자",
    ai_feedback: "과거의 행복한 순간이 현재에 재현되었군요. 예상치 못한 기쁨은 시간의 흐름 속에서 더욱 빛나는 보석과 같습니다. 이 소중한 기억을 미래로 가져가세요."
  },
  {
    id: 7,
    date: "2024-05-15",
    emotion: ["우울"],
    content: "날씨가 흐려서 그런지 기분도 가라앉는다. 특별한 일은 없는데 괜히 우울하다.",
    ai_character_name: "숲속의 현자",
    ai_feedback: "마음의 하늘에 먹구름이 드리웠군요. 우울함은 때때로 찾아오는 안개와 같습니다. 억지로 걷어내려 하지 말고, 잠시 그 안에 머물러도 괜찮습니다. 곧 햇살이 비출 거예요."
  },
];

export const dummyEmotions = {
  "기쁨": 25,
  "슬픔": 10,
  "분노": 7,
  "불안": 12,
  "설렘": 18,
  "평온": 15,
  "피곤함": 10,
  "우울": 8,
  "지루함": 5,
};

export const generateDummyAiFeedback = (content, emotions) => {
  const randomCharacter = dummyAiCharacterNames[Math.floor(Math.random() * dummyAiCharacterNames.length)];
  let feedback = "당신의 이야기에 귀 기울이고 있습니다. 더 깊은 마음을 들여다볼 준비가 되었습니다.";

  if (emotions.includes("기쁨") || emotions.includes("설렘")) {
    feedback = "긍정적인 에너지가 느껴집니다! 이 기분을 오래도록 간직하세요.";
  } else if (emotions.includes("슬픔") || emotions.includes("우울")) {
    feedback = "마음이 아프셨군요. 괜찮아요, 제가 옆에서 당신의 이야기를 들어줄게요.";
  } else if (emotions.includes("분노") || emotions.includes("불안")) {
    feedback = "화나고 불안한 마음, 충분히 이해합니다. 잠시 숨을 고르고 저와 함께 해결책을 찾아볼까요?";
  } else if (emotions.includes("피곤함")) {
    feedback = "많이 지치셨군요. 잠시 모든 것을 내려놓고 충분한 휴식을 취하는 것이 중요합니다.";
  } else if (emotions.includes("평온")) {
    feedback = "평화로운 하루를 보내셨군요. 이 평온함이 당신의 삶에 계속되기를 바랍니다.";
  }

  if (content.length < 20) {
    feedback += " 조금 더 자세한 이야기를 들려주시면 더 깊은 공감을 드릴 수 있습니다.";
  } else if (content.length > 100) {
    feedback += " 많은 이야기를 나누어주셔서 감사합니다. 당신의 마음을 더 잘 이해할 수 있게 되었어요.";
  }

  return {
    ai_character_name: randomCharacter,
    ai_feedback: feedback,
  };
};
