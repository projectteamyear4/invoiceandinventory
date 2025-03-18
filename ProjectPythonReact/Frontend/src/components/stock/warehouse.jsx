import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './WarehouseTable.css';

const WarehouseTable = () => {
  const [warehouses, setWarehouses] = useState([
    { id: 1, name: 'រំដួល', location: 'ភ្នំពេញ', capacity: 10000 },
  ]);

  const navigate = useNavigate(); // Define navigate function

  return (
    <div className="warehouse-container">
      <h2>បញ្ជីឃ្លាំងទំនិញ</h2>
      <div className="table-wrapper">
        <table className="warehouse-table">
          <thead>
            <tr>
              <th>លេខសម្គាល់</th>
              <th>ឈ្មោះ</th>
              <th>ទីតាំង</th>
              <th>សមត្ថភាព</th>
              <th>សកម្មភាព</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map((warehouse) => (
              <tr key={warehouse.id}>
                <td>{warehouse.id}</td>
                <td>{warehouse.name}</td>
                <td>{warehouse.location}</td>
                <td>{warehouse.capacity}</td>
                <td>
                <button
                    className="inventory-btn"
                    onClick={() => navigate(`/cabinets/${warehouse.id}`)} // Navigate to CabinetTable
                  >
                    មើលបញ្ជីទូ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WarehouseTable;