import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Mascot from '../components/Mascot'; // "마음이" 캐릭터 import
import './Pages.css';

function MyPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login'); 
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="page-container mypage-container">
      <div className="mascot-container">
        <Mascot />
        <h2 className="mypage-title">나의 마음 기록</h2>
        <p className="mypage-subtitle">당신의 소중한 기록들을 관리하세요.</p>
      </div>
      
      <div className="profile-info-card">
        <p><strong>이메일:</strong> {user ? user.email : '사용자 정보 없음'}</p>
        {/* <p><strong>이름:</strong> {userProfile ? userProfile.full_name : '정보 없음'}</p> */}
      </div>

      <button onClick={handleLogout} className="logout-button">
        로그아웃
      </button>
    </div>
  );
}

export default MyPage;