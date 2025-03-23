// src/components/StockMovements.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StockMovements.css';

const StockMovements = () => {
  const [stockMovements, setStockMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    const fetchStockMovements = async () => {
      try {
        const response = await api.get('/api/stock-movements/');
        console.log('API Response:', response.data);
        setStockMovements(response.data);
      } catch (err) {
        setError('Failed to load stock movements. Please try again.');
        console.error('Fetch error:', err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };
    fetchStockMovements();
  }, []);

  console.log('Stock Movements State:', stockMovements);
  if (loading) return <p>Loading stock movements...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="stock-movement-container">
      <div className="stock-movement-header">
        <h2>Stock Movements</h2>
        <button onClick={() => navigate('/add-purchase')} className="add-button">
          Add Purchase
        </button>
      </div>
      <table className="stock-movement-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>Variant</th>
            <th>Warehouse</th>
            <th>Shelf</th>
            <th>Type</th>
            <th>Quantity</th>
            <th>Date</th>
            <th>Purchase ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stockMovements.map((movement) => (
            <tr key={movement.id}>
              <td>{movement.id}</td>
              <td>{movement.product_name}</td>
              <td>{movement.variant_info || 'N/A'}</td>
              <td>{movement.warehouse_name}</td>
              <td>{movement.shelf_name || 'N/A'}</td>
              <td>{movement.movement_type}</td>
              <td>{movement.quantity}</td>
              <td>{new Date(movement.movement_date).toLocaleString()}</td>
              <td>{movement.purchase || 'N/A'}</td>
              <td>
                <button
                  onClick={() => navigate(`/edit-stock-movement/${movement.id}`)}
                  className="edit-button"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockMovements;