import React from 'react';
import { Link } from 'react-router-dom';
import Mascot from '../components/Mascot';
import './Pages.css'; // For general page container styles
import './ErrorPage.css'; // For specific error page styles

function ErrorPage() {
  return (
    <div className="page-container error-page-container">
      <header className="garden-header">
        <Mascot />
        <div className="greeting">
          <h2>길을 잃으셨나요?</h2>
          <p>요청하신 페이지를 찾을 수 없습니다.</p>
        </div>
      </header>

      <div className="error-content">
        <p>주소가 잘못되었거나, 페이지가 삭제되었을 수 있습니다.</p>
        <Link to="/calendar" className="error-home-button">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export default ErrorPage;