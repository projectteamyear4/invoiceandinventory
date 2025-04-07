import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext'; // សូមប្រាកដថា path នេះត្រឹមត្រូវ
import './Header.css'; // រក្សា CSS ដូចដើម

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // បញ្ជូនទៅកាន់ទំព័រដើមបន្ទាប់ពីចាកចេញ
  };

  return (
    <header className="header">
      {/* Icons for Notifications and Messages */}
      <div className="nav-icons">
        <div className="icon-container">
          <span className="icon">🔔</span> {/* រូបកណ្ដឹង */}
          <span className="badge">3</span> {/* ចំនួន Notification */}
        </div>
        <div className="icon-container">
          <span className="icon">✉️</span> {/* រូបស្រោមសំបុត្រ */}
          <span className="badge">2</span> {/* ចំនួន Message */}
        </div>
      </div>

      {/* User Profile Section or Login Link */}
      {user ? (
        // បើ User បាន Login
        <div className="profile">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJoBkWxNNHvLpW4knNYlRPtXfn9pRdijE0ow&s" // URL រូបភាព Profile (អាចប្តូរបាន)
            alt="ប្រវត្តិរូប" // <--- Translated "Profile"
            className="profile-image"
          />
          <span className="profile-name">{user.username}</span> {/* បង្ហាញ Username */}
          <button className="create-button" onClick={handleLogout}>
            ចាកចេញ {/* <--- Translated "Logout" */}
          </button>
        </div>
      ) : (
        // បើ User មិនទាន់ Login
        <h3 className="login-link" onClick={() => navigate('/login')}> {/* Added class for styling, navigate to login */}
          ចូលប្រើ {/* <--- Translated "Login" */}
        </h3>
      )}

      {/* Language Indicator */}
      <div className="language">ភាសាខ្មែរ</div> {/* <--- Changed to "ភាសាខ្មែរ" (Khmer Language) */}
    </header>
  );
};

export default Header;