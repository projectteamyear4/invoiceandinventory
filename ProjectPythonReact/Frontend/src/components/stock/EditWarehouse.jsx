// src/components/EditWarehouse.jsx
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './AddWarehouse.css';

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
        console.log(`Fetching warehouse with ID: ${id}`);
        const response = await api.get(`/api/warehouses/${id}/`);
        console.log('Warehouse data:', response.data);
        setFormData({
          name: response.data.name || '',
          location: response.data.location || '',
          owner: response.data.owner || '',
          contact_person: response.data.contact_person || '',
          contact_number: response.data.contact_number || '',
          capacity: response.data.capacity || '',
        });
      } catch (error) {
        console.error('កំហុសក្នុងការទាញយកឃ្លាំង:', error.response || error);
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;
          if (status === 401) {
            setMessage('មិនមានសិទ្ធិ។ សូមចូលគណនីម្តងទៀត។');
            setTimeout(() => navigate('/login'), 1000);
          } else if (status === 404) {
            setMessage('រកឃ្លាំងមិនឃើញ។');
          } else {
            setMessage(`បរាជ័យក្នុងការផ្ទុកទិន្នន័យឃ្លាំង: ${data.detail || 'កំហុសមិនស្គាល់'}`);
          }
        } else {
          setMessage('បរាជ័យក្នុងការផ្ទុកទិន្នន័យឃ្លាំង: បញ្ហាបណ្តាញ។');
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
      setMessage('កែប្រែឃ្លាំងដោយជោគជ័យ!');
      setTimeout(() => navigate('/warehouses'), 1000);
    } catch (error) {
      console.error('កំហុសក្នុងការកែប្រែឃ្លាំង:', error.response || error);
      setMessage(error.response?.data?.detail || 'បរាជ័យក្នុងការកែប្រែឃ្លាំង។');
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
        <h2>កែប្រែឃ្លាំង</h2>
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
          {isLoading ? 'កំពុងកែប្រែ...' : 'កែប្រែឃ្លាំង'}
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

export default EditWarehouse;