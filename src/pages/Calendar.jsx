import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { supabase, deleteDiaryEntry } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import Mascot from "../components/Mascot";
import { truncateText } from "../lib/textUtils";
import "./Pages.css";
import "./Calendar.css";
import { useTranslation } from 'react-i18next';

const INITIAL_DISPLAY_LIMIT = 5;

function CalendarPage() {
  const location = useLocation();
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); // Get i18n instance
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [monthlyDiaries, setMonthlyDiaries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [diariesForSelectedDay, setDiariesForSelectedDay] = useState([]);
  const [displayLimit, setDisplayLimit] = useState(INITIAL_DISPLAY_LIMIT);
  const [hasMoreDiaries, setHasMoreDiaries] = useState(false);
  const [loading, setLoading] = useState(true);

  const formatDateToYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (!user || !profile || !profile.nickname) {
      setLoading(false);
      return;
    }

    const fetchDiariesForMonth = async (date) => {
      setLoading(true);
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("diaries")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching diaries for month:", error);
        setMonthlyDiaries([]);
      } else {
        setMonthlyDiaries(data);
      }
      setLoading(false);
    };

    fetchDiariesForMonth(activeStartDate);
  }, [activeStartDate, user, profile, location.key]);

  useEffect(() => {
    if (!selectedDate) {
      setDiariesForSelectedDay([]);
      setDisplayLimit(INITIAL_DISPLAY_LIMIT);
      return;
    }
    const filteredDiaries = monthlyDiaries.filter((diary) => {
      const diaryDate = new Date(diary.created_at);
      return (
        diaryDate.getFullYear() === selectedDate.getFullYear() &&
        diaryDate.getMonth() === selectedDate.getMonth() &&
        diaryDate.getDate() === selectedDate.getDate()
      );
    });

    // Ensure the final list is always sorted correctly and unique
    const uniqueAndSorted = filteredDiaries
      .filter((diary, index, self) => index === self.findIndex((d) => d.id === diary.id))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setDiariesForSelectedDay(uniqueAndSorted);
    setHasMoreDiaries(uniqueAndSorted.length > displayLimit);
  }, [selectedDate, monthlyDiaries, displayLimit]);

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

  const handleDelete = async (id) => {
    if (window.confirm(t('calendar_confirm_delete_diary'))) {
      try {
        await deleteDiaryEntry(id);
        setMonthlyDiaries((prevDiaries) => prevDiaries.filter((diary) => diary.id !== id));
        alert(t('calendar_alert_diary_deleted'));
      } catch (error) {
        alert(t('calendar_alert_delete_failed'));
      }
    }
  };

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const diaryForDay = monthlyDiaries.find((diary) => {
        const diaryDate = new Date(diary.created_at);
        return (
          diaryDate.getFullYear() === date.getFullYear() &&
          diaryDate.getMonth() === date.getMonth() &&
          diaryDate.getDate() === date.getDate()
        );
      });
      const mainEmotion = diaryForDay?.emotion?.[0];
      return mainEmotion ? <div className={`diary-marker emotion-bg-${mainEmotion}`}></div> : null;
    }
    return null;
  };

  return (
    <div className="page-container">
      <header className="garden-header">
        <Mascot />
        <div className="greeting">
          <h2>{t('calendar_garden_title')}</h2>
          <p>
            {profile && profile.nickname ? t('calendar_greeting_with_name', { nickname: profile.nickname }) : ""}
            {t('calendar_greeting_no_name')}
          </p>
        </div>
      </header>

      <div className={`calendar-container ${loading ? "loading" : ""}`}>
        <Calendar
          onChange={setSelectedDate}
          onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
          activeStartDate={activeStartDate}
          tileContent={tileContent}
          formatDay={(locale, date) => date.getDate()}
          calendarType="gregory"
          value={selectedDate}
          disabled={loading || authLoading}
        />
      </div>

      <div className="diary-view-area">
        {selectedDate && (
          <div className="selected-diary-container">
            <div className="selected-diary-header">
              <h3>{selectedDate.toLocaleDateString("ko-KR")}</h3>
              <div className="write-diary-for-day-btn-container">
                <Link to={`/write?date=${formatDateToYYYYMMDD(selectedDate)}`} className="write-diary-for-day-btn">
                  {t('calendar_write_diary_for_day')}
                </Link>
              </div>
            </div>
            {diariesForSelectedDay.length > 0 ? (
              diariesForSelectedDay.slice(0, displayLimit).map((diary) => {
                const characterName = getCharacterNameForDisplay(diary);
                return (
                  <Link to={`/diary/${diary.id}`} key={diary.id} className="diary-item-link">
                    <div className="diary-item-display">
                      <div className="diary-content-section">
                        <div className="diary-meta">
                          {diary.emotion && diary.emotion.map((emo) => (
                            <span key={emo} className={`emotion-tag emotion-bg-${emo}`}>
                              {t(`emotion_${emo}`, emo)}
                            </span>
                          ))}
                        </div>
                        <p className="diary-content">{truncateText(diary.content, 100)}</p>
                        {diary.ai_feedback && (
                          <div className="ai-feedback">
                            <p className="ai-character-name">
                              {characterName ? characterName + t('from_ai_character_suffix') : t('ai_advice')}
                            </p>
                            <p className="ai-feedback-text">{diary.ai_feedback}</p>
                          </div>
                        )}
                      </div>
                      <div className="diary-actions">
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/write/${diary.id}`); }} className="edit-link">
                          {t('edit')}
                        </button>
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(diary.id); }} className="delete-button">
                          {t('delete')}
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="no-diary-message">
                <p>{t('calendar_no_diary_message')}</p>
              </div>
            )}
            {diariesForSelectedDay.length > displayLimit && (
              <button onClick={() => setDisplayLimit(prev => prev + INITIAL_DISPLAY_LIMIT)} className="load-more-btn">
                {t('load_more')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CalendarPage;