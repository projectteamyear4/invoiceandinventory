import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', password2: '' });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: 'http://localhost:8000',
    timeout: 5000,
    headers: { 'Content-Type': 'application/json' },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message) setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (formData.password !== formData.password2) {
      setMessage("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/register/', formData);
      setMessage(response.data.message || 'Registration successful!');
      setFormData({ username: '', email: '', password: '', password2: '' });
      setTimeout(() => navigate('/login'), 2000); // Redirect to login after 2 seconds
    } catch (error) {
      if (error.response) {
        const errors = error.response.data;
        setMessage(errors.email?.[0] || errors.username?.[0] || errors.password?.[0] || 'Registration failed!');
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
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required disabled={isLoading} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required disabled={isLoading} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required disabled={isLoading} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <input type="password" name="password2" placeholder="Confirm Password" value={formData.password2} onChange={handleChange} required disabled={isLoading} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '10px', backgroundColor: isLoading ? '#ccc' : '#007bff', color: 'white', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </div>
      </form>
      {message && <p style={{ color: message.includes('success') ? 'green' : 'red', marginTop: '10px' }}>{message}</p>}
    </div>
  );
};

export default Register;