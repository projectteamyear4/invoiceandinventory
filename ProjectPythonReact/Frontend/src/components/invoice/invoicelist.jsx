import axios from "axios";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import React, { useEffect, useMemo, useState } from "react";
import { CSVLink } from "react-csv";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import "./InvoiceList.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
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

  // Search functionality
  useEffect(() => {
    const filtered = invoices.filter((invoice) => {
      const customer = invoice.customer || {};
      const customerName = `${customer.first_name || ""} ${customer.last_name || ""}`.trim().toLowerCase();
      const delivery = invoice.delivery_method ? invoice.delivery_method.name : "";
      const query = searchQuery.toLowerCase();
      return (
        invoice.id?.toString().includes(query) ||
        customerName.includes(query) ||
        (invoice.status || "").toLowerCase().includes(query) ||
        (invoice.type || "").toLowerCase().includes(query) ||
        (invoice.notes || "").toLowerCase().includes(query) ||
        delivery.toLowerCase().includes(query)
      );
    });
    setFilteredInvoices(filtered);
  }, [searchQuery, invoices]);

  // Update status
  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      await api.patch(`/api/invoices/${invoiceId}/`, { status: newStatus });
      const updatedInvoices = invoices.map((inv) =>
        inv.id === invoiceId ? { ...inv, status: newStatus } : inv
      );
      setInvoices(updatedInvoices);
      setFilteredInvoices(updatedInvoices);
    } catch (err) {
      console.error("Status update error:", err);
      setError("បញ្ហាក្នុងការកែស្ថានភាព");
    }
  };

  // Delete invoice
  const handleDelete = async (invoiceId) => {
    if (window.confirm("តើអ្នកប្រាកដជាចង់លុបវិក្កយបត្រនេះមែនទេ?")) {
      try {
        await api.delete(`/api/invoices/${invoiceId}/`);
        const updatedInvoices = invoices.filter((inv) => inv.id !== invoiceId);
        setInvoices(updatedInvoices);
        setFilteredInvoices(updatedInvoices);
        console.log(`Invoice ${invoiceId} deleted successfully`);
      } catch (err) {
        console.error("Delete error:", err);
        setError("បញ្ហាក្នុងការលុបវិក្កយបត្រ");
      }
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredInvoices.map((inv) => ({
        "លេខវិក្កយបត្រ": inv.id,
        "ប្រភេទ": inv.type === "invoice" ? "វិក្កយបត្រ" : "សម្រង់តម្លៃ",
        "ស្ថានភាព": { DRAFT: "ព្រាង", PENDING: "មិនទាន់បង់", PAID: "បានបង់", CANCELLED: "បានលុបចោល" }[inv.status] || inv.status,
        "កាលបរិច្ឆេទ": inv.date ? new Date(inv.date).toLocaleDateString() : "-",
        "ផុតកំណត់": inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "-",
        "អតិថិជន": inv.customer ? `${inv.customer.first_name || ""} ${inv.customer.last_name || ""}`.trim() : "-",
        "វិធីដឹកជញ្ជូន": inv.delivery_method ? inv.delivery_method.name : "-",
        "កំណត់សម្គាល់": inv.notes || "-",
        "សរុប (USD)": parseFloat(inv.total || 0).toFixed(2),
        "សរុប (KHR)": parseInt(inv.total_in_riel || 0),
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");
    XLSX.writeFile(wb, "invoices.xlsx");
  };

  // Export to PNG
  const exportToPNG = () => {
    const table = document.querySelector(".rdt_Table");
    if (table) {
      html2canvas(table).then((canvas) => {
        canvas.toBlob((blob) => {
          saveAs(blob, "invoices.png");
        });
      });
    } else {
      console.error("Table element not found for PNG export");
    }
  };

  const columns = useMemo(
    () => [
      { name: "លេខវិក្កយបត្រ", selector: (row) => row.id || "-", sortable: true, width: "100px" },
      { name: "ប្រភេទ", selector: (row) => (row.type === "invoice" ? "វិក្កយបត្រ" : "សម្រង់តម្លៃ"), sortable: true, width: "120px" },
      {
        name: "ស្ថានភាព",
        selector: (row) => row.status,
        cell: (row) => (
          <select
            value={row.status}
            onChange={(e) => handleStatusChange(row.id, e.target.value)}
            style={{ padding: "5px", borderRadius: "4px" }}
          >
            <option value="DRAFT">ព្រាង</option>
            <option value="PENDING">មិនទាន់បង់</option>
            <option value="PAID">បានបង់</option>
            <option value="CANCELLED">បានលុបចោល</option>
          </select>
        ),
        sortable: true,
        width: "150px",
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
      {
        name: "វិធីដឹកជញ្ជូន",
        selector: (row) => (row.delivery_method ? row.delivery_method.name : "-"),
        sortable: true,
        width: "150px",
      },
      { name: "កំណត់សម្គាល់", selector: (row) => row.notes || "-", sortable: true, width: "150px" },
      { name: "សរុប (USD)", selector: (row) => `$${parseFloat(row.total || 0).toFixed(2)}`, sortable: true, width: "120px" },
      { name: "សរុប (KHR)", selector: (row) => `៛${parseInt(row.total_in_riel || 0).toLocaleString()}`, sortable: true, width: "150px" },
      {
        name: "សកម្មភាព",
        cell: (row) => (
          <button
            onClick={() => handleDelete(row.id)}
            style={{ padding: "5px 10px", background: "#dc3545", color: "white", borderRadius: "4px", border: "none" }}
          >
            លុប
          </button>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
        width: "100px",
      },
    ],
    []
  );

  const customStyles = {
    table: { style: { borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)", background: "#fff" } },
    headRow: { style: { background: "linear-gradient(90deg, #3f7fc2, #0056b3)", color: "white", textTransform: "uppercase", fontSize: "16px" } },
    headCells: { style: { padding: "12px" } },
    rows: { style: { fontSize: "16px", color: "#333", borderBottom: "1px solid #ddd", "&:hover": { background: "rgba(0, 123, 255, 0.1)" } } },
    cells: { style: { padding: "12px" } },
    pagination: {
      style: { marginTop: "10px", padding: "5px" },
      pageButtonsStyle: { padding: "5px 10px", background: "#007bff", color: "white", borderRadius: "4px" },
    },
  };

  // CSV data preparation
  const csvData = filteredInvoices.map((inv) => ({
    "លេខវិក្កយបត្រ": inv.id,
    "ប្រភេទ": inv.type === "invoice" ? "វិក្កយបត្រ" : "សម្រង់តម្លៃ",
    "ស្ថានភាព": { DRAFT: "ព្រាង", PENDING: "មិនទាន់បង់", PAID: "បានបង់", CANCELLED: "បានលុបចោល" }[inv.status] || inv.status,
    "កាលបរិច្ឆេទ": inv.date ? new Date(inv.date).toLocaleDateString() : "-",
    "ផុតកំណត់": inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "-",
    "អតិថិជន": inv.customer ? `${inv.customer.first_name || ""} ${inv.customer.last_name || ""}`.trim() : "-",
    "វិធីដឹកជញ្ជូន": inv.delivery_method ? inv.delivery_method.name : "-",
    "កំណត់សម្គាល់": inv.notes || "-",
    "សរុប (USD)": parseFloat(inv.total || 0).toFixed(2),
    "សរុប (KHR)": parseInt(inv.total_in_riel || 0),
  }));

  return (
    <div className="invoice-list-container">
      <h2>បញ្ជីវិក្កយបត្រ</h2>
      {error && <p className="error-message">{error}</p>}
      <div style={{ marginBottom: "10px", display: "flex", gap: "10px", alignItems: "center" }}>
        <input
          type="text"
          placeholder="ស្វែងរក (លេខ, អតិថិជន, ស្ថានភាព, កំណត់សម្គាល់...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: "8px", width: "300px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <div>
          <label>បង្ហាញក្នុងមួយទំព័រ: </label>
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            style={{ padding: "5px", borderRadius: "4px" }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <CSVLink
          data={csvData}
          filename="invoices.csv"
          style={{ padding: "8px 15px", background: "#28a745", color: "white", borderRadius: "4px", textDecoration: "none" }}
        >
          CSV
        </CSVLink>
        <button
          onClick={exportToPNG}
          style={{ padding: "8px 15px", background: "#007bff", color: "white", borderRadius: "4px", border: "none" }}
        >
          PNG
        </button>
        <button
          onClick={exportToExcel}
          style={{ padding: "8px 15px", background: "#17a2b8", color: "white", borderRadius: "4px", border: "none" }}
        >
          Excel
        </button>
      </div>
      <DataTable
        columns={columns}
        data={filteredInvoices}
        pagination
        paginationPerPage={rowsPerPage}
        paginationRowsPerPageOptions={[5, 10, 20, 50]}
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