import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { supabase, deleteDiaryEntry } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Mascot from '../components/Mascot';
import './Pages.css';
import './Calendar.css';

function CalendarPage() {
  const { user } = useAuth();
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [monthlyDiaries, setMonthlyDiaries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDiaries, setSelectedDiaries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to format Date object to YYYY-MM-DD string (local time)
  const formatDateToYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchDiariesForMonth = async (date) => {
      setLoading(true);
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('diaries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString()) 
        .lte('created_at', endDate.toISOString()); 

      if (error) {
        console.error('Error fetching diaries for month:', error);
        setMonthlyDiaries([]);
      } else {
        setMonthlyDiaries(data);
      }
      setLoading(false);
    };

    fetchDiariesForMonth(activeStartDate);
  }, [activeStartDate, user.id]);

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDiaries([]);
      return;
    }
    const selectedDateFormatted = formatDateToYYYYMMDD(selectedDate);
    const diariesForDay = monthlyDiaries.filter(diary => {
      const diaryDate = new Date(diary.created_at); 
      return diaryDate.getFullYear() === selectedDate.getFullYear() &&
             diaryDate.getMonth() === selectedDate.getMonth() &&
             diaryDate.getDate() === selectedDate.getDate();
    });
    setSelectedDiaries(diariesForDay);
  }, [selectedDate, monthlyDiaries]);

  const handleDateClick = (date) => {
    if (loading) return;
    setSelectedDate(date);
  };

  const handleActiveStartDateChange = ({ activeStartDate }) => {
    setSelectedDate(null);
    setActiveStartDate(activeStartDate);
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말로 이 일기를 삭제하시겠습니까?')) {
      try {
        await deleteDiaryEntry(id);
        // Update selectedDiaries to remove the deleted entry
        setSelectedDiaries(prevDiaries => prevDiaries.filter(diary => diary.id !== id));
        // Also update monthlyDiaries to reflect the change in the calendar view
        setMonthlyDiaries(prevDiaries => prevDiaries.filter(diary => diary.id !== id));
        alert('일기가 성공적으로 삭제되었습니다.');
      } catch (error) {
        alert('일기 삭제에 실패했습니다.');
      }
    }
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const diaryForDay = monthlyDiaries.find(diary => {
        const diaryDate = new Date(diary.created_at); 
        return diaryDate.getFullYear() === date.getFullYear() &&
               diaryDate.getMonth() === date.getMonth() &&
               diaryDate.getDate() === date.getDate();
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
          <h2>마음 정원</h2>
          <p>오늘의 마음은 어땠나요? 차분히 하루를 돌아보세요.</p>
        </div>
      </header>

      <div className={`calendar-container ${loading ? 'loading' : ''}`}>
        <Calendar
          onChange={handleDateClick}
          onActiveStartDateChange={handleActiveStartDateChange}
          activeStartDate={activeStartDate}
          tileContent={tileContent}
          formatDay={(locale, date) => date.getDate()}
          calendarType="gregory"
          value={selectedDate}
          disabled={loading}
        />
      </div>

      <div className="diary-view-area">
        {selectedDate && (
          <div className="selected-diary-container">
            <div className="selected-diary-header">
              <h3>{selectedDate.toLocaleDateString('ko-KR')}</h3>
              <div className="write-diary-for-day-btn-container">
                <Link 
                  to={`/write?date=${formatDateToYYYYMMDD(selectedDate)}`}
                  className="write-diary-for-day-btn"
                >
                  이 날에 일기 작성하기
                </Link>
              </div>
            </div>
            {selectedDiaries.length > 0 ? (
              selectedDiaries.map(diary => (
                <div key={diary.id} className="diary-item-display">
                   <div className="diary-content-section">
                      <div className="diary-meta">
                        {diary.emotion && diary.emotion.map(emo => (
                          <span key={emo} className={`emotion-tag emotion-bg-${emo}`}>{emo}</span>
                        ))}
                      </div>
                      <p className="diary-content">{diary.content}</p>
                      {diary.ai_feedback && (
                        <div className="ai-feedback">
                          <p><strong>마음이의 속삭임:</strong> {diary.ai_feedback}</p>
                        </div>
                      )}
                   </div>
                   <div className="diary-actions">
                      <Link to={`/write/${diary.id}`} className="edit-link">수정</Link>
                      <button onClick={() => handleDelete(diary.id)} className="delete-button">삭제</button>
                   </div>
                </div>
              ))
            ) : (
              <div className="no-diary-message">
                <p>이 날에는 기록된 마음이 없네요.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CalendarPage;