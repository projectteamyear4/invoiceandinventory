import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Supplier.css';

const EditSupplier = () => {
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
  const { id } = useParams(); // Get supplier ID from URL
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: 'http://localhost:8000',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const response = await api.get(`/api/suppliers/${id}/`);
        setFormData(response.data);
      } catch (error) {
        console.error('Error fetching supplier:', error);
        setMessage('Failed to load supplier data.');
      }
    };
    fetchSupplier();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message) setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await api.patch(`/api/suppliers/${id}/`, formData);
      setMessage('Supplier updated successfully!');
      setTimeout(() => navigate('/suppliers'), 1000); // Redirect after 1s
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.detail || 'Failed to update supplier.');
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
      <h2>Edit Supplier</h2>
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
          value={formData.contact_person || ''}
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
          value={formData.email || ''}
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
          {isLoading ? 'Updating...' : 'Update Supplier'}
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

export default EditSupplier;