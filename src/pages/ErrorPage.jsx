import React from 'react';
import { Link } from 'react-router-dom';
import Mascot from '../components/Mascot';
import './Pages.css'; // For general page container styles
import './ErrorPage.css'; // For specific error page styles
import { useTranslation } from 'react-i18next'; // Import useTranslation

function ErrorPage() {
  const { t } = useTranslation(); // Initialize useTranslation
  return (
    <div className="page-container error-page-container">
      <header className="garden-header">
        <Mascot />
        <div className="greeting">
          <h2>{t('error_page_title')}</h2>
          <p>{t('error_page_subtitle')}</p>
        </div>
      </header>

      <div className="error-content">
        <p>{t('error_page_message')}</p>
        <Link to="/calendar" className="error-home-button">
          {t('error_page_go_home')}
        </Link>
      </div>
    </div>
  );
}

export default ErrorPage;