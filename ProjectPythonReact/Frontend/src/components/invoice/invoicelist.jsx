import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import "./InvoiceList.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const api = useMemo(
    () =>
      axios.create({
        baseURL: API_BASE_URL,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }),
    []
  );

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("សូមចូលប្រើប្រាស់ប្រព័ន្ធសិន (No access token found)");
      setLoading(false);
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const invoiceResponse = await api.get("/api/invoices/list/");
        console.log("Invoices Response:", invoiceResponse.data);
        const fetchedInvoices = Array.isArray(invoiceResponse.data) ? invoiceResponse.data : [];
        setInvoices(fetchedInvoices);
        setFilteredInvoices(fetchedInvoices);
      } catch (err) {
        setError(err.response?.data?.detail || "បញ្ហាក្នុងការទាញយកវិក្កយបត្រ");
        console.error("Fetch error:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api, navigate]);

  const columns = useMemo(
    () => [
      { name: "លេខវិក្កយបត្រ", selector: (row) => row.id || "-", sortable: true, width: "100px" },
      { name: "ប្រភេទ", selector: (row) => (row.type === "invoice" ? "វិក្កយបត្រ" : "សម្រង់តម្លៃ"), sortable: true, width: "120px" },
      {
        name: "ស្ថានភាព",
        selector: (row) => {
          switch (row.status) {
            case "DRAFT": return "ព្រាង";
            case "PENDING": return "មិនទាន់បង់";
            case "PAID": return "បានបង់";
            case "CANCELLED": return "បានលុបចោល";
            default: return row.status || "-";
          }
        },
        sortable: true,
        width: "120px",
      },
      { name: "កាលបរិច្ឆេទ", selector: (row) => (row.date ? new Date(row.date).toLocaleDateString() : "-"), sortable: true, width: "120px" },
      { name: "ផុតកំណត់", selector: (row) => (row.due_date ? new Date(row.due_date).toLocaleDateString() : "-"), sortable: true, width: "120px" },
      {
        name: "អតិថិជន",
        selector: (row) => {
          const customer = row.customer;
          return customer ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim() : row.customer_id || "-";
        },
        sortable: true,
        width: "150px",
      },
      { name: "កំណត់សម្គាល់", selector: (row) => row.notes || "-", sortable: true, width: "150px" },
      { name: "សរុប (USD)", selector: (row) => `$${parseFloat(row.total || 0).toFixed(2)}`, sortable: true, width: "120px" },
      { name: "សរុប (KHR)", selector: (row) => `៛${parseInt(row.total_in_riel || 0).toLocaleString()}`, sortable: true, width: "150px" },
    ],
    []
  );

  const customStyles = {
    table: { style: { borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)", background: "#fff" } },
    headRow: { style: { background: "linear-gradient(90deg, #3f7fc2, #0056b3)", color: "white", textTransform: "uppercase", fontSize: "16px" } },
    headCells: { style: { padding: "12px" } },
    rows: { style: { fontSize: "16px", color: "#333", borderBottom: "1px solid #ddd", "&:hover": { background: "rgba(0, 123, 255, 0.1)" } } },
    cells: { style: { padding: "12px" } },
  };

  return (
    <div className="invoice-list-container">
      <h2>បញ្ជីវិក្កយបត្រ</h2>
      {error && <p className="error-message">{error}</p>}
      <DataTable
        columns={columns}
        data={filteredInvoices}
        customStyles={customStyles}
        noDataComponent={<div className="no-results">គ្មានវិក្កយបត្រត្រូវនឹងលក្ខខណ្ឌស្វែងរក។</div>}
        highlightOnHover
        responsive
        progressPending={loading}
        progressComponent={<div className="loading">កំពុងផ្ទុកវិក្កយបត្រ...</div>}
      />
    </div>
  );
};

export default InvoiceList;