import React, { useState } from 'react';
import { useParams } from 'react-router-dom';


const CabinetTable = () => {
  const { warehouseId } = useParams();

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
            </tr>
          </thead>
          <tbody>
            {warehouseCabinets.map((cabinet) => (
              <tr key={cabinet.id}>
                <td>{cabinet.id}</td>
                <td>{cabinet.name}</td>
                <td>{cabinet.capacity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CabinetTable;