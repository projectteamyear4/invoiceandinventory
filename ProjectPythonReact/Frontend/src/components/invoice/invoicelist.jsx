import React, { useState } from "react";
import "./InvoiceList.css";

const InvoiceList = () => {
  const initialInvoices = [
    {
      id: "INV001",
      customerName: "សុខ សុភ័ក្ត្រ", // Sok Sophak (Khmer: "Happiness" + "Wisdom")
      date: "2025-02-01",
      dueDate: "2025-03-01",
      type: "Invoice",
      status: "Open",
    },
    {
      id: "INV002",
      customerName: "គឹម សុជាតិ", // Kim Socheat (Khmer: "Gold" + "Good Birth")
      date: "2025-02-10",
      dueDate: "2025-03-10",
      type: "Quote",
      status: "Closed",
    },
    {
      id: "INV003",
      customerName: "ម៉ី នា", // Mey Na (Khmer: "Mother" + "Lady")
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

  const handleSort = (field) => {
    const direction =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);

    const sortedInvoices = [...invoices].sort((a, b) => {
      const aValue = field === "date" || field === "dueDate" ? new Date(a[field]) : a[field];
      const bValue = field === "date" || field === "dueDate" ? new Date(b[field]) : b[field];
      
      if (direction === "asc") {
        return typeof aValue === "string" 
          ? aValue.localeCompare(bValue)
          : aValue - bValue;
      } else {
        return typeof bValue === "string"
          ? bValue.localeCompare(aValue)
          : bValue - aValue;
      }
    });
    setInvoices(sortedInvoices);
  };

  const filteredInvoices = invoices.filter((invoice) =>
    Object.values(invoice)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

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
        
        <div className="sort-buttons">
          <button 
            className="sort-btn" 
            onClick={() => handleSort("customerName")}
          >
            តម្រៀបតាមឈ្មោះ {sortField === "customerName" && (sortDirection === "asc" ? "↑" : "↓")}
          </button>
          <button 
            className="sort-btn" 
            onClick={() => handleSort("date")}
          >
            តម្រៀបតាមកាលបរិច្ឆេទ {sortField === "date" && (sortDirection === "asc" ? "↑" : "↓")}
          </button>
          <button 
            className="sort-btn" 
            onClick={() => handleSort("status")}
          >
            តម្រៀបតាមស្ថានភាព {sortField === "status" && (sortDirection === "asc" ? "↑" : "↓")}
          </button>
        </div>
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
                <td className={`table-cell status-${invoice.status.toLowerCase()}`}>
                  {invoice.status === "Open" ? "បើក" : "បិទ"}
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