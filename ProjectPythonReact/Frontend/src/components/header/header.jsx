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
          <span className="badge">១</span> {/* 1 in Khmer */}
        </div>
        <div className="icon-container">
          <UilPlusCircle className="icon" />
          <button className="create-button">បង្កើតកន្លែងធ្វើការ</button> {/* Create Workspace */}
        </div>
      </div>

      {/* User Profile */}
      <div className="profile">
        <span className="language">ខ្មែរ</span> {/* Khmer */}
        <img
          src="https://static.vecteezy.com/system/resources/previews/000/439/863/original/vector-users-icon.jpg"
          alt="Profile"
          className="profile-image"
        />
        <span className="profile-name">ចន សុ</span> {/* John S. in Khmer */}
      </div>
    </div>
  );
};

export default Header;