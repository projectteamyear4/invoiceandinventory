// src/components/CustomerList.jsx
import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'registration_date', direction: 'desc' });
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: 'http://localhost:8000',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get('/api/customers/');
        setCustomers(response.data);
        setFilteredCustomers(response.data);
      } catch (err) {
        setError('Failed to load customers.');
        console.error('Fetch error:', err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filtered = customers.filter((customer) =>
        `${customer.first_name} ${customer.last_name} ${customer.email}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      setFilteredCustomers(filtered);
      setCurrentPage(1);
    }, 300); 

    return () => clearTimeout(timeoutId);
  }, [searchQuery, customers]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredCustomers].sort((a, b) => {
      if (key === 'registration_date') {
        return direction === 'asc'
          ? new Date(a[key]) - new Date(b[key])
          : new Date(b[key]) - new Date(a[key]);
      }
      return direction === 'asc'
        ? a[key]?.toString().localeCompare(b[key]?.toString())
        : b[key]?.toString().localeCompare(a[key]?.toString());
    });

    setFilteredCustomers(sorted);
    setCurrentPage(1);
  };

  const handleDelete = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;

    try {
      await api.delete(`/api/customers/${customerId}/`);
      setCustomers(customers.filter((customer) => customer.customer_id !== customerId));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete customer.');
    }
  };

  const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) return <motion.div className="loading">Loading customers...</motion.div>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <motion.div className="customer-list-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h1>អតិថិជន</h1>

      <div className="table-controls">
        <motion.input
          type="text"
          placeholder="ស្វែងរកអតិថិជន..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <motion.select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </motion.select>
      </div>

      <motion.button className="add-customer-button" onClick={() => navigate('/add-customer')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        បន្ថែមអតិថិជនថ្មី
      </motion.button>

      <motion.table className="customer-list-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <thead>
          <tr>
            {['customer_id', 'first_name', 'last_name', 'email', 'order_history', 'status', 'registration_date'].map((key) => (
              <th key={key} onClick={() => handleSort(key)}>
                {key} {sortConfig.key === key && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
            ))}
            <th>លេខទូរស័ព្ទ</th>
            <th>លេខទូរស័ព្ទ ២</th>
            <th>អាសយដ្ឋាន</th>
            <th>ទីក្រុង</th>
            <th>ប្រទេស</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedCustomers.map((customer, index) => (
            <motion.tr
              key={customer.customer_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ backgroundColor: '#f0f0f0' }}
            >
              <td>{customer.customer_id}</td>
              <td>{customer.first_name}</td>
              <td>{customer.last_name}</td>
              <td>{customer.email}</td>
              <td>{customer.phone_number || '-'}</td>
              <td>{customer.phone_number2 || '-'}</td>
              <td>{customer.address || '-'}</td>
              <td>{customer.city || '-'}</td>
              <td>{customer.country || '-'}</td>
              <td>{customer.order_history}</td>
              <td>{customer.status}</td>
              <td>{new Date(customer.registration_date).toLocaleDateString()}</td>
              <td>
                <button className="delete-btn" onClick={() => handleDelete(customer.customer_id)}>🗑 Delete</button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </motion.table>

      <motion.div className="pagination">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          មុន
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button key={page} onClick={() => handlePageChange(page)} className={currentPage === page ? 'active' : ''}>
            {page}
          </button>
        ))}
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          បន្ទាប់
        </button>
      </motion.div>
    </motion.div>
  );
};

export default Customers;
