import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Shelf.css';

const AddShelf = () => {
  const [formData, setFormData] = useState({
    warehouse: '',
    shelf_name: '',
    section: '',
    capacity: '',
  });
  const [warehouses, setWarehouses] = useState([]);
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

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await api.get('/api/warehouses/');
        setWarehouses(response.data);
      } catch (error) {
        console.error('Error fetching warehouses:', error);
        setMessage('Failed to load warehouses.');
      }
    };
    fetchWarehouses();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message) setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const selectedWarehouse = warehouses.find((w) => w.id === parseInt(formData.warehouse));
    if (selectedWarehouse && parseFloat(formData.capacity) > selectedWarehouse.capacity) {
      setMessage(`Shelf capacity (${formData.capacity}) cannot exceed warehouse capacity (${selectedWarehouse.capacity}).`);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/shelves/', formData);
      setMessage('Shelf added successfully!');
      setFormData({ warehouse: '', shelf_name: '', section: '', capacity: '' });
      setTimeout(() => navigate('/shelves'), 1000);
    } catch (error) {
      console.error('Error adding shelf:', error);
      setMessage(error.response?.data?.detail || 'Failed to add shelf.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="shelf-form-container">
      <h2>Add Shelf</h2>
      <form onSubmit={handleSubmit} className="shelf-form">
        <select
          name="warehouse"
          value={formData.warehouse}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="shelf-input"
        >
          <option value="">Select Warehouse</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} (Capacity: {w.capacity})
            </option>
          ))}
        </select>
        <input
          type="text"
          name="shelf_name"
          placeholder="Shelf Name (e.g., A1)"
          value={formData.shelf_name}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="shelf-input"
        />
        <input
          type="text"
          name="section"
          placeholder="Section (e.g., Men's Clothing)"
          value={formData.section}
          onChange={handleChange}
          disabled={isLoading}
          className="shelf-input"
        />
        <input
          type="number"
          name="capacity"
          placeholder="Capacity (e.g., 1000)"
          value={formData.capacity}
          onChange={handleChange}
          required
          step="0.01"
          min="1"
          disabled={isLoading}
          className="shelf-input"
        />
        <button type="submit" disabled={isLoading} className="shelf-button">
          {isLoading ? 'Adding...' : 'Add Shelf'}
        </button>
      </form>
      {message && (
        <p className={`shelf-message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default AddShelf;