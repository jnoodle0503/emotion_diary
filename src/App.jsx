import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import CalendarPage from './pages/Calendar';
import MyPage from './pages/MyPage';
import NegativeDiaryPage from './pages/NegativeDiary';
import EmotionChartPage from './pages/EmotionChart';
import WriteDiary from './pages/WriteDiary';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import './App.css';

// 로그인한 사용자만 접근할 수 있는 보호된 라우트 컴포넌트
function ProtectedRoute({ children }) {
  const { session } = useAuth();
  // 세션이 없으면 로그인 페이지로 리디렉션합니다.
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const { session } = useAuth();

  return (
    <div className="App">
      {/* 세션이 있을 때만 네비게이션 바를 보여줍니다. */}
      {session && <Navbar />}
      <main>
        <Routes>
          <Route 
            path="/login" 
            element={session ? <Navigate to="/calendar" replace /> : <Login />}
          />
          <Route path="/" element={<Navigate to="/calendar" replace />} />
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
          <Route path="*" element={<Navigate to="/calendar" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
