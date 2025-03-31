import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import './Customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState({
    id: true, // Changed from customer_id to id
    first_name: true,
    last_name: true,
    email: true,
    phone_number: true,
    phone_number2: true,
    address: true,
    city: true,
    country: true,
    order_history: true,
    status: true,
    registration_date: true,
    actions: true,
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
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
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, customers]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDelete = async (customerId) => {
    if (!window.confirm('តើអ្នកចង់លុបអតិថិជននេះឬ?')) return;

    try {
      await api.delete(`/api/customers/${customerId}/`);
      setCustomers(customers.filter((customer) => customer.id !== customerId)); // Changed customer_id to id
      setFilteredCustomers(filteredCustomers.filter((customer) => customer.id !== customerId)); // Changed customer_id to id
    } catch (err) {
      console.error('Delete error:', err);
      alert('មិនអាចលុបអតិថិជនបានទេ។');
    }
  };

  const toggleColumn = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
  };

  const columns = useMemo(
    () => [
      {
        name: 'ID',
        selector: (row) => row.id, // Changed customer_id to id
        sortable: true,
        width: '80px',
        omit: !visibleColumns.id, // Changed customer_id to id
      },
      {
        name: 'ឈ្មោះ',
        selector: (row) => row.first_name,
        sortable: true,
        omit: !visibleColumns.first_name,
      },
      {
        name: 'នាមត្រកូល',
        selector: (row) => row.last_name,
        sortable: true,
        omit: !visibleColumns.last_name,
      },
      {
        name: 'អ៊ីមែល',
        selector: (row) => row.email,
        sortable: true,
        omit: !visibleColumns.email,
      },
      {
        name: 'លេខទូរស័ព្ទ',
        selector: (row) => row.phone_number || '-',
        omit: !visibleColumns.phone_number,
      },
      {
        name: 'លេខទូរស័ព្ទ ២',
        selector: (row) => row.phone_number2 || '-',
        omit: !visibleColumns.phone_number2,
      },
      {
        name: 'អាសយដ្ឋាន',
        selector: (row) => row.address || '-',
        omit: !visibleColumns.address,
      },
      {
        name: 'ទីក្រុង',
        selector: (row) => row.city || '-',
        omit: !visibleColumns.city,
      },
      {
        name: 'ប្រទេស',
        selector: (row) => row.country || '-',
        omit: !visibleColumns.country,
      },
      {
        name: 'ប្រវត្តិការបញ្ជាទិញ',
        selector: (row) => row.order_history,
        sortable: true,
        omit: !visibleColumns.order_history,
      },
      {
        name: 'ស្ថានភាព',
        selector: (row) => row.status,
        sortable: true,
        omit: !visibleColumns.status,
      },
      {
        name: 'កាលបរិច្ឆេទចុះឈ្មោះ',
        selector: (row) => new Date(row.registration_date).toLocaleDateString(),
        sortable: true,
        omit: !visibleColumns.registration_date,
      },
      {
        name: 'សកម្មភាព',
        cell: (row) => (
          <div className="action-buttons">
            <motion.button
              className="customer-edit-button"
              onClick={() => navigate(`/edit-customer/${row.id}`)} // Changed customer_id to id
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              កែប្រែ
            </motion.button>
            <motion.button
              className="customer-delete-button"
              onClick={() => handleDelete(row.id)} // Changed customer_id to id
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              លុប
            </motion.button>
          </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
        omit: !visibleColumns.actions,
      },
    ],
    [navigate, visibleColumns]
  );

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
        '&:hover': {
          background: '#0056b3',
          cursor: 'pointer',
        },
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

  if (error) return <motion.p className="error-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>{error}</motion.p>;

  return (
    <motion.div
      className="customer-table-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="customer-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h2>អតិថិជន</h2>
        <motion.button
          className="customer-add-button"
          onClick={() => navigate('/add-customer')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          បន្ថែមអតិថិជនថ្មី
        </motion.button>
      </motion.div>

      <motion.div
        className="customer-controls"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="customer-search-wrapper">
          <input
            type="text"
            placeholder="ស្វែងរកអតិថិជន..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="customer-search-input"
          />
        </div>
        <div className="column-selector" ref={dropdownRef}>
          <label>ជ្រើសរើសជួរឈរ: </label>
          <div className="custom-dropdown">
            <button
              className="dropdown-toggle"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              ជ្រើសរើសជួរឈរ {isDropdownOpen ? '▲' : '▼'}
            </button>
            {isDropdownOpen && (
              <motion.div
                className="dropdown-menu"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {Object.keys(visibleColumns).map((column) => (
                  <label key={column} className="dropdown-item">
                    <input
                      type="checkbox"
                      checked={visibleColumns[column]}
                      onChange={() => toggleColumn(column)}
                    />
                    {column === 'id' ? 'ID' : // Changed customer_id to id
                     column === 'first_name' ? 'ឈ្មោះ' :
                     column === 'last_name' ? 'នាមត្រកូល' :
                     column === 'email' ? 'អ៊ីមែល' :
                     column === 'phone_number' ? 'លេខទូរស័ព្ទ' :
                     column === 'phone_number2' ? 'លេខទូរ�ส័ព្ទ ២' :
                     column === 'address' ? 'អាសយដ្ឋាន' :
                     column === 'city' ? 'ទីក្រុង' :
                     column === 'country' ? 'ប្រទេស' :
                     column === 'order_history' ? 'ប្រវត្តិការបញ្ជាទិញ' :
                     column === 'status' ? 'ស្ថានភាព' :
                     column === 'registration_date' ? 'កាលបរិច្ឆេទចុះឈ្មោះ' :
                     column === 'actions' ? 'សកម្មភាព' : column}
                  </label>
                ))}
              </motion.div>
            )}
          </div>
        </div>
        <div className="per-page-selector">
          <label>បង្ហាញក្នុងមួយទំព័រ: </label>
          <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </motion.div>

      <DataTable
        columns={columns}
        data={filteredCustomers}
        pagination
        paginationPerPage={rowsPerPage}
        paginationRowsPerPageOptions={[10, 20, 50]}
        customStyles={customStyles}
        noDataComponent={<div className="no-results">គ្មានអតិថិជនត្រូវនឹងលក្ខខណ្ឌស្វែងរក។</div>}
        highlightOnHover
        responsive
        progressPending={loading}
        progressComponent={<div className="loading">កំពុងផ្ទុកអតិថិជន...</div>}
      />
    </motion.div>
  );
};

export default Customers;