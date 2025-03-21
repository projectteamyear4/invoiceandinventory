import axios from 'axios';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext'; // Adjust path
import './Category.css';

const AddCategory = () => {
  const [formData, setFormData] = useState({ name: '' });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, logout } = useContext(AuthContext); // Include logout
  const navigate = useNavigate();

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
      const response = await api.post('/api/categories/', formData);
      setMessage('Category added successfully!');
      setFormData({ name: '' });
      setTimeout(() => navigate('/category-list'), 1000);
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const detail = error.response.data.detail || 'Failed to add category.';
        if (status === 401) { // Unauthorized (token invalid)
          setMessage('Session expired. Please log in again.');
          logout(); // Clear user and token
          setTimeout(() => navigate('/login'), 1000);
        } else {
          setMessage(detail);
        }
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
    <div className="category-form-container">
      <h2>Add Category</h2>
      <form onSubmit={handleSubmit} className="category-form">
        <input
          type="text"
          name="name"
          placeholder="Category Name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="category-input"
        />
        <button type="submit" disabled={isLoading} className="category-button">
          {isLoading ? 'Adding...' : 'Add Category'}
        </button>
      </form>
      {message && (
        <p
          className={`category-message ${message.includes('successfully') ? 'success' : 'error'}`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default AddCategory;