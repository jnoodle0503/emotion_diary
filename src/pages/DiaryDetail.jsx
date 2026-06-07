import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, getStickerAssetCandidates } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import ComfortNoteButton from "../components/ComfortNoteButton";
import Mascot from "../components/Mascot";
import "./Pages.css";
import "./DiaryDetail.css";
import { useTranslation } from 'react-i18next';

function StickerPreviewImage({ sticker }) {
  const candidates = getStickerAssetCandidates(sticker.url || sticker.sticker_file_name);
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [sticker.url, sticker.sticker_file_name]);

  if (candidates.length === 0) {
    return null;
  }

  return (
    <img
      className="diary-preview-sticker"
      src={candidates[candidateIndex]}
      alt=""
      style={{
        left: `${sticker.x_percent}%`,
        top: `${sticker.y_percent}%`,
        width: `${sticker.width_percent}%`,
        transform: `translate(-50%, -50%) rotate(${sticker.rotation || 0}deg)`,
        zIndex: sticker.z_index,
      }}
      draggable="false"
      onError={() => {
        setCandidateIndex((index) => Math.min(index + 1, candidates.length - 1));
      }}
    />
  );
}

function DiaryDetail() {
  const { t, i18n } = useTranslation(); // Get i18n instance
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [diary, setDiary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiary = async () => {
      if (!user) {
        navigate("/login");
        return;
      }
      setLoading(true);
      try {
        const data = await api.getDiary(id);
        setDiary(data);
      } catch (error) {
        console.error("Error fetching diary:", error);
        setError(t('diary_detail_error_fetching_diary'));
        setDiary(null);
      }
      setLoading(false);
    };

    fetchDiary();
  }, [id, user, navigate, t]);

  const handleDelete = async () => {
    if (window.confirm(t('diary_detail_confirm_delete'))) {
      try {
        await api.deleteDiary(diary.id);
        alert(t('diary_detail_alert_deleted'));
        navigate("/calendar");
      } catch (error) {
        console.error("Error deleting diary:", error);
        alert(t('diary_detail_alert_delete_failed'));
      }
    }
  };

  const getCharacterNameForDisplay = (diary) => {
    const currentLang = i18n.language;
    const fallbackLang = currentLang === 'ko' ? 'en' : 'ko';

    if (diary.ai_character_names && typeof diary.ai_character_names === 'object') {
      return diary.ai_character_names[currentLang] || diary.ai_character_names[fallbackLang];
    } else if (diary.ai_character_name) {
      return diary.ai_character_name;
    }
    return null;
  };

  if (loading) {
    return <div className="page-container">{t('diary_detail_loading')}</div>;
  }

  if (error) {
    return <div className="page-container error-message">{error}</div>;
  }

  if (!diary) {
    return <div className="page-container">{t('diary_detail_diary_not_found_fallback')}</div>;
  }

  const characterName = getCharacterNameForDisplay(diary);

  return (
    <div className="page-container diary-detail-page">
      <header className="garden-header">
        <Mascot />
        <div className="greeting">
          <h2>{t('diary_detail_title')}</h2>
          <p>{new Date(diary.created_at).toLocaleDateString("ko-KR")}</p>
        </div>
      </header>

      <div className="diary-item-display">
        <div className="diary-content-section">
          <div className="diary-meta">
            {diary.emotion &&
              diary.emotion.map((emo) => (
                <span key={emo} className={`emotion-tag emotion-bg-${emo}`}>
                  {t(`emotion_${emo}`, emo)}
                </span>
              ))}
          </div>
          <div className="diary-sticker-preview">
            <p className="diary-content">{diary.content}</p>
            <div className="diary-sticker-preview-layer" aria-hidden="true">
              {(diary.stickers || []).map((sticker) => (
                <StickerPreviewImage
                  key={sticker.id || `${sticker.sticker_file_name}-${sticker.z_index}`}
                  sticker={sticker}
                />
              ))}
            </div>
          </div>
          {diary.ai_feedback && (
            <div className="ai-feedback">
              <p className="ai-character-name">
                {characterName ? characterName + t('from_ai_character_suffix') : t('ai_advice')}
              </p>
              <p className="ai-feedback-text">{diary.ai_feedback}</p>
            </div>
          )}
          <ComfortNoteButton diary={diary} onDiaryUpdated={setDiary} />
        </div>
        <div className="diary-actions">
          <Link to={`/write/${diary.id}`} className="edit-link">
            {t('edit')}
          </Link>
          <button onClick={handleDelete} className="delete-button">
            {t('delete')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DiaryDetail;
