import axios from 'axios';
import { motion } from 'framer-motion';
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
  const [exportFormat, setExportFormat] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();
  const tableRef = useRef(null);

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
        setStockMovements(response.data || []);
        setFilteredStockMovements(response.data || []);
      } catch (err) {
        const errorMessage = err.response?.data?.detail || err.message || 'មិនអាចទាញយកព័ត៌មានស្តុកបានទេ។ សូមព្យាយាមម្ដងទៀត។';
        setError(errorMessage);
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
      (movement.product_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStockMovements(filtered);
    setCurrentPage(1);
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
      } else {
        return direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
    });
    setFilteredStockMovements(sorted);
  };

  // Pagination logic
  const totalItems = filteredStockMovements.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMovements = filteredStockMovements.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
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
    { label: 'លេខសម្គាល់ធាតុវិក្កយបត្រ', key: 'invoice_item_id' }, // Added for export
  ];

  const exportData = filteredStockMovements.map((movement) => ({
    product_name: movement.product_name || 'មិនមាន',
    variant_info: movement.variant_info || 'មិនមាន',
    warehouse_name: movement.warehouse_name || 'មិនមាន',
    shelf_name: movement.shelf_name || 'មិនមាន',
    movement_type: movement.movement_type || 'មិនមាន',
    quantity: movement.quantity || 0,
    movement_date: movement.movement_date ? new Date(movement.movement_date).toLocaleString() : 'មិនមាន',
    invoice_item_id: movement.invoice_item_id || 'មិនមាន', // Added for export
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

  if (loading) return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      កំពុងផ្ទុកទិន្នន័យស្តុក...
    </motion.p>
  );

  if (error) return (
    <motion.p
      className="error-message"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {error}
    </motion.p>
  );

  return (
    <motion.div
      className="stock-movement-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="stock-movement-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="header-content">
          <h2>ចលនាស្តុក</h2>
          <div className="stock-movement-search-wrapper">
            <input
              type="text"
              placeholder="ស្វែងរកតាមផលិតផល..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="stock-movement-search-input"
            />
          </div>
        </div>
        <div className="stock-movement-controls">
          <motion.button
            onClick={() => navigate('/add-purchase')}
            className="add-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            បន្ថែមការទិញ
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
            filename="stock-movements.csv"
            id="csv-link"
            style={{ display: 'none' }}
          />
        </div>
      </motion.div>

      {filteredStockMovements.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          មិនមានទិន្នន័យចលនាស្តុកទេ។
        </motion.p>
      ) : (
        <>
          <table className="stock-movement-table" ref={tableRef}>
            <thead>
              <tr>
                <th onClick={() => handleSort('product_name')}>
                  ផលិតផល
                  {sortConfig.key === 'product_name' && (
                    <span className="sort-icon">
                      {sortConfig.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('variant_info')}>
                  វ៉ារីយ៉ង់
                  {sortConfig.key === 'variant_info' && (
                    <span className="sort-icon">
                      {sortConfig.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('warehouse_name')}>
                  ឃ្លាំង
                  {sortConfig.key === 'warehouse_name' && (
                    <span className="sort-icon">
                      {sortConfig.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('shelf_name')}>
                  ធ្នើរ
                  {sortConfig.key === 'shelf_name' && (
                    <span className="sort-icon">
                      {sortConfig.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('movement_type')}>
                  ប្រភេទ
                  {sortConfig.key === 'movement_type' && (
                    <span className="sort-icon">
                      {sortConfig.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('quantity')}>
                  បរិមាណ
                  {sortConfig.key === 'quantity' && (
                    <span className="sort-icon">
                      {sortConfig.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('movement_date')}>
                  កាលបរិច្ឆេទ
                  {sortConfig.key === 'movement_date' && (
                    <span className="sort-icon">
                      {sortConfig.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('invoice_item_id')}>
                  លេខសម្គាល់ធាតុវិក្កយបត្រ
                  {sortConfig.key === 'invoice_item_id' && (
                    <span className="sort-icon">
                      {sortConfig.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
                <th>សកម្មភាព</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMovements.map((movement, index) => {
                const isMissingStockInfo = !movement.warehouse_name || !movement.shelf_name;

                return (
                  <motion.tr
                    key={movement.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td>{movement.product_name || 'មិនមាន'}</td>
                    <td>{movement.variant_info || 'មិនមាន'}</td>
                    <td>{movement.warehouse_name || 'មិនមាន'}</td>
                    <td>{movement.shelf_name || 'មិនមាន'}</td>
                    <td>{movement.movement_type || 'មិនមាន'}</td>
                    <td>{movement.quantity || 0}</td>
                    <td>{movement.movement_date ? new Date(movement.movement_date).toLocaleString() : 'មិនមាន'}</td>
                    <td>{movement.invoice_item_id || 'មិនមាន'}</td>
                    <td>
                      <motion.button
                        onClick={() => navigate(`/edit-stock-movement/${movement.id}`)}
                        className={isMissingStockInfo ? 'join-stock-button' : 'edit-button'}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isMissingStockInfo ? 'បញ្ចូលស្តុក' : 'កែសម្រួល'}
                      </motion.button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          <div className="pagination-controls">
            <label htmlFor="items-per-page">ចំនួនក្នុងមួយទំព័រ: </label>
            <select
              id="items-per-page"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="items-per-page-select"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          {totalItems > 0 && (
            <div className="pagination">
              <motion.button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                មុន
              </motion.button>

              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <motion.button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {page}
                  </motion.button>
                ))}
              </div>

              <motion.button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                បន្ទាប់
              </motion.button>
            </div>
          )}

          {totalItems > 0 && (
            <div className="pagination-info">
              បង្ហាញ {startIndex + 1} ដល់ {Math.min(endIndex, totalItems)} នៃ {totalItems} ធាតុ
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default StockMovements;