import axios from 'axios';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { AuthContext } from '../AuthContext';
import './Supplier.css';

const AddSupplier = () => {
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    country: '',
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Add state for success animation
  const { user } = useContext(AuthContext);
  const navigate = useNavigate(); // Initialize useNavigate

  const api = axios.create({
    baseURL: 'http://localhost:8000',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message) setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await api.post('/api/suppliers/create/', formData);
      setMessage('បានបន្ថែមអ្នកផ្គត់ផ្គង់ដោយជោគជ័យ!'); // "Supplier added successfully!"
      setFormData({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        country: '',
      });
      setIsSuccess(true); // Trigger success state for animation
      setTimeout(() => {
        navigate('/suppliers', { replace: true }); // Redirect to /suppliers after 1.5s
      }, 1500);
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.detail || 'បរាជ័យក្នុងការបន្ថែមអ្នកផ្គត់ផ្គង់។'); // "Failed to add supplier."
      } else if (error.request) {
        setMessage('មិនអាចភ្ជាប់ទៅសេវ័របានទេ។'); // "Unable to connect to server."
      } else {
        setMessage('កំហុស: ' + error.message); // "Error: " + error message
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="supplier-form-container">
      <h2>បន្ថែមអ្នកផ្គត់ផ្គង់</h2> {/* "Add Supplier" */}
      <form onSubmit={handleSubmit} className={`supplier-form ${isSuccess ? 'fade-out' : ''}`}>
        <div className="form-row">
          <input
            type="text"
            name="name"
            placeholder="ឈ្មោះអ្នកផ្គត់ផ្គង់" // "Supplier Name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="supplier-input"
          />
          <input
            type="text"
            name="contact_person"
            placeholder="អ្នកទំនាក់ទំនង (ស្រេចចិត្ត)" // "Contact Person (optional)"
            value={formData.contact_person}
            onChange={handleChange}
            disabled={isLoading}
            className="supplier-input"
          />
        </div>
        <div className="form-row">
          <input
            type="text"
            name="phone"
            placeholder="ទូរស័ព្ទ" // "Phone"
            value={formData.phone}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="supplier-input"
          />
          <input
            type="email"
            name="email"
            placeholder="អ៊ីមែល (ស្រេចចិត្ត)" // "Email (optional)"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            className="supplier-input"
          />
        </div>
        <div className="form-row">
          <textarea
            name="address"
            placeholder="អាសយដ្ឋាន" // "Address"
            value={formData.address}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="supplier-input supplier-textarea"
          />
          <input
            type="text"
            name="country"
            placeholder="ប្រទេស" // "Country"
            value={formData.country}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="supplier-input"
          />
        </div>
        <button type="submit" disabled={isLoading} className="supplier-button">
          {isLoading ? 'កំពុងបន្ថែម...' : 'បន្ថែមអ្នកផ្គត់ផ្គង់'} {/* "Adding..." / "Add Supplier" */}
        </button>
      </form>
      {message && (
        <p
          className={`supplier-message ${
            message.includes('ជោគជ័យ') ? 'success fade-in' : 'error' // Check for "success" in Khmer
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default AddSupplier;