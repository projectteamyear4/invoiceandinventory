import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
// import './ShelfTable.css'; // Create this CSS file

const ShelfTable = () => {
  const { warehouseId, cabinetId } = useParams();

  const [shelves, setShelves] = useState([
    { id: 1, cabinet_id: 1, name: 'ធ្នើរ 1', capacity: 4000 },
    { id: 2, cabinet_id: 1, name: 'ធ្នើរ 2', capacity: 3000 },
    { id: 3, cabinet_id: 2, name: 'ធ្នើរ 1', capacity: 1000 },
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
            </tr>
          </thead>
          <tbody>
            {cabinetShelves.map((shelf) => (
              <tr key={shelf.id}>
                <td>{shelf.id}</td>
                <td>{shelf.name}</td>
                <td>{shelf.capacity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShelfTable;