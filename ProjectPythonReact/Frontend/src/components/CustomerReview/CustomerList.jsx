import React, { useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Customers.css";

const CustomerList = () => {
  const initialCustomers = [
    { customer_id: 1, name: "ចន ដូ", phone1: "៥៥៥-១២៩៤", phone2: "៥៥៥៩២៩២៩-១២៩៤", bookinghistory: "៥", address: "ផ្លូវលេខ ១២៩", status: "សកម្ម" }, // John Doe - Active
    { customer_id: 2, name: "ទូទៅ", phone1: "ទូទៅ", phone2: "ទូទៅ", bookinghistory: "៥", address: "ទូទៅ", status: "អសកម្ម" }, // General - Inactive
  ];

  const [customers, setCustomers] = useState(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortOption, setSortOption] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();

  const handleSort = (field, directionFromSelect = null) => {
    const direction =
      directionFromSelect !== null
        ? directionFromSelect
        : sortField === field && sortDirection === "asc"
        ? "desc"
        : "asc";

    setSortField(field);
    setSortDirection(direction);
    setSortOption(`${field}-${direction}`);

    const sortedCustomers = [...customers].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];

      if (field === "bookinghistory") {
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      } else {
        return direction === "asc"
          ? aValue.localeCompare(bValue, 'km')
          : bValue.localeCompare(aValue, 'km');
      }
    });
    setCustomers(sortedCustomers);
  };

  const handleSelectSort = (option) => {
    setSortOption(option);
    if (!option) {
      setCustomers(initialCustomers);
      setSortField(null);
      setSortDirection("asc");
      return;
    }

    const [field, direction] = option.split("-");
    handleSort(field, direction);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination handlers
  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedCustomers = filteredCustomers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handle Delete action
  const handleDelete = (customer_id) => {
    if (window.confirm("តើអ្នកប្រាកដជាចង់លុបអតិថិជននេះមែនទេ?")) { // Are you sure you want to delete this customer?
      setCustomers(customers.filter(customer => customer.customer_id !== customer_id));
      alert("អតិថិជនត្រូវបានលុបដោយជោគជ័យ!"); // Customer deleted successfully!
    }
  };

  // Handle Edit action (navigate to edit page)
  const handleEdit = (customer_id) => {
    navigate(`/edit-customer/${customer_id}`);
  };

  // Sort options for dropdown
  const sortOptions = [
    { value: "", label: "លំនាំដើម" }, // Default
    { value: "name-asc", label: "ឈ្មោះ (ក - ហ)" }, // Name (A-Z)
    { value: "name-desc", label: "ឈ្មោះ (ហ - ក)" }, // Name (Z-A)
    { value: "phone1-asc", label: "ទូរស័ព្ទ ១ (ក - ហ)" }, // Phone1 (A-Z)
    { value: "phone1-desc", label: "ទូរស័ព្ទ ១ (ហ - ក)" }, // Phone1 (Z-A)
    { value: "phone2-asc", label: "ទូរស័ព្ទ ២ (ក - ហ)" }, // Phone2 (A-Z)
    { value: "phone2-desc", label: "ទូរស័ព្ទ ២ (ហ - ក)" }, // Phone2 (Z-A)
    { value: "bookinghistory-asc", label: "ប្រវត្តិកក់ (តិច - ច្រើន)" }, // Booking History (Low to High)
    { value: "bookinghistory-desc", label: "ប្រវត្តិកក់ (ច្រើន - តិច)" }, // Booking History (High to Low)
    { value: "address-asc", label: "អាសយដ្ឋាន (ក - ហ)" }, // Address (A-Z)
    { value: "address-desc", label: "អាសយដ្ឋាន (ហ - ក)" }, // Address (Z-A)
    { value: "status-asc", label: "ស្ថានភាព (ក - ហ)" }, // Status (A-Z)
    { value: "status-desc", label: "ស្ថានភាព (ហ - ក)" }, // Status (Z-A)
  ];

  // Rows per page options
  const rowsPerPageOptions = [5, 10, 25];

  return (
    <div className="customer-container">
      <header className="customer-header">
        <h1>ការគ្រប់គ្រងអតិថិជន</h1> {/* Customer Management */}
        <div className="controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="ស្វែងរកអតិថិជន..." // Search customers...
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
          <button className="add-button" onClick={() => navigate('/add-customer')}>
            <FaPlus /> បន្ថែមអតិថិជន {/* Add Customer */}
          </button>
        </div>
      </header>

      <table className="customer-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("name")}>
              ឈ្មោះ {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")} {/* Name */}
            </th>
            <th onClick={() => handleSort("phone1")}>
              ទូរស័ព្ទ ១ {sortField === "phone1" && (sortDirection === "asc" ? "↑" : "↓")} {/* Phone1 */}
            </th>
            <th onClick={() => handleSort("phone2")}>
              ទូរស័ព្ទ ២ {sortField === "phone2" && (sortDirection === "asc" ? "↑" : "↓")} {/* Phone2 */}
            </th>
            <th onClick={() => handleSort("bookinghistory")}>
              ប្រវត្តិកក់ {sortField === "bookinghistory" && (sortDirection === "asc" ? "↑" : "↓")} {/* Booking History */}
            </th>
            <th onClick={() => handleSort("address")}>
              អាសយដ្ឋាន {sortField === "address" && (sortDirection === "asc" ? "↑" : "↓")} {/* Address */}
            </th>
            <th onClick={() => handleSort("status")}>
              ស្ថានភាព {sortField === "status" && (sortDirection === "asc" ? "↑" : "↓")} {/* Status */}
            </th>
            <th>សកម្មភាព</th> {/* Action */}
          </tr>
        </thead>
        <tbody>
          {paginatedCustomers.map(customer => (
            <tr key={customer.customer_id}>
              <td>{customer.name}</td>
              <td>{customer.phone1}</td>
              <td>{customer.phone2}</td>
              <td>{customer.bookinghistory}</td>
              <td>{customer.address}</td>
              <td className={`status-${customer.status === "សកម្ម" ? "active" : "inactive"}`}>
                {customer.status}
              </td>
              <td className="action-cell">
                <button 
                  className="action-button edit" 
                  onClick={() => handleEdit(customer.customer_id)}
                  title="កែ" // Edit
                >
                  <FaEdit />
                </button>
                <button 
                  className="action-button delete" 
                  onClick={() => handleDelete(customer.customer_id)}
                  title="លុប" // Delete
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button
          className="pagination-button"
          onClick={() => handleChangePage(page - 1)}
          disabled={page === 0}
        >
          មុន {/* Previous */}
        </button>
        <span className="pagination-info">
          ទំព័រ {page + 1} នៃ {Math.ceil(filteredCustomers.length / rowsPerPage)} {/* Page X of Y */}
        </span>
        <button
          className="pagination-button"
          onClick={() => handleChangePage(page + 1)}
          disabled={page >= Math.ceil(filteredCustomers.length / rowsPerPage) - 1}
        >
          បន្ទាប់ {/* Next */}
        </button>
        <select
          className="rows-per-page-select"
          value={rowsPerPage}
          onChange={handleChangeRowsPerPage}
        >
          {rowsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option} ក្នុងមួយទំព័រ {/* X per page */}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CustomerList;