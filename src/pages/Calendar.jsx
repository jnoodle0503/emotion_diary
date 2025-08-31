import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Import useNavigate
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { supabase, deleteDiaryEntry } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import Mascot from "../components/Mascot";
import { truncateText } from "../lib/textUtils";
import "./Pages.css";
import "./Calendar.css";

const INITIAL_DISPLAY_LIMIT = 5; // 초기 표시 일기 개수

function CalendarPage() {
  const location = useLocation();
  const { user, profile, loading: authLoading } = useAuth(); // Get profile and authLoading
  const navigate = useNavigate(); // Initialize useNavigate
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [monthlyDiaries, setMonthlyDiaries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [diariesForSelectedDay, setDiariesForSelectedDay] = useState([]); // 선택된 날짜의 모든 일기
  const [displayLimit, setDisplayLimit] = useState(INITIAL_DISPLAY_LIMIT); // 현재 표시할 일기 개수
  const [hasMoreDiaries, setHasMoreDiaries] = useState(false); // 더 불러올 일기가 있는지 여부
  const [loading, setLoading] = useState(true); // Data fetching loading

  // Helper function to format Date object to YYYY-MM-DD string (local time)
  const formatDateToYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    // Only fetch if user and profile are loaded and nickname exists
    if (!user || !profile || !profile.nickname) {
      setLoading(false); // Stop loading if user/profile not ready
      return;
    }

    const fetchDiariesForMonth = async (date) => {
      setLoading(true);
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999); // 마지막 날의 끝까지 포함

      const { data, error } = await supabase
        .from("diaries")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: false }); // 생성일 기준 내림차순 정렬

      if (error) {
        console.error("Error fetching diaries for month:", error);
        setMonthlyDiaries([]);
      } else {
        setMonthlyDiaries(data);
      }
      setLoading(false);
    };

    fetchDiariesForMonth(activeStartDate);
  }, [activeStartDate, user, profile, location.key]); // Depend on user and profile

  useEffect(() => {
    if (!selectedDate) {
      setDiariesForSelectedDay([]);
      setDisplayLimit(INITIAL_DISPLAY_LIMIT); // 날짜 변경 시 리밋 초기화
      return;
    }
    const selectedDateFormatted = formatDateToYYYYMMDD(selectedDate);
    const allDiariesForDay = monthlyDiaries.filter((diary) => {
      const diaryDate = new Date(diary.created_at);
      return (
        diaryDate.getFullYear() === selectedDate.getFullYear() &&
        diaryDate.getMonth() === selectedDate.getMonth() &&
        diaryDate.getDate() === selectedDate.getDate()
      );
    });

    // 일기 정렬 (이미 월별 데이터가 정렬되어 오지만, 혹시 몰라 다시 정렬)
    allDiariesForDay.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    setDiariesForSelectedDay(allDiariesForDay);
    setHasMoreDiaries(allDiariesForDay.length > displayLimit);
  }, [selectedDate, monthlyDiaries, displayLimit]);

  const handleDateClick = (date) => {
    if (loading || authLoading) return;
    setSelectedDate(date);
    setDisplayLimit(INITIAL_DISPLAY_LIMIT); // 날짜 클릭 시 리밋 초기화
  };

  const handleActiveStartDateChange = ({ activeStartDate }) => {
    setSelectedDate(null);
    setActiveStartDate(activeStartDate);
  };

  const handleLoadMore = () => {
    setDisplayLimit((prevLimit) => prevLimit + INITIAL_DISPLAY_LIMIT);
  };

  const handleDelete = async (id) => {
    if (window.confirm("정말로 이 일기를 삭제하시겠습니까?")) {
      try {
        await deleteDiaryEntry(id);
        // 삭제된 일기를 상태에서 제거
        setMonthlyDiaries((prevDiaries) =>
          prevDiaries.filter((diary) => diary.id !== id)
        );
        alert("일기가 성공적으로 삭제되었습니다.");
      } catch (error) {
        alert("일기 삭제에 실패했습니다.");
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
      return mainEmotion ? (
        <div className={`diary-marker emotion-bg-${mainEmotion}`}></div>
      ) : null;
    }
    return null;
  };

  return (
    <div className="page-container">
      <header className="garden-header">
        <Mascot />
        <div className="greeting">
          <h2>마음 정원</h2>
          <p>
            {profile && profile.nickname
              ? `안녕하세요, ${profile.nickname}님! `
              : ""}
            오늘의 마음은 어땠나요? 차분히 하루를 돌아보세요.
          </p>
        </div>
      </header>

      <div className={`calendar-container ${loading ? "loading" : ""}`}>
        <Calendar
          onChange={handleDateClick}
          onActiveStartDateChange={handleActiveStartDateChange}
          activeStartDate={activeStartDate}
          tileContent={tileContent}
          formatDay={(locale, date) => date.getDate()}
          calendarType="gregory"
          value={selectedDate}
          disabled={loading || authLoading} // Disable calendar during any loading
        />
      </div>

      <div className="diary-view-area">
        {selectedDate && (
          <div className="selected-diary-container">
            <div className="selected-diary-header">
              <h3>{selectedDate.toLocaleDateString("ko-KR")}</h3>
              <div className="write-diary-for-day-btn-container">
                <Link
                  to={`/write?date=${formatDateToYYYYMMDD(selectedDate)}`}
                  className="write-diary-for-day-btn"
                >
                  이 날에 일기 작성하기
                </Link>
              </div>
            </div>
            {diariesForSelectedDay.length > 0 ? (
              diariesForSelectedDay.slice(0, displayLimit).map((diary) => (
                <Link
                  to={`/diary/${diary.id}`}
                  key={diary.id}
                  className="diary-item-link"
                >
                  {" "}
                  {/* New Link wrapper */}
                  <div className="diary-item-display">
                    <div className="diary-content-section">
                      <div className="diary-meta">
                        {diary.emotion &&
                          diary.emotion.map((emo) => (
                            <span
                              key={emo}
                              className={`emotion-tag emotion-bg-${emo}`}
                            >
                              {emo}
                            </span>
                          ))}
                      </div>
                      <p className="diary-content">
                        {truncateText(diary.content, 100)}
                      </p>{" "}
                      {/* Apply truncateText */}
                      {diary.ai_feedback && (
                        <div className="ai-feedback">
                          <p className="ai-character-name">
                            {diary.ai_character_name + "(으)로 부터..." ||
                              "AI의 조언"}
                          </p>
                          <p className="ai-feedback-text">
                            {diary.ai_feedback}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="diary-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/write/${diary.id}`);
                        }}
                        className="edit-link"
                      >
                        수정
                      </button>{" "}
                      {/* Changed to button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(diary.id);
                        }}
                        className="delete-button"
                      >
                        삭제
                      </button>{" "}
                      {/* Stop propagation */}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="no-diary-message">
                <p>이 날에는 기록된 마음이 없네요.</p>
              </div>
            )}
            {hasMoreDiaries && (
              <button onClick={handleLoadMore} className="load-more-btn">
                더 보기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CalendarPage;
