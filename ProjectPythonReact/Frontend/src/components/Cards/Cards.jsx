// src/components/Cards/Cards.jsx
import React from "react";
import Card from "../Card/Card";
import "./Cards.css";

const Cards = ({ cardsData }) => {
  return (
    <div className="Cards">
      {cardsData.map((card, id) => (
        <div className="parentContainer" key={id}>
          <Card
            title={card.title}
            color={card.color}
            barValue={card.barValue}
            value={card.value}
            png={card.png}
            series={card.series}
          />
        </div>
      ))}
    </div>
  );
};

export default Cards;