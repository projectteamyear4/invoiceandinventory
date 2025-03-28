// src/components/Warehouses.jsx
import axios from 'axios';
import { motion } from 'framer-motion'; // Import framer-motion
import html2canvas from 'html2canvas';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { AuthContext } from '../AuthContext';
import './Warehouse.css';

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [exportFormat, setExportFormat] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const tableRef = useRef(null);

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
        console.log('API Response:', response.data);
        setWarehouses(response.data);
        setFilteredWarehouses(response.data);
      } catch (error) {
        console.error('Error fetching warehouses:', error);
        setMessage('មិនអាចទាញយកឃ្លាំងបានទេ។');
      } finally {
        setLoading(false);
      }
    };
    fetchWarehouses();
  }, []);

  useEffect(() => {
    const filtered = warehouses.filter((warehouse) =>
      warehouse.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredWarehouses(filtered);
  }, [searchTerm, warehouses]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredWarehouses].sort((a, b) => {
      const aValue = a[key] || '';
      const bValue = b[key] || '';
      if (key === 'id' || key === 'capacity' || key === 'shelf_count' || key === 'total_quantity') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      } else if (key === 'created_at') {
        return direction === 'asc'
          ? new Date(aValue) - new Date(bValue)
          : new Date(bValue) - new Date(aValue);
      } else {
        return direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
    });
    setFilteredWarehouses(sorted);
  };

  const exportHeaders = [
    { label: 'ID', key: 'id' },
    { label: 'ឈ្មោះ', key: 'name' },
    { label: 'ទីតាំង', key: 'location' },
    { label: 'ម្ចាស់', key: 'owner' },
    { label: 'អ្នកទំនាក់ទំនង', key: 'contact_person' },
    { label: 'លេខទំនាក់ទំនង', key: 'contact_number' },
    { label: 'សមត្ថភាព', key: 'capacity' },
    { label: 'បរិមាណស្តុក', key: 'total_quantity' },
    { label: 'ចំនួនធ្នើរ', key: 'shelf_count' },
    { label: 'បានបង្កើតនៅ', key: 'created_at' },
  ];

  const exportData = filteredWarehouses.map((warehouse) => ({
    id: warehouse.id,
    name: warehouse.name,
    location: warehouse.location,
    owner: warehouse.owner || '-',
    contact_person: warehouse.contact_person || '-',
    contact_number: warehouse.contact_number || '-',
    capacity: warehouse.capacity || '-',
    total_quantity: `${warehouse.total_quantity || 0}/${warehouse.capacity || 0}`,
    shelf_count: warehouse.shelf_count || 0,
    created_at: new Date(warehouse.created_at).toLocaleDateString(),
  }));

  const downloadAsPNG = () => {
    if (tableRef.current) {
      html2canvas(tableRef.current).then((canvas) => {
        const link = document.createElement('a');
        link.download = 'warehouses-table.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  const downloadAsSVG = () => {
    if (tableRef.current) {
      html2canvas(tableRef.current).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
            <image href="${imgData}" width="${canvas.width}" height="${canvas.height}"/>
          </svg>
        `;
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const link = document.createElement('a');
        link.download = 'warehouses-table.svg';
        link.href = URL.createObjectURL(blob);
        link.click();
      });
    }
  };

  const downloadAsExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Warehouses');
    XLSX.utils.sheet_add_aoa(worksheet, [exportHeaders.map((header) => header.label)], { origin: 'A1' });
    XLSX.writeFile(workbook, 'warehouses.xlsx');
  };

  const handleExport = () => {
    if (!exportFormat) {
      alert('សូមជ្រើសរើសទម្រង់សម្រាប់ទាញយក!');
      return;
    }

    switch (exportFormat) {
      case 'csv':
        document.getElementById('csv-link').click();
        break;
      case 'excel':
        downloadAsExcel();
        break;
      case 'png':
        downloadAsPNG();
        break;
      case 'svg':
        downloadAsSVG();
        break;
      default:
        alert('ទម្រង់មិនត្រឹមត្រូវ!');
    }
  };

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
        setFilteredWarehouses(filteredWarehouses.filter((w) => w.id !== id));
        setMessage('ឃ្លាំងត្រូវបានលុបដោយជោគជ័យ!');
      } catch (error) {
        console.error('Error deleting warehouse:', error);
        setMessage('មិនអាចលុបឃ្លាំងបានទេ។');
      }
    }
  };

  const handleViewShelves = (warehouseId) => {
    navigate(`/shelves/${warehouseId}`);
  };

  if (loading) return <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>កំពុងផ្ទុកឃ្លាំង...</motion.p>;

  return (
    <motion.div
      className="warehouse-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="warehouse-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="header-content">
          <h2>ឃ្លាំង</h2>
          <div className="warehouse-search-wrapper">
        
            <input
              type="text"
              placeholder="ស្វែងរកតាមឈ្មោះឃ្លាំង..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="warehouse-search-input"
            />
          </div>
        </div>
        <div className="warehouse-controls">
          <motion.button
            className="warehouse-add-button"
            onClick={handleAddWarehouse}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            បន្ថែមឃ្លាំង
          </motion.button>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="export-select"
          >
            <option value="">ជ្រើសរើសទម្រង់ទាញយក</option>
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
            <option value="png">PNG</option>
            <option value="svg">SVG</option>
          </select>
          <motion.button
            onClick={handleExport}
            className="export-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ទាញយក
          </motion.button>
          <CSVLink
            data={exportData}
            headers={exportHeaders}
            filename="warehouses.csv"
            id="csv-link"
            style={{ display: 'none' }}
          />
        </div>
      </motion.div>
      {message && (
        <motion.p
          className={`warehouse-message ${message.includes('ជោគជ័យ') ? 'success' : 'error'}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {message}
        </motion.p>
      )}
      {filteredWarehouses.length === 0 ? (
        <motion.div
          className="no-warehouses"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p>មិនមានឃ្លាំងទេ។ សូមបន្ថែមឃ្លាំងថ្មី!</p>
          <motion.button
            className="warehouse-add-button"
            onClick={handleAddWarehouse}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            បន្ថែមឃ្លាំង
          </motion.button>
        </motion.div>
      ) : (
        <table className="warehouse-table" ref={tableRef}>
          <thead>
            <tr>
              <th onClick={() => handleSort('id')}>
                ID
                {sortConfig.key === 'id' && (
                  <span className="sort-icon">
                    {sortConfig.direction === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('name')}>
                ឈ្មោះ
                {sortConfig.key === 'name' && (
                  <span className="sort-icon">
                    {sortConfig.direction === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('location')}>
                ទីតាំង
                {sortConfig.key === 'location' && (
                  <span className="sort-icon">
                    {sortConfig.direction === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('owner')}>
                ម្ចាស់
                {sortConfig.key === 'owner' && (
                  <span className="sort-icon">
                    {sortConfig.direction === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('contact_person')}>
                អ្នកទំនាក់ទំនង
                {sortConfig.key === 'contact_person' && (
                  <span className="sort-icon">
                    {sortConfig.direction === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('contact_number')}>
                លេខទំនាក់ទំនង
                {sortConfig.key === 'contact_number' && (
                  <span className="sort-icon">
                    {sortConfig.direction === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('capacity')}>
                សមត្ថភាព
                {sortConfig.key === 'capacity' && (
                  <span className="sort-icon">
                    {sortConfig.direction === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('total_quantity')}>
                បរិមាណស្តុក
                {sortConfig.key === 'total_quantity' && (
                  <span className="sort-icon">
                    {sortConfig.direction === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('shelf_count')}>
                ចំនួនធ្នើរ
                {sortConfig.key === 'shelf_count' && (
                  <span className="sort-icon">
                    {sortConfig.direction === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('created_at')}>
                បានបង្កើតនៅ
                {sortConfig.key === 'created_at' && (
                  <span className="sort-icon">
                    {sortConfig.direction === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
              <th>សកម្មភាព</th>
            </tr>
          </thead>
          <tbody>
            {filteredWarehouses.map((warehouse, index) => (
              <motion.tr
                key={warehouse.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <td>{warehouse.id}</td>
                <td>{warehouse.name}</td>
                <td>{warehouse.location}</td>
                <td>{warehouse.owner || '-'}</td>
                <td>{warehouse.contact_person || '-'}</td>
                <td>{warehouse.contact_number || '-'}</td>
                <td>{warehouse.capacity || '-'}</td>
                <td>{`${warehouse.total_quantity || 0}/${warehouse.capacity || 0}`}</td>
                <td>{warehouse.shelf_count || 0}</td>
                <td>{new Date(warehouse.created_at).toLocaleDateString()}</td>
                <td>
                  <motion.button
                    className="warehouse-edit-button"
                    onClick={() => handleEditWarehouse(warehouse.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    កែប្រែ
                  </motion.button>
                  <motion.button
                    className="warehouse-delete-button"
                    onClick={() => handleDeleteWarehouse(warehouse.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    លុប
                  </motion.button>
                  <motion.button
                    className="warehouse-shelves-button"
                    onClick={() => handleViewShelves(warehouse.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    មើលធ្នើរ
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      )}
    </motion.div>
  );
};

export default Warehouses;