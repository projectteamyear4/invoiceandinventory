import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa'; // Added for button icon
import { useNavigate, useParams } from 'react-router-dom'; // Added useNavigate
import './WarehouseTable.css';

const ShelfTable = () => {
  const { warehouseId, cabinetId } = useParams();
  const navigate = useNavigate(); // Initialize navigate for routing

  const [shelves, setShelves] = useState([
    { id: 1, cabinet_id: 1, name: 'ធ្នើរ 1', capacity: 2000, usedCapacity: 300 },
    { id: 2, cabinet_id: 1, name: 'ធ្នើរ 2', capacity: 2000, usedCapacity: 500 },
    { id: 3, cabinet_id: 1, name: 'ធ្នើរ 3', capacity: 2000, usedCapacity: 150 },
    { id: 4, cabinet_id: 1, name: 'ធ្នើរ 4', capacity: 2000, usedCapacity: 700 },
    { id: 5, cabinet_id: 2, name: 'ធ្នើរ 1', capacity: 2000, usedCapacity: 400 },
  ]);

  const cabinetShelves = shelves.filter(
    (shelf) => shelf.cabinet_id === parseInt(cabinetId)
  );

  return (
    <div className="shelf-container">
      <h2>បញ្ជីធ្នើរនៃទូ {cabinetId} (ឃ្លាំង {warehouseId})</h2>
      <div className="table-wrapper">
        <table className="shelf-table">
          <thead>
            <tr>
              <th>លេខសម្គាល់</th>
              <th>ឈ្មោះ</th>
              <th>សមត្ថភាព</th>
              <th>សកម្មភាព</th> {/* New column for actions */}
            </tr>
          </thead>
          <tbody>
            {cabinetShelves.map((shelf) => (
              <tr key={shelf.id}>
                <td>{shelf.id}</td>
                <td>{shelf.name}</td>
                <td>{shelf.usedCapacity}/{shelf.capacity}</td> {/* Display as fraction */}
                <td>
                  <button
                    className="inventory-btn"
                    onClick={() => navigate(`/inventory/${warehouseId}/${cabinetId}/${shelf.id}`)}
                  >
                    <FaPlus className="btn-icon" />
                    មើលស្តុក
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

export default ShelfTable;