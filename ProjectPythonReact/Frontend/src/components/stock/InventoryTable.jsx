import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import './WarehouseTable.css';

const InventoryTable = () => {
  const { warehouseId, cabinetId, shelfId } = useParams();

  const [inventory, setInventory] = useState([
    { id: 1, shelf_id: 1, product: 'Nike Air Max', quantity: 100 },
    { id: 2, shelf_id: 1, product: 'Adidas Shorts', quantity: 50 },
    { id: 3, shelf_id: 2, product: 'Gucci Bag', quantity: 30 },
  ]);

  const shelfInventory = inventory.filter(
    (item) => item.shelf_id === parseInt(shelfId)
  );

  return (
    <div className="inventory-container">
      <h2>ស្តុកនៃធ្នើរ {shelfId} (ទូ {cabinetId}, ឃ្លាំង {warehouseId})</h2>
      <div className="table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>លេខសម្គាល់</th>
              <th>លេខសម្គាល់ធ្នើរ</th>
              <th>ផលិតផល</th>
              <th>បរិមាណ</th>
            </tr>
          </thead>
          <tbody>
            {shelfInventory.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.shelf_id}</td>
                <td>{item.product}</td>
                <td>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;