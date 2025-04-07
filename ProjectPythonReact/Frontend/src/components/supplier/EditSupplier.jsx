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
        setMessage('មិនអាចផ្ទុកព័ត៌មានអ្នកផ្គត់ផ្គង់បានទេ។');
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
      setMessage('អ្នកផ្គត់ផ្គង់ត្រូវបានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ!');
      setTimeout(() => navigate('/suppliers'), 1000);
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.detail || 'បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាពអ្នកផ្គត់ផ្គង់។');
      } else if (error.request) {
        setMessage('មិនអាចភ្ជាប់ទៅម៉ាស៊ីនមេបានទេ។');
      } else {
        setMessage('បញ្ហា៖ ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="supplier-form-container">
      <h2>កែប្រែព័ត៌មានអ្នកផ្គត់ផ្គង់</h2>
      <form onSubmit={handleSubmit} className="supplier-form">
        <input
          type="text"
          name="name"
          placeholder="ឈ្មោះអ្នកផ្គត់ផ្គង់"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="supplier-input"
        />
        <input
          type="text"
          name="contact_person"
          placeholder="អ្នកទំនាក់ទំនង (ស្រេចចិត្ត)"
          value={formData.contact_person || ''}
          onChange={handleChange}
          disabled={isLoading}
          className="supplier-input"
        />
        <input
          type="text"
          name="phone"
          placeholder="លេខទូរស័ព្ទ"
          value={formData.phone}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="supplier-input"
        />
        <input
          type="email"
          name="email"
          placeholder="អ៊ីមែល (ស្រេចចិត្ត)"
          value={formData.email || ''}
          onChange={handleChange}
          disabled={isLoading}
          className="supplier-input"
        />
        <textarea
          name="address"
          placeholder="អាសយដ្ឋាន"
          value={formData.address}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="supplier-input supplier-textarea"
        />
        <input
          type="text"
          name="country"
          placeholder="ប្រទេស"
          value={formData.country}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="supplier-input"
        />
        <button type="submit" disabled={isLoading} className="supplier-button">
          {isLoading ? 'កំពុងធ្វើបច្ចុប្បន្នភាព...' : 'ធ្វើបច្ចុប្បន្នភាពអ្នកផ្គត់ផ្គង់'}
        </button>
      </form>
      {message && (
        <p
          className={`supplier-message ${
            message.includes('ជោគជ័យ') ? 'success' : 'error'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default EditSupplier;
