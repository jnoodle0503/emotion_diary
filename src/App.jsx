import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import CalendarPage from './pages/Calendar';
import MyPage from './pages/MyPage';
import NegativeDiaryPage from './pages/NegativeDiary';
import EmotionChartPage from './pages/EmotionChart';
import WriteDiary from './pages/WriteDiary';
import ErrorPage from './pages/ErrorPage';
import Login from './pages/Login';
import DemoPage from './pages/DemoPage'; // Import DemoPage
import Navbar from './components/Navbar';
import NicknameRegistration from './pages/NicknameRegistration';
import DiaryDetail from './pages/DiaryDetail'; // New import
import './App.css';

// 로그인한 사용자만 접근할 수 있는 보호된 라우트 컴포넌트
function ProtectedRoute({ children }) {
  const { session, user, profile, loading: authLoading } = useAuth();

  // If AuthContext is still loading, show a loading message
  if (authLoading) {
    return <div className="page-container">사용자 데이터를 불러오는 중...</div>;
  }

  // If no session, redirect to login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in but profile or nickname is missing, redirect to nickname registration
  // This check should happen *after* authLoading is false, ensuring profile is loaded
  if (user && (!profile || !profile.nickname)) {
    // Only redirect if not already on the nickname registration page to avoid infinite loops
    if (window.location.pathname !== '/register-nickname') {
      return <Navigate to="/register-nickname" replace />;
    }
    // If we are on /register-nickname, let it render its children (NicknameRegistration)
    return children; 
  }

  // If all checks pass (session, user, profile, nickname), render children
  return children;
}

function App() {
  const { session, profile } = useAuth();

  return (
    <div className="App">
      {/* 세션이 있고 프로필이 로드되었으며 닉네임이 있을 때만 네비게이션 바를 보여줍니다. */}
      {(session && profile && profile.nickname) && <Navbar />}
      <main>
        <Routes>
          <Route path="/demo" element={<DemoPage />} />
          <Route 
            path="/login" 
            element={session ? <Navigate to="/calendar" replace /> : <Login />}
          />
          {/* Nickname registration page - NOT protected */}
          <Route path="/register-nickname" element={<NicknameRegistration />} /> 

          <Route path="/" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route 
            path="/calendar"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/write"
            element={
              <ProtectedRoute>
                <WriteDiary />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/write/:id"
            element={
              <ProtectedRoute>
                <WriteDiary />
              </ProtectedRoute>
            }
          />
          {/* Diary Detail Page */} 
          <Route 
            path="/diary/:id"
            element={
              <ProtectedRoute>
                <DiaryDetail />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/mypage" 
            element={
              <ProtectedRoute>
                <MyPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/negative-diaries" 
            element={
              <ProtectedRoute>
                <NegativeDiaryPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/emotion-chart" 
            element={
              <ProtectedRoute>
                <EmotionChartPage />
              </ProtectedRoute>
            }
          />
          {/* 일치하는 라우트가 없을 경우 기본 페이지로 리디렉션 */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;