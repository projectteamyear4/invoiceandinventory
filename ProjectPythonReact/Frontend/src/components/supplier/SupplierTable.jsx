import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './SupplierTable.css'; // Create this CSS file

const SupplierTable = () => {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([
    { id: 1, name: 'ABC Corp', contact_person: 'John Doe', phone: '123-456-7890', email: 'john@abccorp.com', address: '123 Main St', country: 'USA', created_at: '2025-03-01 10:00:00' },
    { id: 2, name: 'XYZ Ltd', contact_person: 'Jane Smith', phone: '987-654-3210', email: 'jane@xyz.com', address: '456 Elm St', country: 'Canada', created_at: '2025-03-02 14:30:00' },
    { id: 3, name: 'Global Supplies', contact_person: 'Mark Lee', phone: '555-123-4567', email: 'mark@globalsupplies.com', address: '789 Oak St', country: 'UK', created_at: '2025-03-03 09:15:00' },
  ]);

  return (
    <div className="supplier-container">
      <h2>បញ្ជីអ្នកផ្គត់ផ្គង់</h2>
      <div className="action-bar">
        <button
          className="add-supplier-btn"
          onClick={() => navigate('/add-supplier')}
        >
          <FaPlus className="btn-icon" />
          បន្ថែមអ្នកផ្គត់ផ្គង់
        </button>
      </div>
      <div className="table-wrapper">
        <table className="supplier-table">
          <thead>
            <tr>
              <th>លេខសម្គាល់</th>
              <th>ឈ្មោះ</th>
              <th>អ្នកទំនាក់ទំនង</th>
              <th>ទូរស័ព្ទ</th>
              <th>អ៊ីមែល</th>
              <th>អាសយដ្ឋាន</th>
              <th>ប្រទេស</th>
              <th>បង្កើតនៅ</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td>{supplier.id}</td>
                <td>{supplier.name}</td>
                <td>{supplier.contact_person || '-'}</td> {/* Show '-' if null */}
                <td>{supplier.phone}</td>
                <td>{supplier.email || '-'}</td> {/* Show '-' if null */}
                <td>{supplier.address}</td>
                <td>{supplier.country || '-'}</td> {/* Show '-' if null */}
                <td>{new Date(supplier.created_at).toLocaleString()}</td> {/* Format timestamp */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupplierTable;