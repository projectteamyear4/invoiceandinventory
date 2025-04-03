// src/components/Card/Card.jsx
import { UilBox, UilClipboardAlt, UilFileAlt, UilMoneyWithdrawal, UilShoppingCart, UilTimes, UilTruck, UilUsdSquare, UilUsersAlt } from "@iconscout/react-unicons";
import { AnimateSharedLayout, motion } from "framer-motion";
import React, { useState } from "react";
import Chart from "react-apexcharts";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./Card.css";

const Card = (props) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <AnimateSharedLayout>
      {expanded ? (
        <ExpandedCard param={props} setExpanded={() => setExpanded(false)} />
      ) : (
        <CompactCard param={props} setExpanded={() => setExpanded(true)} />
      )}
    </AnimateSharedLayout>
  );
};

function CompactCard({ param, setExpanded }) {
  // Map the icon string to the corresponding icon component
  const Png = param.png === "UilShoppingCart" ? UilShoppingCart :
              param.png === "UilMoneyWithdrawal" ? UilMoneyWithdrawal :
              param.png === "UilClipboardAlt" ? UilClipboardAlt :
              param.png === "UilUsdSquare" ? UilUsdSquare :
              param.png === "UilUsersAlt" ? UilUsersAlt :
              param.png === "UilTruck" ? UilTruck :
              param.png === "UilFileAlt" ? UilFileAlt :
              param.png === "UilBox" ? UilBox :
              UilUsdSquare; // Fallback icon

  return (
    <motion.div
      className="CompactCard"
      style={{ background: param.color.backGround, border: param.color.border, boxShadow: param.color.boxShadow }}
      layoutId={`expandableCard-${param.title}`} // Unique layoutId for each card
      onClick={setExpanded}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="radialBar">
        <CircularProgressbar
          value={param.barValue}
          text={`${param.barValue}%`}
          styles={buildStyles({
            textColor: "#333",
            pathColor: "#007bff",
            trailColor: "#e0e0e0",
          })}
        />
        <span className="card-title">{param.title}</span>
      </div>
      <div className="detail">
        <Png className="card-icon" />
        <span className="card-value">{param.value}</span>
      </div>
    </motion.div>
  );
}

function ExpandedCard({ param, setExpanded }) {
  const data = {
    options: {
      chart: { type: "area", height: "auto", toolbar: { show: false } },
      dropShadow: { enabled: true, top: 2, left: 2, blur: 4, color: "#000", opacity: 0.2 },
      fill: { colors: ["#007bff"], type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3 } },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", colors: ["#007bff"], width: 2 },
      tooltip: { x: { format: "dd/MM/yy HH:mm" }, theme: "dark" },
      grid: { show: true, borderColor: "#e0e0e0", strokeDashArray: 4 },
      xaxis: {
        type: "datetime",
        categories: [
          "2025-09-19T00:00:00.000Z",
          "2025-09-19T01:30:00.000Z",
          "2025-09-19T02:30:00.000Z",
          "2025-09-19T03:30:00.000Z",
          "2025-09-19T04:30:00.000Z",
          "2025-09-19T05:30:00.000Z",
          "2025-09-19T06:30:00.000Z",
        ],
        labels: { style: { colors: "#666", fontSize: "12px" } },
      },
      yaxis: {
        labels: { style: { colors: "#666", fontSize: "12px" } },
      },
    },
  };

  return (
    <motion.div
      className="ExpandedCard"
      style={{ background: param.color.backGround, border: param.color.border, boxShadow: param.color.boxShadow }}
      layoutId={`expandableCard-${param.title}`} // Unique layoutId for each card
    >
      <div className="expanded-header">
        <span className="expanded-title">{param.title}</span>
        <UilTimes className="close-icon" onClick={setExpanded} />
      </div>
      <div className="expanded-content">
        <div className="chartContainer">
          <Chart options={data.options} series={param.series} type="area" height={300} />
        </div>
        <div className="expanded-details">
          <div className="detail-item">
            <span className="detail-label">តម្លៃសរុប:</span>
            <span className="detail-value">{param.value}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">ភាគរយ:</span>
            <span className="detail-value">{param.barValue}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Card;