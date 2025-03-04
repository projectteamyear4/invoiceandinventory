import React, { useState } from 'react';
import './WarehouseTable.css';

const WarehouseTable = () => {
  // Sample data (you'd typically fetch this from an API)
  const [warehouses, setWarehouses] = useState([
    { id: 1, name: "Central Hub", location: "New York", capacity: 10000 },
    { id: 2, name: "West Coast", location: "Los Angeles", capacity: 7500 },
    { id: 3, name: "East Storage", location: "Boston", capacity: 5000 },
  ]);



  return (
    <div className="warehouse-container">
      <h2>Warehouse Inventory</h2>
      <table className="warehouse-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Location</th>
            <th>Capacity</th>
          </tr>
        </thead>
        <tbody>
          {warehouses.map(warehouse => (
            <tr key={warehouse.id}>
              <td>{warehouse.id}</td>
              <td>{warehouse.name}</td>
              <td>{warehouse.location}</td>
              <td>{warehouse.capacity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WarehouseTable;