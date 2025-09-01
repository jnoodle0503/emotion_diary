import React, { useState, useEffect, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Mascot from '../components/Mascot';
import './Pages.css';
import './EmotionChart.css';
import { useTranslation } from 'react-i18next'; // Import useTranslation

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EMOTION_COLORS = {
  '기쁨': '#FFD700', // Gold
  '행복': '#FF6347', // Tomato
  '설렘': '#FFB6C1', // LightPink
  '평온': '#98FB98', // PaleGreen
  '슬픔': '#6495ED', // CornflowerBlue
  '우울': '#4682B4', // SteelBlue
  '분노': '#DC143C', // Crimson
  '불안': '#FFA07A', // LightSalmon
  '사랑': '#FF69B4', // HotPink
  '놀람': '#ADD8E6', // LightBlue
  '지루함': '#D3D3D3', // LightGrey
  '피곤함': '#808080'  // Gray
};

function EmotionChartPage() {
  const { t } = useTranslation(); // Initialize useTranslation
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [emotionData, setEmotionData] = useState({});
  const [loading, setLoading] = useState(true);
  const [highlightedEmotion, setHighlightedEmotion] = useState(null);
  const [chartTitleFontSize, setChartTitleFontSize] = useState(18); // Default for PC

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleMediaQueryChange = (e) => {
      if (e.matches) {
        setChartTitleFontSize(14); // Smaller size for mobile
      } else {
        setChartTitleFontSize(18); // Larger size for PC
      }
    };

    // Initial check
    handleMediaQueryChange(mediaQuery);

    // Listen for changes
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
      data.forEach(entry => {
        if (entry.emotion) {
          entry.emotion.forEach(emo => {
            counts[emo] = (counts[emo] || 0) + 1;
          });
        }
      });
      setEmotionData(counts);
    }
    setLoading(false);
  }, [currentMonth, user.id]);

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

  // Get translated emotion labels
  const translatedEmotionLabels = Object.keys(EMOTION_COLORS).map(emotion => t(`emotion_${emotion}`));
  const chartLabels = Object.keys(EMOTION_COLORS); // Keep original keys for data mapping

  const chartCounts = chartLabels.map(label => emotionData[label] || 0);
  const chartBackgroundColors = chartLabels.map(label => 
    highlightedEmotion && highlightedEmotion !== label 
      ? EMOTION_COLORS[label] + '40' // 25% opacity for non-highlighted
      : EMOTION_COLORS[label]
  );
  const chartBorderColors = chartLabels.map(label => 
    highlightedEmotion && highlightedEmotion !== label 
      ? EMOTION_COLORS[label] + '80' // 50% opacity for non-highlighted
      : EMOTION_COLORS[label]
  );

  const data = {
    labels: translatedEmotionLabels, // Use translated labels for chart display
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
        position: 'top',
        labels: {
          font: {
            family: 'var(--font-main)',
            size: 14,
          },
          color: 'var(--color-text-primary)',
          usePointStyle: true, // Use a point style for legend items
          boxWidth: 10, // Size of the color box
          boxHeight: 10,
        },
        onClick: (e, legendItem, legend) => {
          // Find the original emotion name from the translated one
          const originalEmotionName = Object.keys(EMOTION_COLORS).find(key => t(`emotion_${key}`) === legendItem.text);
          setHighlightedEmotion(prev => (prev === originalEmotionName ? null : originalEmotionName));
        },
      },
      title: {
        display: true,
        text: t('emotion_chart_title_month_analysis', { year: currentMonth.getFullYear(), month: currentMonth.getMonth() + 1 }),
        font: {
          family: 'var(--font-main)',
          size: chartTitleFontSize,
          weight: 'bold',
        },
        color: 'var(--color-primary)',
      },
      tooltip: {
        backgroundColor: 'var(--color-text-primary)',
        titleColor: 'var(--color-white)',
        bodyColor: 'var(--color-white)',
        borderColor: 'var(--color-border)',
        borderWidth: 1,
        cornerRadius: 4,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + t('chart_unit_count');
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: {
            family: 'var(--font-main)',
            size: 12,
          },
          color: 'var(--color-text-secondary)',
          callback: function(value, index, ticks) {
            // Use translated labels for x-axis ticks
            return translatedEmotionLabels[index];
          }
        },
        barPercentage: 0.8, // Adjust bar width
        categoryPercentage: 0.8, // Adjust space between categories
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'var(--color-gray-light)', // Light grid lines
          drawBorder: false,
        },
        ticks: {
          font: {
            family: 'var(--font-main)',
            size: 12,
          },
          color: 'var(--color-text-secondary)',
          callback: function(value) {
            if (value % 1 === 0) { return value; }
          }
        }
      }
    }
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

      <div className="chart-container">
        {Object.keys(emotionData).length > 0 ? (
          <Bar data={data} options={options} />
        ) : (
          <p className="no-data-message">{t('no_emotion_data_for_month')}</p>
        )}
      </div>

      <div className="emotion-legend">
        {chartLabels.map(emotion => (
          <div 
            key={emotion} 
            className={`legend-item ${highlightedEmotion === emotion ? 'highlighted' : ''}`}
            onClick={() => setHighlightedEmotion(prev => (prev === emotion ? null : emotion))}
          >
            <span className="legend-color-box" style={{ backgroundColor: EMOTION_COLORS[emotion] }}></span>
            <span className="legend-text">{t(`emotion_${emotion}`)} ({emotionData[emotion] || 0}{t('chart_unit_count')})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmotionChartPage;