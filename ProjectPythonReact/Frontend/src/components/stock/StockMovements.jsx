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
        setError('មិនអាចទាញយកព័ត៌មានស្តុកបានទេ។ សូមព្យាយាមម្ដងទៀត។');
        console.error('Fetch error:', err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };
    fetchStockMovements();
  }, []);

  console.log('Stock Movements State:', stockMovements);
  if (loading) return <p>កំពុងផ្ទុកទិន្នន័យស្តុក...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="stock-movement-container">
      <div className="stock-movement-header">
        <h2>ចលនាស្តុក</h2>
        <button onClick={() => navigate('/add-purchase')} className="add-button">
          បន្ថែមការទិញ
        </button>
      </div>
      <table className="stock-movement-table">
        <thead>
          <tr>
            <th>លេខសម្គាល់</th>
            <th>ផលិតផល</th>
            <th>វ៉ារីយ៉ង់</th>
            <th>ឃ្លាំង</th>
            <th>ធ្នើរ</th>
            <th>ប្រភេទ</th>
            <th>បរិមាណ</th>
            <th>កាលបរិច្ឆេទ</th>
            <th>លេខសម្គាល់ការទិញ</th>
            <th>សកម្មភាព</th>
          </tr>
        </thead>
        <tbody>
          {stockMovements.map((movement) => {
            // Check if warehouse_name or shelf_name is 'N/A'
            const isMissingStockInfo = !movement.warehouse_name || !movement.shelf_name;

            return (
              <tr key={movement.id}>
                <td>{movement.id}</td>
                <td>{movement.product_name}</td>
                <td>{movement.variant_info || 'មិនមាន'}</td>
                <td>{movement.warehouse_name || 'មិនមាន'}</td>
                <td>{movement.shelf_name || 'មិនមាន'}</td>
                <td>{movement.movement_type}</td>
                <td>{movement.quantity}</td>
                <td>{new Date(movement.movement_date).toLocaleString()}</td>
                <td>{movement.purchase || 'មិនមាន'}</td>
                <td>
                  <button
                    onClick={() => navigate(`/edit-stock-movement/${movement.id}`)}
                    className={isMissingStockInfo ? 'join-stock-button' : 'edit-button'}
                  >
                    {isMissingStockInfo ? 'បញ្ចូលស្តុក' : 'កែសម្រួល'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StockMovements;
