// src/components/Purchases.jsx
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Purchases.css';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const purchasesPerPage = 7; // 7 purchases per page
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: 'http://localhost:8000',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  // Fetch purchases
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await api.get('/api/purchases/');
        console.log('Total purchases fetched:', response.data.length);
        setPurchases(response.data);
        setFilteredPurchases(response.data);
      } catch (error) {
        console.error('Error fetching purchases:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, []);

  // Search and filter functionality
  useEffect(() => {
    const filtered = purchases.filter((purchase) =>
      purchase.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.batch_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPurchases(filtered);
    setCurrentPage(1);
  }, [searchTerm, purchases]);

  // Sort functionality
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredPurchases].sort((a, b) => {
      const aValue = a[key] || '';
      const bValue = b[key] || '';
      if (typeof aValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
    setFilteredPurchases(sorted);
  };

  // Pagination logic
  const indexOfLastPurchase = currentPage * purchasesPerPage;
  const indexOfFirstPurchase = indexOfLastPurchase - purchasesPerPage;
  const currentPurchases = filteredPurchases.slice(indexOfFirstPurchase, indexOfLastPurchase);
  const totalPages = Math.ceil(filteredPurchases.length / purchasesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleAddPurchase = () => {
    navigate('/add-purchase'); // Assuming you'll create this route
  };

  if (loading) return <p>Loading purchases...</p>;

  return (
    <div className="product-table-container">
      <div className="product-header">
        <h2>Purchases</h2>
        <div className="product-controls">
          <input
            type="text"
            placeholder="Search by product or batch number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="product-search-input"
          />
          <button className="product-add-button" onClick={handleAddPurchase}>
            Add Purchase
          </button>
        </div>
      </div>
      <table className="product-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('supplier_name')}>
              Supplier {sortConfig.key === 'supplier_name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th onClick={() => handleSort('product_name')}>
              Product {sortConfig.key === 'product_name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th onClick={() => handleSort('product_variant_info')}>
              Variant {sortConfig.key === 'product_variant_info' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
           
            <th onClick={() => handleSort('batch_number')}>
              Batch Number {sortConfig.key === 'batch_number' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th onClick={() => handleSort('quantity')}>
              Quantity {sortConfig.key === 'quantity' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th onClick={() => handleSort('purchase_price')}>
              Purchase Price {sortConfig.key === 'purchase_price' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th onClick={() => handleSort('purchase_date')}>
              Purchase Date {sortConfig.key === 'purchase_date' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          {currentPurchases.map((purchase) => (
            <tr key={purchase.id}>
              <td>{purchase.supplier_name}</td>
              <td>{purchase.product_name}</td>
              <td>{purchase.product_variant_info || '-'}</td>
             
              <td>{purchase.batch_number}</td>
              <td>{purchase.quantity}</td>
              <td>{purchase.purchase_price}</td>
              <td>{new Date(purchase.purchase_date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`pagination-button ${currentPage === page ? 'active' : ''}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Purchases;