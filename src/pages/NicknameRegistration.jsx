import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Mascot from '../components/Mascot';
import './Pages.css'; // For page-container
import './NicknameRegistration.css';

function NicknameRegistration() {
  const { user, profile, refreshProfile } = useAuth(); // Get profile and refreshProfile
  const navigate = useNavigate();
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

    console.log('handleSubmit called'); // Log 1

    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      console.log('Nickname is empty'); // Log 2
      return;
    }

    setLoading(true);
    console.log('Loading state set to true'); // Log 3

    try {
      console.log('Attempting to upsert nickname:', nickname, 'for user:', user.id); // Log 4
      
      const { data, error: upsertError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, nickname: nickname }, { onConflict: 'id' }); // onConflict: 'id' is crucial

      if (upsertError) {
        console.log('Upsert error:', upsertError); // Log 5
        throw upsertError;
      }
      
      // Force a session refresh to update AuthContext with the new profile data
      console.log('Forcing session refresh...'); // Log 8.1
      const { data: { user: refreshedUser }, error: refreshError } = await supabase.auth.getUser();
      if (refreshError) {
        console.error('Error refreshing user session:', refreshError); // Log 8.2
        // Handle refresh error, maybe don't navigate or show a specific message
      } else {
        console.log('Session refreshed, user:', refreshedUser); // Log 8.3
      }

      // Explicitly refresh profile in AuthContext
      console.log('Calling refreshProfile...');
      await refreshProfile();
      console.log('refreshProfile completed.');

      console.log('Nickname saved successfully, navigating to /calendar'); // Log 8
      navigate('/calendar'); // Redirect to main app after successful registration

    } catch (err) {
      console.log('Caught error during save:', err); // Log 9
      console.error('Error saving nickname:', err);
      setError('닉네임 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
      console.log('Loading state set to false'); // Log 10
    }
  };

  if (!user) {
    return <div className="page-container">로그인 중...</div>; // Or a proper loading/redirect message
  }

  return (
    <div className="page-container nickname-registration-page">
      <div className="mascot-container">
        <Mascot />
        <h1 className="page-title">환영합니다!</h1>
        <p className="page-subtitle">서비스 이용을 위해 닉네임을 설정해주세요.</p>
      </div>
      <form onSubmit={handleSubmit} className="nickname-form">
        <input
          type="text"
          placeholder="닉네임을 입력하세요"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          disabled={loading}
        />
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? '저장 중...' : '닉네임 설정'}
        </button>
      </form>
    </div>
  );
}

export default NicknameRegistration;