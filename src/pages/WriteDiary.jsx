import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Mascot from '../components/Mascot';
import FeedbackModal, { getRandomCharacter } from '../components/FeedbackModal';
import { getAIFeedback } from '../lib/gemini';
import './Pages.css';
import './WriteDiary.css';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const EMOTIONS = {
  '기쁨': '😊', '행복': '🥰', '설렘': '🤩', '평온': '😌', 
  '슬픔': '😢', '우울': '😞', '분노': '😠', '불안': '😟',
  '사랑': '❤️', '놀람': '😮', '지루함': '😴', '피곤함': '😩'
};

function WriteDiary() {
  const { t } = useTranslation(); // Initialize useTranslation
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
      alert(t('write_diary_alert_save_failed'));
    } else {
      navigate('/calendar');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || selectedEmotions.length === 0) {
      alert(t('write_diary_alert_enter_content_emotion'));
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
    return <div className="page-container">{t('loading')}</div>;
  }

  return (
    <>
      <div className="page-container write-page-container">
        <header className="garden-header">
          <Mascot />
          <div className="greeting">
            <h2>{t('write_diary_title')}</h2>
            <p>{t('write_diary_description')}</p>
          </div>
        </header>
        <form onSubmit={handleSubmit} className="write-diary-form">
          <div className="form-section">
            <label>{t('write_diary_emotion_question')}</label>
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
            <label>{t('write_diary_content_question')}</label>
            <textarea 
              placeholder={t('write_diary_content_placeholder')}
              value={content} 
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => navigate('/calendar')} className="cancel-btn">{t('cancel')}</button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? t('write_diary_ai_reading') : (isEditing ? t('write_diary_edit_complete') : t('write_diary_record'))}
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