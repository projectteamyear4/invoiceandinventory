import React, { useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Customers.css";

const CustomerList = () => {
  const [customers, setCustomers] = useState([
    { customer_id: 1, name: "ចន ដូ", phone1: "៥៥៥-១២៣៤", phone2: "៥៥៥៣២៣២៣-១២៣៤", bookinghistory: "៥", address: "ផ្លូវលេខ ១២៣", status: "សកម្ម" }, // John Doe - Active
    { customer_id: 2, name: "ទូទៅ", phone1: "ទូទៅ", phone2: "ទូទៅ", bookinghistory: "៥", address: "ទូទៅ", status: "អសកម្ម" }, // General - Inactive
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
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
          <button className="add-button" onClick={() => navigate('/add-customer')}>
            <FaPlus /> បន្ថែមអតិថិជន {/* Add Customer */}
          </button>
        </div>
      </header>

      <table className="customer-table">
        <thead>
          <tr>
            <th>ឈ្មោះ</th> {/* Name */}
            <th>ទូរស័ព្ទ ១</th> {/* Phone1 */}
            <th>ទូរស័ព្ទ ២</th> {/* Phone2 */}
            <th>ប្រវត្តិកក់</th> {/* Booking History */}
            <th>អាសយដ្ឋាន</th> {/* Address */}
            <th>ស្ថានភាព</th> {/* Status */}
            <th>សកម្មភាព</th> {/* Action */}
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.map(customer => (
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
    </div>
  );
};

export default CustomerList;