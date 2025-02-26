import React, { useState } from "react";
import "./InvoiceList.css";

const InvoiceList = () => {
  // Sample data
  const initialInvoices = [
    {
      id: "INV001",
      customerName: "John Doe",
      date: "2025-02-01",
      dueDate: "2025-03-01",
      type: "Invoice",
      status: "Open",
    },
    {
      id: "INV002",
      customerName: "Jane Smith",
      date: "2025-02-10",
      dueDate: "2025-03-10",
      type: "Quote",
      status: "Closed",
    },
    {
      id: "INV003",
      customerName: "Alice Johnson",
      date: "2025-02-15",
      dueDate: "2025-03-15",
      type: "Invoice",
      status: "Open",
    },
  ];

  const [invoices, setInvoices] = useState(initialInvoices);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");

  // Sort function
  const handleSort = (field) => {
    const direction =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);

    const sortedInvoices = [...invoices].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];
      if (direction === "asc") {
        return aValue.localeCompare
          ? aValue.localeCompare(bValue)
          : aValue - bValue;
      } else {
        return bValue.localeCompare
          ? bValue.localeCompare(aValue)
          : bValue - aValue;
      }
    });
    setInvoices(sortedInvoices);
  };

  // Filter function
  const filteredInvoices = invoices.filter((invoice) =>
    Object.values(invoice)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="invoice-list-container">
      <h1 className="invoice-list-title">
        <span className="title-highlight">Invoice</span> List
      </h1>
      <div className="invoice-table-card">
        {/* Search Input */}
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <table className="invoice-table">
          <thead>
            <tr>
              <th className="table-header" onClick={() => handleSort("id")}>
                Invoice ID {sortField === "id" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="table-header"
                onClick={() => handleSort("customerName")}
              >
                Customer Name{" "}
                {sortField === "customerName" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th className="table-header" onClick={() => handleSort("date")}>
                Date {sortField === "date" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="table-header"
                onClick={() => handleSort("dueDate")}
              >
                Due Date{" "}
                {sortField === "dueDate" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th className="table-header" onClick={() => handleSort("type")}>
                Type {sortField === "type" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th className="table-header" onClick={() => handleSort("status")}>
                Status{" "}
                {sortField === "status" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="table-cell">{invoice.id}</td>
                <td className="table-cell">{invoice.customerName}</td>
                <td className="table-cell">{invoice.date}</td>
                <td className="table-cell">{invoice.dueDate}</td>
                <td className="table-cell">{invoice.type}</td>
                <td className="table-cell">{invoice.status}</td>
                <td className="table-cell">
                  <button className="action-button edit">Edit</button>
                  <button className="action-button download">Download PDF</button>
                  <button className="action-button delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <button className="pagination-button" disabled>
            Previous
          </button>
          <span className="pagination-info">Page 1 of 3</span>
          <button className="pagination-button">Next</button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceList;