import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { ensurePushSubscription } from '../lib/notifications';

function ComfortNoteButton({ diary, onDiaryUpdated, showPrompt = true }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [requesting, setRequesting] = useState(false);

  const hasNote = Boolean(diary?.ai_feedback);
  const isPending = Boolean(diary?.ai_feedback_requested_at) && !hasNote;
  const isReviewed = hasNote && Boolean(diary?.ai_feedback_reaction);

  const getButtonText = () => {
    if (requesting || isPending) {
      return t('comfort_note_pending');
    }

    if (hasNote) {
      return isReviewed ? t('comfort_note_review') : t('comfort_note_ready');
    }

    return t('comfort_note_request');
  };

  const handleClick = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!diary?.id || requesting || isPending) {
      return;
    }

    if (hasNote) {
      navigate(`/ai-feedback/${diary.id}`);
      return;
    }

    setRequesting(true);

    try {
      try {
        await ensurePushSubscription();
      } catch (error) {
        console.warn('Push subscription failed:', error);
      }

      const updatedDiary = await api.requestComfortNote(diary.id, {
        ai_feedback_language: i18n.language,
      });
      onDiaryUpdated?.(updatedDiary);
      alert(t('comfort_note_requested'));
    } catch (error) {
      console.error('Error requesting comfort note:', error);
      alert(t('comfort_note_request_failed'));
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="comfort-note-action">
      {showPrompt && !hasNote && !isPending && (
        <p className="comfort-note-guide">{t('comfort_note_prompt')}</p>
      )}
      {isPending && (
        <p className="comfort-note-guide">{t('comfort_note_pending_description')}</p>
      )}
      <button
        type="button"
        className="comfort-note-button"
        disabled={requesting || isPending}
        onClick={handleClick}
      >
        {getButtonText()}
      </button>
    </div>
  );
}

export default ComfortNoteButton;
