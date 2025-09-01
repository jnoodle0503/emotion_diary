import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';
import { useTranslation } from 'react-i18next'; // Import useTranslation

function Navbar() {
  const { t } = useTranslation(); // Initialize useTranslation
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
          Marden
        </NavLink>

        <ul className="nav-menu top-nav">
          <li className="nav-item">
            <NavLink 
              to="/calendar"
              className={({ isActive }) => isActive ? 'nav-links active' : 'nav-links'}
              onClick={closeMobileMenu}
            >
              {t('navbar_monthly_view')}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/write"
              className={({ isActive }) => isActive ? 'nav-links active' : 'nav-links'}
              onClick={closeMobileMenu}
            >
              {t('navbar_new_diary')}
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
              {t('navbar_mypage')}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/negative-diaries" 
              className={({ isActive }) => isActive ? 'nav-links active' : 'nav-links'}
              onClick={closeMobileMenu}
            >
              {t('navbar_shadows_of_mind')}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/emotion-chart" 
              className={({ isActive }) => isActive ? 'nav-links active' : 'nav-links'}
              onClick={closeMobileMenu}
            >
              {t('navbar_emotion_chart')}
            </NavLink>
          </li>

        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
