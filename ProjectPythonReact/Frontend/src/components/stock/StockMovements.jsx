// src/components/StockMovements.jsx
import axios from 'axios';
import html2canvas from 'html2canvas';
import React, { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './StockMovements.css';

const StockMovements = () => {
  const [stockMovements, setStockMovements] = useState([]);
  const [filteredStockMovements, setFilteredStockMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [exportFormat, setExportFormat] = useState(''); // State for selected export format
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

  // Fetch stock movements
  useEffect(() => {
    const fetchStockMovements = async () => {
      try {
        const response = await api.get('/api/stock-movements/');
        console.log('API Response:', response.data);
        setStockMovements(response.data);
        setFilteredStockMovements(response.data);
      } catch (err) {
        setError('មិនអាចទាញយកព័ត៌មានស្តុកបានទេ។ សូមព្យាយាមម្ដងទៀត។');
        console.error('Fetch error:', err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };
    fetchStockMovements();
  }, []);

  // Search and filter stock movements by product name
  useEffect(() => {
    const filtered = stockMovements.filter((movement) =>
      movement.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStockMovements(filtered);
  }, [searchTerm, stockMovements]);

  // Sort stock movements
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredStockMovements].sort((a, b) => {
      const aValue = a[key] || '';
      const bValue = b[key] || '';
      if (key === 'id' || key === 'quantity') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      } else if (key === 'movement_date') {
        return direction === 'asc'
          ? new Date(aValue) - new Date(bValue)
          : new Date(bValue) - new Date(aValue);
      } else if (key === 'purchase') {
        const aPurchase = aValue || 0;
        const bPurchase = bValue || 0;
        return direction === 'asc' ? aPurchase - bPurchase : bPurchase - aPurchase;
      } else {
        return direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
    });
    setFilteredStockMovements(sorted);
  };

  // Prepare data for export (CSV and Excel)
  const exportHeaders = [
   
    { label: 'ផលិតផល', key: 'product_name' },
    { label: 'វ៉ារីយ៉ង់', key: 'variant_info' },
    { label: 'ឃ្លាំង', key: 'warehouse_name' },
    { label: 'ធ្នើរ', key: 'shelf_name' },
    { label: 'ប្រភេទ', key: 'movement_type' },
    { label: 'បរិមាណ', key: 'quantity' },
    { label: 'កាលបរិច្ឆេទ', key: 'movement_date' },
   
  ];

  const exportData = filteredStockMovements.map((movement) => ({
 
    product_name: movement.product_name,
    variant_info: movement.variant_info || 'មិនមាន',
    warehouse_name: movement.warehouse_name || 'មិនមាន',
    shelf_name: movement.shelf_name || 'មិនមាន',
    movement_type: movement.movement_type,
    quantity: movement.quantity,
    movement_date: new Date(movement.movement_date).toLocaleString(),
   
  }));

  // Download as PNG
  const downloadAsPNG = () => {
    if (tableRef.current) {
      html2canvas(tableRef.current).then((canvas) => {
        const link = document.createElement('a');
        link.download = 'stock-movements-table.png';
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
        link.download = 'stock-movements-table.svg';
        link.href = URL.createObjectURL(blob);
        link.click();
      });
    }
  };

  // Download as Excel
  const downloadAsExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'StockMovements');
    XLSX.utils.sheet_add_aoa(worksheet, [exportHeaders.map((header) => header.label)], { origin: 'A1' });
    XLSX.writeFile(workbook, 'stock-movements.xlsx');
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

  console.log('Stock Movements State:', stockMovements);
  if (loading) return <p>កំពុងផ្ទុកទិន្នន័យស្តុក...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="stock-movement-container">
      <div className="stock-movement-header">
        <h2>ចលនាស្តុក</h2>
        <div className="stock-movement-controls">
          <input
            type="text"
            placeholder="ស្វែងរកតាមផលិតផល..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="stock-movement-search-input"
          />
          <button onClick={() => navigate('/add-purchase')} className="add-button">
            បន្ថែមការទិញ
          </button>
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
          <CSVLink
            data={exportData}
            headers={exportHeaders}
            filename="stock-movements.csv"
            id="csv-link"
            style={{ display: 'none' }}
          />
        </div>
      </div>
      <table className="stock-movement-table" ref={tableRef}>
        <thead>
          <tr>
           
            <th onClick={() => handleSort('product_name')}>ផលិតផល</th>
            <th onClick={() => handleSort('variant_info')}>វ៉ារីយ៉ង់</th>
            <th onClick={() => handleSort('warehouse_name')}>ឃ្លាំង</th>
            <th onClick={() => handleSort('shelf_name')}>ធ្នើរ</th>
            <th onClick={() => handleSort('movement_type')}>ប្រភេទ</th>
            <th onClick={() => handleSort('quantity')}>បរិមាណ</th>
            <th onClick={() => handleSort('movement_date')}>កាលបរិច្ឆេទ</th>
           
            <th>សកម្មភាព</th>
          </tr>
        </thead>
        <tbody>
          {filteredStockMovements.map((movement) => {
            const isMissingStockInfo = !movement.warehouse_name || !movement.shelf_name;

            return (
              <tr key={movement.id}>
               
                <td>{movement.product_name}</td>
                <td>{movement.variant_info || 'មិនមាន'}</td>
                <td>{movement.warehouse_name || 'មិនមាន'}</td>
                <td>{movement.shelf_name || 'មិនមាន'}</td>
                <td>{movement.movement_type}</td>
                <td>{movement.quantity}</td>
                <td>{new Date(movement.movement_date).toLocaleString()}</td>
               
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