import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Mascot from '../components/Mascot';
// EmotionIcon 더 이상 사용 안함
import './Pages.css';
import './WriteDiary.css';

const EMOTIONS = {
  '기쁨': '😊', '행복': '🥰', '설렘': '🤩', '평온': '😌', 
  '슬픔': '😢', '우울': '😞', '분노': '😠', '불안': '😟',
  '사랑': '❤️', '놀람': '😮', '지루함': '😴', '피곤함': '😩'
};

function WriteDiary() {
  const { user } = useAuth();
  const { id: diaryId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [content, setContent] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preselectedDate, setPreselectedDate] = useState(null);
  const isEditing = !!diaryId;

  useEffect(() => {
    if (isEditing) {
      const fetchDiary = async () => {
        const { data, error } = await supabase.from('diaries').select('*').eq('id', diaryId).single();
        if (error) {
          console.error('Error fetching diary:', error);
          navigate('/calendar');
        } else {
          setContent(data.content);
          setSelectedEmotions(data.emotion || []);
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
  }, [diaryId, isEditing, navigate, searchParams]);

  const handleEmotionClick = (emotion) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || selectedEmotions.length === 0) {
      alert('일기 내용과 감정을 하나 이상 선택해주세요.');
      return;
    }
    const diaryData = { 
      content, 
      emotion: selectedEmotions,
      user_id: user.id 
    };

    if (!isEditing && preselectedDate) {
      diaryData.created_at = preselectedDate + 'T12:00:00Z'; // UTC 정오 기준으로 저장
    }

    const { error } = isEditing
      ? await supabase.from('diaries').update(diaryData).eq('id', diaryId)
      : await supabase.from('diaries').insert(diaryData);

    if (error) {
      console.error('Error saving diary:', error);
      alert('일기 저장 중 오류가 발생했습니다.');
    } else {
      navigate('/calendar');
    }
  };

  if (loading) {
    return <div className="page-container">Loading...</div>;
  }

  return (
    <div className="page-container write-page-container">
      <div className="mascot-container">
        <Mascot /> {/* mood prop 제거 */}
        <p className="mascot-prompt">마음의 소리에 귀를 기울여보세요.</p>
      </div>
      <form onSubmit={handleSubmit} className="write-diary-form">
        <div className="form-section">
          <label>오늘 어떤 감정을 느꼈나요?</label>
          <div className="emotion-selector">
            {Object.entries(EMOTIONS).map(([name, emoji]) => (
              <button 
                type="button"
                key={name}
                className={`emotion-btn ${selectedEmotions.includes(name) ? 'selected' : ''}`}
                onClick={() => handleEmotionClick(name)}
              >
                <span className="emotion-emoji">{emoji}</span>
                <span className="emotion-name">{name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="form-section">
          <label>어떤 일이 있었나요?</label>
          <textarea 
            placeholder="이곳에 편안하게 이야기를 적어주세요."
            value={content} 
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/calendar')} className="cancel-btn">취소</button>
          <button type="submit" className="submit-btn">{isEditing ? '수정 완료' : '기록하기'}</button>
        </div>
      </form>
    </div>
  );
}

export default WriteDiary;
