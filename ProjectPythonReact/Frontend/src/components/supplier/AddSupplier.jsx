import axios from 'axios';
import React, { useContext, useState } from 'react';
import { AuthContext } from '../AuthContext'; // Fixed path: one level up
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
  const { user } = useContext(AuthContext);

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
      setMessage('Supplier added successfully!');
      setFormData({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        country: '',
      });
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.detail || 'Failed to add supplier.');
      } else if (error.request) {
        setMessage('Unable to connect to server.');
      } else {
        setMessage('Error: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="supplier-form-container">
      <h2>Add Supplier</h2>
      <form onSubmit={handleSubmit} className="supplier-form">
        <input
          type="text"
          name="name"
          placeholder="Supplier Name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="supplier-input"
        />
        <input
          type="text"
          name="contact_person"
          placeholder="Contact Person (optional)"
          value={formData.contact_person}
          onChange={handleChange}
          disabled={isLoading}
          className="supplier-input"
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="supplier-input"
        />
        <input
          type="email"
          name="email"
          placeholder="Email (optional)"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          className="supplier-input"
        />
        <textarea
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="supplier-input supplier-textarea"
        />
        <input
          type="text"
          name="country"
          placeholder="Country"
          value={formData.country}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="supplier-input"
        />
        <button type="submit" disabled={isLoading} className="supplier-button">
          {isLoading ? 'Adding...' : 'Add Supplier'}
        </button>
      </form>
      {message && (
        <p
          className={`supplier-message ${
            message.includes('successfully') ? 'success' : 'error'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default AddSupplier;