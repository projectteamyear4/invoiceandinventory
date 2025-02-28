import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Customers.css";

export const AddCustomer = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([
    { name: "", email: "", phone: "", address: "" },
  ]);
  const [errors, setErrors] = useState([{}]);

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
    setCustomers([...customers, { name: "", email: "", phone: "", address: "" }]);
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
      if (!customer.name.trim()) customerErrors.name = "តម្រូវឱ្យបញ្ចូលឈ្មោះ"; // Name is required
      if (!customer.email.trim()) customerErrors.email = "តម្រូវឱ្យបញ្ចូលអ៊ីមែល"; // Email is required
      return customerErrors;
    });
    setErrors(newErrors);
    return newErrors.every((err) => Object.keys(err).length === 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("ទិន្នន័យអតិថិជន:", customers); // Customer data
      alert("អតិថិជនត្រូវបានបន្ថែមដោយជោគជ័យ!"); // Customers added successfully!
      navigate('/customers');
    }
  };

  return (
    <div className="add-customer-container">
      <h2>បន្ថែមអតិថិជនថ្មី</h2> {/* Add New Customers */}
      <form onSubmit={handleSubmit}>
        <table className="customer-table">
          <thead>
            <tr>
              <th>ឈ្មោះ</th> {/* Name */}
              <th>អ៊ីមែល</th> {/* Email */}
              <th>ទូរស័ព្ទ</th> {/* Phone */}
              <th>អាសយដ្ឋាន</th> {/* Address */}
              <th>សកម្មភាព</th> {/* Action */}
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    name="name"
                    placeholder="បញ្ចូលឈ្មោះ" // Enter Name
                    value={customer.name}
                    onChange={(e) => handleChange(index, e)}
                  />
                  {errors[index]?.name && <span className="error">{errors[index].name}</span>}
                </td>
                <td>
                  <input
                    type="email"
                    name="email"
                    placeholder="បញ្ចូលអ៊ីមែល" // Enter Email
                    value={customer.email}
                    onChange={(e) => handleChange(index, e)}
                  />
                  {errors[index]?.email && <span className="error">{errors[index].email}</span>}
                </td>
                <td>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="បញ្ចូលលេខទូរស័ព្ទ" // Enter Phone Number
                    value={customer.phone}
                    onChange={(e) => handleChange(index, e)}
                  />
                </td>
                <td>
                  <textarea
                    name="address"
                    placeholder="បញ្ចូលអាសយដ្ឋាន" // Enter Address
                    value={customer.address}
                    onChange={(e) => handleChange(index, e)}
                  />
                </td>
                <td>
                  {customers.length > 1 && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeCustomer(index)}
                    >
                      លុប {/* Remove */}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="button-group">
          <button type="button" className="add-more-btn" onClick={addCustomer}>
            បន្ថែមអតិថិជនថ្មី {/* Add Another Customer */}
          </button>
          <button type="button" className="cancel-btn" onClick={() => navigate('/customers')}>
            បោះបង់ {/* Cancel */}
          </button>
          <button type="submit" className="submit-btn">
            បន្ថែមអតិថិជនទាំងអស់ {/* Add All Customers */}
          </button>
        </div>
      </form>
    </div>
  );
};