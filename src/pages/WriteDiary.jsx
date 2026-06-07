import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import Mascot from '../components/Mascot';
import './Pages.css';
import './WriteDiary.css';
import { useTranslation } from 'react-i18next';

const EMOTIONS = {
  'joy': '😊', 'happiness': '🥰', 'excitement': '🤩', 'proud': '😌', 'calmness': '😌', 
  'sadness': '😢', 'depression': '😞', 'anger': '😠', 'anxiety': '😟',
  'love': '❤️', 'surprise': '😮', 'boredom': '😴', 'tiredness': '😩'
};

function createDateWithCurrentTime(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  const now = new Date();

  return new Date(
    year,
    month - 1,
    day,
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds(),
  );
}

function WriteDiary() {
  const { t, i18n } = useTranslation();
  const { id: diaryId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [content, setContent] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preselectedDate, setPreselectedDate] = useState(null);
  const isEditing = !!diaryId;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [existingFeedback, setExistingFeedback] = useState(null);
  const [existingCharNames, setExistingCharNames] = useState(null);
  const [existingFeedbackReaction, setExistingFeedbackReaction] = useState(null);

  useEffect(() => {
    if (isEditing) {
      const fetchDiary = async () => {
        try {
          const data = await api.getDiary(diaryId);
          setContent(data.content);

          const emotionsFromDB = data.emotion || [];
          const koreanTranslations = i18n.getResourceBundle('ko', 'translation');
          const koreanToEnglishMap = {};
          if (koreanTranslations) {
            Object.keys(EMOTIONS).forEach(key => {
              const koreanName = koreanTranslations[`emotion_${key}`];
              if (koreanName) {
                koreanToEnglishMap[koreanName] = key;
              }
            });
          }
          const normalizedEmotions = emotionsFromDB.map(emo => koreanToEnglishMap[emo] || emo);
          setSelectedEmotions(normalizedEmotions);

          setExistingFeedback(data.ai_feedback);
          setExistingCharNames(data.ai_character_names);
          setExistingFeedbackReaction(data.ai_feedback_reaction);
        } catch (error) {
          console.error('Error fetching diary:', error);
          navigate('/calendar');
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
  }, [diaryId, isEditing, navigate, searchParams, i18n]); // Added i18n to dependency array

  const handleEmotionClick = (emotion) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion]
    );
  };

  const handleFinalSave = async (feedbackToSave = null, characterNamesToSave = null, feedbackReaction = null) => {
    const diaryData = { 
      content, 
      emotion: selectedEmotions,
      ai_feedback: feedbackToSave,
      ai_character_names: characterNamesToSave,
      ai_feedback_reaction: feedbackReaction,
    };

    if (!isEditing && preselectedDate) {
      diaryData.created_at = createDateWithCurrentTime(preselectedDate).toISOString();
    }

    try {
      if (isEditing) {
        await api.updateDiary(diaryId, diaryData);
      } else {
        await api.createDiary(diaryData);
        alert(t('write_diary_ai_notify_after_save'));
      }
      navigate('/calendar');
    } catch (error) {
      console.error('Error saving diary:', error);
      alert(t('write_diary_alert_save_failed'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || selectedEmotions.length === 0) {
      alert(t('write_diary_alert_enter_content_emotion'));
      return;
    }

    if (isEditing) {
      handleFinalSave(existingFeedback, existingCharNames, existingFeedbackReaction);
      return;
    }

    setIsSubmitting(true);
    await handleFinalSave();
    setIsSubmitting(false);
  };

  if (loading) {
    return <div className="page-container">{t('loading')}</div>;
  }

  return (
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
                  <span className="emotion-name">{t(`emotion_${name}`)}</span>
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
              {isSubmitting ? t('write_diary_saving') : (isEditing ? t('write_diary_edit_complete') : t('write_diary_record'))}
            </button>
          </div>
        </form>
      </div>
  );
}

export default WriteDiary;
