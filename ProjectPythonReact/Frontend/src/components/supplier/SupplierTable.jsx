import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import { AuthContext } from '../AuthContext';
import './Supplier.css';

const SupplierTable = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate(); // Hook for navigation

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
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  const handleAddSupplier = () => {
    navigate('/add-supplier'); // Navigate to AddSupplier route
  };

  if (loading) return <p>Loading suppliers...</p>;

  return (
    <div className="supplier-table-container">
      <div className="supplier-header">
        <h2>Suppliers</h2>
        <button className="supplier-add-button" onClick={handleAddSupplier}>
          Add Supplier
        </button>
      </div>
      <table className="supplier-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Contact Person</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Address</th>
            <th>Country</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.id}>
              <td>{supplier.id}</td>
              <td>{supplier.name}</td>
              <td>{supplier.contact_person || '-'}</td>
              <td>{supplier.phone}</td>
              <td>{supplier.email || '-'}</td>
              <td>{supplier.address}</td>
              <td>{supplier.country}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierTable;