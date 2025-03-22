import React, { useState } from 'react';
import { useParams } from 'react-router-dom';


const StockMovementTable = () => {
  const { warehouseId } = useParams();

  const [movements, setMovements] = useState([
    { id: 1, warehouse_id: 1, product: 'Nike Air Max', type: 'In', quantity: 50, date: '2025-03-15' },
    { id: 2, warehouse_id: 1, product: 'Adidas Shorts', type: 'Out', quantity: 20, date: '2025-03-16' },
  ]);

  const warehouseMovements = movements.filter(
    (movement) => movement.warehouse_id === parseInt(warehouseId)
  );

  return (
    <div className="stock-movement-container">
      <h2>ចលនាស្តុកនៃឃ្លាំង {warehouseId}</h2>
      <div className="table-wrapper">
        <table className="stock-movement-table">
          <thead>
            <tr>
              <th>លេខសម្គាល់</th>
              <th>ផលិតផល</th>
              <th>ប្រភេទ</th>
              <th>បរិមាណ</th>
              <th>កាលបរិច្ឆេទ</th>
            </tr>
          </thead>
          <tbody>
            {warehouseMovements.map((movement) => (
              <tr key={movement.id}>
                <td>{movement.id}</td>
                <td>{movement.product}</td>
                <td>{movement.type}</td>
                <td>{movement.quantity}</td>
                <td>{movement.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockMovementTable;