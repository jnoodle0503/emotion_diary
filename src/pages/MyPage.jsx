import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { deleteUserData } from '../lib/supabase';
import Mascot from '../components/Mascot';
import './MyPage.css';
import { useTranslation } from 'react-i18next'; // Import useTranslation

function MyPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); // Initialize useTranslation

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) {
      alert('로그인된 사용자 정보가 없습니다.'); // This will be translated later
      return;
    }

    if (window.confirm('정말로 계정을 삭제하시겠습니까? 모든 일기와 프로필 정보가 영구적으로 삭제됩니다.')) { // This will be translated later
      if (window.confirm('정말로 마지막 경고입니다. 삭제된 데이터는 복구할 수 없습니다. 계속하시겠습니까?')) { // This will be translated later
        try {
          await deleteUserData(user.id);
          await signOut();
          alert('계정과 모든 데이터가 성공적으로 삭제되었습니다.'); // This will be translated later
          navigate('/login');
        } catch (error) {
          console.error('Error deleting account:', error);
          alert('계정 삭제 중 오류가 발생했습니다. 다시 시도해주세요.'); // This will be translated later
        }
      }
    }
  };

  const handleComingSoon = () => {
    alert(t('coming_soon_feature')); // Use translation for this alert
  };

  const changeLanguage = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <div className="page-container mypage-container">
      <div className="mypage-header">
        <Mascot />
        <p className="profile-name">{profile ? profile.nickname : '닉네임 미설정'}</p> {/* This will be translated later */}
        <p className="profile-email">{user ? user.email : '이메일 정보 없음'}</p> {/* This will be translated later */}
      </div>

      <div className="mypage-menu">
        <div className="menu-item" onClick={handleComingSoon}>
          <span className="menu-icon">📢</span>
          <span className="menu-text">{t('announcements')}</span>
        </div>
        <div className="menu-item" onClick={handleComingSoon}>
          <span className="menu-icon">💌</span>
          <span className="menu-text">{t('send_feedback')}</span>
        </div>
        <div className="menu-item language-setting-item"> {/* New language setting item */}
          <span className="menu-icon">🌐</span>
          <span className="menu-text">{t('language_setting')}</span>
          <select onChange={changeLanguage} value={i18n.language} className="language-select">
            <option value="ko">{t('korean')}</option>
            <option value="en">{t('english')}</option>
          </select>
        </div>
        <div className="menu-item" onClick={handleLogout}>
          <span className="menu-icon">🚪</span>
          <span className="menu-text">{t('logout')}</span>
        </div>
        <div className="menu-item" onClick={handleDeleteAccount}>
          <span className="menu-icon">🗑️</span>
          <span className="menu-text">{t('delete_account')}</span>
        </div>
      </div>
    </div>
  );
}

export default MyPage;