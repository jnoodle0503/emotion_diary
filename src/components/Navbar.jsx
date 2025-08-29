import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="nav-logo">
          감정 일기
        </NavLink>
        <ul className="nav-menu">
          <li className="nav-item">
            <NavLink 
              to="/calendar"
              className={({ isActive }) => isActive ? 'nav-links active' : 'nav-links'}
            >
              월별 보기
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/write"
              className={({ isActive }) => isActive ? 'nav-links active' : 'nav-links'}
            >
              새 일기
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/mypage" 
              className={({ isActive }) => isActive ? 'nav-links active' : 'nav-links'}
            >
              마이페이지
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
