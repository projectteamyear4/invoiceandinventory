// src/components/Purchases.jsx
import axios from 'axios';
import html2canvas from 'html2canvas';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx'; // Import xlsx for Excel export
import { AuthContext } from '../AuthContext';
import './Purchases.css';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [exportFormat, setExportFormat] = useState(''); // State for selected export format
  const purchasesPerPage = 7; // ៧ ទំនិញក្នុងមួយទំព័រ
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const tableRef = useRef(null); // Reference to the table for capturing as image

  const api = axios.create({
    baseURL: 'http://localhost:8000',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  // Prepare data for export (CSV and Excel)
  const exportHeaders = [
    { label: 'អ្នកផ្គត់ផ្គង់', key: 'supplier_name' },
    { label: 'ផលិតផល', key: 'product_name' },
    { label: 'ប្រភេទ', key: 'product_variant_info' },
    { label: 'លេខបាច់', key: 'batch_number' },
    { label: 'បរិមាណ', key: 'quantity' },
    { label: 'តម្លៃទិញ', key: 'purchase_price' },
    { label: 'តម្លៃសរុប', key: 'total' },
    { label: 'កាលបរិច្ឆេទទិញ', key: 'purchase_date' },
  ];

  const exportData = filteredPurchases.map((purchase) => ({
    supplier_name: purchase.supplier_name,
    product_name: purchase.product_name,
    product_variant_info: purchase.product_variant_info || '-',
    batch_number: purchase.batch_number,
    quantity: purchase.quantity,
    purchase_price: purchase.purchase_price,
    total: parseFloat(purchase.total).toFixed(2),
    purchase_date: new Date(purchase.purchase_date).toLocaleString(),
  }));

  // Download as PNG
  const downloadAsPNG = () => {
    if (tableRef.current) {
      html2canvas(tableRef.current).then((canvas) => {
        const link = document.createElement('a');
        link.download = 'purchases-table.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  // Download as SVG
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
        link.download = 'purchases-table.svg';
        link.href = URL.createObjectURL(blob);
        link.click();
      });
    }
  };

  // Download as Excel
  const downloadAsExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Purchases');
    // Set column headers
    XLSX.utils.sheet_add_aoa(worksheet, [exportHeaders.map((header) => header.label)], { origin: 'A1' });
    XLSX.writeFile(workbook, 'purchases.xlsx');
  };

  // Handle export based on selected format
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

  // Fetch purchases
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

  // Search and filter purchases
  useEffect(() => {
    const filtered = purchases.filter(
      (purchase) =>
        purchase.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.batch_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPurchases(filtered);
    setCurrentPage(1);
  }, [searchTerm, purchases]);

  // Sort purchases
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

  // Pagination
  const indexOfLastPurchase = currentPage * purchasesPerPage;
  const indexOfFirstPurchase = indexOfLastPurchase - purchasesPerPage;
  const currentPurchases = filteredPurchases.slice(indexOfFirstPurchase, indexOfLastPurchase);
  const totalPages = Math.ceil(filteredPurchases.length / purchasesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleAddPurchase = () => {
    navigate('/add-purchase');
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
          <button onClick={() => navigate('/stock-movements')} className="add-button">
            ស្តុកផលិតផល
          </button>
          {/* Export Format Selector */}
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
          <button onClick={handleExport} className="export-button">
            ទាញយក
          </button>
          {/* Hidden CSVLink for triggering CSV download */}
          <CSVLink
            data={exportData}
            headers={exportHeaders}
            filename="purchases.csv"
            id="csv-link"
            style={{ display: 'none' }}
          />
        </div>
      </div>
      <table className="product-table" ref={tableRef}>
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
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
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