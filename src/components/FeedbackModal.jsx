
import React from 'react';
import './FeedbackModal.css';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const allCharacterNames = [
  '중세시대의 어느 나그네',
  '대항해 시대의 어느 해적',
  '사이버펑크 세계의 정보상',
  '마법학교의 현명한 교수',
  '은하계를 여행하는 탐험가',
  '시간을 달리는 발명가',
  '숲속의 고요한 정령',
  '미래에서 온 로봇',
  '고대 문명의 현자',
  '우주를 유랑하는 음유시인',
  '심해의 신비로운 생명체',
  '꿈을 만드는 요정',
  '도시의 그림자 탐정',
  '사막의 방랑자',
  '북극의 얼음 마법사',
  '화산 속의 대장장이',
];

let shuffledNames = [];
let lastUsedCharacterName = null; // 마지막으로 사용된 캐릭터 이름 저장

// Fisher-Yates 셔플 알고리즘
const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

export const getRandomCharacter = () => {
  if (shuffledNames.length === 0) {
    let newShuffled = shuffleArray([...allCharacterNames]);
    // 이전 주기의 마지막 이름과 새 주기의 첫 이름이 같으면 위치 변경
    if (lastUsedCharacterName && newShuffled[0] === lastUsedCharacterName && newShuffled.length > 1) {
      // 첫 번째 요소를 두 번째 요소와 교환 (또는 다른 위치로)
      [newShuffled[0], newShuffled[1]] = [newShuffled[1], newShuffled[0]];
    }
    shuffledNames = newShuffled;
  }
  const nextCharacter = shuffledNames.pop();
  lastUsedCharacterName = nextCharacter; // 마지막으로 사용된 이름 업데이트
  return nextCharacter;
};

const FeedbackModal = ({ feedback, characterName, onLike, onDislike, show }) => {
  const { t } = useTranslation(); // Initialize useTranslation
  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content card">
        <p className="character-name">- {characterName} -</p>
        <p className="feedback-text">{feedback}</p>
        <div className="modal-actions">
          <button className="btn btn-dislike" onClick={onDislike}>{t('dislike')}</button>
          <button className="btn btn-like" onClick={onLike}>{t('like')}</button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
