import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Customers.css";

export const AddCustomer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "តម្រូវឱ្យបញ្ចូលឈ្មោះ"; // Name is required
    if (!formData.email.trim()) newErrors.email = "តម្រូវឱ្យបញ្ចូលអ៊ីមែល"; // Email is required
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Submit to API here
      console.log("ទិន្នន័យអតិថិជន:", formData); // Customer data
      alert("អតិថិជនត្រូវបានបន្ថែមដោយជោគជ័យ!"); // Customer added successfully!
      navigate('/customers');
    }
  };

  return (
    <div className="add-customer-container">
      <h2>បន្ថែមអតិថិជនថ្មី</h2> {/* Add New Customer */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>ឈ្មោះ:</label> {/* Name */}
          <input
            type="text"
            placeholder="បញ្ចូលឈ្មោះ" // Enter Name
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>អ៊ីមែល:</label> {/* Email */}
          <input
            type="email"
            placeholder="បញ្ចូលអ៊ីមែល" // Enter Email
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>ទូរស័ព្ទ:</label> {/* Phone */}
          <input
            type="tel"
            placeholder="បញ្ចូលលេខទូរស័ព្ទ" // Enter Phone Number
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>អាសយដ្ឋាន:</label> {/* Address */}
          <textarea
            placeholder="បញ្ចូលអាសយដ្ឋាន" // Enter Address
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          />
        </div>

        <div className="button-group">
          <button type="button" className="cancel-btn" onClick={() => navigate('/customers')}>
            បោះបង់ {/* Cancel */}
          </button>
          <button type="submit" className="submit-btn">
            បន្ថែមអតិថិជន {/* Add Customer */}
          </button>
        </div>
      </form>
    </div>
  );
};