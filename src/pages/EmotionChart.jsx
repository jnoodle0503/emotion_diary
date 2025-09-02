import React, { useState, useEffect, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Mascot from '../components/Mascot';
import './Pages.css';
import './EmotionChart.css';
import { useTranslation } from 'react-i18next';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Reverting to the original, vibrant color scheme as per the design concept.
// Keys are now English for consistency with the data logic.
const EMOTION_COLORS = {
  joy:       '#FFD700', // Gold
  happiness: '#FF6347', // Tomato
  excitement:'#FFB6C1', // LightPink
  proud:     '#90EE90', // LightGreen
  calmness:  '#98FB98', // PaleGreen
  sadness:   '#6495ED', // CornflowerBlue
  depression:'#4682B4', // SteelBlue
  anger:     '#DC143C', // Crimson
  anxiety:   '#FFA07A', // LightSalmon
  love:      '#FF69B4', // HotPink
  surprise:  '#ADD8E6', // LightBlue
  boredom:   '#D3D3D3', // LightGrey
  tiredness: '#808080', // Gray
};

const EMOTION_KEYS = Object.keys(EMOTION_COLORS);

function EmotionChartPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [emotionData, setEmotionData] = useState({});
  const [loading, setLoading] = useState(true);
  const [highlightedEmotion, setHighlightedEmotion] = useState(null);
  const [chartTitleFontSize, setChartTitleFontSize] = useState(18);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleMediaQueryChange = (e) => {
      setChartTitleFontSize(e.matches ? 14 : 18);
    };
    handleMediaQueryChange(mediaQuery);
    mediaQuery.addEventListener('change', handleMediaQueryChange);
    return () => mediaQuery.removeEventListener('change', handleMediaQueryChange);
  }, []);

  const fetchEmotionData = useCallback(async () => {
    setLoading(true);
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from('diaries')
      .select('emotion')
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString());

    if (error) {
      console.error('Error fetching emotion data:', error);
      setEmotionData({});
    } else {
      const counts = {};
      const translationMap = EMOTION_KEYS.reduce((acc, key) => {
        acc[t(`emotion_${key}`)] = key;
        return acc;
      }, {});

      data.forEach(entry => {
        if (entry.emotion) {
          entry.emotion.forEach(emo => {
            const key = translationMap[emo] || (EMOTION_COLORS[emo] ? emo : null);
            if (key) {
              counts[key] = (counts[key] || 0) + 1;
            }
          });
        }
      });
      setEmotionData(counts);
    }
    setLoading(false);
  }, [currentMonth, user.id, t]);

  useEffect(() => {
    fetchEmotionData();
  }, [fetchEmotionData]);

  const handleMonthChange = (direction) => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(prevMonth.getMonth() + direction);
      return newMonth;
    });
  };

  const translatedLabels = EMOTION_KEYS.map(key => t(`emotion_${key}`));
  const chartCounts = EMOTION_KEYS.map(key => emotionData[key] || 0);
  
  const chartBackgroundColors = EMOTION_KEYS.map(key => {
    const color = EMOTION_COLORS[key];
    return highlightedEmotion && highlightedEmotion !== key ? color + '40' : color;
  });

  const chartData = {
    labels: translatedLabels,
    datasets: [{
      label: t('chart_label_emotion_count'),
      data: chartCounts,
      backgroundColor: chartBackgroundColors,
      borderWidth: 0,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: t('emotion_chart_title_month_analysis', { year: currentMonth.getFullYear(), month: currentMonth.getMonth() + 1 }),
        font: { family: 'var(--font-main)', size: chartTitleFontSize, weight: 'bold' },
        color: 'var(--color-primary)',
      },
      tooltip: { /* Tooltip options */ }
    },
    scales: { /* Scales options */ }
  };

  if (loading) {
    return <div className="page-container">{t('loading_chart_data')}</div>;
  }

  return (
    <div className="page-container">
      <header className="garden-header">
        <Mascot />
        <div className="greeting">
          <h2>{t('emotion_chart_title')}</h2>
          <p>{t('emotion_chart_description')}</p>
        </div>
      </header>

      <div className="chart-controls">
        <button onClick={() => handleMonthChange(-1)}><i className="fas fa-chevron-left"></i></button>
        <span>{currentMonth.getFullYear()}{t('year')} {currentMonth.getMonth() + 1}{t('month')}</span>
        <button onClick={() => handleMonthChange(1)}><i className="fas fa-chevron-right"></i></button>
      </div>

      <div className="chart-container" style={{ height: '280px' }}>
        {Object.values(emotionData).some(v => v > 0) ? (
          <Bar data={chartData} options={options} />
        ) : (
          <p className="no-data-message">{t('no_emotion_data_for_month')}</p>
        )}
      </div>

      <div className="emotion-legend">
        {EMOTION_KEYS.map(key => (
          <div 
            key={key} 
            className={`legend-item ${highlightedEmotion === key ? 'highlighted' : ''}`}
            onClick={() => setHighlightedEmotion(prev => (prev === key ? null : key))}
          >
            <span className="legend-color-box" style={{ backgroundColor: EMOTION_COLORS[key] }}></span>
            <span className="legend-text">{t(`emotion_${key}`)} ({emotionData[key] || 0}{t('chart_unit_count')})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmotionChartPage;