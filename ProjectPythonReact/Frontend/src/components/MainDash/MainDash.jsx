// src/components/MainDash.jsx
import axios from "axios";
import React, { useEffect, useState } from "react";
import { cardsData } from "../../Data/Data"; // Import static cardsData
import Cards from "../Cards/Cards";
import "./MainDash.css";

const MainDash = () => {
  const [dynamicCardsData, setDynamicCardsData] = useState(cardsData); // Start with static data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const api = axios.create({
    baseURL: "http://localhost:8000",
    timeout: 5000,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await api.get("/api/purchases/");
        const purchases = response.data;

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0];

        // Calculate total purchase price for today
        const todayPurchases = purchases.filter((purchase) =>
          purchase.purchase_date.startsWith(today)
        );
        const totalPriceToday = todayPurchases.reduce(
          (sum, purchase) => sum + parseFloat(purchase.purchase_price),
          0
        );

        // Calculate total purchase price for all time
        const totalPurchasePrice = purchases.reduce(
          (sum, purchase) => sum + parseFloat(purchase.purchase_price),
          0
        );

        // Convert numbers to Khmer numerals
        const khmerNumbers = (num) =>
          num.toFixed(2).replace(/\d/g, (d) => "០១២៣៤៥៦៧៨៩"[d]);

        // Card for today's purchase price
        const purchaseTodayCard = {
          title: "តម្លៃទិញថ្ងៃនេះ", // Purchase Price Today
          color: {
            backGround: "#fff3e0",
            border: "1px solid #fb8c00",
            boxShadow: "0 4px 10px rgba(251, 140, 0, 0.3)",
          },
          barValue: Math.min((totalPriceToday / 100) * 100, 100),
          value: `${khmerNumbers(totalPriceToday)} $`,
          png: "UilUsdSquare",
          series: [{ name: "តម្លៃទិញ", data: todayPurchases.map((p) => parseFloat(p.purchase_price)) }],
        };

        // Card for total purchase price (all-time)
        const totalPurchaseCard = {
          title: "តម្លៃទិញសរុប", // Total Purchase Price
          color: {
            backGround: "#e3f2fd",
            border: "1px solid #2196f3",
            boxShadow: "0 4px 10px rgba(33, 150, 243, 0.3)",
          },
          barValue: Math.min((totalPurchasePrice / 1000) * 100, 100),
          value: `${khmerNumbers(totalPurchasePrice)} $`,
          png: "UilMoneyWithdrawal",
          series: [{ name: "សរុប", data: purchases.map((p) => parseFloat(p.purchase_price)) }],
        };

        // Update cardsData with new cards
        setDynamicCardsData([...cardsData, purchaseTodayCard, totalPurchaseCard]);
      } catch (err) {
        setError("Failed to load purchase data.");
        console.error("Fetch error:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="MainDash">
      <h1>ផ្ទាំងគ្រប់គ្រង</h1>
      <Cards cardsData={dynamicCardsData} />
    </div>
  );
};

export default MainDash;
