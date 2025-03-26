import axios from 'axios';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Login.css'; // ប្រាកដថា ផ្លូវនេះត្រឹមត្រូវ

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
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

    try {
      const response = await api.post('/api/login/', formData);
      const { access, refresh, user } = response.data;
      login(user, access, refresh);
      setMessage('ចូលប្រើប្រាស់ជោគជ័យ! ស្វាគមន៍, ' + user.username);
      setFormData({ username: '', password: '' });
      navigate('/dashboard');
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.detail || 'ចូលបរាជ័យ! សូមពិនិត្យព័ត៌មានរបស់អ្នក។');
      } else if (error.request) {
        setMessage('មិនអាចភ្ជាប់ទៅម៉ាស៊ីនមេបានទេ។');
      } else {
        setMessage('កំហុស៖ ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>ចូលប្រើ</h2>
        <input
          type="text"
          name="username"
          placeholder="ឈ្មោះអ្នកប្រើ"
          value={formData.username}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="login-input"
        />
        <input
          type="password"
          name="password"
          placeholder="ពាក្យសម្ងាត់"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="login-input"
        />
        <button type="submit" disabled={isLoading} className="login-button">
          {isLoading ? 'កំពុងចូល...' : 'ចូល'}
        </button>
      </form>
      {message && (
        <p
          className={`login-message ${
            message.includes('ជោគជ័យ') ? 'success' : 'error'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default Login;
