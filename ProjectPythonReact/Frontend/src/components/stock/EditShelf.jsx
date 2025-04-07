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
        setMessage('បរាជ័យក្នុងការផ្ទុកទិន្នន័យពីទិន្នន័យធ្វើឱ្យទាន់សម័យ។');
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
      setMessage(`សមត្ថភាពធ្នើ (${formData.capacity}) មិនអាចលើសសមត្ថភាពឃ្លាំង (${selectedWarehouse.capacity}) បានទេ។`);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.put(`/api/shelves/${id}/`, formData);
      setMessage('ធ្នើត្រូវបានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ!');
      setTimeout(() => navigate('/warehouses'), 1000);
    } catch (error) {
      console.error('Error updating shelf:', error);
      setMessage(error.response?.data?.detail || 'បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាពធ្នើ។');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="shelf-form-container">
      <h2>កែប្រែធ្នើ</h2>
      <form onSubmit={handleSubmit} className="shelf-form">
        <select
          name="warehouse"
          value={formData.warehouse}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="shelf-input"
        >
          <option value="">ជ្រើសរើសឃ្លាំង</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} (សមត្ថភាព: {w.capacity})
            </option>
          ))}
        </select>
        <input
          type="text"
          name="shelf_name"
          placeholder="ឈ្មោះធ្នើ (ឧ. A1)"
          value={formData.shelf_name}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="shelf-input"
        />
        <input
          type="text"
          name="section"
          placeholder="ផ្នែក (ឧ. សម្លៀកបំពាក់បុរស)"
          value={formData.section}
          onChange={handleChange}
          disabled={isLoading}
          className="shelf-input"
        />
        <input
          type="number"
          name="capacity"
          placeholder="សមត្ថភាព (ឧ. 1000)"
          value={formData.capacity}
          onChange={handleChange}
          required
          step="0.01"
          min="1"
          disabled={isLoading}
          className="shelf-input"
        />
        <button type="submit" disabled={isLoading} className="shelf-button">
          {isLoading ? 'កំពុងធ្វើបច្ចុប្បន្នភាព...' : 'ធ្វើបច្ចុប្បន្នភាពធ្នើ'}
        </button>
      </form>
      {message && (
        <p className={`shelf-message ${message.includes('ជោគជ័យ') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default EditShelf;
