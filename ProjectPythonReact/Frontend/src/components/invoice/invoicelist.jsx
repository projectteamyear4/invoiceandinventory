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
    console.log("Token:", token);
    if (!token) {
      setError("Please log in first (No access token found)");
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
        setError(err.response?.data?.detail || "Error fetching invoices");
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
      const delivery = invoice.delivery_method && invoice.delivery_method.name ? invoice.delivery_method.name : "";
      const query = (searchQuery || "").toLowerCase();
      return (
        (invoice.id?.toString() || "").includes(query) ||
        customerName.includes(query) ||
        (invoice.status || "").toLowerCase().includes(query) ||
        (invoice.type || "").toLowerCase().includes(query) ||
        (invoice.notes || "").toLowerCase().includes(query) ||
        delivery.toLowerCase().includes(query)
      );
    });
    setFilteredInvoices(filtered);
  }, [searchQuery, invoices]);

  const handleStatusChange = async () => {
    if (!selectedInvoiceId || !newStatus) return;
    try {
      const response = await api.patch(`/api/invoices/${selectedInvoiceId}/`, { status: newStatus });
      console.log("Patch Response:", response.data);
      const updatedInvoice = response.data;
      const updatedInvoices = invoices.map((inv) =>
        inv.id === selectedInvoiceId ? updatedInvoice : inv
      );
      console.log("Updated Invoices:", updatedInvoices);
      setInvoices(updatedInvoices);
      setFilteredInvoices(updatedInvoices);
      setError(null);
      setShowModal(false); // Close modal on success
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
          err.response?.data?.status?.[0] ||
          "Error updating status"
      );
      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const openStatusModal = (invoiceId, currentStatus) => {
    setSelectedInvoiceId(invoiceId);
    setNewStatus(currentStatus);
    setShowModal(true);
  };

  const handleDelete = async (invoiceId) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await api.delete(`/api/invoices/${invoiceId}/`);
        const updatedInvoices = invoices.filter((inv) => inv.id !== invoiceId);
        setInvoices(updatedInvoices);
        setFilteredInvoices(updatedInvoices);
        console.log(`Invoice ${invoiceId} deleted successfully`);
        setError(null);
      } catch (err) {
        console.error("Delete error:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
        setError("Error deleting invoice");
      }
    }
  };

  const handleView = (invoice) => {
    navigate(`/invoices/${invoice.id}`, { state: { invoice } });
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredInvoices.map((inv) => ({
        "Invoice ID": inv.id,
        Type: inv.type === "invoice" ? "Invoice" : "Quotation",
        Status: inv.status || "-",
        Date: inv.date ? new Date(inv.date).toLocaleDateString() : "-",
        "Due Date": inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "-",
        Customer: inv.customer ? `${inv.customer.first_name || ""} ${inv.customer.last_name || ""}`.trim() : "-",
        "Delivery Method": inv.delivery_method ? inv.delivery_method.name : "-",
        Notes: inv.notes || "-",
        "Total (USD)": parseFloat(inv.total || 0).toFixed(2),
        "Total (KHR)": parseFloat(inv.total_in_riel || 0).toFixed(2),
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");
    XLSX.writeFile(wb, "invoices.xlsx");
  };

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
      {
        name: "View",
        cell: (row) => (
          <button
            onClick={() => handleView(row)}
            style={{ padding: "5px", background: "transparent", border: "none", cursor: "pointer" }}
            title="View Details"
          >
            <FaEye style={{ color: "#007bff", fontSize: "18px" }} />
          </button>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
        width: "60px",
      },
      { name: "Invoice ID", selector: (row) => row.id || "-", sortable: true, width: "100px" },
      { name: "Type", selector: (row) => (row.type === "invoice" ? "Invoice" : "Quotation"), sortable: true, width: "120px" },
      {
        name: "Status",
        selector: (row) => row.status,
        cell: (row) => (
          <button
            onClick={() => openStatusModal(row.id, row.status)}
            style={{ padding: "5px 10px", background: "#007bff", color: "white", borderRadius: "4px", border: "none" }}
          >
            {row.status || "DRAFT"}
          </button>
        ),
        sortable: true,
        width: "150px",
      },
      { name: "Date", selector: (row) => (row.date ? new Date(row.date).toLocaleDateString() : "-"), sortable: true, width: "120px" },
      { name: "Due Date", selector: (row) => (row.due_date ? new Date(row.due_date).toLocaleDateString() : "-"), sortable: true, width: "120px" },
      {
        name: "Customer",
        selector: (row) => {
          const customer = row.customer || {};
          return customer ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim() : row.customer_id || "-";
        },
        sortable: true,
        width: "150px",
      },
      {
        name: "Delivery Method",
        selector: (row) => (row.delivery_method && row.delivery_method.name ? row.delivery_method.name : "-"),
        sortable: true,
        width: "150px",
      },
      { name: "Notes", selector: (row) => row.notes || "-", sortable: true, width: "150px" },
      { name: "Total (USD)", selector: (row) => `$${parseFloat(row.total || 0).toFixed(2)}`, sortable: true, width: "120px" },
      { name: "Total (KHR)", selector: (row) => `៛${parseFloat(row.total_in_riel || 0).toFixed(2)}`, sortable: true, width: "150px" },
      {
        name: "Action",
        cell: (row) => (
          <button
            onClick={() => handleDelete(row.id)}
            style={{ padding: "5px 10px", background: "#dc3545", color: "white", borderRadius: "4px", border: "none" }}
          >
            Delete
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
    "Invoice ID": inv.id,
    Type: inv.type === "invoice" ? "Invoice" : "Quotation",
    Status: inv.status || "-",
    Date: inv.date ? new Date(inv.date).toLocaleDateString() : "-",
    "Due Date": inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "-",
    Customer: inv.customer ? `${inv.customer.first_name || ""} ${inv.customer.last_name || ""}`.trim() : "-",
    "Delivery Method": inv.delivery_method ? inv.delivery_method.name : "-",
    Notes: inv.notes || "-",
    "Total (USD)": parseFloat(inv.total || 0).toFixed(2),
    "Total (KHR)": parseFloat(inv.total_in_riel || 0).toFixed(2),
  }));

  return (
    <div className="invoice-list-container">
      <h2>Invoice List</h2>
      {error && <p className="error-message">{error}</p>}
      <div style={{ marginBottom: "10px", display: "flex", gap: "10px", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search (ID, Customer, Status, Notes...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: "8px", width: "300px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <div>
          <label>Rows per page: </label>
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
        noDataComponent={<div className="no-results">No invoices match the search criteria.</div>}
        highlightOnHover
        responsive
        progressPending={loading}
        progressComponent={<div className="loading">Loading invoices...</div>}
      />

      {/* Modal for Status Change */}
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div style={{
            background: "white", padding: "20px", borderRadius: "8px", width: "300px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
          }}>
            <h3>Change Status</h3>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              style={{ width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "4px" }}
            >
              <option value="DRAFT">Draft</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleStatusChange}
                style={{ padding: "8px 15px", background: "#28a745", color: "white", borderRadius: "4px", border: "none" }}
              >
                Save
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: "8px 15px", background: "#dc3545", color: "white", borderRadius: "4px", border: "none" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;