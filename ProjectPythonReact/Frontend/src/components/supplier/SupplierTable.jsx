import axios from 'axios';
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
  const suppliersPerPage = 10;
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
    setCurrentPage(1);
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

  const indexOfLastSupplier = currentPage * suppliersPerPage;
  const indexOfFirstSupplier = indexOfLastSupplier - suppliersPerPage;
  const currentSuppliers = filteredSuppliers.slice(indexOfFirstSupplier, indexOfLastSupplier);
  const totalPages = Math.ceil(filteredSuppliers.length / suppliersPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
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

  if (loading) return <p>កំពុងផ្ទុកអ្នកផ្គត់ផ្គង់...</p>;

  return (
    <div className="supplier-table-container">
      <div className="supplier-header">
        <h2>អ្នកផ្គត់ផ្គង់</h2>
        <button className="supplier-add-button" onClick={handleAddSupplier}>
          បន្ថែមអ្នកផ្គត់ផ្គង់
        </button>
      </div>

      <div className="supplier-search">
        <input
          type="text"
          placeholder="ស្វែងរកតាមឈ្មោះ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="supplier-search-input"
        />
      </div>

      <table className="supplier-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('id')}>លេខសំគាល់</th>
            <th onClick={() => handleSort('name')}>ឈ្មោះ</th>
            <th onClick={() => handleSort('contact_person')}>អ្នកទាក់ទង</th>
            <th onClick={() => handleSort('phone')}>ទូរស័ព្ទ</th>
            <th>អ៊ីមែល</th>
            <th>អាសយដ្ឋាន</th>
            <th onClick={() => handleSort('country')}>ប្រទេស</th>
            <th>សកម្មភាព</th>
          </tr>
        </thead>
        <tbody>
          {currentSuppliers.map((supplier) => (
            <tr key={supplier.id}>
              <td>{supplier.id}</td>
              <td>{supplier.name}</td>
              <td>{supplier.contact_person || '-'}</td>
              <td>{supplier.phone}</td>
              <td>{supplier.email || '-'}</td>
              <td>{supplier.address}</td>
              <td>{supplier.country}</td>
              <td>
                <button
                  className="supplier-edit-button"
                  onClick={() => handleEditSupplier(supplier.id)}
                >
                  កែប្រែ
                </button>
                <button
                  className="supplier-delete-button"
                  onClick={() => handleDeleteSupplier(supplier.id)}
                >
                  លុប
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="supplier-pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          មុន
        </button>
        <span>
          ទំព័រ {currentPage} នៃ {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          បន្ទាប់
        </button>
      </div>
    </div>
  );
};

export default SupplierTable;
