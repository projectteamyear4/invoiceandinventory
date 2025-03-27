// src/components/SupplierTable.jsx
import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Supplier.css';

const SupplierTable = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [suppliersPerPage, setSuppliersPerPage] = useState(10); // State for suppliers per page
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

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await api.get('/api/suppliers/');
        setSuppliers(response.data);
        setFilteredSuppliers(response.data);
      } catch (error) {
        console.error('កំហុសក្នុងការទាញយកអ្នកផ្គត់ផ្គង់:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  useEffect(() => {
    const filtered = suppliers.filter((supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSuppliers(filtered);
    setCurrentPage(1); // Reset to first page on search
  }, [searchTerm, suppliers]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredSuppliers].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredSuppliers(sorted);
  };

  // Pagination logic
  const indexOfLastSupplier = currentPage * suppliersPerPage;
  const indexOfFirstSupplier = indexOfLastSupplier - suppliersPerPage;
  const currentSuppliers = filteredSuppliers.slice(indexOfFirstSupplier, indexOfLastSupplier);
  const totalPages = Math.ceil(filteredSuppliers.length / suppliersPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle suppliers per page change
  const handleSuppliersPerPageChange = (e) => {
    setSuppliersPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleAddSupplier = () => {
    navigate('/add-supplier');
  };

  const handleEditSupplier = (id) => {
    navigate(`/edit-supplier/${id}`);
  };

  const handleDeleteSupplier = async (id) => {
    if (window.confirm('តើអ្នកចង់លុបអ្នកផ្គត់ផ្គង់នេះឬ?')) {
      try {
        await api.delete(`/api/suppliers/${id}/`);
        setSuppliers(suppliers.filter((supplier) => supplier.id !== id));
        setFilteredSuppliers(filteredSuppliers.filter((supplier) => supplier.id !== id));
      } catch (error) {
        console.error('កំហុសក្នុងការលុបអ្នកផ្គត់ផ្គង់:', error);
        alert('មិនអាចលុបអ្នកផ្គត់ផ្គង់បានទេ។');
      }
    }
  };

  if (loading) return <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>កំពុងផ្ទុកអ្នកផ្គត់ផ្គង់...</motion.p>;

  return (
    <motion.div
      className="supplier-table-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="supplier-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h2>អ្នកផ្គត់ផ្គង់</h2>
        <motion.button
          className="supplier-add-button"
          onClick={handleAddSupplier}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          បន្ថែមអ្នកផ្គត់ផ្គង់
        </motion.button>
      </motion.div>

      {/* Search and Per Page Selector */}
      <motion.div
        className="supplier-controls"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="supplier-search">
          <input
            type="text"
            placeholder="ស្វែងរកតាមឈ្មោះ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="supplier-search-input"
          />
        </div>
        <div className="per-page-selector">
          <label>បង្ហាញក្នុងមួយទំព័រ: </label> {/* Show per page: */}
          <select value={suppliersPerPage} onChange={handleSuppliersPerPageChange}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </select>
        </div>
      </motion.div>

      {/* Table */}
      <motion.table
        className="supplier-table"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <thead>
          <tr>
            <th onClick={() => handleSort('id')}>
              លេខសំគាល់ {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('name')}>
              ឈ្មោះ {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('contact_person')}>
              អ្នកទាក់ទង {sortConfig.key === 'contact_person' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('phone')}>
              ទូរស័ព្ទ {sortConfig.key === 'phone' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th>អ៊ីមែល</th>
            <th>អាសយដ្ឋាន</th>
            <th onClick={() => handleSort('country')}>
              ប្រទេស {sortConfig.key === 'country' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th>សកម្មភាព</th>
          </tr>
        </thead>
        <tbody>
          {currentSuppliers.map((supplier, index) => (
            <motion.tr
              key={supplier.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ backgroundColor: '#f8f9fa' }}
            >
              <td>{supplier.id}</td>
              <td>{supplier.name}</td>
              <td>{supplier.contact_person || '-'}</td>
              <td>{supplier.phone}</td>
              <td>{supplier.email || '-'}</td>
              <td>{supplier.address}</td>
              <td>{supplier.country}</td>
              <td>
                <motion.button
                  className="supplier-edit-button"
                  onClick={() => handleEditSupplier(supplier.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  កែប្រែ
                </motion.button>
                <motion.button
                  className="supplier-delete-button"
                  onClick={() => handleDeleteSupplier(supplier.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  លុប
                </motion.button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </motion.table>

      {/* Pagination */}
      <motion.div
        className="supplier-pagination"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <motion.button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          មុន
        </motion.button>
        <span>
          ទំព័រ {currentPage} នៃ {totalPages}
        </span>
        <motion.button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          បន្ទាប់
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default SupplierTable;