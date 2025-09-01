import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase, deleteDiaryEntry } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import Mascot from "../components/Mascot";
import "./Pages.css";
import "./DiaryDetail.css"; // New CSS file for this page
import { useTranslation } from 'react-i18next'; // Import useTranslation

function DiaryDetail() {
  const { t } = useTranslation(); // Initialize useTranslation
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
      const { data, error } = await supabase
        .from("diaries")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id) // Ensure user owns the diary
        .single();

      if (error) {
        console.error("Error fetching diary:", error);
        setError(t('diary_detail_error_fetching_diary'));
        setDiary(null);
      } else if (!data) {
        setError(t('diary_detail_diary_not_found'));
        setDiary(null);
      } else {
        setDiary(data);
      }
      setLoading(false);
    };

    fetchDiary();
  }, [id, user, navigate, t]); // Added t to dependency array

  const handleDelete = async () => {
    if (window.confirm(t('diary_detail_confirm_delete'))) {
      try {
        await deleteDiaryEntry(diary.id);
        alert(t('diary_detail_alert_deleted'));
        navigate("/calendar"); // Go back to calendar after deletion
      } catch (error) {
        console.error("Error deleting diary:", error);
        alert(t('diary_detail_alert_delete_failed'));
      }
    }
  };

  if (loading) {
    return <div className="page-container">{t('diary_detail_loading')}</div>;
  }

  if (error) {
    return <div className="page-container error-message">{error}</div>;
  }

  if (!diary) {
    return <div className="page-container">{t('diary_detail_diary_not_found_fallback')}</div>; // Should be caught by error state, but as a fallback
  }

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
        {" "}
        {/* Reusing common diary item display styles */}
        <div className="diary-content-section">
          <div className="diary-meta">
            {diary.emotion &&
              diary.emotion.map((emo) => (
                <span key={emo} className={`emotion-tag emotion-bg-${emo}`}>
                  {emo}
                </span>
              ))}
          </div>
          <p className="diary-content">{diary.content}</p>
          {diary.ai_feedback && (
            <div className="ai-feedback">
              <p className="ai-character-name">
                {diary.ai_character_name + t('from_ai_character_suffix') || t('ai_advice')}
              </p>
              <p className="ai-feedback-text">{diary.ai_feedback}</p>
            </div>
          )}
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
