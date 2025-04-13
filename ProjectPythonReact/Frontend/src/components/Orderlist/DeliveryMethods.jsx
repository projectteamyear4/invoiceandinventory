// src/components/DeliveryMethods.jsx
import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DeliveryMethods.css';

const DeliveryMethods = () => {
  const [deliveryMethods, setDeliveryMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    delivery_name: '',
    car_number: '',
    delivery_number: '',
    estimated_delivery_time: '',
    is_active: true,
    date: '',  // Add date field to formData
  });
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: 'http://localhost:8000',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  // Fetch all delivery methods
  useEffect(() => {
    const fetchDeliveryMethods = async () => {
      try {
        const response = await api.get('/api/delivery-methods/');
        console.log('Delivery methods fetched:', response.data);
        setDeliveryMethods(response.data);
      } catch (err) {
        console.error('Error fetching delivery methods:', err);
        setError('មិនអាចទាញយកវិធីសាស្ត្រដឹកជញ្ជូនបានទេ។');
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveryMethods();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Convert estimated_delivery_time to a format Django can understand
    let duration = null;
    if (formData.estimated_delivery_time) {
      const [days, time] = formData.estimated_delivery_time.split(':');
      const [hours, minutes, seconds] = time ? time.split(':') : ['00', '00', '00'];
      duration = `${parseInt(days || 0)} days, ${hours || '00'}:${minutes || '00'}:${seconds || '00'}`;
    }

    const payload = {
      ...formData,
      estimated_delivery_time: duration,
      delivery_number: formData.delivery_number ? parseInt(formData.delivery_number) : null,
      date: formData.date || null,  // Send null if date is empty
    };

    try {
      if (editingId) {
        // Update existing delivery method
        const response = await api.put(`/api/delivery-methods/${editingId}/`, payload);
        setDeliveryMethods(
          deliveryMethods.map((dm) =>
            dm.delivery_method_id === editingId ? response.data : dm
          )
        );
        setEditingId(null);
      } else {
        // Create new delivery method
        const response = await api.post('/api/delivery-methods/', payload);
        setDeliveryMethods([...deliveryMethods, response.data]);
      }
      // Reset form
      setFormData({
        delivery_name: '',
        car_number: '',
        delivery_number: '',
        estimated_delivery_time: '',
        is_active: true,
        date: '',
      });
    } catch (err) {
      console.error('Error saving delivery method:', err);
      setError(
        err.response?.data?.detail ||
        'មិនអាចរក្សាទុកវិធីសាស្ត្រដឹកជញ្ជូនបានទេ។'
      );
    }
  };

  // Handle edit button click
  const handleEdit = (dm) => {
    setFormData({
      delivery_name: dm.delivery_name,
      car_number: dm.car_number,
      delivery_number: dm.delivery_number || '',
      estimated_delivery_time: dm.estimated_delivery_time
        ? `${Math.floor(new Date(dm.estimated_delivery_time.match(/\d+/g).join('') * 1000) / (1000 * 60 * 60 * 24))}:${new Date(dm.estimated_delivery_time.match(/\d+/g).join('') * 1000).getUTCHours().toString().padStart(2, '0')}:${new Date(dm.estimated_delivery_time.match(/\d+/g).join('') * 1000).getUTCMinutes().toString().padStart(2, '0')}:${new Date(dm.estimated_delivery_time.match(/\d+/g).join('') * 1000).getUTCSeconds().toString().padStart(2, '0')}`
        : '',
      is_active: dm.is_active,
      date: dm.date ? dm.date.slice(0, 16) : '',  // Format for datetime-local input (YYYY-MM-DDThh:mm)
    });
    setEditingId(dm.delivery_method_id);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (window.confirm('តើអ្នកប្រាកដទេថាចង់លុបវិធីសាស្ត្រដឹកជញ្ជូននេះ?')) {
      try {
        await api.delete(`/api/delivery-methods/${id}/`);
        setDeliveryMethods(
          deliveryMethods.filter((dm) => dm.delivery_method_id !== id)
        );
      } catch (err) {
        console.error('Error deleting delivery method:', err);
        setError('មិនអាចលុបវិធីសាស្ត្រដឹកជញ្ជូនបានទេ។');
      }
    }
  };

  if (loading) {
    return (
      <motion.div
        className="loading-spinner"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p>កំពុងទាញយកវិធីសាស្ត្រដឹកជញ្ជូន...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="delivery-methods-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="delivery-methods-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h2>វិធីសាស្ត្រដឹកជញ្ជូន</h2>
      </motion.div>

      {/* Form for adding/editing delivery methods */}
      <motion.div
        className="delivery-methods-form"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="text"
              name="delivery_name"
              placeholder="ឈ្មោះវិធីសាស្ត្រដឹកជញ្ជូន"
              value={formData.delivery_name}
              onChange={handleChange}
              required
              className="delivery-input"
            />
            <input
              type="text"
              name="car_number"
              placeholder="លេខរថយន្ត"
              value={formData.car_number}
              onChange={handleChange}
              required
              className="delivery-input"
            />
          </div>
          <div className="form-row">
            <input
              type="number"
              name="delivery_number"
              placeholder="លេខដឹកជញ្ជូន"
              value={formData.delivery_number}
              onChange={handleChange}
              className="delivery-input"
            />
            {/* <input
              type="text"
              name="estimated_delivery_time"
              placeholder="រយៈពេលប៉ាន់ស្មាន (DD:HH:MM:SS)"
              value={formData.estimated_delivery_time}
              onChange={handleChange}
              className="delivery-input"
            /> */}
          </div>
          <div className="form-row">
            {/* <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="delivery-input"
            /> */}
            <label>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              សកម្ម
            </label>
            <button type="submit" className="delivery-button">
              {editingId ? 'ធ្វើបច្ចុប្បន្នភាព' : 'បន្ថែមវិធីសាស្ត្រ'}
            </button>
          </div>
        </form>
        {error && <p className="error-message">{error}</p>}
      </motion.div>

      {/* Table to display delivery methods */}
      <motion.div
        className="delivery-methods-table"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <h3>បញ្ជីវិធីសាស្ត្រដឹកជញ្ជូន</h3>
        {deliveryMethods.length > 0 ? (
          <table className="delivery-table">
            <thead>
              <tr>
                <th>លេខសម្គាល់</th>
                <th>ឈ្មោះវិធីសាស្ត្រ</th>
                <th>លេខរថយន្ត</th>
                <th>លេខដឹកជញ្ជូន</th>
                {/* <th>រយៈពេលប៉ាន់ស្មាន</th>
                <th>កាលបរិច្ឆេទ</th> */}
                <th>សកម្ម</th>
                <th>សកម្មភាព</th>
              </tr>
            </thead>
            <tbody>
              {deliveryMethods.map((dm, index) => (
                <motion.tr
                  key={dm.delivery_method_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                >
                  <td>{dm.delivery_method_id}</td>
                  <td>{dm.delivery_name}</td>
                  <td>{dm.car_number}</td>
                  <td>{dm.delivery_number || '-'}</td>
                  {/* <td>{dm.estimated_delivery_time || '-'}</td>
                  <td>{dm.date ? new Date(dm.date).toLocaleString() : '-'}</td> */}
                  <td>{dm.is_active ? 'បាទ/ចាស' : 'ទេ'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="delivery-edit-button"
                        onClick={() => handleEdit(dm)}
                      >
                        កែ
                      </button>
                      <button
                        className="delivery-delete-button"
                        onClick={() => handleDelete(dm.delivery_method_id)}
                      >
                        លុប
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>គ្មានវិធីសាស្ត្រដឹកជញ្ជូនទេ។</p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default DeliveryMethods;