import { UilEnvelope, UilPlusCircle } from "@iconscout/react-unicons";
import React from "react";
import "./Header.css";

const Header = () => {
  return (
    <div className="header">
  

      {/* Navigation Icons */}
      <div className="nav-icons">
        <div className="icon-container">
          <UilEnvelope className="icon" />
          <span className="badge">1</span>
        </div>

        <div className="icon-container">
          <UilPlusCircle className="icon" />
          <button className="create-button">Create Workspace</button>
        </div>
      </div>

      {/* User Profile */}
      <div className="profile">
        <span className="language">EN</span>
        <img
          src="https://static.vecteezy.com/system/resources/previews/000/439/863/original/vector-users-icon.jpg" // Replace with your image source
          alt="Profile"
          className="profile-image"
        />
        <span className="profile-name">John S.</span>
      </div>
    </div>
  );
};

export default Header;
