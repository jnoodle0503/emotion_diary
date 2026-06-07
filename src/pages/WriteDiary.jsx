import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  api,
  getStickerAssetCandidates,
  getStickerAssetUrl,
} from '../lib/api';
import './Pages.css';
import './WriteDiary.css';
import { useTranslation } from 'react-i18next';

const EMOTIONS = {
  'joy': '😊', 'happiness': '🥰', 'excitement': '🤩', 'proud': '😌', 'calmness': '😌', 
  'sadness': '😢', 'depression': '😞', 'anger': '😠', 'anxiety': '😟',
  'love': '❤️', 'surprise': '😮', 'boredom': '😴', 'tiredness': '😩'
};

const DEFAULT_STICKER_WIDTH_PERCENT = 18;

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

function createStickerClientId() {
  return `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function clampPercent(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 50;
  }

  return Math.min(100, Math.max(0, numericValue));
}

function normalizeDiarySticker(sticker, index) {
  const fileName = sticker.sticker_file_name || sticker.file_name;

  return {
    client_id: createStickerClientId(),
    sticker_file_name: fileName,
    url: getStickerAssetUrl(sticker.url || fileName),
    x_percent: clampPercent(sticker.x_percent),
    y_percent: clampPercent(sticker.y_percent),
    width_percent: Number(sticker.width_percent) || DEFAULT_STICKER_WIDTH_PERCENT,
    rotation: Number(sticker.rotation) || 0,
    z_index: Number(sticker.z_index) || index + 1,
  };
}

function StickerImage({ fileName, src, className }) {
  const candidates = getStickerAssetCandidates(src || fileName);
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [fileName, src]);

  if (candidates.length === 0) {
    return null;
  }

  return (
    <img
      className={className}
      src={candidates[candidateIndex]}
      alt=""
      draggable="false"
      onError={() => {
        setCandidateIndex((index) => Math.min(index + 1, candidates.length - 1));
      }}
    />
  );
}

function WriteDiary() {
  const { t, i18n } = useTranslation();
  const { id: diaryId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const diaryFormRef = useRef(null);
  const textareaRef = useRef(null);
  const draggingStickerRef = useRef(null);

  const [content, setContent] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preselectedDate, setPreselectedDate] = useState(null);
  const [emotionSheetOpen, setEmotionSheetOpen] = useState(false);
  const [stickerSheetOpen, setStickerSheetOpen] = useState(false);
  const [stickerCatalog, setStickerCatalog] = useState([]);
  const [stickers, setStickers] = useState([]);
  const [activeStickerId, setActiveStickerId] = useState(null);
  const [isWritingFocused, setIsWritingFocused] = useState(false);
  const isEditing = !!diaryId;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [existingFeedback, setExistingFeedback] = useState(null);
  const [existingCharNames, setExistingCharNames] = useState(null);
  const [existingFeedbackReaction, setExistingFeedbackReaction] = useState(null);

  useEffect(() => {
    let mounted = true;

    api.getStickers()
      .then((items) => {
        if (mounted) {
          setStickerCatalog(Array.isArray(items) ? items : []);
        }
      })
      .catch((error) => {
        console.error('Error fetching stickers:', error);
        if (mounted) {
          setStickerCatalog([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

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
          setStickers((data.stickers || []).map(normalizeDiarySticker));
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

  const openStickerSheet = () => {
    textareaRef.current?.blur();
    setIsWritingFocused(false);
    setStickerSheetOpen(true);
  };

  const addSticker = (sticker) => {
    const nextZIndex = stickers.reduce((max, item) => Math.max(max, item.z_index || 1), 0) + 1;
    const fileName = sticker.file_name || sticker.sticker_file_name;

    if (!fileName) {
      return;
    }

    const placedSticker = {
      client_id: createStickerClientId(),
      sticker_file_name: fileName,
      url: getStickerAssetUrl(sticker.url || fileName),
      x_percent: 50,
      y_percent: 50,
      width_percent: DEFAULT_STICKER_WIDTH_PERCENT,
      rotation: 0,
      z_index: nextZIndex,
    };

    setStickers((prev) => [...prev, placedSticker]);
    setActiveStickerId(placedSticker.client_id);
    setStickerSheetOpen(false);
  };

  const removeActiveSticker = () => {
    if (!activeStickerId) {
      return;
    }

    setStickers((prev) => prev.filter((sticker) => sticker.client_id !== activeStickerId));
    setActiveStickerId(null);
  };

  const moveStickerToPointer = (clientId, event) => {
    const formRect = diaryFormRef.current?.getBoundingClientRect();

    if (!formRect) {
      return;
    }

    const dragState = draggingStickerRef.current;
    const offsetX = dragState?.clientId === clientId ? dragState.offsetX : 0;
    const offsetY = dragState?.clientId === clientId ? dragState.offsetY : 0;
    const xPercent = ((event.clientX - offsetX - formRect.left) / formRect.width) * 100;
    const yPercent = ((event.clientY - offsetY - formRect.top) / formRect.height) * 100;

    setStickers((prev) => prev.map((sticker) => (
      sticker.client_id === clientId
        ? {
            ...sticker,
            x_percent: clampPercent(xPercent),
            y_percent: clampPercent(yPercent),
          }
        : sticker
    )));
  };

  const handleStickerPointerDown = (event, clientId) => {
    event.preventDefault();
    event.stopPropagation();
    const formRect = diaryFormRef.current?.getBoundingClientRect();
    const sticker = stickers.find((item) => item.client_id === clientId);

    if (formRect && sticker) {
      const stickerCenterX = formRect.left + (sticker.x_percent / 100) * formRect.width;
      const stickerCenterY = formRect.top + (sticker.y_percent / 100) * formRect.height;
      draggingStickerRef.current = {
        clientId,
        offsetX: event.clientX - stickerCenterX,
        offsetY: event.clientY - stickerCenterY,
      };
    } else {
      draggingStickerRef.current = { clientId, offsetX: 0, offsetY: 0 };
    }

    setActiveStickerId(clientId);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    moveStickerToPointer(clientId, event);
  };

  const handleStickerPointerMove = (event, clientId) => {
    if (draggingStickerRef.current?.clientId !== clientId) {
      return;
    }

    event.preventDefault();
    moveStickerToPointer(clientId, event);
  };

  const handleStickerPointerEnd = (event) => {
    draggingStickerRef.current = null;
    try {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    } catch {
      // Pointer capture may already be released by the browser.
    }
  };

  const getSelectedEmotionLabel = () => {
    if (selectedEmotions.length === 0) {
      return t('write_diary_emotion_none');
    }

    return selectedEmotions
      .map((emotion) => t(`emotion_${emotion}`))
      .join(', ');
  };

  const handleFinalSave = async (feedbackToSave = null, characterNamesToSave = null, feedbackReaction = null) => {
    const diaryData = { 
      content, 
      emotion: selectedEmotions,
      ai_feedback: feedbackToSave,
      ai_character_names: characterNamesToSave,
      ai_feedback_reaction: feedbackReaction,
      stickers: stickers.map((sticker) => ({
        sticker_file_name: sticker.sticker_file_name,
        x_percent: sticker.x_percent,
        y_percent: sticker.y_percent,
        width_percent: sticker.width_percent,
        rotation: sticker.rotation,
        z_index: sticker.z_index,
      })),
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
        <form ref={diaryFormRef} onSubmit={handleSubmit} className="write-diary-form">
          <div className="form-section">
            <div className="diary-question-row">
              <label htmlFor="diary-content">{t('write_diary_content_question')}</label>
              <button
                type="button"
                className="emotion-sheet-trigger"
                onClick={() => setEmotionSheetOpen(true)}
              >
                {t('write_diary_select_emotion')}
              </button>
            </div>
            <p className="selected-emotion-summary">{getSelectedEmotionLabel()}</p>
            {activeStickerId && (
              <button
                type="button"
                className="remove-sticker-btn"
                onClick={removeActiveSticker}
              >
                {t('write_diary_remove_sticker')}
              </button>
            )}
            <textarea 
              ref={textareaRef}
              id="diary-content"
              placeholder={t('write_diary_content_placeholder')}
              value={content} 
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsWritingFocused(true)}
              onBlur={() => window.setTimeout(() => setIsWritingFocused(false), 120)}
            />
          </div>
          <div className="diary-sticker-layer" aria-label={t('write_diary_sticker_layer_label')}>
            {stickers.map((sticker) => (
              <button
                type="button"
                key={sticker.client_id}
                className={`placed-sticker ${activeStickerId === sticker.client_id ? 'active' : ''}`}
                style={{
                  left: `${sticker.x_percent}%`,
                  top: `${sticker.y_percent}%`,
                  width: `${sticker.width_percent}%`,
                  transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
                  zIndex: sticker.z_index,
                }}
                onPointerDown={(event) => handleStickerPointerDown(event, sticker.client_id)}
                onPointerMove={(event) => handleStickerPointerMove(event, sticker.client_id)}
                onPointerUp={handleStickerPointerEnd}
                onPointerCancel={handleStickerPointerEnd}
                aria-label={t('write_diary_move_sticker')}
              >
                <StickerImage fileName={sticker.sticker_file_name} src={sticker.url} />
              </button>
            ))}
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => navigate('/calendar')} className="cancel-btn">{t('cancel')}</button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? t('write_diary_saving') : (isEditing ? t('write_diary_edit_complete') : t('write_diary_record'))}
            </button>
          </div>
        </form>
        {isWritingFocused && !stickerSheetOpen && !emotionSheetOpen && (
          <div className="keyboard-sticker-accessory">
            <button
              type="button"
              className="keyboard-sticker-button"
              onMouseDown={(event) => event.preventDefault()}
              onPointerDown={(event) => {
                event.preventDefault();
                openStickerSheet();
              }}
              onClick={openStickerSheet}
            >
              {t('write_diary_add_sticker')}
            </button>
          </div>
        )}
        {emotionSheetOpen && (
          <div className="emotion-sheet-overlay" role="presentation" onClick={() => setEmotionSheetOpen(false)}>
            <div
              className="emotion-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="emotion-sheet-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="emotion-sheet-handle" aria-hidden="true" />
              <div className="emotion-sheet-header">
                <h3 id="emotion-sheet-title">{t('write_diary_content_question')}</h3>
                <button
                  type="button"
                  className="emotion-sheet-close"
                  onClick={() => setEmotionSheetOpen(false)}
                  aria-label={t('close')}
                >
                  ×
                </button>
              </div>
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
              <button
                type="button"
                className="emotion-sheet-done"
                onClick={() => setEmotionSheetOpen(false)}
              >
                {t('done')}
              </button>
            </div>
          </div>
        )}
        {stickerSheetOpen && (
          <div className="sticker-sheet-overlay" role="presentation" onClick={() => setStickerSheetOpen(false)}>
            <div
              className="sticker-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="sticker-sheet-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="emotion-sheet-handle" aria-hidden="true" />
              <div className="emotion-sheet-header">
                <h3 id="sticker-sheet-title">{t('write_diary_sticker_sheet_title')}</h3>
                <button
                  type="button"
                  className="emotion-sheet-close"
                  onClick={() => setStickerSheetOpen(false)}
                  aria-label={t('close')}
                >
                  ×
                </button>
              </div>
              {stickerCatalog.length > 0 ? (
                <div className="sticker-selector">
                  {stickerCatalog.map((sticker) => (
                    <button
                      type="button"
                      key={sticker.id || sticker.file_name}
                      className="sticker-option"
                      onClick={() => addSticker(sticker)}
                      aria-label={t('write_diary_add_sticker')}
                    >
                      <StickerImage
                        fileName={sticker.file_name || sticker.sticker_file_name}
                        src={getStickerAssetUrl(sticker.url || sticker.file_name || sticker.sticker_file_name)}
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="sticker-empty-message">{t('write_diary_sticker_empty')}</p>
              )}
            </div>
          </div>
        )}
      </div>
  );
}

export default WriteDiary;
