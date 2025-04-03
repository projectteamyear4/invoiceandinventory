// src/components/MainDash.jsx
import axios from "axios";
import React, { useEffect, useState } from "react";
import Cards from "../Cards/Cards";
import "./MainDash.css";

const MainDash = () => {
  const [cards, setCards] = useState([]); // Store only database-generated cards
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
    const fetchData = async () => {
      try {
        // Fetch purchases, products, customers, suppliers, and invoices concurrently
        const [purchasesResponse, productsResponse, customersResponse, suppliersResponse, invoicesResponse] = await Promise.all([
          api.get("/api/purchases/"),
          api.get("/api/products/"),
          api.get("/api/invoices/"),
          api.get("/api/customers/"),
          api.get("/api/suppliers/"),
        ]);

        const purchases = purchasesResponse.data;
        const products = productsResponse.data;
        const customers = customersResponse.data;
        const suppliers = suppliersResponse.data;
        const invoices = invoicesResponse.data;

        // Get today's date in YYYY-MM-DD format (for today's purchase price)
        const today = new Date().toISOString().split("T")[0];

        // Calculate total purchase price for today
        const todayPurchases = purchases.filter((purchase) =>
          purchase.purchase_date.startsWith(today)
        );
        const totalPriceToday = todayPurchases.reduce(
          (sum, purchase) => sum + parseFloat(purchase.total),
          0
        );

        // Calculate total purchase price for all time
        const totalPurchasePrice = purchases.reduce(
          (sum, purchase) => sum + parseFloat(purchase.total),
          0
        );

        // Calculate total number of products
        const totalProducts = products.length;

        // Calculate total customers (all time)
        const totalCustomers = customers.length;

        // Calculate total suppliers (all time)
        const totalSuppliers = suppliers.length;

        // Calculate total invoices (all time)
        const totalInvoices = invoices.length;

        // Convert numbers to Khmer numerals
        const khmerNumbers = (num) =>
          num.toString().replace(/\d/g, (d) => "០១២៣៤៥៦៧៨៩"[d]);

        // Card for today's purchase price
        const purchaseTodayCard = {
          title: "តម្លៃទិញថ្ងៃនេះ", // Purchase Price Today
          color: {
            backGround: "#fff3e0",
            border: "1px solid #fb8c00",
            boxShadow: "0 4px 10px rgba(251, 140, 0, 0.3)",
          },
          barValue: Math.min((totalPriceToday / 1000) * 100, 100),
          value: `${khmerNumbers(totalPriceToday.toFixed(2))} $`,
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
          barValue: Math.min((totalPurchasePrice / 1000000) * 100, 100),
          value: `${khmerNumbers(totalPurchasePrice.toFixed(2))} $`,
          png: "UilMoneyWithdrawal",
          series: [{ name: "សរុប", data: purchases.map((p) => parseFloat(p.purchase_price)) }],
        };

        // Card for total number of products
        const totalProductsCard = {
          title: "ចំនួនផលិតផលសរុប", // Total Number of Products
          color: {
            backGround: "#e8f5e9",
            border: "1px solid #4caf50",
            boxShadow: "0 4px 10px rgba(76, 175, 80, 0.3)",
          },
          barValue: Math.min((totalProducts / 100) * 100, 100),
          value: khmerNumbers(totalProducts),
          png: "UilBox",
          series: [{ name: "ផលិតផល", data: [totalProducts] }],
        };

        // Card for total customers (all time)
        const totalCustomersCard = {
          title: "អតិថិជនសរុប", // Total Customers
          color: {
            backGround: "#f3e5f5",
            border: "1px solid #ab47bc",
            boxShadow: "0 4px 10px rgba(171, 71, 188, 0.3)",
          },
          barValue: Math.min((totalCustomers / 500) * 100, 100),
          value: khmerNumbers(totalCustomers),
          png: "UilUsersAlt",
          series: [{ name: "អតិថិជន", data: [totalCustomers] }],
        };

        // Card for total suppliers (all time)
        const totalSuppliersCard = {
          title: "អ្នកផ្គត់ផ្គង់សរុប", // Total Suppliers
          color: {
            backGround: "#ffebee",
            border: "1px solid #ef5350",
            boxShadow: "0 4px 10px rgba(239, 83, 80, 0.3)",
          },
          barValue: Math.min((totalSuppliers / 100) * 100, 100),
          value: khmerNumbers(totalSuppliers),
          png: "UilTruck",
          series: [{ name: "អ្នកផ្គត់ផ្គង់", data: [totalSuppliers] }],
        };

        // Card for total invoices (all time)
        const totalInvoicesCard = {
          title: "វិក្កយបត្រសរុប", // Total Invoices
          color: {
            backGround: "#e0f7fa",
            border: "1px solid #00acc1",
            boxShadow: "0 4px 10px rgba(0, 172, 193, 0.3)",
          },
          barValue: Math.min((totalInvoices / 1000) * 100, 100),
          value: khmerNumbers(totalInvoices),
          png: "UilFileAlt",
          series: [{ name: "វិក្កយបត្រ", data: [totalInvoices] }],
        };

        // Set the cards array with only database-generated cards
        setCards([
          purchaseTodayCard,
          totalPurchaseCard,
          totalProductsCard,
          totalCustomersCard,
          totalSuppliersCard,
          totalInvoicesCard,
        ]);
      } catch (err) {
        setError("Failed to load data.");
        console.error("Fetch error:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="MainDash">
      <h1>ផ្ទាំងគ្រប់គ្រង</h1>
      <Cards cardsData={cards} />
    </div>
  );
};

export default MainDash;