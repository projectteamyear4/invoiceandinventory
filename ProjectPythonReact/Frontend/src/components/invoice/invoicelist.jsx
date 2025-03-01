import React, { useState } from "react";
import "./InvoiceList.css";

const InvoiceList = () => {
  const initialInvoices = [
    {
      id: "INV001",
      customerName: "សុខ សុភ័ក្ត្រ", // Sok Sophak
      date: "2025-02-01",
      dueDate: "2025-03-01",
      type: "Invoice",
      status: "Open",
    },
    {
      id: "INV002",
      customerName: "គឹម សុជាតិ", // Kim Socheat
      date: "2025-02-10",
      dueDate: "2025-03-10",
      type: "Quote",
      status: "Closed",
    },
    {
      id: "INV003",
      customerName: "ម៉ី នា", // Mey Na
      date: "2025-02-15",
      dueDate: "2025-03-15",
      type: "Invoice",
      status: "Open",
    },
  ];

  const [invoices, setInvoices] = useState(initialInvoices);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortOption, setSortOption] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSort = (field, directionFromSelect = null) => {
    const direction =
      directionFromSelect !== null
        ? directionFromSelect
        : sortField === field && sortDirection === "asc"
        ? "desc"
        : "asc";

    setSortField(field);
    setSortDirection(direction);
    setSortOption(`${field}-${direction}`); // Sync with select dropdown

    const sortedInvoices = [...invoices].sort((a, b) => {
      const aValue = field === "date" || field === "dueDate" ? new Date(a[field]) : a[field];
      const bValue = field === "date" || field === "dueDate" ? new Date(b[field]) : b[field];

      if (direction === "asc") {
        return typeof aValue === "string"
          ? aValue.localeCompare(bValue, 'km') // Khmer locale for strings
          : aValue - bValue;
      } else {
        return typeof bValue === "string"
          ? bValue.localeCompare(aValue, 'km')
          : bValue - aValue;
      }
    });
    setInvoices(sortedInvoices);
  };

  const handleSelectSort = (option) => {
    setSortOption(option);
    if (!option) {
      setInvoices(initialInvoices); // Reset to initial order if "Default" is selected
      setSortField(null);
      setSortDirection("asc");
      return;
    }

    const [field, direction] = option.split("-");
    handleSort(field, direction);
  };

  // Handle status toggle
  const handleStatusToggle = (id) => {
    setInvoices(invoices.map(invoice =>
      invoice.id === id
        ? { ...invoice, status: invoice.status === "Open" ? "Closed" : "Open" }
        : invoice
    ));
  };

  const filteredInvoices = invoices.filter((invoice) =>
    Object.values(invoice)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Sort options for dropdown
  const sortOptions = [
    { value: "", label: "លំនាំដើម" }, // Default
    { value: "id-asc", label: "លេខសម្គាល់ (ក - ហ)" }, // ID (A-Z)
    { value: "id-desc", label: "លេខសម្គាល់ (ហ - ក)" }, // ID (Z-A)
    { value: "customerName-asc", label: "ឈ្មោះ (ក - ហ)" }, // Customer Name (A-Z)
    { value: "customerName-desc", label: "ឈ្មោះ (ហ - ក)" }, // Customer Name (Z-A)
    { value: "date-asc", label: "កាលបរិច្ឆេទ (ចាស់ - ថ្មី)" }, // Date (Old to New)
    { value: "date-desc", label: "កាលបរិច្ឆេទ (ថ្មី - ចាស់)" }, // Date (New to Old)
    { value: "dueDate-asc", label: "កាលបរិច្ឆេទកំណត់ (ចាស់ - ថ្មី)" }, // Due Date (Old to New)
    { value: "dueDate-desc", label: "កាលបរិច្ឆេទកំណត់ (ថ្មី - ចាស់)" }, // Due Date (New to Old)
    { value: "type-asc", label: "ប្រភេទ (ក - ហ)" }, // Type (A-Z)
    { value: "type-desc", label: "ប្រភេទ (ហ - ក)" }, // Type (Z-A)
    { value: "status-asc", label: "ស្ថានភាព (ក - ហ)" }, // Status (A-Z)
    { value: "status-desc", label: "ស្ថានភាព (ហ - ក)" }, // Status (Z-A)
  ];

  return (
    <div className="invoice-list-container">
      <h1 className="invoice-list-title">
        <span className="title-highlight">វិក្កយបត្រ</span> បញ្ជី
      </h1>
      
      <div className="controls-container">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="ស្វែងរកវិក្កយបត្រ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="sort-select"
          value={sortOption}
          onChange={(e) => handleSelectSort(e.target.value)}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="invoice-table-card">
        <table className="invoice-table">
          <thead>
            <tr>
              <th className="table-header" onClick={() => handleSort("id")}>
                លេខសម្គាល់ {sortField === "id" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th className="table-header" onClick={() => handleSort("customerName")}>
                អតិថិជន {sortField === "customerName" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th className="table-header" onClick={() => handleSort("date")}>
                កាលបរិច្ឆេទ {sortField === "date" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th className="table-header" onClick={() => handleSort("dueDate")}>
                កាលបរិច្ឆេទកំណត់ {sortField === "dueDate" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th className="table-header" onClick={() => handleSort("type")}>
                ប្រភេទ {sortField === "type" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th className="table-header" onClick={() => handleSort("status")}>
                ស្ថានភាព {sortField === "status" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th className="table-header">សកម្មភាព</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="table-row-hover">
                <td className="table-cell">{invoice.id}</td>
                <td className="table-cell">{invoice.customerName}</td>
                <td className="table-cell">{invoice.date}</td>
                <td className="table-cell">{invoice.dueDate}</td>
                <td className="table-cell">{invoice.type}</td>
                <td className="table-cell">
                  <button
                    className={`status-button status-${invoice.status.toLowerCase()}`}
                    onClick={() => handleStatusToggle(invoice.id)}
                  >
                    {invoice.status === "Open" ? "បើក" : "បិទ"}
                  </button>
                </td>
                <td className="table-cell actions-cell">
                  <button className="action-button edit">កែ</button>
                  <button className="action-button download">ទាញយក PDF</button>
                  <button className="action-button delete">លុប</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button className="pagination-button" disabled>
            មុន
          </button>
          <span className="pagination-info">ទំព័រ ១ នៃ ៣</span>
          <button className="pagination-button">
            បន្ទាប់
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceList;