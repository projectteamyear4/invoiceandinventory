// src/components/SupplierTable.jsx
import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Supplier.css';

const SupplierTable = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    name: true,
    contact_person: true,
    phone: true,
    email: true,
    address: true,
    country: true,
    actions: true,
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useContext(AuthContext);
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
  }, [searchTerm, suppliers]);

  // Handle clicks outside the dropdown to close it
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

  const toggleColumn = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
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

  // Define columns for the DataTable
  const columns = useMemo(
    () => [
      {
        name: 'លេខសំគាល់',
        selector: (row) => row.id,
        sortable: true,
        width: '100px',
        omit: !visibleColumns.id,
      },
      {
        name: 'ឈ្មោះ',
        selector: (row) => row.name,
        sortable: true,
        omit: !visibleColumns.name,
      },
      {
        name: 'អ្នកទាក់ទង',
        selector: (row) => row.contact_person || '-',
        sortable: true,
        omit: !visibleColumns.contact_person,
      },
      {
        name: 'ទូរស័ព្ទ',
        selector: (row) => row.phone,
        sortable: true,
        omit: !visibleColumns.phone,
      },
      {
        name: 'អ៊ីមែល',
        selector: (row) => row.email || '-',
        omit: !visibleColumns.email,
      },
      {
        name: 'អាសយដ្ឋាន',
        selector: (row) => row.address,
        omit: !visibleColumns.address,
      },
      {
        name: 'ប្រទេស',
        selector: (row) => row.country,
        sortable: true,
        omit: !visibleColumns.country,
      },
      {
        name: 'សកម្មភាព',
        cell: (row) => (
          <div className="action-buttons">
            <motion.button
              className="supplier-edit-button"
              onClick={() => handleEditSupplier(row.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              កែប្រែ
            </motion.button>
            <motion.button
              className="supplier-delete-button"
              onClick={() => handleDeleteSupplier(row.id)}
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
    [visibleColumns]
  );

  // Custom styles for the DataTable to match Supplier.css
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

      {/* Controls (Search, Column Selector, Per Page Selector) */}
      <motion.div
        className="supplier-controls"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="supplier-search-wrapper">
         
          <input
            type="text"
            placeholder="ស្វែងរកតាមឈ្មោះ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="supplier-search-input"
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
                    {column === 'id' ? 'លេខសំគាល់' :
                     column === 'name' ? 'ឈ្មោះ' :
                     column === 'contact_person' ? 'អ្នកទាក់ទង' :
                     column === 'phone' ? 'ទូរស័ព្ទ' :
                     column === 'email' ? 'អ៊ីមែល' :
                     column === 'address' ? 'អាសយដ្ឋាន' :
                     column === 'country' ? 'ប្រទេស' :
                     column === 'actions' ? 'សកម្មភាព' : column}
                  </label>
                ))}
              </motion.div>
            )}
          </div>
        </div>
     
      </motion.div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredSuppliers}
        pagination
        paginationPerPage={rowsPerPage}
        paginationRowsPerPageOptions={[10, 20, 30]}
        customStyles={customStyles}
        noDataComponent={<div className="no-results">គ្មានអ្នកផ្គត់ផ្គង់ត្រូវនឹងលក្ខខណ្ឌស្វែងរក។</div>}
        highlightOnHover
        responsive
        progressPending={loading}
        progressComponent={<div className="loading">កំពុងផ្ទុកអ្នកផ្គត់ផ្គង់...</div>}
      />
    </motion.div>
  );
};

export default SupplierTable;