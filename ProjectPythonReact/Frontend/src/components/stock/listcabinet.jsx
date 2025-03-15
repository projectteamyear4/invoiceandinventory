import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa'; // Optional: for a cool icon
import { useNavigate, useParams } from 'react-router-dom'; // Add useNavigate


const CabinetTable = () => {
  const { warehouseId } = useParams();
  const navigate = useNavigate(); // Initialize navigate for navigation

  const [cabinets, setCabinets] = useState([
    { id: 1, warehouse_id: 1, name: 'ទូ A1', capacity: 8000 },
    { id: 2, warehouse_id: 1, name: 'ទូ A2', capacity: 2000 },
  ]);

  const warehouseCabinets = cabinets.filter(
    (cabinet) => cabinet.warehouse_id === parseInt(warehouseId)
  );

  return (
    <div className="cabinet-container">
      <h2>បញ្ជីទូនៃឃ្លាំង {warehouseId}</h2>
      <div className="table-wrapper">
        <table className="cabinet-table">
          <thead>
            <tr>
              <th>លេខសម្គាល់</th>
              <th>ឈ្មោះ</th>
              <th>សមត្ថភាព</th>
              <th>សកម្មភាព</th> {/* New column for actions */}
            </tr>
          </thead>
          <tbody>
            {warehouseCabinets.map((cabinet) => (
              <tr key={cabinet.id}>
                <td>{cabinet.id}</td>
                <td>{cabinet.name}</td>
                <td>{cabinet.capacity}</td>
                <td>
                  <button
                    className="view-shelf-btn"
                    onClick={() => navigate(`/shelves/${warehouseId}/${cabinet.id}`)} // Navigate to shelves
                  >
                    <FaPlus className="btn-icon" /> {/* Optional icon */}
                    មើលធ្នើរ
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

export default CabinetTable;