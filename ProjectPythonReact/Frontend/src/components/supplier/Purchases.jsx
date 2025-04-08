import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useContext, useEffect, useMemo, useState } from 'react'; // Added useState
import { CSVLink } from 'react-csv';
import DataTable from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { AuthContext } from '../AuthContext';
import './Purchases.css';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [exportFormat, setExportFormat] = useState('');
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
  }, [searchTerm, purchases]);

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

  // Download as Excel
  const downloadAsExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Purchases');
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
      default:
        alert('ទម្រង់មិនត្រឹមត្រូវ! (Only CSV and Excel supported in this version)');
    }
  };

  // Define columns for DataTable
  const columns = useMemo(() => [
    {
      name: 'អ្នកផ្គត់ផ្គង់',
      selector: (row) => row.supplier_name || '-',
      sortable: true,
    },
    {
      name: 'ផលិតផល',
      selector: (row) => row.product_name || '-',
      sortable: true,
    },
    {
      name: 'ប្រភេទ',
      selector: (row) => row.product_variant_info || '-',
      sortable: true,
    },
    {
      name: 'លេខបាច់',
      selector: (row) => row.batch_number || '-',
      sortable: true,
    },
    {
      name: 'បរិមាណ',
      selector: (row) => row.quantity || 0,
      sortable: true,
    },
    {
      name: 'តម្លៃទិញ',
      selector: (row) => row.purchase_price || 0,
      sortable: true,
    },
    {
      name: 'តម្លៃសរុប',
      selector: (row) => parseFloat(row.total || 0).toFixed(2),
      sortable: true,
    },
    {
      name: 'កាលបរិច្ឆេទទិញ',
      selector: (row) => new Date(row.purchase_date).toLocaleString(),
      sortable: true,
    },
  ], []);

  // Custom styles for DataTable
  const customStyles = {
    table: {
      style: {
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        background: '#fff',
      },
    },
    headRow: {
      style: {
        background: 'linear-gradient(90deg, #3f7fc2, #0056b3)',
        color: 'white',
        textTransform: 'uppercase',
        fontSize: '16px',
      },
    },
    headCells: {
      style: {
        padding: '12px',
      },
    },
    rows: {
      style: {
        fontSize: '16px',
        color: '#333',
        borderBottom: '1px solid #ddd',
        '&:hover': {
          background: 'rgba(0, 123, 255, 0.1)',
        },
      },
    },
    cells: {
      style: {
        padding: '12px',
      },
    },
    pagination: {
      style: {
        marginTop: '25px',
        padding: '10px',
        background: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
        border: 'none',
      },
      pageButtonsStyle: {
        padding: '8px 15px',
        background: 'linear-gradient(90deg, #007bff, #0056b3)',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover:not(:disabled)': {
          background: 'linear-gradient(90deg, #0056b3, #007bff)',
          boxShadow: '0 4px 10px rgba(0, 123, 255, 0.4)',
          transform: 'translateY(-2px)',
        },
        '&:disabled': {
          background: '#ccc',
          cursor: 'not-allowed',
        },
      },
    },
  };

  const handleAddPurchase = () => {
    navigate('/add-purchase');
  };

  if (loading) return <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>កំពុងផ្ទុកទំនិញ...</motion.p>;

  return (
    <motion.div
      className="product-table-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="product-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="header-content">
          <h2>ការទិញទំនិញ</h2>
          <div className="product-search-wrapper">
            <input
              type="text"
              placeholder="ស្វែងរកតាមផលិតផល ឬ លេខបាច់..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="product-search-input"
            />
          </div>
        </div>
        <div className="product-controls">
          <motion.button
            className="product-add-button"
            onClick={handleAddPurchase}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            បន្ថែមការទិញ
          </motion.button>
          <motion.button
            onClick={() => navigate('/stock-movements')}
            className="add-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ស្តុកផលិតផល
          </motion.button>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="export-select"
          >
            <option value="">ជ្រើសរើសទម្រង់ទាញយក</option>
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
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
            filename="purchases.csv"
            id="csv-link"
            style={{ display: 'none' }}
          />
        </div>
      </motion.div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredPurchases}
        pagination
        paginationPerPage={rowsPerPage}
        paginationRowsPerPageOptions={[10, 20, 30]}
        customStyles={customStyles}
        noDataComponent={<div className="no-results">គ្មានការទិញត្រូវនឹងលក្ខខណ្ឌស្វែងរក។</div>}
        highlightOnHover
        responsive
        progressPending={loading}
        progressComponent={<div className="loading">កំពុងផ្ទុកការទិញ...</div>}
      />
    </motion.div>
  );
};

export default Purchases;