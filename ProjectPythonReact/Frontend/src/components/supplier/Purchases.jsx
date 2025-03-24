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
  const purchasesPerPage = 7; // ៧ ទំនិញក្នុងមួយទំព័រ
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

  // ទាញយកទំនិញដែលបានទិញ
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await api.get('/api/purchases/');
        console.log('សរុបទំនិញបានទិញ៖', response.data.length);
        setPurchases(response.data);
        setFilteredPurchases(response.data);
      } catch (error) {
        console.error('កំហុសក្នុងការទាញយកទំនិញ៖', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, []);

  // ស្វែងរក និង ចម្រាញ់ទំនិញ
  useEffect(() => {
    const filtered = purchases.filter((purchase) =>
      purchase.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.batch_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPurchases(filtered);
    setCurrentPage(1);
  }, [searchTerm, purchases]);

  // តម្រៀបទំនិញ
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

  // លុបទំនិញ
  const handleDelete = async (purchaseId) => {
    if (window.confirm('តើអ្នកប្រាកដជាចង់លុបការទិញនេះមែនទេ?')) {
      try {
        await api.delete(`/api/purchases/${purchaseId}/`);
        // Remove the deleted purchase from the state
        const updatedPurchases = purchases.filter((purchase) => purchase.id !== purchaseId);
        setPurchases(updatedPurchases);
        setFilteredPurchases(updatedPurchases);
        alert('ការទិញត្រូវបានលុបដោយជោគជ័យ!');
      } catch (error) {
        console.error('កំហុសក្នុងការលុបការទិញ៖', error);
        alert('មានបញ្ហាក្នុងការលុបការទិញ។ សូមព្យាយាមម្តងទៀត។');
      }
    }
  };

  // គ្រប់គ្រងទំព័រពីមួយទៅមួយ
  const indexOfLastPurchase = currentPage * purchasesPerPage;
  const indexOfFirstPurchase = indexOfLastPurchase - purchasesPerPage;
  const currentPurchases = filteredPurchases.slice(indexOfFirstPurchase, indexOfLastPurchase);
  const totalPages = Math.ceil(filteredPurchases.length / purchasesPerPage);

  // គណនាសរុបបរិមាណ និង តម្លៃសរុប
  const totalQuantity = currentPurchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
  const totalPurchasePrice = currentPurchases.reduce((sum, purchase) => sum + parseFloat(purchase.total), 0).toFixed(2);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleAddPurchase = () => {
    navigate('/add-purchase'); // សន្សំទីតាំងនេះសម្រាប់បន្ថែមទំនិញ
  };

  if (loading) return <p>កំពុងផ្ទុកទំនិញ...</p>;

  return (
    <div className="product-table-container">
      <div className="product-header">
        <h2>ការទិញទំនិញ</h2>
        <div className="product-controls">
          <input
            type="text"
            placeholder="ស្វែងរកតាមផលិតផល ឬ លេខបាច់..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="product-search-input"
          />
          <button className="product-add-button" onClick={handleAddPurchase}>
            បន្ថែមការទិញ
          </button>
        </div>
      </div>
      <table className="product-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('supplier_name')}>អ្នកផ្គត់ផ្គង់</th>
            <th onClick={() => handleSort('product_name')}>ផលិតផល</th>
            <th onClick={() => handleSort('product_variant_info')}>ប្រភេទ</th>
            <th onClick={() => handleSort('batch_number')}>លេខបាច់</th>
            <th onClick={() => handleSort('quantity')}>បរិមាណ</th>
            <th onClick={() => handleSort('purchase_price')}>តម្លៃទិញ</th>
            <th onClick={() => handleSort('total')}>តម្លៃសរុប</th>
            <th onClick={() => handleSort('purchase_date')}>កាលបរិច្ឆេទទិញ</th>
            <th>សកម្មភាព</th> {/* New column for actions */}
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
              <td>{parseFloat(purchase.total).toFixed(2)}</td>
              <td>{new Date(purchase.purchase_date).toLocaleString()}</td>
              <td>
              
                <button
                  onClick={() => handleDelete(purchase.id)}
                  className="delete-button"
                >
                  លុប
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* គ្រប់គ្រងទំព័រ */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            ថយក្រោយ
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
            ទៅមុខ
          </button>
        </div>
      )}
    </div>
  );
};

export default Purchases;