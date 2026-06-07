export const dummyAiCharacterNames = [
  "오래된 정원을 돌보던 기록가",
  "비 오는 날의 서점 주인",
  "새벽 시장을 지나던 상인",
  "숲길을 오래 걷던 상담가",
  "바닷가 마을의 등대지기",
  "느린 편지를 쓰던 여행자",
];

export const dummyDiaries = [
  {
    id: 1,
    date: "2024-05-20",
    emotion: ["기쁨", "설렘"],
    content: "오늘은 오랫동안 기다려온 프로젝트를 성공적으로 마쳤다. 팀원들과 함께 노력한 결과물이 드디어 빛을 보게 되어 정말 기쁘고 설렌다. 이 성취감을 동력 삼아 다음 목표를 향해 나아갈 것이다.",
    ai_character_name: "오래된 정원을 돌보던 기록가",
    ai_feedback: "오랫동안 기다린 일이 좋은 결실로 이어져 정말 뿌듯했겠어요. 그동안 쌓아온 노력이 오늘의 기쁨을 더 단단하게 만들어준 것 같아요."
  },
  {
    id: 2,
    date: "2024-05-20",
    emotion: ["슬픔"],
    content: "친한 친구와 사소한 오해로 다퉜다. 마음이 너무 무겁고 슬프다. 먼저 손 내밀어 화해하고 싶은데, 용기가 나지 않는다.",
    ai_character_name: "숲길을 오래 걷던 상담가",
    ai_feedback: "친구와의 다툼으로 마음이 많이 무거웠겠어요. 먼저 다가가고 싶은 마음이 있다면, 아주 작은 말부터 천천히 꺼내봐도 괜찮습니다."
  },
  {
    id: 3,
    date: "2024-05-18",
    emotion: ["분노", "불안"],
    content: "예상치 못한 문제로 계획이 틀어져서 화가 난다. 모든 것이 내 통제 밖으로 벗어나는 것 같아 불안하다.",
    ai_character_name: "비 오는 날의 서점 주인",
    ai_feedback: "계획이 갑자기 틀어지면 화가 나고 불안해지는 건 자연스러운 일이에요. 지금은 모든 걸 바로 되돌리기보다, 내가 다시 붙잡을 수 있는 작은 한 가지부터 천천히 확인해봐도 괜찮아요."
  },
  {
    id: 4,
    date: "2024-05-19",
    emotion: ["평온"],
    content: "오랜만에 혼자만의 시간을 가졌다. 조용한 카페에서 책을 읽으니 마음이 편안해진다. 이런 여유가 필요했다.",
    ai_character_name: "바닷가 마을의 등대지기",
    ai_feedback: "오랜만의 혼자 있는 시간이 마음을 편안하게 해준 것 같아요. 이런 조용한 여유도 잘 지켜두고 싶은 소중한 기록입니다."
  },
  {
    id: 5,
    date: "2024-05-17",
    emotion: ["피곤함"],
    content: "야근이 계속되니 몸이 천근만근이다. 피로가 쌓여서 아무것도 하기 싫다. 쉬고 싶다.",
    ai_character_name: "새벽 시장을 지나던 상인",
    ai_feedback: "계속되는 야근으로 몸과 마음이 많이 지친 것 같아요. 오늘은 무언가를 더 해내기보다, 잠시 멈추고 회복할 시간을 가져도 괜찮습니다."
  },
  {
    id: 6,
    date: "2024-05-15",
    emotion: ["기쁨"],
    content: "친구가 깜짝 생일 파티를 열어줬다. 전혀 예상 못했는데 감동받았다. 정말 행복한 하루였다.",
    ai_character_name: "느린 편지를 쓰던 여행자",
    ai_feedback: "과거의 행복한 순간이 현재에 재현되었군요. 예상치 못한 기쁨은 시간의 흐름 속에서 더욱 빛나는 보석과 같습니다. 이 소중한 기억을 미래로 가져가세요."
  },
  {
    id: 7,
    date: "2024-05-15",
    emotion: ["우울"],
    content: "날씨가 흐려서 그런지 기분도 가라앉는다. 특별한 일은 없는데 괜히 우울하다.",
    ai_character_name: "숲길을 오래 걷던 상담가",
    ai_feedback: "특별한 이유 없이 마음이 가라앉는 날도 있어요. 그런 날에는 감정을 설명하려 애쓰기보다, 지금의 상태를 조용히 인정해주는 것만으로도 충분합니다."
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
  let feedback = "당신이 남긴 하루의 마음을 조용히 살펴보고 있어요.";

  if (emotions.includes("기쁨") || emotions.includes("설렘")) {
    feedback = "오늘의 기쁨과 설렘이 잘 느껴져요. 이 마음이 하루를 조금 더 환하게 만들어주었겠네요.";
  } else if (emotions.includes("슬픔") || emotions.includes("우울")) {
    feedback = "마음이 많이 가라앉은 하루였겠어요. 지금 느끼는 감정을 억지로 밀어내지 않아도 괜찮습니다.";
  } else if (emotions.includes("분노") || emotions.includes("불안")) {
    feedback = "화나고 불안한 마음이 함께 올라왔군요. 잠시 숨을 고르고, 지금 붙잡을 수 있는 것부터 천천히 살펴봐도 괜찮아요.";
  } else if (emotions.includes("피곤함")) {
    feedback = "많이 지친 하루였겠어요. 오늘은 해야 할 일을 조금 내려놓고 쉬어도 괜찮습니다.";
  } else if (emotions.includes("평온")) {
    feedback = "평온한 하루의 결이 느껴져요. 이런 조용한 안정감도 소중한 마음의 기록입니다.";
  }

  if (content.length < 20) {
    feedback += " 조금 더 적어두면 오늘의 마음을 돌아보는 데 도움이 될 수 있어요.";
  } else if (content.length > 100) {
    feedback += " 긴 이야기를 남겨주셔서 오늘의 감정이 더 선명하게 느껴집니다.";
  }

  return {
    ai_character_name: randomCharacter,
    ai_feedback: feedback,
  };
};
