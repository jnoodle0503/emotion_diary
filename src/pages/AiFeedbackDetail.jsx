import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import Mascot from '../components/Mascot';
import './Pages.css';
import './AiFeedbackDetail.css';

function AiFeedbackDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [diary, setDiary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reaction, setReaction] = useState(null);
  const [savingReaction, setSavingReaction] = useState(false);

  useEffect(() => {
    const fetchDiary = async () => {
      setLoading(true);
      try {
        const data = await api.getDiary(id);
        setDiary(data);
        setReaction(data.ai_feedback_reaction);
      } catch (error) {
        console.error('Error fetching AI feedback:', error);
        setDiary(null);
      }
      setLoading(false);
    };

    fetchDiary();
  }, [id]);

  const getCharacterNameForDisplay = () => {
    const currentLang = i18n.language;
    const fallbackLang = currentLang === 'ko' ? 'en' : 'ko';

    if (diary?.ai_character_names && typeof diary.ai_character_names === 'object') {
      return diary.ai_character_names[currentLang] || diary.ai_character_names[fallbackLang];
    }

    return diary?.ai_character_name || null;
  };

  const handleReaction = async (nextReaction) => {
    if (savingReaction) {
      return;
    }

    setReaction(nextReaction);
    setSavingReaction(true);

    try {
      await api.updateAiFeedbackReaction(id, nextReaction);
      navigate(`/diary/${id}`);
    } catch (error) {
      console.error('Error saving AI feedback reaction:', error);
      setReaction(diary.ai_feedback_reaction);
      setSavingReaction(false);
      alert(t('ai_feedback_reaction_failed'));
    }
  };

  if (loading) {
    return <div className="page-container">{t('ai_feedback_detail_loading')}</div>;
  }

  if (!diary) {
    return <div className="page-container error-message">{t('diary_detail_diary_not_found')}</div>;
  }

  const characterName = getCharacterNameForDisplay();

  return (
    <div className="page-container ai-feedback-detail-page">
      <header className="garden-header">
        <Mascot />
        <div className="greeting">
          <h2>{t('ai_feedback_detail_title')}</h2>
          <p>{new Date(diary.created_at).toLocaleDateString('ko-KR')}</p>
        </div>
      </header>

      <section className="ai-feedback-panel diary-panel">
        <h3>{t('ai_feedback_diary_section_title')}</h3>
        <div className="diary-meta">
          {diary.emotion &&
            diary.emotion.map((emo) => (
              <span key={emo} className={`emotion-tag emotion-bg-${emo}`}>
                {t(`emotion_${emo}`, emo)}
              </span>
            ))}
        </div>
        <p className="ai-feedback-diary-text">{diary.content}</p>
      </section>

      <section className="ai-feedback-panel ai-reply-panel">
        <h3>{characterName ? `${characterName}${t('from_ai_character_suffix')}` : t('ai_advice')}</h3>
        {diary.ai_feedback ? (
          <p className="ai-feedback-detail-text">{diary.ai_feedback}</p>
        ) : (
          <p className="ai-feedback-pending">{t('ai_feedback_still_generating')}</p>
        )}
      </section>

      {diary.ai_feedback && (
        <div className="ai-feedback-reactions" aria-label={t('ai_feedback_reaction_label')}>
          <button
            type="button"
            className={`reaction-button ${reaction === 'like' ? 'selected' : ''}`}
            disabled={savingReaction}
            onClick={() => handleReaction('like')}
          >
            {t('ai_feedback_like')}
          </button>
          <button
            type="button"
            className={`reaction-button ${reaction === 'dislike' ? 'selected' : ''}`}
            disabled={savingReaction}
            onClick={() => handleReaction('dislike')}
          >
            {t('ai_feedback_dislike')}
          </button>
        </div>
      )}
    </div>
  );
}

export default AiFeedbackDetail;
