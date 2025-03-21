import { UilBars } from "@iconscout/react-unicons";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarData } from "../Data/Data";
import Logo from "../imgs/logo.png";
import "./Sidebar.css";

const Sidebar = () => {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate(); // Navigation hook

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarVariants = {
    true: { left: "0" },
    false: { left: "-60%" },
  };

  return (
    <>
      {/* Toggle Button for Mobile */}
      <div
        className="bars"
        style={expanded ? { left: "60%" } : { left: "5%" }}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <UilBars />
      </div>

      <motion.div
        className="sidebar"
        variants={sidebarVariants}
        animate={isMobile ? `${expanded}` : ""}
      >
        {/* Logo */}
        <div className="logo">
          <img src={Logo} alt="logo" />
          <span>
            II<span>M</span>S
          </span>
        </div>

        {/* Sidebar Menu */}
        <div className="menu">
          {SidebarData.map((item, index) => (
            <div
              className={selected === index ? "menuItem active" : "menuItem"}
              key={index}
              onClick={() => {
                setSelected(index);
                navigate(item.path); // Navigate to the correct route
              }}
            >
              <item.icon />
              <span>{item.heading}</span>
            </div>
          ))}

          {/* Sign-out Button */}
       
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
