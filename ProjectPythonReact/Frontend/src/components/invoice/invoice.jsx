// InvoiceForm.jsx
import React from "react";
import "./InvoiceForm.css";

const InvoiceForm = () => {
  return (
    <div className="invoice-container">
      <h1 className="invoice-title">
        <span className="title-highlight">Create New</span> INVOICE
      </h1>
      <div className="form-card">
        <div className="select-section">
          <label className="select-label">Select Type:</label>
          <div className="select-group">
            <select className="select-input">
              <option>Invoice</option>
              <option>Quote</option>
            </select>
            <select className="select-input">
              <option>Open</option>
              <option>Closed</option>
            </select>
            <input type="date" className="date-input" />
            <input type="date" className="date-input" />
          </div>
        </div>
        <div className="form-grid">
          <div className="form-section">
            <h2 className="section-title">Customer Information</h2>
            <input className="form-input" placeholder="Enter Name" />
            <input className="form-input" placeholder="E-mail Address" />
            <input className="form-input" placeholder="Address 1" />
            <input className="form-input" placeholder="Address 2" />
            <input className="form-input" placeholder="Town" />
            <input className="form-input" placeholder="Country" />
            <input className="form-input" placeholder="Phone Number" />
          </div>
          <div className="form-section">
            <h2 className="section-title">Shipping Information</h2>
            <input className="form-input" placeholder="Enter Name" />
            <input className="form-input" placeholder="Address 1" />
            <input className="form-input" placeholder="Address 2" />
            <input className="form-input" placeholder="Town" />
            <input className="form-input" placeholder="Country" />
            <input className="form-input" placeholder="Postcode" />
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="product-table-card">
        <h2 className="product-table-title">Products</h2>
        <table className="product-table">
          <thead>
            <tr>
              <th className="table-header">Barcode</th>
              <th className="table-header">Name</th>
              <th className="table-header">Qty</th>
              <th className="table-header">Discount (%)</th>
              <th className="table-header">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <input className="table-input" placeholder="Barcode" />
              </td>
              <td>
                <input className="table-input" placeholder="Product Name" />
              </td>
              <td>
                <input className="table-input" type="number" placeholder="0" />
              </td>
              <td>
                <input className="table-input" type="number" placeholder="0" />
              </td>
              <td>
                <input className="table-input" placeholder="$0.00" disabled />
              </td>
            </tr>
          </tbody>
        </table>

        {/* Summary Section */}
        <div className="summary-section">
          <div className="summary-item">
            <span className="summary-label">Subtotal:</span>
            <span className="summary-value">$0.00</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Discount:</span>
            <span className="summary-value">$0.00</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Tax (Shipping):</span>
            <input
              type="number"
              className="summary-input"
              placeholder="0.00"
            />
          </div>
          <div className="summary-item">
            <label className="checkbox-label">
              <input type="checkbox" className="checkbox-input" />
              Remove Tax
            </label>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total:</span>
            <span className="summary-value">$0.00</span>
          </div>
          <button className="create-button">Create Invoice</button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;