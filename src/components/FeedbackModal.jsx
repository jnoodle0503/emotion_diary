import React from 'react';
import './FeedbackModal.css';
import { useTranslation } from 'react-i18next'; // Import useTranslation

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