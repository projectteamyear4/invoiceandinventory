// src/components/AddWarehouse.jsx
import axios from 'axios';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Warehouse.css';

const AddWarehouse = () => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    owner: '',
    contact_person: '',
    contact_number: '',
    capacity: '', // Added capacity field
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: 'http://localhost:8000',
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
      const response = await api.post('/api/warehouses/', formData);
      setMessage('Warehouse added successfully!');
      setFormData({
        name: '',
        location: '',
        owner: '',
        contact_person: '',
        contact_number: '',
        capacity: '', // Reset capacity
      });
      setTimeout(() => navigate('/warehouses'), 1000);
    } catch (error) {
      console.error('Error adding warehouse:', error);
      setMessage(error.response?.data?.detail || 'Failed to add warehouse.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="warehouse-form-container">
      <h2>Add Warehouse</h2>
      <form onSubmit={handleSubmit} className="warehouse-form">
        <input
          type="text"
          name="name"
          placeholder="Warehouse Name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="warehouse-input"
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="warehouse-input"
        />
        <input
          type="text"
          name="owner"
          placeholder="Owner"
          value={formData.owner}
          onChange={handleChange}
          disabled={isLoading}
          className="warehouse-input"
        />
        <input
          type="text"
          name="contact_person"
          placeholder="Contact Person"
          value={formData.contact_person}
          onChange={handleChange}
          disabled={isLoading}
          className="warehouse-input"
        />
        <input
          type="text"
          name="contact_number"
          placeholder="Contact Number"
          value={formData.contact_number}
          onChange={handleChange}
          disabled={isLoading}
          className="warehouse-input"
        />
        <input
          type="number"
          name="capacity" // Added capacity input
          placeholder="Capacity (e.g., 1000.50)"
          value={formData.capacity}
          onChange={handleChange}
          step="0.01" // Allow two decimal places
          disabled={isLoading}
          className="warehouse-input"
        />
        <button type="submit" disabled={isLoading} className="warehouse-button">
          {isLoading ? 'Adding...' : 'Add Warehouse'}
        </button>
      </form>
      {message && (
        <p className={`warehouse-message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default AddWarehouse;