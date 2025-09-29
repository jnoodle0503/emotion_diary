import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Mascot from "../components/Mascot";
import Calendar from "react-calendar"; // Import react-calendar
import "react-calendar/dist/Calendar.css"; // Import calendar styles
import {
  dummyDiaries,
  generateDummyAiFeedback,
  dummyEmotions,
} from "../lib/dummyData";
import { truncateText } from "../lib/textUtils"; // Import truncateText
import "./DemoPage.css";
import "./Pages.css"; // For common styles like emotion tags
import { useTranslation } from 'react-i18next'; // Import useTranslation

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const EMOTION_COLORS = {
  기쁨: "#FFD700", // Gold
  행복: "#FF6347", // Tomato
  설렘: "#FFB6C1", // LightPink
  평온: "#98FB98", // PaleGreen
  슬픔: "#6495ED", // CornflowerBlue
  우울: "#4682B4", // SteelBlue
  분노: "#DC143C", // Crimson
  불안: "#FFA07A", // LightSalmon
  사랑: "#FF69B4", // HotPink
  놀람: "#ADD8E6", // LightBlue
  지루함: "#D3D3D3", // LightGrey
  피곤함: "#808080", // Gray
};

function DemoPage() {
  const { t } = useTranslation(); // Initialize useTranslation
  // State for Diary Writing section
  const [diaryInput, setDiaryInput] = useState("");
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [showAiFeedback, setShowAiFeedback] = useState(false);

  // State for Calendar section
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [diariesForSelectedDay, setDiariesForSelectedDay] = useState([]);

  // State for Emotion Chart section (no specific state needed, uses dummyEmotions directly)
  const [highlightedEmotion, setHighlightedEmotion] = useState(null);

  // Helper to format date to YYYY-MM-DD
  const formatDateToYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Filter diaries for selected day
  useEffect(() => {
    const formattedSelectedDate = formatDateToYYYYMMDD(selectedDate);
    let filteredDiaries = dummyDiaries.filter(
      (diary) => diary.date === formattedSelectedDate
    );

    // If no diaries for the selected date, show a default set
    if (filteredDiaries.length === 0) {
      // Use a subset of dummyDiaries as default, e.g., the first 3
      filteredDiaries = dummyDiaries.slice(0, 3);
    }
    setDiariesForSelectedDay(filteredDiaries);
  }, [selectedDate]);

  // Handle emotion tag click
  const handleEmotionClick = (emotion) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion)
        ? prev.filter((e) => e !== emotion)
        : [...prev, emotion]
    );
  };

  // Handle Get AI Feedback button click
  const handleGetAiFeedback = () => {
    if (diaryInput.trim() === "" || selectedEmotions.length === 0) {
      alert(t('demo_alert_select_diary_emotion'));
      return;
    }
    const feedback = generateDummyAiFeedback(diaryInput, selectedEmotions);
    setAiFeedback(feedback);
    setShowAiFeedback(true);
  };

  // Emotion Chart data preparation
  const chartLabels = Object.keys(EMOTION_COLORS);
  const chartCounts = chartLabels.map((label) => dummyEmotions[label] || 0);
  const chartBackgroundColors = chartLabels.map((label) =>
    highlightedEmotion && highlightedEmotion !== label
      ? EMOTION_COLORS[label] + "40" // 25% opacity for non-highlighted
      : EMOTION_COLORS[label]
  );
  const chartBorderColors = chartLabels.map((label) =>
    highlightedEmotion && highlightedEmotion !== label
      ? EMOTION_COLORS[label] + "80" // 50% opacity for non-highlighted
      : EMOTION_COLORS[label]
  );

  const data = {
    labels: chartLabels,
    datasets: [
      {
        label: t('chart_label_emotion_count'),
        data: chartCounts,
        backgroundColor: chartBackgroundColors,
        borderColor: chartBorderColors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow chart to fill container
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            family: "var(--font-main)",
            size: 14,
          },
          color: "var(--color-text-primary)",
          usePointStyle: true, // Use a point style for legend items
          boxWidth: 10, // Size of the color box
          boxHeight: 10,
        },
        onClick: (e, legendItem, legend) => {
          const emotionName = legendItem.text;
          setHighlightedEmotion((prev) =>
            prev === emotionName ? null : emotionName
          );
        },
      },
      title: {
        display: true,
        text: t('chart_title_emotion_stats'),
        font: {
          family: "var(--font-main)",
          size: 18,
          weight: "bold",
        },
        color: "var(--color-primary)",
      },
      tooltip: {
        backgroundColor: "var(--color-text-primary)",
        titleColor: "var(--color-white)",
        bodyColor: "var(--color-white)",
        borderColor: "var(--color-border)",
        borderWidth: 1,
        cornerRadius: 4,
        displayColors: true,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + t('chart_unit_count');
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: {
            family: "var(--font-main)",
            size: 12,
          },
          color: "var(--color-text-secondary)",
          callback: function (value, index, ticks) {
            return chartLabels[index];
          },
        },
        barPercentage: 0.8, // Adjust bar width
        categoryPercentage: 0.8, // Adjust space between categories
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "var(--color-gray-light)", // Light grid lines
          drawBorder: false,
        },
        ticks: {
          font: {
            family: "var(--font-main)",
            size: 12,
          },
          color: "var(--color-text-secondary)",
          callback: function (value) {
            if (value % 1 === 0) {
              return value;
            }
          },
        },
      },
    },
  };

  return (
    <div className="page-container demo-page-container">
      <header className="demo-header">
        <div className="mascot-container">
          <Mascot />
        </div>
        <h1>{t('welcome_to_marden')}</h1>
        <p>{t('marden_description_1')}</p>
        <p>{t('marden_description_2')}</p>
      </header>

      {/* Feature 1: Interactive Diary Writing & AI Feedback */}
      <section className="demo-section">
        <h2>{t('demo_section_title_diary_ai_feedback')}</h2>
        <p className="section-description">
          {t('demo_diary_ai_feedback_description_part1')}{" "}
          <span className="highlight-name">{t('robot_from_future')}</span>,{" "}
          <span className="highlight-name">{t('medieval_outlaw')}</span>{t('demo_diary_ai_feedback_description_part2')}
        </p>
        <div className="feature-layout">
          <div className="interactive-diary-writer">
            <textarea
              className="fake-textarea"
              placeholder={t('demo_diary_placeholder')}
              value={diaryInput}
              onChange={(e) => setDiaryInput(e.target.value)}
            />
            <div className="emotion-selection-area">
              <p>
                <strong>{t('emotion_selection_title')}</strong>
              </p>
              {[
                "기쁨",
                "슬픔",
                "분노",
                "불안",
                "설렘",
                "평온",
                "피곤함",
                "우울",
                "지루함",
              ].map((emotion) => (
                <span
                  key={emotion}
                  className={`emotion-tag ${
                    selectedEmotions.includes(emotion)
                      ? `emotion-bg-${emotion}`
                      : ""
                  }`}
                  onClick={() => handleEmotionClick(emotion)}
                >
                  {emotion}
                </span>
              ))}
            </div>
            <button
              className="fake-ai-feedback-btn"
              onClick={handleGetAiFeedback}
            >
              {t('get_maumi_feedback')}
            </button>
          </div>
          <div className="feature-image-container">
            {/* This image is now optional or can be removed if the interactive part is enough */}
            {/* <img src={detailImage} alt="Diary Detail Example" /> */}
            {showAiFeedback && aiFeedback && (
              <div className="fake-ai-feedback ai-feedback">
                <p className="ai-character-name">
                  {aiFeedback.ai_character_name}{t('from_ai_character')}
                </p>
                <p className="ai-feedback-text">{aiFeedback.ai_feedback}</p>
              </div>
            )}
            <p className="image-caption">
              {t('demo_write_diary_get_feedback')}
            </p>
          </div>
        </div>
      </section>

      {/* Feature 2: Interactive Calendar View */}
      <section className="demo-section">
        <h2>{t('demo_section_title_calendar')}</h2>
        <p className="section-description">
          {t('demo_calendar_description')}
        </p>
        <div className="calendar-and-diaries-layout">
          <div className="demo-calendar-container">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              formatDay={(locale, date) => date.getDate()}
              calendarType="gregory"
            />
          </div>
          <div className="demo-diaries-for-day">
            <h3>{selectedDate.toLocaleDateString("ko-KR")}{t('demo_diary_of_day')}</h3>
            {diariesForSelectedDay.length > 0 ? (
              diariesForSelectedDay.map((diary) => (
                <div
                  key={diary.id}
                  className="diary-item-display demo-diary-item"
                >
                  <div className="diary-content-section">
                    <div className="diary-meta">
                      {diary.emotion.map((emo) => (
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
                    </p>
                    {diary.ai_feedback && (
                      <div className="ai-feedback">
                        <p className="ai-character-name">
                          {diary.ai_character_name} {t('from_ai_character')}
                        </p>
                        <p className="ai-feedback-text">{diary.ai_feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-diary-message">
                <p>{t('demo_no_diary_message')}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature 3: Interactive Emotion Chart */}
      <section className="demo-section">
        <h2>{t('demo_section_title_emotion_stats')}</h2>
        <p className="section-description">
          {t('demo_emotion_stats_description')}
        </p>
        <div className="emotion-chart-container">
          {data.datasets[0].data.some((count) => count > 0) ? (
            <Bar data={data} options={options} />
          ) : (
            <p>{t('demo_no_emotion_data')}</p>
          )}
        </div>

        <div className="emotion-legend-demo">
          {chartLabels.map((emotion) => (
            <div
              key={emotion}
              className={`legend-item-demo ${
                highlightedEmotion === emotion ? "highlighted" : ""
              }`}
              onClick={() =>
                setHighlightedEmotion((prev) =>
                  prev === emotion ? null : emotion
                )
              }
            >
              <span
                className="legend-color-box-demo"
                style={{ backgroundColor: EMOTION_COLORS[emotion] }}
              ></span>
              <span className="legend-text-demo">
                {emotion} ({dummyEmotions[emotion] || 0}{t('chart_unit_count')})
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="demo-section demo-cta">
        <h2>{t('cta_title')}</h2>
        <p>
          {t('cta_description')}
        </p>
        <br />
        <Link to="/login" className="cta-button">
          <Mascot />
          {t('start_marden')}
        </Link>
      </section>
    </div>
  );
}

export default DemoPage;
