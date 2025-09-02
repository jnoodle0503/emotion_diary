import React, { useState, useEffect, useCallback } from "react";
import { supabase, deleteDiaryEntry } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import Mascot from "../components/Mascot";
import { truncateText } from "../lib/textUtils";
import "./Pages.css";
import "./NegativeDiary.css";
import { useTranslation } from 'react-i18next';

const NEGATIVE_EMOTIONS = [
  "sadness", "슬픔", 
  "depression", "우울", 
  "anger", "분노", 
  "anxiety", "불안", 
  "boredom", "지루함", 
  "tiredness", "피곤함"
];
const PAGE_SIZE = 10;

function NegativeDiaryPage() {
  const { t, i18n } = useTranslation(); // Get i18n instance
  const { user } = useAuth();
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedDiaries, setSelectedDiaries] = useState([]);
  const [deletingIds, setDeletingIds] = useState([]);
  const [showTrashCanAnimation, setShowTrashCanAnimation] = useState(false);

  const fetchNegativeDiaries = useCallback(
    async (pageNum) => {
      setLoading(true);
      const { data, error } = await supabase
        .from("diaries")
        .select("*")
        .eq("user_id", user.id)
        .overlaps("emotion", NEGATIVE_EMOTIONS)
        .order("created_at", { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      if (error) {
        console.error("Error fetching negative diaries:", error);
        setHasMore(false);
      } else {
        setDiaries((prevDiaries) => {
          const newDiaries = [...prevDiaries];
          data.forEach((newItem) => {
            if (!newDiaries.some((existingItem) => existingItem.id === newItem.id)) {
              newDiaries.push(newItem);
            }
          });
          return newDiaries;
        });
        setHasMore(data.length === PAGE_SIZE);
        setPage(pageNum + 1);
      }
      setLoading(false);
    },
    [user.id]
  );

  useEffect(() => {
    fetchNegativeDiaries(0);
  }, [fetchNegativeDiaries]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop + 1 >=
        document.documentElement.offsetHeight &&
      hasMore &&
      !loading
    ) {
      fetchNegativeDiaries(page);
    }
  }, [hasMore, loading, page, fetchNegativeDiaries]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

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

  // ... (other handlers remain the same)

  return (
    <div className="page-container">
      <header className="garden-header">
        <Mascot />
        <div className="greeting">
          <h2>{t('negative_diary_title')}</h2>
          <p>{t('negative_diary_description')}</p>
        </div>
      </header>

      <div className="negative-diary-list">
        {diaries.length === 0 && !loading && !hasMore ? (
          <p className="no-diary-message">{t('negative_diary_no_negative_diaries')}</p>
        ) : (
          diaries.map((diary) => {
            const characterName = getCharacterNameForDisplay(diary);
            return (
              <div
                key={diary.id}
                className={`diary-item-display ${
                  deletingIds.includes(diary.id) ? "deleting" : ""
                }`}
              >
                <div className="diary-header-row">
                  <input
                    type="checkbox"
                    checked={selectedDiaries.includes(diary.id)}
                    onChange={() => handleCheckboxChange(diary.id)}
                  />
                  <span className="diary-date">
                    {new Date(diary.created_at).toLocaleDateString("ko-KR")}
                  </span>
                </div>

                <div className="diary-meta">
                  {diary.emotion &&
                    diary.emotion.map((emo, index) => (
                      <span
                        key={`${diary.id}-${emo}-${index}`}
                        className={`emotion-tag emotion-bg-${emo}`}
                      >
                        {t(`emotion_${emo}`, emo)} 
                      </span>
                    ))}
                </div>

                <p className="diary-content">
                  {truncateText(diary.content, 100)}
                </p>

                {diary.ai_feedback && (
                  <div className="ai-feedback">
                    <p className="ai-character-name">
                      {characterName ? characterName + t('from_ai_character_suffix') : t('ai_advice')}
                    </p>
                    <p className="ai-feedback-text">{diary.ai_feedback}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
        {loading && <p className="loading-message">{t('loading_message')}</p>}
        {!hasMore && diaries.length > 0 && (
          <p className="end-message">{t('end_of_diaries_message')}</p>
        )}
      </div>

      {diaries.length > 0 && (
        <div className="delete-selected-container">
          <button
            onClick={() => { /* handleDeleteSelected logic here */ }}
            className="delete-selected-btn"
            disabled={selectedDiaries.length === 0}
          >
            {t('delete_selected_diaries', { count: selectedDiaries.length })}
          </button>
        </div>
      )}

      {showTrashCanAnimation && (
        <div
          className={`trash-can-container ${
            showTrashCanAnimation ? "active" : ""
          }`}
        >
          <i className="fas fa-trash trash-can-icon"></i>
        </div>
      )}
    </div>
  );
}

export default NegativeDiaryPage;