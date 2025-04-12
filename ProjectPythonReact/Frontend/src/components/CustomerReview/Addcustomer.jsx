import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddCustomers.css";

export const AddCustomer = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([
    {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      phone_number2: "",
      address: "",
      city: "",
      country: "",
      order_history: 0,
      status: "active",
    },
  ]);
  const [errors, setErrors] = useState([{}]);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  const api = axios.create({
    baseURL: 'http://localhost:8000',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedCustomers = [...customers];
    updatedCustomers[index] = {
      ...updatedCustomers[index],
      [name]: value,
    };
    setCustomers(updatedCustomers);
  };

  const addCustomer = () => {
    setCustomers([
      ...customers,
      {
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        phone_number2: "",
        address: "",
        city: "",
        country: "",
        order_history: 0,
        status: "active",
      },
    ]);
    setErrors([...errors, {}]);
  };

  const removeCustomer = (index) => {
    if (customers.length > 1) {
      const updatedCustomers = customers.filter((_, i) => i !== index);
      const updatedErrors = errors.filter((_, i) => i !== index);
      setCustomers(updatedCustomers);
      setErrors(updatedErrors);
    }
  };

  const validateForm = () => {
    const newErrors = customers.map((customer) => {
      const customerErrors = {};
      if (!customer.first_name.trim()) customerErrors.first_name = "តម្រូវឱ្យបញ្ចូលឈ្មោះ"; // First Name is required
      if (!customer.last_name.trim()) customerErrors.last_name = "តម្រូវឱ្យបញ្ចូលនាមត្រកូល"; // Last Name is required
      if (!customer.email.trim()) customerErrors.email = "តម្រូវឱ្យបញ្ចូលអ៊ីមែល"; // Email is required
      else if (!/\S+@\S+\.\S+/.test(customer.email)) customerErrors.email = "អ៊ីមែលមិនត្រឹមត្រូវ"; // Invalid email format
      return customerErrors;
    });
    setErrors(newErrors);
    return newErrors.every((err) => Object.keys(err).length === 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!validateForm()) {
      setFormError("សូមបំពេញទិន្នន័យឱ្យបានត្រឹមត្រូវ"); // Please fill in the data correctly
      return;
    }

    try {
      for (const customer of customers) {
        await api.post('/api/customers/', customer);
      }
      setFormSuccess("អតិថិជនត្រូវបានបន្ថែមដោយជោគជ័យ! កំពុងប្តូរទិស..."); // Customers added successfully! Redirecting...
      setTimeout(() => {
        navigate('/suppliers');
      }, 1500);
    } catch (err) {
      setFormError('បរាជ័យក្នុងការបន្ថែមអតិថិជន។ សូមពិនិត្យទិន្នន័យ។'); // Failed to add customers. Please check the data.
      console.error('Add customer error:', err.response?.data || err);
    }
  };

  return (
    <motion.div
      className="add-customer-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2>បន្ថែមអតិថិជនថ្មី</h2> {/* Add New Customers */}
      {formSuccess && <p className="success-message">{formSuccess}</p>}
      {formError && <p className="error-message">{formError}</p>}
      <form onSubmit={handleSubmit}>
        <div className="customer-list">
          {customers.map((customer, index) => (
            <motion.div
              key={index}
              className="customer-row"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="customer-row-header">
                <h3>អតិថិជន {index + 1}</h3> {/* Customer {index + 1} */}
                {customers.length > 1 && (
                  <motion.button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeCustomer(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    លុប {/* Remove */}
                  </motion.button>
                )}
              </div>
              <div className="customer-row-content">
                <div className="form-group">
                  <label htmlFor={`first_name-${index}`}>ឈ្មោះ</label> {/* First Name */}
                  <input
                    type="text"
                    id={`first_name-${index}`}
                    name="first_name"
                    placeholder="បញ្ចូលឈ្មោះ" // Enter First Name
                    value={customer.first_name}
                    onChange={(e) => handleChange(index, e)}
                  />
                  {errors[index]?.first_name && <span className="error">{errors[index].first_name}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor={`last_name-${index}`}>នាមត្រកូល</label> {/* Last Name */}
                  <input
                    type="text"
                    id={`last_name-${index}`}
                    name="last_name"
                    placeholder="បញ្ចូលនាមត្រកូល" // Enter Last Name
                    value={customer.last_name}
                    onChange={(e) => handleChange(index, e)}
                  />
                  {errors[index]?.last_name && <span className="error">{errors[index].last_name}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor={`email-${index}`}>អ៊ីមែល</label> {/* Email */}
                  <input
                    type="email"
                    id={`email-${index}`}
                    name="email"
                    placeholder="បញ្ចូលអ៊ីមែល" // Enter Email
                    value={customer.email}
                    onChange={(e) => handleChange(index, e)}
                  />
                  {errors[index]?.email && <span className="error">{errors[index].email}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor={`phone_number-${index}`}>លេខទូរស័ព្ទ</label> {/* Phone Number */}
                  <input
                    type="tel"
                    id={`phone_number-${index}`}
                    name="phone_number"
                    placeholder="បញ្ចូលលេខទូរស័ព្ទ" // Enter Phone Number
                    value={customer.phone_number}
                    onChange={(e) => handleChange(index, e)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`phone_number2-${index}`}>លេខទូរស័ព្ទ ២</label> {/* Phone Number 2 */}
                  <input
                    type="tel"
                    id={`phone_number2-${index}`}
                    name="phone_number2"
                    placeholder="បញ្ចូលលេខទូរស័ព្ទ ២" // Enter Phone Number 2
                    value={customer.phone_number2}
                    onChange={(e) => handleChange(index, e)}
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor={`address-${index}`}>អាសយដ្ឋាន</label> {/* Address */}
                  <textarea
                    id={`address-${index}`}
                    name="address"
                    placeholder="បញ្ចូលអាសយដ្ឋាន" // Enter Address
                    value={customer.address}
                    onChange={(e) => handleChange(index, e)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`city-${index}`}>ទីក្រុង</label> {/* City */}
                  <input
                    type="text"
                    id={`city-${index}`}
                    name="city"
                    placeholder="បញ្ចូលទីក្រុង" // Enter City
                    value={customer.city}
                    onChange={(e) => handleChange(index, e)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`country-${index}`}>ប្រទេស</label> {/* Country */}
                  <input
                    type="text"
                    id={`country-${index}`}
                    name="country"
                    placeholder="បញ្ចូលប្រទេស" // Enter Country
                    value={customer.country}
                    onChange={(e) => handleChange(index, e)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`order_history-${index}`}>ប្រវត្តិការបញ្ជាទិញ</label> {/* Order History */}
                  <input
                    type="number"
                    id={`order_history-${index}`}
                    name="order_history"
                    value={customer.order_history}
                    onChange={(e) => handleChange(index, e)}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`status-${index}`}>ស្ថានភាព</label> {/* Status */}
                  <select
                    id={`status-${index}`}
                    name="status"
                    value={customer.status}
                    onChange={(e) => handleChange(index, e)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="button-group">
          <motion.button
            type="button"
            className="add-more-btn"
            onClick={addCustomer}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            បន្ថែមអតិថិជនថ្មី {/* Add Another Customer */}
          </motion.button>
          <motion.button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/customers')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            បោះបង់ {/* Cancel */}
          </motion.button>
          <motion.button
            type="submit"
            className="submit-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            បន្ថែមអតិថិជនទាំងអស់ {/* Add All Customers */}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};