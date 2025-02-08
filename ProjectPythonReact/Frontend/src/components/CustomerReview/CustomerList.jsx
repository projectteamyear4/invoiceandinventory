import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Customers.css";

const CustomerList = () => {
  const [customers] = useState([
    { customer_id: 1, name: "John Doe", email: "john@example.com", phone: "555-1234", address: "123 Main St" },
    { customer_id: 2, name: "General", email: "General", phone: "general", address: "general" },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="customer-container">
      <header className="customer-header">
        <h1>Customer Management</h1>
        <div className="controls">
          <div className="search-box">
           
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="add-button" onClick={() => navigate('/add-customer')}>
            <FaPlus /> Add Customer
          </button>
        </div>
      </header>

      <table className="customer-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.map(customer => (
            <tr key={customer.customer_id}>
              <td>{customer.name}</td>
              <td>{customer.email}</td>
              <td>{customer.phone}</td>
              <td>{customer.address}</td>
              <td>d</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};




export default CustomerList;