// src/components/AddWarehouse.jsx
import axios from 'axios';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './AddWarehouse.css';

const AddWarehouse = () => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    owner: '',
    contact_person: '',
    contact_number: '',
    capacity: '',
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
      setMessage('បន្ថែមឃ្លាំងដោយជោគជ័យ!');
      setFormData({
        name: '',
        location: '',
        owner: '',
        contact_person: '',
        contact_number: '',
        capacity: '',
      });
      setTimeout(() => navigate('/warehouses'), 1000);
    } catch (error) {
      console.error('កំហុសក្នុងការបន្ថែមឃ្លាំង:', error);
      setMessage(error.response?.data?.detail || 'បន្ថែមឃ្លាំងមិនបានជោគជ័យ។');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/warehouses');
  };

  return (
    <div className="warehouse-form-container">
      <div className="header-group">
        <h2>បន្ថែមឃ្លាំង</h2>
        <button type="button" onClick={handleBack} className="back-button">
          ត្រឡប់ទៅក្រោយ
        </button>
      </div>
      <form onSubmit={handleSubmit} className="warehouse-form">
        <input
          type="text"
          name="name"
          placeholder="ឈ្មោះឃ្លាំង"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="warehouse-input"
        />
        <input
          type="text"
          name="location"
          placeholder="ទីតាំង"
          value={formData.location}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="warehouse-input"
        />
        <input
          type="text"
          name="owner"
          placeholder="ម្ចាស់"
          value={formData.owner}
          onChange={handleChange}
          disabled={isLoading}
          className="warehouse-input"
        />
        <input
          type="text"
          name="contact_person"
          placeholder="អ្នកទំនាក់ទំនង"
          value={formData.contact_person}
          onChange={handleChange}
          disabled={isLoading}
          className="warehouse-input"
        />
        <input
          type="text"
          name="contact_number"
          placeholder="លេខទំនាក់ទំនង"
          value={formData.contact_number}
          onChange={handleChange}
          disabled={isLoading}
          className="warehouse-input"
        />
        <input
          type="number"
          name="capacity"
          placeholder="ចំនុះ (ឧ. 1000.50)"
          value={formData.capacity}
          onChange={handleChange}
          step="0.01"
          disabled={isLoading}
          className="warehouse-input"
        />
        <button type="submit" disabled={isLoading} className="warehouse-button">
          {isLoading ? 'កំពុងបន្ថែម...' : 'បន្ថែមឃ្លាំង'}
        </button>
      </form>
      {message && (
        <p className={`warehouse-message ${message.includes('ជោគជ័យ') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default AddWarehouse;