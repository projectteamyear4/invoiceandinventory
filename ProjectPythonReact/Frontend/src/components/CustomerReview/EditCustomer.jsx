import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './EditCustomer.css';

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    phone_number2: '',
    address: '',
    city: '',
    country: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const api = axios.create({
    baseURL: 'http://localhost:8000',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await api.get(`/api/customers/${id}/`);
        setCustomer(response.data);
      } catch (err) {
        setError('មិនអាចទាញយកទិន្នន័យអតិថិជនបានទេ');
        console.error('Fetch error:', err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/customers/${id}/`, customer);
      alert('បានកែប្រែអតិថិជនដោយជោគជ័យ');
      navigate('/customers');
    } catch (err) {
      setError('មិនអាចកែប្រែអតិថិជនបានទេ');
      console.error('Update error:', err.response?.data || err);
    }
  };

  if (loading) return <div className="loading">កំពុងផ្ទុក...</div>;
  if (error) return <motion.p className="error-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.p>;

  return (
    <motion.div
      className="edit-customer-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        កែប្រែអតិថិជន (ID: {id})
      </motion.h2>

      <form onSubmit={handleSubmit} className="edit-customer-form">
        <div className="form-row">
          <div className="form-group half">
            <label>ឈ្មោះ:</label>
            <input
              type="text"
              name="first_name"
              value={customer.first_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group half">
            <label>នាមត្រកូល:</label>
            <input
              type="text"
              name="last_name"
              value={customer.last_name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>អ៊ីមែល:</label>
          <input
            type="email"
            name="email"
            value={customer.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label>លេខទូរស័ព្ទ:</label>
            <input
              type="tel"
              name="phone_number"
              value={customer.phone_number}
              onChange={handleChange}
            />
          </div>

          <div className="form-group half">
            <label>លេខទូរស័ព្ទ ២:</label>
            <input
              type="tel"
              name="phone_number2"
              value={customer.phone_number2}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>អាសយដ្ឋាន:</label>
          <input
            type="text"
            name="address"
            value={customer.address}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>ទីក្រុង:</label>
          <input
            type="text"
            name="city"
            value={customer.city}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>ប្រទេស:</label>
          <input
            type="text"
            name="country"
            value={customer.country}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>ស្ថានភាព:</label>
          <select
            name="status"
            value={customer.status}
            onChange={handleChange}
          >
            <option value="active">សកម្ម</option>
            <option value="inactive">អសកម្ម</option>
          </select>
        </div>

        <div className="form-actions">
          <motion.button
            type="submit"
            className="save-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            រក្សាទុក
          </motion.button>
          <motion.button
            type="button"
            className="cancel-button"
            onClick={() => navigate('/customers')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            បោះបង់
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditCustomer;
