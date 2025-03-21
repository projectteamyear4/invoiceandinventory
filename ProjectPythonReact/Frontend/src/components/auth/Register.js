import axios from 'axios';
import React, { useState } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Configure axios with base URL
  const api = axios.create({
    baseURL: 'http://localhost:8000', // Adjust this based on your backend URL
    timeout: 5000, // 5 second timeout
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear message when user starts typing again
    if (message) setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Client-side password validation
    if (formData.password !== formData.password2) {
      setMessage("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/register/', formData);
      setMessage(response.data.message || 'Registration successful!');
      // Optional: Clear form after success
      setFormData({
        username: '',
        email: '',
        password: '',
        password2: '',
      });
    } catch (error) {
      if (error.response) {
        // Server responded with an error status
        const errors = error.response.data;
        if (errors.email) {
          setMessage('Email error: ' + errors.email[0]);
        } else if (errors.username) {
          setMessage('Username error: ' + errors.username[0]);
        } else if (errors.password) {
          setMessage('Password error: ' + errors.password[0]);
        } else {
          setMessage(errors.message || 'Registration failed!');
        }
      } else if (error.request) {
        // No response received
        setMessage('Unable to connect to server. Please check if the backend is running.');
      } else {
        // Error setting up the request
        setMessage('Error: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={isLoading}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <input
            type="password"
            name="password2"
            placeholder="Confirm Password"
            value={formData.password2}
            onChange={handleChange}
            required
            disabled={isLoading}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: isLoading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </div>
      </form>
      {message && (
        <p style={{ color: message.includes('success') ? 'green' : 'red', marginTop: '10px' }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default Register;