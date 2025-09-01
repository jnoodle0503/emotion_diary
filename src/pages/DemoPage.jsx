import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Mascot from '../components/Mascot';
import { dummyDiaries } from '../lib/dummyData';
import './DemoPage.css';
import './Pages.css'; // For common styles like emotion tags

// Import the new images
import calendarImage from '../assets/img/demo/calendar_diary_list.png';
import chartImage from '../assets/img/demo/emotion_chart.png';
import detailImage from '../assets/img/demo/calendar_diary_list_detail.png';

function DemoPage() {
  const [showFeedback, setShowFeedback] = useState(false);
  const sampleDiary = dummyDiaries[0];

  return (
    <div className="page-container demo-page-container">
      <header className="demo-header">
        <div className="mascot-container">
          <Mascot />
        </div>
        <h1>Marden에 오신 것을 환영합니다!</h1>
        <p>Marden은 당신의 마음을 기록하고 돌보는 감성 일기 서비스입니다.</p>
        <p>로그인 없이 핵심 기능을 맛보세요!</p>
      </header>

      {/* Feature 1: Writing Diary & AI Feedback */}
      <section className="demo-section">
        <h2>✨ 일기 작성 & AI 피드백</h2>
        <div className="feature-layout">
          <div className="fake-diary-writer">
            <textarea className="fake-textarea" readOnly value={sampleDiary.content} />
            <div className="fake-emotions">
              <p><strong>감정 선택:</strong></p>
              {sampleDiary.emotion.map(emo => (
                <span key={emo} className={`emotion-tag emotion-bg-${emo}`}>{emo}</span>
              ))}
            </div>
            {!showFeedback && (
              <button className="fake-ai-feedback-btn" onClick={() => setShowFeedback(true)}>
                마음이의 피드백 받기 (체험)
              </button>
            )}
            {showFeedback && (
              <div className="fake-ai-feedback ai-feedback">
                <p className="ai-character-name">{sampleDiary.ai_character_name}(으)로 부터...</p>
                <p className="ai-feedback-text">{sampleDiary.ai_feedback}</p>
              </div>
            )}
          </div>
          <div className="feature-image-container">
            <img src={detailImage} alt="Diary Detail Example" />
            <p className="image-caption">작성된 일기는 이렇게 표시됩니다.</p>
          </div>
        </div>
      </section>

      {/* Feature 2: Calendar View */}
      <section className="demo-section">
        <h2>📅 마음 달력</h2>
        <div className="feature-image-container-full">
          <img src={calendarImage} alt="Calendar View Example" />
          <p className="image-caption">작성한 일기의 감정을 달력에서 한눈에 모아보세요.</p>
        </div>
      </section>

      {/* Feature 3: Emotion Chart */}
      <section className="demo-section">
        <h2>📊 감정 통계</h2>
        <div className="feature-image-container-full">
          <img src={chartImage} alt="Emotion Chart Example" />
          <p className="image-caption">기간별 감정 통계를 통해 자신의 마음 상태를 돌아볼 수 있습니다.</p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="demo-section demo-cta">
        <h2>이제, 당신의 마음 정원을 가꿔보세요</h2>
        <p>Marden과 함께 매일의 감정을 기록하고, 따뜻한 위로를 받으며 성장하는 시간을 가져보세요.</p>
        <br />
        <Link to="/login" className="cta-button">
          Marden 시작하기
        </Link>
      </section>
    </div>
  );
}

export default DemoPage;