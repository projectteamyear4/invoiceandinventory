import axios from "axios";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import React, { useEffect, useMemo, useState } from "react";
import { CSVLink } from "react-csv";
import DataTable from "react-data-table-component";
import { FaEye } from "react-icons/fa";
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
  const [startDate, setStartDate] = useState(""); // New state for start date
  const [endDate, setEndDate] = useState("");     // New state for end date
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
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
      setError("សូមចូលប្រើប្រាស់ជាមុន (រកមិនឃើញ Access Token)"); // "Please log in first (No access token found)"
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
        setError(err.response?.data?.detail || "មានបញ្ហាក្នុងការទាញយកវិក្កយបត្រ"); // "Error fetching invoices"
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

  useEffect(() => {
    const filtered = invoices.filter((invoice) => {
      const customer = invoice.customer || {};
      const customerName = `${customer.first_name || ""} ${customer.last_name || ""}`.trim().toLowerCase();
      const delivery = invoice.delivery_method?.delivery_name || "";
      const query = searchQuery.toLowerCase();
      
      // Text-based filtering
      const matchesText =
        String(invoice.id || "").includes(query) ||
        customerName.includes(query) ||
        (invoice.status || "").toLowerCase().includes(query) ||
        (invoice.type || "").toLowerCase().includes(query) ||
        (invoice.notes || "").toLowerCase().includes(query) ||
        delivery.toLowerCase().includes(query);

      // Date range filtering
      const invoiceDate = new Date(invoice.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      let matchesDate = true;
      if (start && invoiceDate < start) matchesDate = false;
      if (end && invoiceDate > end) matchesDate = false;

      return matchesText && matchesDate;
    });
    setFilteredInvoices(filtered);
  }, [searchQuery, startDate, endDate, invoices]);

  const handleStatusChange = async () => {
    if (!selectedInvoiceId) return;
    const payload = { status: newStatus || null };
    console.log("Sending PATCH with payload:", payload);
    try {
      const response = await api.patch(`/api/invoices/${selectedInvoiceId}/`, payload);
      console.log("Patch Response:", response.data);
      const updatedInvoice = response.data;
      const updatedInvoices = invoices.map((inv) =>
        inv.id === selectedInvoiceId ? updatedInvoice : inv
      );
      setInvoices(updatedInvoices);
      setFilteredInvoices(updatedInvoices);
      setError(null);
      setShowModal(false);
      setSelectedInvoiceId(null);
      setNewStatus("");
    } catch (err) {
      console.error("Status update error:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(
        err.response?.data?.detail ||
          err.response?.data?.non_field_errors?.[0] ||
          "មានបញ្ហាក្នុងការកែស្ថានភាព" // "Error updating status"
      );
      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const openStatusModal = (invoiceId, currentStatus) => {
    setSelectedInvoiceId(invoiceId);
    setNewStatus(currentStatus || "");
    setShowModal(true);
  };

  const handleDelete = async (invoiceId) => {
    if (window.confirm("តើអ្នកប្រាកដទេថាចង់លុបវិក្កយបត្រនេះ?")) { // "Are you sure you want to delete this invoice?"
      try {
        await api.delete(`/api/invoices/${invoiceId}/`);
        const updatedInvoices = invoices.filter((inv) => inv.id !== invoiceId);
        setInvoices(updatedInvoices);
        setFilteredInvoices(updatedInvoices);
        setError(null);
      } catch (err) {
        console.error("Delete error:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
        setError("មានបញ្ហាក្នុងការលុបវិក្កយបត្រ"); // "Error deleting invoice"
      }
    }
  };

  const handleView = (invoice) => {
    navigate(`/invoices/${invoice.id}`, { state: { invoice } });
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredInvoices.map((inv) => ({
        "លេខវិក្កយបត្រ": inv.id, // "Invoice ID"
        "ប្រភេទ": inv.type === "invoice" ? "វិក្កយបត្រ" : "សម្រង់តម្លៃ", // "Type": "Invoice" or "Quotation"
        "ស្ថានភាព": inv.status || "គ្មាន", // "Status" or "None"
        "កាលបរិច្ឆេទ": inv.date || "-", // "Date"
        "កាលបរិច្ឆេទផុតកំណត់": inv.due_date || "-", // "Due Date"
        "អតិថិជន": inv.customer ? `${inv.customer.first_name || ""} ${inv.customer.last_name || ""}`.trim() : "-", // "Customer"
        "វិធីដឹកជញ្ជូន": inv.delivery_method?.delivery_name || "-", // "Delivery Method"
        "កំណត់សម្គាល់": inv.notes || "-", // "Notes"
        "សរុប (USD)": parseFloat(inv.total || 0).toFixed(2), // "Total (USD)"
        "សរុប (រៀល)": parseFloat(inv.total_in_riel || 0).toFixed(2), // "Total (KHR)"
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "វិក្កយបត្រ"); // "Invoices"
    XLSX.writeFile(wb, "វិក្កយបត្រ.xlsx"); // "invoices.xlsx"
  };

  const exportToPNG = () => {
    const table = document.querySelector(".rdt_Table");
    if (table) {
      html2canvas(table).then((canvas) => {
        canvas.toBlob((blob) => {
          saveAs(blob, "វិក្កយបត្រ.png"); // "invoices.png"
        });
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        name: "មើល", // "View"
        cell: (row) => (
          <button
            onClick={() => handleView(row)}
            style={{ padding: "5px", background: "transparent", border: "none", cursor: "pointer" }}
            title="មើលលម្អិត" // "View Details"
          >
            <FaEye style={{ color: "#007bff", fontSize: "18px" }} />
          </button>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
        width: "60px",
      },
      { name: "លេខវិក្កយបត្រ", selector: (row) => row.id || "-", sortable: true, width: "100px" }, // "Invoice ID"
      { name: "ប្រភេទ", selector: (row) => (row.type === "invoice" ? "វិក្កយបត្រ" : "សម្រង់តម្លៃ"), sortable: true, width: "120px" }, // "Type"
      {
        name: "ស្ថានភាព", // "Status"
        selector: (row) => row.status,
        cell: (row) => (
          <button
            onClick={() => openStatusModal(row.id, row.status)}
            style={{ padding: "5px 10px", background: "#007bff", color: "white", borderRadius: "4px", border: "none" }}
          >
            {row.status === "DRAFT" ? "ព្រាង" : 
             row.status === "PENDING" ? "មិនទាន់បង់" : 
             row.status === "PAID" ? "បានបង់" : 
             row.status === "CANCELLED" ? "បានលុប" : "គ្មាន"}
          </button>
        ),
        sortable: true,
        width: "150px",
      },
      { name: "កាលបរិច្ឆេទ", selector: (row) => row.date || "-", sortable: true, width: "120px" }, // "Date"
      { name: "ផុតកំណត់", selector: (row) => row.due_date || "-", sortable: true, width: "120px" }, // "Due Date"
      {
        name: "អតិថិជន", // "Customer"
        selector: (row) => {
          const customer = row.customer || {};
          return customer ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim() : "-";
        },
        sortable: true,
        width: "150px",
      },
      {
        name: "វិធីដឹកជញ្ជូន", // "Delivery Method"
        selector: (row) => row.delivery_method?.delivery_name || "-", // Adjusted to match model
        sortable: true,
        width: "150px",
      },
      { name: "កំណត់សម្គាល់", selector: (row) => row.notes || "-", sortable: true, width: "150px" }, // "Notes"
      { name: "សរុប (USD)", selector: (row) => `$${parseFloat(row.total || 0).toFixed(2)}`, sortable: true, width: "120px" }, // "Total (USD)"
      { name: "សរុប (រៀល)", selector: (row) => `៛${parseFloat(row.total_in_riel || 0).toFixed(2)}`, sortable: true, width: "150px" }, // "Total (KHR)"
      {
        name: "សកម្មភាព", // "Action"
        cell: (row) => (
          <button
            onClick={() => handleDelete(row.id)}
            style={{ padding: "5px 10px", background: "#dc3545", color: "white", borderRadius: "4px", border: "none" }}
          >
            លុប  {/* "Delete" */}
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

  const csvData = filteredInvoices.map((inv) => ({
    "លេខវិក្កយបត្រ": inv.id, // "Invoice ID"
    "ប្រភេទ": inv.type === "invoice" ? "វិក្កយបត្រ" : "សម្រង់តម្លៃ", // "Type"
    "ស្ថានភាព": inv.status === "DRAFT" ? "ព្រាង" : 
                  inv.status === "PENDING" ? "មិនទាន់បង់" : 
                  inv.status === "PAID" ? "បានបង់" : 
                  inv.status === "CANCELLED" ? "បានលុប" : "គ្មាន", // "Status"
    "កាលបរិច្ឆេទ": inv.date || "-", // "Date"
    "ផុតកំណត់": inv.due_date || "-", // "Due Date"
    "អតិថិជន": inv.customer ? `${inv.customer.first_name || ""} ${inv.customer.last_name || ""}`.trim() : "-", // "Customer"
    "វិធីដឹកជញ្ជូន": inv.delivery_method?.delivery_name || "-", // "Delivery Method"
    "កំណត់សម្គាល់": inv.notes || "-", // "Notes"
    "សរុប (USD)": parseFloat(inv.total || 0).toFixed(2), // "Total (USD)"
    "សរុប (រៀល)": parseFloat(inv.total_in_riel || 0).toFixed(2), // "Total (KHR)"
  }));

  return (
    <div className="invoice-list-container">
      <h2>បញ្ជីវិក្កយបត្រ</h2> {/* "Invoice List" */}
      {error && <p className="error-message">{error}</p>}
      <div style={{ marginBottom: "10px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="ស្វែងរក (លេខសម្គាល់, អតិថិជន, ស្ថានភាព, កំណត់សម្គាល់...)" // "Search (ID, Customer, Status, Notes...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: "8px", width: "300px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <label>ចាប់ពីថ្ងៃ: </label> {/* "From Date:" */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <label>ដល់ថ្ងៃ: </label> {/* "To Date:" */}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>
        <CSVLink
          data={csvData}
          filename="វិក្កយបត្រ.csv" // "invoices.csv"
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
      {/* "No invoices match the search criteria" */}
      <DataTable
        columns={columns}
        data={filteredInvoices}
        pagination
        paginationPerPage={rowsPerPage}
        paginationRowsPerPageOptions={[5, 10, 20, 50]}
        customStyles={customStyles}
        noDataComponent={<div className="no-results">គ្មានវិក្កយបត្រណាមួយត្រូវនឹងការស្វែងរកទេ</div>}
        highlightOnHover
        responsive
        progressPending={loading}
        progressComponent={<div className="loading">កំពុងផ្ទុកវិក្កយបត្រ...</div>} // "Loading invoices..."
      />

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "300px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3>ផ្លាស់ប្តូរស្ថានភាព</h3> {/* "Change Status" */}
            <select
              value={newStatus || ""}
              onChange={(e) => setNewStatus(e.target.value)}
              style={{ width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "4px" }}
            >
              <option value="">គ្មាន</option> {/* "None" */}
              <option value="DRAFT">ព្រាង</option> {/* "Draft" */}
              <option value="PENDING">មិនទាន់បង់</option> {/* "Pending" */}
              <option value="PAID">បានបង់</option> {/* "Paid" */}
              <option value="CANCELLED">បានលុប</option> {/* "Cancelled" */}
            </select>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleStatusChange}
                style={{ padding: "8px 15px", background: "#28a745", color: "white", borderRadius: "4px", border: "none" }}
              >
                រក្សាទុក {/* "Save" */}
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: "8px 15px", background: "#dc3545", color: "white", borderRadius: "4px", border: "none" }}
              >
                បោះបង់ {/* "Cancel" */}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;