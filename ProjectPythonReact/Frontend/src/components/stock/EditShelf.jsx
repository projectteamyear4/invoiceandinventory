// src/components/EditShelf.jsx
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './EditShelf.css';

const EditShelf = () => {
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
    const fetchData = async () => {
      try {
        const [shelfResponse, warehouseResponse] = await Promise.all([
          api.get(`/api/shelves/${id}/`),
          api.get('/api/warehouses/'),
        ]);
        setFormData({
          warehouse: shelfResponse.data.warehouse,
          shelf_name: shelfResponse.data.shelf_name,
          section: shelfResponse.data.section || '',
          capacity: shelfResponse.data.capacity || '',
        });
        setWarehouses(warehouseResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage('Failed to load shelf or warehouses.');
      }
    };
    fetchData();
  }, [id]);

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
      const response = await api.put(`/api/shelves/${id}/`, formData);
      setMessage('Shelf updated successfully!');
      setTimeout(() => navigate('/shelves'), 1000);
    } catch (error) {
      console.error('Error updating shelf:', error);
      setMessage(error.response?.data?.detail || 'Failed to update shelf.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="shelf-form-container">
      <h2>Edit Shelf</h2>
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
          {isLoading ? 'Updating...' : 'Update Shelf'}
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

export default EditShelf;