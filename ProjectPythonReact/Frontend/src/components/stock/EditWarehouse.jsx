// src/components/EditWarehouse.jsx
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Warehouse.css';

const EditWarehouse = () => {
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
  const { id } = useParams();
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        console.log(`Fetching warehouse with ID: ${id}`); // Debug log
        const response = await api.get(`/api/warehouses/${id}/`);
        console.log('Warehouse data:', response.data); // Debug log
        setFormData({
          name: response.data.name || '',
          location: response.data.location || '',
          owner: response.data.owner || '',
          contact_person: response.data.contact_person || '',
          contact_number: response.data.contact_number || '',
          capacity: response.data.capacity || '',
        });
      } catch (error) {
        console.error('Error fetching warehouse:', error.response || error);
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;
          if (status === 401) {
            setMessage('Unauthorized. Please log in again.');
            setTimeout(() => navigate('/login'), 1000);
          } else if (status === 404) {
            setMessage('Warehouse not found.');
          } else {
            setMessage(`Failed to load warehouse data: ${data.detail || 'Unknown error'}`);
          }
        } else {
          setMessage('Failed to load warehouse data: Network error.');
        }
      }
    };
    fetchWarehouse();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message) setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await api.put(`/api/warehouses/${id}/`, formData);
      setMessage('Warehouse updated successfully!');
      setTimeout(() => navigate('/warehouses'), 1000);
    } catch (error) {
      console.error('Error updating warehouse:', error.response || error);
      setMessage(error.response?.data?.detail || 'Failed to update warehouse.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="warehouse-form-container">
      <h2>Edit Warehouse</h2>
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
          name="capacity"
          placeholder="Capacity (e.g., 1000.50)"
          value={formData.capacity}
          onChange={handleChange}
          step="0.01"
          disabled={isLoading}
          className="warehouse-input"
        />
        <button type="submit" disabled={isLoading} className="warehouse-button">
          {isLoading ? 'Updating...' : 'Update Warehouse'}
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

export default EditWarehouse;