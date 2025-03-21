import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext'; // Ensure this path is correct
import './Header.css'; // Updated to match Header.css

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="nav-icons">
        <div className="icon-container">
          <span className="icon">🔔</span>
          <span className="badge">3</span>
        </div>
        <div className="icon-container">
          <span className="icon">✉️</span>
          <span className="badge">2</span>
        </div>
      </div>

      {user ? (
        <div className="profile">
          <img
            src="https://via.placeholder.com/40"
            alt="Profile"
            className="profile-image"
          />
          <span className="profile-name">{user.username}</span>
          <button className="create-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <h3  onClick={() => navigate('/login')}>
          Login
        </h3>
      )}

      <div className="language">EN</div>
    </header>
  );
};

export default Header;