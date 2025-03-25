// src/components/Shelves.jsx
import axios from 'axios';
import html2canvas from 'html2canvas';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useNavigate, useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { AuthContext } from '../AuthContext';
import './Shelf.css';

const Shelves = () => {
  const [shelves, setShelves] = useState([]);
  const [filteredShelves, setFilteredShelves] = useState([]);
  const [warehouseName, setWarehouseName] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [exportFormat, setExportFormat] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { warehouseId } = useParams();
  const tableRef = useRef(null);

  const api = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  useEffect(() => {
    setShelves([]);
    setFilteredShelves([]);
    setWarehouseName('');
    setMessage('');
    setSearchTerm('');
    setSortConfig({ key: null, direction: 'asc' });
    setLoading(true);

    const fetchData = async () => {
      try {
        console.log('Warehouse ID from URL:', warehouseId);
        const [shelvesResponse, warehouseResponse] = await Promise.all([
          api.get(`/api/shelves/?warehouse=${warehouseId}`),
          api.get(`/api/warehouses/${warehouseId}/`),
        ]);
        console.log(`API Response for warehouseId ${warehouseId}:`, shelvesResponse.data);
        setShelves(shelvesResponse.data);
        setFilteredShelves(shelvesResponse.data);
        setWarehouseName(warehouseResponse.data.name);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 404) {
          setMessage('ឃ្លាំងនេះមិនមានទេ។');
        } else {
          setMessage('មិនអាចទាញយកធ្នើរបានទេ។');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [warehouseId]);

  useEffect(() => {
    const filtered = shelves
      .filter((shelf) => shelf.warehouse === parseInt(warehouseId))
      .filter((shelf) =>
        (
          shelf.shelf_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (shelf.section && shelf.section.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (shelf.warehouse_name && shelf.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    console.log('Filtered Shelves:', filtered);
    setFilteredShelves(filtered);
  }, [searchTerm, shelves, warehouseId]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredShelves].sort((a, b) => {
      const aValue = a[key] || '';
      const bValue = b[key] || '';
      if (key === 'id' || key === 'capacity' || key === 'total_quantity') {
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
    setFilteredShelves(sorted);
  };

  const exportHeaders = [
    { label: 'ID', key: 'id' },
    { label: 'ឈ្មោះឃ្លាំង', key: 'warehouse_name' },
    { label: 'ឈ្មោះធ្នើរ', key: 'shelf_name' },
    { label: 'ផ្នែក', key: 'section' },
    { label: 'សមត្ថភាព', key: 'capacity' },
    { label: 'បរិមាណស្តុក', key: 'total_quantity' }, // New column for total quantity
    { label: 'បានបង្កើតនៅ', key: 'created_at' },
  ];

  const exportData = filteredShelves.map((shelf) => ({
    id: shelf.id,
    warehouse_name: shelf.warehouse_name || '-',
    shelf_name: shelf.shelf_name,
    section: shelf.section || '-',
    capacity: shelf.capacity || '-',
    total_quantity: `${shelf.total_quantity || 0}/${shelf.capacity || 0}`, // Display as fraction
    created_at: new Date(shelf.created_at).toLocaleDateString(),
  }));

  const downloadAsPNG = () => {
    if (tableRef.current) {
      html2canvas(tableRef.current).then((canvas) => {
        const link = document.createElement('a');
        link.download = 'shelves-table.png';
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
        link.download = 'shelves-table.svg';
        link.href = URL.createObjectURL(blob);
        link.click();
      });
    }
  };

  const downloadAsExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Shelves');
    XLSX.utils.sheet_add_aoa(worksheet, [exportHeaders.map((header) => header.label)], { origin: 'A1' });
    XLSX.writeFile(workbook, 'shelves.xlsx');
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

  const handleAddShelf = () => {
    navigate(`/add-shelf/${warehouseId}`);
  };

  const handleEditShelf = (id) => {
    navigate(`/edit-shelf/${id}`);
  };

  const handleDeleteShelf = async (id) => {
    if (window.confirm('តើអ្នកប្រាកដទេថាចង់លុបធ្នើរនេះ?')) {
      try {
        await api.delete(`/api/shelves/${id}/`);
        setShelves(shelves.filter((s) => s.id !== id));
        setFilteredShelves(filteredShelves.filter((s) => s.id !== id));
        setMessage('ធ្នើរត្រូវបានលុបដោយជោគជ័យ!');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting shelf:', error);
        setMessage('មិនអាចលុបធ្នើរបានទេ។');
      }
    }
  };

  const handleBackToWarehouses = () => {
    navigate('/warehouses');
  };

  if (message === 'ឃ្លាំងនេះមិនមានទេ។') {
    return (
      <div className="shelf-container">
        <h2>កំហុស</h2>
        <p>{message}</p>
        <button className="back-button" onClick={() => navigate('/warehouses')}>
          ត្រឡប់ទៅឃ្លាំង
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-spinner">
        <p>កំពុងផ្ទុកធ្នើរ...</p>
      </div>
    );
  }

  return (
    <div className="shelf-container">
      <div className="shelf-header">
        <h2>ធ្នើរសម្រាប់ឃ្លាំង: {warehouseName || `ID: ${warehouseId}`}</h2>
        <div className="shelf-controls">
          <input
            type="text"
            placeholder="ស្វែងរកតាមឈ្មោះធ្នើរ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="shelf-search-input"
          />
          <button className="shelf-add-button" onClick={handleAddShelf}>
            បន្ថែមធ្នើរ
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
            filename="shelves.csv"
            id="csv-link"
            style={{ display: 'none' }}
          />
          <button className="back-button" onClick={handleBackToWarehouses}>
            ត្រឡប់ទៅឃ្លាំង
          </button>
        </div>
      </div>
      {message && (
        <p className={`shelf-message ${message.includes('ជោគជ័យ') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}
      {filteredShelves.length === 0 ? (
        <div className="no-shelves">
          <p>មិនមានធ្នើរសម្រាប់ឃ្លាំងនេះទេ។ សូមបន្ថែមធ្នើរថ្មី!</p>
          <button className="shelf-add-button" onClick={handleAddShelf}>
            បន្ថែមធ្នើរ
          </button>
        </div>
      ) : (
        <table className="shelf-table" ref={tableRef}>
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} className={sortConfig.key === 'id' ? sortConfig.direction : ''}>
                ID
              </th>
              <th onClick={() => handleSort('warehouse_name')} className={sortConfig.key === 'warehouse_name' ? sortConfig.direction : ''}>
                ឈ្មោះឃ្លាំង
              </th>
              <th onClick={() => handleSort('shelf_name')} className={sortConfig.key === 'shelf_name' ? sortConfig.direction : ''}>
                ឈ្មោះធ្នើរ
              </th>
              <th onClick={() => handleSort('section')} className={sortConfig.key === 'section' ? sortConfig.direction : ''}>
                ផ្នែក
              </th>
              <th onClick={() => handleSort('capacity')} className={sortConfig.key === 'capacity' ? sortConfig.direction : ''}>
                សមត្ថភាព
              </th>
              <th onClick={() => handleSort('total_quantity')} className={sortConfig.key === 'total_quantity' ? sortConfig.direction : ''}>
                បរិមាណស្តុក
              </th>
              <th onClick={() => handleSort('created_at')} className={sortConfig.key === 'created_at' ? sortConfig.direction : ''}>
                បានបង្កើតនៅ
              </th>
              <th>សកម្មភាព</th>
            </tr>
          </thead>
          <tbody>
            {filteredShelves.map((shelf) => (
              <tr key={shelf.id}>
                <td>{shelf.id}</td>
                <td>{shelf.warehouse_name || '-'}</td>
                <td>{shelf.shelf_name}</td>
                <td>{shelf.section || '-'}</td>
                <td>{shelf.capacity || '-'}</td>
                <td>{`${shelf.total_quantity || 0}/${shelf.capacity || 0}`}</td>
                <td>{new Date(shelf.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className="shelf-edit-button"
                    onClick={() => handleEditShelf(shelf.id)}
                  >
                    កែប្រែ
                  </button>
                  <button
                    className="shelf-delete-button"
                    onClick={() => handleDeleteShelf(shelf.id)}
                  >
                    លុប
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Shelves;