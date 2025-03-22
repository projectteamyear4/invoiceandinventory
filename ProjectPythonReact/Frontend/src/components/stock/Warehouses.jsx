// src/components/Warehouses.jsx
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Warehouse.css';

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await api.get('/api/warehouses/');
        setWarehouses(response.data);
      } catch (error) {
        console.error('Error fetching warehouses:', error);
        setMessage('មិនអាចទាញយកឃ្លាំងបានទេ។');
      } finally {
        setLoading(false);
      }
    };
    fetchWarehouses();
  }, []);

  const handleAddWarehouse = () => {
    navigate('/add-warehouse');
  };

  const handleEditWarehouse = (id) => {
    navigate(`/edit-warehouse/${id}`);
  };

  const handleDeleteWarehouse = async (id) => {
    if (window.confirm('តើអ្នកចង់លុបឃ្លាំងនេះចំនួននេះទេ?')) {
      try {
        await api.delete(`/api/warehouses/${id}/`);
        setWarehouses(warehouses.filter((w) => w.id !== id));
        setMessage('ឃ្លាំងត្រូវបានលុបដោយជោគជ័យ!');
      } catch (error) {
        console.error('Error deleting warehouse:', error);
        setMessage('មិនអាចលុបឃ្លាំងបានទេ។');
      }
    }
  };

  const handleViewShelves = () => {
    navigate('/shelves'); // Navigate to shelf list
  };

  if (loading) return <p>កំពុងផ្ទុកឃ្លាំង...</p>;

  return (
    <div className="warehouse-container">
      <div className="warehouse-header">
        <h2>ឃ្លាំង</h2>
        <div>
          <button className="warehouse-add-button" onClick={handleAddWarehouse}>
            បន្ថែមឃ្លាំង
          </button>
          <button className="warehouse-shelves-button" onClick={handleViewShelves}>
            មើលធ្នើរ
          </button>
        </div>
      </div>
      {message && (
        <p className={`warehouse-message ${message.includes('ជោគជ័យ') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}
      <table className="warehouse-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>ឈ្មោះ</th>
            <th>ទីតាំង</th>
            <th>ម្ចាស់</th>
            <th>អ្នកទំនាក់ទំនង</th>
            <th>លេខទំនាក់ទំនង</th>
            <th>សមត្ថភាព</th>
            <th>បានបង្កើតនៅ</th>
            <th>សកម្មភាព</th>
          </tr>
        </thead>
        <tbody>
          {warehouses.map((warehouse) => (
            <tr key={warehouse.id}>
              <td>{warehouse.id}</td>
              <td>{warehouse.name}</td>
              <td>{warehouse.location}</td>
              <td>{warehouse.owner || '-'}</td>
              <td>{warehouse.contact_person || '-'}</td>
              <td>{warehouse.contact_number || '-'}</td>
              <td>{warehouse.capacity || '-'}</td>
              <td>{new Date(warehouse.created_at).toLocaleDateString()}</td>
              <td>
                <button
                  className="warehouse-edit-button"
                  onClick={() => handleEditWarehouse(warehouse.id)}
                >
                  កែប្រែ
                </button>
                <button
                  className="warehouse-delete-button"
                  onClick={() => handleDeleteWarehouse(warehouse.id)}
                >
                  លុប
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Warehouses;