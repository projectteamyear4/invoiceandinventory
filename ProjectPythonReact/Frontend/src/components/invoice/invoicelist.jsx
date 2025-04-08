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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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
      setError("សូមចូលប្រើប្រាស់ជាមុន (រកមិនឃើញ Access Token)");
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
        setError(err.response?.data?.detail || "មានបញ្ហាក្នុងការទាញយកវិក្កយបត្រ");
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

  const filterInvoices = (invoicesToFilter) => {
    return invoicesToFilter.filter((invoice) => {
      const customer = invoice.customer || {};
      const customerName = `${customer.first_name || ""} ${customer.last_name || ""}`.trim().toLowerCase();
      const delivery = invoice.delivery_method?.delivery_name || "";
      const query = searchQuery.toLowerCase();

      const matchesText =
        String(invoice.id || "").includes(query) ||
        customerName.includes(query) ||
        (invoice.status || "").toLowerCase().includes(query) ||
        (invoice.type || "").toLowerCase().includes(query) ||
        (invoice.notes || "").toLowerCase().includes(query) ||
        delivery.toLowerCase().includes(query);

      const invoiceDate = new Date(invoice.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      let matchesDate = true;
      if (start && invoiceDate < start) matchesDate = false;
      if (end && invoiceDate > end) matchesDate = false;

      return matchesText && matchesDate;
    });
  };

  useEffect(() => {
    const filtered = filterInvoices(invoices);
    setFilteredInvoices(filtered);
  }, [searchQuery, startDate, endDate, invoices]);

  const handleStatusChange = async () => {
    if (!selectedInvoiceId) return;

    const payload = { status: newStatus || null };
    console.log("Sending PATCH with payload:", payload);

    const originalInvoice = invoices.find((inv) => inv.id === selectedInvoiceId);

    const updatedInvoices = invoices.map((inv) =>
      inv.id === selectedInvoiceId ? { ...inv, status: newStatus || null } : inv
    );
    console.log("After optimistic update - invoices:", updatedInvoices);
    setInvoices(updatedInvoices);
    setFilteredInvoices(filterInvoices(updatedInvoices));
    setShowModal(false);
    setSelectedInvoiceId(null);
    setNewStatus("");

    try {
      const response = await api.patch(`/api/invoices/${selectedInvoiceId}/`, payload);
      console.log("Patch Response Data:", response.data);
      const updatedInvoice = response.data;

      const finalInvoices = invoices.map((inv) =>
        inv.id === selectedInvoiceId ? { ...inv, status: updatedInvoice.status } : inv
      );
      console.log("After API update - invoices:", finalInvoices);
      setInvoices(finalInvoices);
      setFilteredInvoices(filterInvoices(finalInvoices));
      setError(null);
    } catch (err) {
      console.error("Status update error:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(
        err.response?.data?.detail ||
          err.response?.data?.non_field_errors?.[0] ||
          "មានបញ្ហាក្នុងការកែស្ថានភាព"
      );

      const revertedInvoices = invoices.map((inv) =>
        inv.id === selectedInvoiceId ? originalInvoice : inv
      );
      console.log("After revert - invoices:", revertedInvoices);
      setInvoices(revertedInvoices);
      setFilteredInvoices(filterInvoices(revertedInvoices));

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
    if (window.confirm("តើអ្នកប្រាកដទេថាចង់លុបវិក្កយបត្រនេះ?")) {
      try {
        await api.delete(`/api/invoices/${invoiceId}/`);
        const updatedInvoices = invoices.filter((inv) => inv.id !== invoiceId);
        setInvoices(updatedInvoices);
        setFilteredInvoices(filterInvoices(updatedInvoices));
        setError(null);
      } catch (err) {
        console.error("Delete error:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
        setError("មានបញ្ហាក្នុងការលុបវិក្កយបត្រ");
      }
    }
  };

  const handleView = (invoice) => {
    navigate(`/invoices/${invoice.id}`, { state: { invoice } });
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredInvoices.map((inv) => ({
        "លេខវិក្កយបត្រ": inv.id,
        "ប្រភេទ": inv.type === "invoice" ? "វិក្កយបត្រ" : "សម្រង់តម្លៃ",
        "ស្ថានភាព": inv.status || "គ្មាន",
        "កាលបរិច្ឆេទ": inv.date || "-",
        "កាលបរិច្ឆេទផុតកំណត់": inv.due_date || "-",
        "អតិថិជន": inv.customer ? `${inv.customer.first_name || ""} ${inv.customer.last_name || ""}`.trim() : "-",
        "វិធីដឹកជញ្ជូន": inv.delivery_method?.delivery_name || "-",
        "កំណត់សម្គាល់": inv.notes || "-",
        "សរុប (USD)": parseFloat(inv.total || 0).toFixed(2),
        "សរុប (រៀល)": parseFloat(inv.total_in_riel || 0).toFixed(2),
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "វិក្កយបត្រ");
    XLSX.writeFile(wb, "វិក្កយបត្រ.xlsx");
  };

  const exportToPNG = () => {
    const table = document.querySelector(".rdt_Table");
    if (table) {
      html2canvas(table).then((canvas) => {
        canvas.toBlob((blob) => {
          saveAs(blob, "វិក្កយបត្រ.png");
        });
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        name: "មើល",
        cell: (row) => (
          <button
            onClick={() => handleView(row)}
            className="action-button view"
            title="មើលលម្អិត"
          >
            <FaEye style={{ fontSize: "18px" }} />
          </button>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
        width: "60px",
      },
      { name: "លេខវិក្កយបត្រ", selector: (row) => row.id || "-", sortable: true, width: "100px" },
      { name: "ប្រភេទ", selector: (row) => (row.type === "invoice" ? "វិក្កយបត្រ" : "សម្រង់តម្លៃ"), sortable: true, width: "120px" },
      {
        name: "ស្ថានភាព",
        selector: (row) => row.status,
        cell: (row) => (
          <button
            onClick={() => openStatusModal(row.id, row.status)}
            className={`status-button status-${(row.status || "").toLowerCase()}`}
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
      { name: "កាលបរិច្ឆេទ", selector: (row) => row.date || "-", sortable: true, width: "120px" },
      { name: "ផុតកំណត់", selector: (row) => row.due_date || "-", sortable: true, width: "120px" },
      {
        name: "អតិថិជន",
        selector: (row) => {
          const customer = row.customer || {};
          return customer ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim() : "-";
        },
        sortable: true,
        width: "150px",
      },
      {
        name: "វិធីដឹកជញ្ជូន",
        selector: (row) => row.delivery_method?.delivery_name || "-",
        sortable: true,
        width: "150px",
      },
      { name: "កំណត់សម្គាល់", selector: (row) => row.notes || "-", sortable: true, width: "150px" },
      { name: "សរុប (USD)", selector: (row) => `$${parseFloat(row.total || 0).toFixed(2)}`, sortable: true, width: "120px" },
      { name: "សរុប (រៀល)", selector: (row) => `៛${parseFloat(row.total_in_riel || 0).toFixed(2)}`, sortable: true, width: "150px" },
      {
        name: "សកម្មភាព",
        cell: (row) => (
          <button
            onClick={() => handleDelete(row.id)}
            className="action-button delete"
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

  const csvData = filteredInvoices.map((inv) => ({
    "លេខវិក្កយបត្រ": inv.id,
    "ប្រភេទ": inv.type === "invoice" ? "វិក្កយបត្រ" : "សម្រង់តម្លៃ",
    "ស្ថានភាព": inv.status === "DRAFT" ? "ព្រាង" : 
                  inv.status === "PENDING" ? "មិនទាន់បង់" : 
                  inv.status === "PAID" ? "បានបង់" : 
                  inv.status === "CANCELLED" ? "បានលុប" : "គ្មាន",
    "កាលបរិច្ឆេទ": inv.date || "-",
    "ផុតកំណត់": inv.due_date || "-",
    "អតិថិជន": inv.customer ? `${inv.customer.first_name || ""} ${inv.customer.last_name || ""}`.trim() : "-",
    "វិធីដឹកជញ្ជូន": inv.delivery_method?.delivery_name || "-",
    "កំណត់សម្គាល់": inv.notes || "-",
    "សរុប (USD)": parseFloat(inv.total || 0).toFixed(2),
    "សរុប (រៀល)": parseFloat(inv.total_in_riel || 0).toFixed(2),
  }));

  return (
    <div className="invoice-list-container">
      <h2 className="invoice-list-title">បញ្ជីវិក្កយបត្រ <span className="title-highlight"></span></h2>
      {error && <p className="error-message">{error}</p>}
      <div className="controls-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="ស្វែងរក (លេខសម្គាល់, អតិថិជន, ស្ថានភាព, កំណត់សម្គាល់...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <label>ចាប់ពីថ្ងៃ: </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="search-input date-input"
          />
          <label>ដល់ថ្ងៃ: </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="search-input date-input"
          />
        </div>
        <CSVLink
          data={csvData}
          filename="វិក្កយបត្រ.csv"
          className="action-button download csv"
        >
          CSV
        </CSVLink>
        <button
          onClick={exportToPNG}
          className="action-button download png"
        >
          PNG
        </button>
        <button
          onClick={exportToExcel}
          className="action-button download excel"
        >
          Excel
        </button>
      </div>
      <div className="invoice-table-card">
        <DataTable
          key={filteredInvoices.length + JSON.stringify(filteredInvoices.map((inv) => inv.status))}
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
          progressComponent={<div className="loading">កំពុងផ្ទុកវិក្កយបត្រ...</div>}
        />
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>ផ្លាស់ប្តូរស្ថានភាព</h3>
            <select
              value={newStatus || ""}
              onChange={(e) => setNewStatus(e.target.value)}
              className="modal-select"
            >
              <option value="">ជ្រើសរើសស្ថានភាព</option>
              <option value="DRAFT">ព្រាង</option>
              <option value="PENDING">មិនទាន់បង់</option>
              <option value="PAID">បានបង់</option>
              <option value="CANCELLED">បានលុប</option>
            </select>
            <div className="modal-actions">
              <button
                onClick={handleStatusChange}
                className="action-button save"
              >
                រក្សាទុក
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="action-button cancel"
              >
                បោះបង់
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;