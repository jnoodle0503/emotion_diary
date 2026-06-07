import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './PublicNavbar.css';

function PublicNavbar() {
  return (
    <nav className="public-navbar">
      <div className="public-navbar-inner">
        <Link to="/" className="public-nav-logo">
          Marden
        </Link>
        <div className="public-nav-actions">
          <NavLink to="/login" className="public-nav-link">
            서비스 소개
          </NavLink>
          <Link to="/auth" className="public-nav-auth-button">
            로그인/회원가입
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default PublicNavbar;
