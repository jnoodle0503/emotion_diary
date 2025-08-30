import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="nav-logo" onClick={closeMobileMenu}>
          감정 일기
        </NavLink>

        <ul className="nav-menu top-nav">
          <li className="nav-item">
            <NavLink 
              to="/calendar"
              className={({ isActive }) => isActive ? 'nav-links active' : 'nav-links'}
              onClick={closeMobileMenu}
            >
              월별 보기
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/write"
              className={({ isActive }) => isActive ? 'nav-links active' : 'nav-links'}
              onClick={closeMobileMenu}
            >
              새 일기
            </NavLink>
          </li>
        </ul>

        <div className="menu-icon" onClick={toggleMobileMenu}>
          <i className={mobileMenuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
        </div>
      </div>

      {/* Mobile Menu / Sidebar */}
      <div className={`sidebar ${mobileMenuOpen ? 'active' : ''}`}>
        <ul className="nav-menu side-nav">
          <li className="nav-item">
            <NavLink 
              to="/mypage" 
              className={({ isActive }) => isActive ? 'nav-links active' : 'nav-links'}
              onClick={closeMobileMenu}
            >
              마이페이지
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/negative-diaries" 
              className={({ isActive }) => isActive ? 'nav-links active' : 'nav-links'}
              onClick={closeMobileMenu}
            >
              마음의 그림자
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/emotion-chart" 
              className={({ isActive }) => isActive ? 'nav-links active' : 'nav-links'}
              onClick={closeMobileMenu}
            >
              감정 차트
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
