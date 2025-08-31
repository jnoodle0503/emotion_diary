import React, { useState, useEffect, useCallback } from "react";
import { supabase, deleteDiaryEntry } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import Mascot from "../components/Mascot";
import { truncateText } from "../lib/textUtils"; // New import
import "./Pages.css";
import "./NegativeDiary.css"; // New CSS file for this page

const NEGATIVE_EMOTIONS = ["슬픔", "우울", "분노", "불안", "지루함", "피곤함"];
const PAGE_SIZE = 10;

function NegativeDiaryPage() {
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
        .overlaps("emotion", NEGATIVE_EMOTIONS) // Use 'overlaps' for array containment
        .order("created_at", { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      if (error) {
        console.error("Error fetching negative diaries:", error);
        setHasMore(false);
      } else {
        setDiaries((prevDiaries) => {
          const newDiaries = [...prevDiaries];
          data.forEach((newItem) => {
            if (
              !newDiaries.some((existingItem) => existingItem.id === newItem.id)
            ) {
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

  const handleCheckboxChange = (id) => {
    setSelectedDiaries((prev) =>
      prev.includes(id)
        ? prev.filter((diaryId) => diaryId !== id)
        : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedDiaries.length === 0) {
      alert("삭제할 일기를 선택해주세요.");
      return;
    }

    if (
      window.confirm(
        `선택된 ${selectedDiaries.length}개의 일기를 정말로 삭제하시겠습니까?`
      )
    ) {
      setDeletingIds(selectedDiaries);
      setShowTrashCanAnimation(true); // Trigger trash can animation

      // Delay actual deletion to allow animation to play
      setTimeout(async () => {
        try {
          for (const id of selectedDiaries) {
            await deleteDiaryEntry(id);
          }
          setDiaries((prevDiaries) =>
            prevDiaries.filter((diary) => !selectedDiaries.includes(diary.id))
          );
          setSelectedDiaries([]);
          setDeletingIds([]);
        } catch (error) {
          console.error("Error deleting selected diaries:", error);
          alert("일기 삭제에 실패했습니다.");
          setDeletingIds([]); // Reset deleting state on error
        } finally {
          setShowTrashCanAnimation(false); // Hide trash can after deletion
        }
      }, 1000); // Animation duration (e.g., 1 second)
    }
  };

  return (
    <div className="page-container">
      <header className="garden-header">
        <Mascot />
        <div className="greeting">
          <h2>마음의 그림자</h2>
          <p>당신의 마음을 힘들게 했던 기록들을 마주하고 정리해보세요.</p>
        </div>
      </header>

      <div className="negative-diary-list">
        {diaries.length === 0 && !loading && !hasMore ? (
          <p className="no-diary-message">
            아직 부정적인 감정의 일기가 없네요.
          </p>
        ) : (
          diaries.map((diary) => (
            <div
              key={diary.id}
              className={`diary-item-display ${
                deletingIds.includes(diary.id) ? "deleting" : ""
              }`}
              onTransitionEnd={(e) => {
                // Remove from DOM after transition if it's a deleting item
                if (
                  e.propertyName === "opacity" &&
                  deletingIds.includes(diary.id)
                ) {
                  setDiaries((prevDiaries) =>
                    prevDiaries.filter((d) => d.id !== diary.id)
                  );
                  setDeletingIds((prev) =>
                    prev.filter((id) => id !== diary.id)
                  );
                }
              }}
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
                      {emo}
                    </span>
                  ))}
              </div>

              <p className="diary-content">
                {truncateText(diary.content, 100)}
              </p>

              {diary.ai_feedback && (
                <div className="ai-feedback">
                  <p className="ai-character-name">
                    {diary.ai_character_name + "(으)로 부터..." || "AI의 조언"}
                  </p>
                  <p className="ai-feedback-text">{diary.ai_feedback}</p>
                </div>
              )}
            </div>
          ))
        )}
        {loading && <p className="loading-message">불러오는 중...</p>}
        {!hasMore && diaries.length > 0 && (
          <p className="end-message">더 이상 일기가 없습니다.</p>
        )}
      </div>

      {diaries.length > 0 && (
        <div className="delete-selected-container">
          <button
            onClick={handleDeleteSelected}
            className="delete-selected-btn"
            disabled={selectedDiaries.length === 0}
          >
            선택된 일기 삭제 ({selectedDiaries.length})
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
