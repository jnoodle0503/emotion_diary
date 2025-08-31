import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase, deleteDiaryEntry } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import Mascot from "../components/Mascot";
import "./Pages.css";
import "./DiaryDetail.css"; // New CSS file for this page

function DiaryDetail() {
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
        setError("일기를 불러오는 중 오류가 발생했습니다.");
        setDiary(null);
      } else if (!data) {
        setError("일기를 찾을 수 없습니다.");
        setDiary(null);
      } else {
        setDiary(data);
      }
      setLoading(false);
    };

    fetchDiary();
  }, [id, user, navigate]);

  const handleDelete = async () => {
    if (window.confirm("정말로 이 일기를 삭제하시겠습니까?")) {
      try {
        await deleteDiaryEntry(diary.id);
        alert("일기가 성공적으로 삭제되었습니다.");
        navigate("/calendar"); // Go back to calendar after deletion
      } catch (error) {
        console.error("Error deleting diary:", error);
        alert("일기 삭제에 실패했습니다.");
      }
    }
  };

  if (loading) {
    return <div className="page-container">일기를 불러오는 중...</div>;
  }

  if (error) {
    return <div className="page-container error-message">{error}</div>;
  }

  if (!diary) {
    return <div className="page-container">일기를 찾을 수 없습니다.</div>; // Should be caught by error state, but as a fallback
  }

  return (
    <div className="page-container diary-detail-page">
      <header className="garden-header">
        <Mascot />
        <div className="greeting">
          <h2>일기 상세 보기</h2>
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
                {diary.ai_character_name + "(으)로 부터..." || "AI의 조언"}
              </p>
              <p className="ai-feedback-text">{diary.ai_feedback}</p>
            </div>
          )}
        </div>
        <div className="diary-actions">
          <Link to={`/write/${diary.id}`} className="edit-link">
            수정
          </Link>
          <button onClick={handleDelete} className="delete-button">
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

export default DiaryDetail;
