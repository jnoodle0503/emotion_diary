import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Mascot from '../components/Mascot';
import './Pages.css'; // For page-container
import './NicknameRegistration.css';
import { useTranslation } from 'react-i18next'; // Import useTranslation

function NicknameRegistration() {
  const { user, profile, refreshProfile } = useAuth(); // Get profile and refreshProfile
  const navigate = useNavigate();
  const { t } = useTranslation(); // Initialize useTranslation
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Watch for profile update after nickname submission
  useEffect(() => {
    // Only navigate if user is logged in and profile is loaded with a nickname
    // and we are currently on the registration page
    if (user && profile && profile.nickname && window.location.pathname === '/register-nickname') {
      navigate('/calendar');
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!nickname.trim()) {
      setError(t('nickname_registration_alert_enter_nickname'));
      return;
    }

    setLoading(true);

    try {
      await api.updateProfile({ nickname });
      await refreshProfile();
      navigate('/calendar');
    } catch (err) {
      console.error('Error saving nickname:', err);
      setError(t('nickname_registration_alert_save_failed'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="page-container">{t('nickname_registration_loading_login')}</div>; // Or a proper loading/redirect message
  }

  return (
    <div className="page-container nickname-registration-page">
      <div className="mascot-container">
        <Mascot />
        <h1 className="page-title">{t('nickname_registration_welcome_title')}</h1>
        <p className="page-subtitle">{t('nickname_registration_subtitle')}</p>
      </div>
      <form onSubmit={handleSubmit} className="nickname-form">
        <input
          type="text"
          placeholder={t('nickname_registration_placeholder')}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          disabled={loading}
        />
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? t('nickname_registration_saving') : t('nickname_registration_set_nickname')}
        </button>
      </form>
    </div>
  );
}

export default NicknameRegistration;
