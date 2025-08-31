import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Mascot from '../components/Mascot';
import FeedbackModal, { getRandomCharacter } from '../components/FeedbackModal';
import { getAIFeedback } from '../lib/gemini';
import './Pages.css';
import './WriteDiary.css';

const EMOTIONS = {
  '기쁨': '😊', '행복': '🥰', '설렘': '🤩', '평온': '😌', 
  '슬픔': '😢', '우울': '😞', '분노': '😠', '불안': '😟',
  '사랑': '❤️', '놀람': '😮', '지루함': '😴', '피곤함': '😩'
};

function WriteDiary() {
  const { user } = useAuth();
  const { id: diaryId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [content, setContent] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preselectedDate, setPreselectedDate] = useState(null);
  const isEditing = !!diaryId;

  // AI Feedback Modal State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [aiFeedback, setAIFeedback] = useState('');
  const [feedbackCharacter, setFeedbackCharacter] = useState('');

  useEffect(() => {
    if (isEditing) {
      const fetchDiary = async () => {
        const { data, error } = await supabase.from('diaries').select('*').eq('id', diaryId).single();
        if (error) {
          console.error('Error fetching diary:', error);
          navigate('/calendar');
        } else {
          setContent(data.content);
          setSelectedEmotions(data.emotion || []);
        }
        setLoading(false);
      };
      fetchDiary();
    } else {
      const dateParam = searchParams.get('date');
      if (dateParam) {
        setPreselectedDate(dateParam);
      }
      setLoading(false);
    }
  }, [diaryId, isEditing, navigate, searchParams]);

  const handleEmotionClick = (emotion) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion]
    );
  };

  const handleFinalSave = async (feedbackToSave = null, characterToSave = null) => {
    const diaryData = { 
      content, 
      emotion: selectedEmotions,
      user_id: user.id,
      ai_feedback: feedbackToSave,
      ai_character_name: characterToSave
    };

    if (!isEditing && preselectedDate) {
      diaryData.created_at = preselectedDate + 'T12:00:00Z';
    }

    const { error } = isEditing
      ? await supabase.from('diaries').update(diaryData).eq('id', diaryId)
      : await supabase.from('diaries').insert(diaryData);

    if (error) {
      console.error('Error saving diary:', error);
      alert('일기 저장 중 오류가 발생했습니다.');
    } else {
      navigate('/calendar');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || selectedEmotions.length === 0) {
      alert('일기 내용과 감정을 하나 이상 선택해주세요.');
      return;
    }

    // 수정 모드일 때는 AI 피드백 없이 바로 저장
    if (isEditing) {
      handleFinalSave();
      return;
    }

    setIsSubmitting(true);
    const character = getRandomCharacter();
    setFeedbackCharacter(character);

    const feedback = await getAIFeedback(content, character); // Pass character to getAIFeedback
    
    setAIFeedback(feedback);
    setIsSubmitting(false);
    setShowFeedbackModal(true);
  };

  const handleLike = () => {
    handleFinalSave(aiFeedback, feedbackCharacter);
    setShowFeedbackModal(false);
  };

  const handleDislike = () => {
    handleFinalSave(null, null); // 피드백 없이 저장
    setShowFeedbackModal(false);
  };

  if (loading) {
    return <div className="page-container">Loading...</div>;
  }

  return (
    <>
      <div className="page-container write-page-container">
        <header className="garden-header">
          <Mascot />
          <div className="greeting">
            <h2>마음 정원</h2>
            <p>오늘의 마음은 어떤가요? 편안하게 기록해보세요.</p>
          </div>
        </header>
        <form onSubmit={handleSubmit} className="write-diary-form">
          <div className="form-section">
            <label>오늘 어떤 감정을 느꼈나요?</label>
            <div className="emotion-selector">
              {Object.entries(EMOTIONS).map(([name, emoji]) => (
                <button 
                  type="button"
                  key={name}
                  className={`emotion-btn ${selectedEmotions.includes(name) ? 'selected' : ''}`}
                  onClick={() => handleEmotionClick(name)}
                >
                  <span className="emotion-emoji">{emoji}</span>
                  <span className="emotion-name">{name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="form-section">
            <label>어떤 일이 있었나요?</label>
            <textarea 
              placeholder="이곳에 편안하게 이야기를 적어주세요."
              value={content} 
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => navigate('/calendar')} className="cancel-btn">취소</button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'AI가 일기를 읽는 중...' : (isEditing ? '수정 완료' : '기록하기')}
            </button>
          </div>
        </form>
      </div>
      <FeedbackModal 
        show={showFeedbackModal}
        feedback={aiFeedback}
        characterName={feedbackCharacter}
        onLike={handleLike}
        onDislike={handleDislike}
      />
    </>
  );
}

export default WriteDiary;