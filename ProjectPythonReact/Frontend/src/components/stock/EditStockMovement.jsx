// src/components/EditStockMovement.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './StockMovements.css';

const EditStockMovement = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    warehouse: '',
    shelf: '',
  });
  const [warehouses, setWarehouses] = useState([]);
  const [allShelves, setAllShelves] = useState([]);
  const [filteredShelves, setFilteredShelves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
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
    const fetchData = async () => {
      try {
        const [movementRes, warehouseRes, shelfRes] = await Promise.all([
          api.get(`/api/stock-movements/${id}/`),
          api.get('/api/warehouses/'),
          api.get('/api/shelves/'),
        ]);
        
        const initialWarehouse = movementRes.data.warehouse;
        setFormData({
          warehouse: initialWarehouse,
          shelf: movementRes.data.shelf,
        });
        setWarehouses(warehouseRes.data);
        setAllShelves(shelfRes.data);
        const filtered = shelfRes.data.filter(shelf => shelf.warehouse === initialWarehouse);
        setFilteredShelves(filtered);
      } catch (err) {
        setError('មិនអាចទាញយកទិន្នន័យបាន។ សូមព្យាយាមម្តងទៀត។');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleWarehouseChange = (e) => {
    const warehouseId = parseInt(e.target.value);
    setFormData((prev) => ({ ...prev, warehouse: warehouseId, shelf: '' }));
    const filtered = allShelves.filter(shelf => shelf.warehouse === warehouseId);
    setFilteredShelves(filtered);
  };

  const handleShelfChange = (e) => {
    const shelfId = parseInt(e.target.value);
    setFormData((prev) => ({ ...prev, shelf: shelfId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const updatedData = {
        warehouse: parseInt(formData.warehouse) || null,
        shelf: parseInt(formData.shelf) || null,
      };
      await api.patch(`/api/stock-movements/${id}/`, updatedData);
      setSuccess('បានកែប្រែការផ្លាស់ទីស្តុកដោយជោគជ័យ!');
      setTimeout(() => navigate('/stock-movements'), 1000);
    } catch (err) {
      setError('មិនអាចកែប្រែការផ្លាស់ទីស្តុកបាន។');
      console.error(err.response?.data || err);
    }
  };

  if (loading) return <p>កំពុងផ្ទុក...</p>;

  return (
    <div className="edit-stock-movement-container">
      <h2>ការផ្លាស់ទីស្តុក</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-group">
          <label>ឃ្លាំង:</label>
          <select
            name="warehouse"
            value={formData.warehouse}
            onChange={handleWarehouseChange}
            required
          >
            <option value="">ជ្រើសរើសឃ្លាំង</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>ធ្នើរ:</label>
          <select
            name="shelf"
            value={formData.shelf}
            onChange={handleShelfChange}
            required
          >
            <option value="">ជ្រើសរើសធ្នើរ</option>
            {filteredShelves.map((shelf) => (
              <option key={shelf.id} value={shelf.id}>
                {shelf.shelf_name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="save-button">រក្សាទុកការផ្លាស់ប្តូរ</button>
      </form>
    </div>
  );
};

export default EditStockMovement;
