import React from "react";
import "./InvoiceForm.css";

const InvoiceForm = () => {
  return (
    <div className="invoice-container">
      <h1 className="invoice-title">
        <span className="title-highlight">បង្កើតថ្មី</span> វិក្កយបត្រ
      </h1>
      <div className="form-card">
        <div className="select-section">
          <label className="select-label">ជ្រើសរើសប្រភេទ:</label>
          <div className="select-group">
            <select className="select-input">
              <option>វិក្កយបត្រ</option> {/* Invoice */}
              <option>សម្រង់តម្លៃ</option> {/* Quote */}
            </select>
            <select className="select-input">
              <option>បើក</option> {/* Open */}
              <option>បិទ</option> {/* Closed */}
            </select>
            <input type="date" className="date-input" />
            <input type="date" className="date-input" />
          </div>
        </div>
        <div className="form-grid">
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">ព័ត៌មានអតិថិជន</h2> {/* Customer Information */}
              <a href="#select-customer" className="select-customer-link">ជ្រើសរើសអតិថិជន</a> {/* Select Customer */}
            </div>
            <input className="form-input" placeholder="បញ្ចូលឈ្មោះ" /> {/* Enter Name */}
            <input className="form-input" placeholder="អាសយដ្ឋានអ៊ីមែល" /> {/* E-mail Address */}
            <input className="form-input" placeholder="អាសយដ្ឋាន ១" /> {/* Address 1 */}
            <input className="form-input" placeholder="ទីប្រជុំជន" /> {/* Town */}
            <input className="form-input" placeholder="ប្រទេស" /> {/* Country */}
            <input className="form-input" placeholder="លេខទូរស័ព្ទ" /> {/* Phone Number */}
          </div>
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">ព័ត៌មានដឹកជញ្ជូន</h2> {/* Shipping Information */}
              <a href="#select-customer" className="select-customer-link">ជ្រើសរើសអតិថិជន</a> {/* Select Customer */}
            </div>
            <input className="form-input" placeholder="បញ្ចូលឈ្មោះ" /> {/* Enter Name */}
            <input className="form-input" placeholder="អាសយដ្ឋាន ១" /> {/* Address 1 */}
            <input className="form-input" placeholder="ទីប្រជុំជន" /> {/* Town */}
            <input className="form-input" placeholder="ប្រទេស" /> {/* Country */}
            <input className="form-input" placeholder="លេខកូដប្រៃសណីយ៍" /> {/* Postcode */}
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="product-table-card">
        <h2 className="product-table-title">ផលិតផល</h2> {/* Products */}
        <table className="product-table">
          <thead>
            <tr>
              <th className="table-header">បាកូដ</th> {/* Barcode */}
              <th className="table-header">ឈ្មោះ</th> {/* Name */}
              <th className="table-header">បរិមាណ</th> {/* Qty */}
              <th className="table-header">តម្លៃឯកតា</th> {/* Qty */}
              <th className="table-header">បញ្ចុះតម្លៃ (%)</th> {/* Discount (%) */}
              <th className="table-header">សរុប</th> {/* Total */}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <input className="table-input" placeholder="បាកូដ" /> {/* Barcode */}
              </td>
              <td>
                <input className="table-input" placeholder="ឈ្មោះផលិតផល" /> {/* Product Name */}
              </td>
              <td>
                <input className="table-input" type="number" placeholder="០" /> {/* 0 */}
              </td>
              <td>
                <input className="table-input" type="number" placeholder="$0.00"disabled /> {/* 0 */}
              </td>
              <td>
                <input className="table-input" type="number" placeholder="០" /> {/* 0 */}
              </td>
              <td>
                <input className="table-input" placeholder="$០.០៦" disabled /> {/* $0.00 */}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Summary Section */}
        <div className="summary-section">
          <div className="summary-item">
            <span className="summary-label">សរុបរង:</span> {/* Subtotal */}
            <span className="summary-value">$០.០៦</span> {/* $0.00 */}
          </div>
          <div className="summary-item">
            <span className="summary-label">បញ្ចុះតម្លៃ:</span> {/* Discount */}
            <span className="summary-value">$៦.៦៦</span> {/* $0.00 */}
          </div>
          <div className="summary-item">
            <span className="summary-label"> (ដឹកជញ្ជូន):</span> {/* (Shipping) */}
            <input
              type="number"
              className="summary-input"
              placeholder="៦.៦៦" 
            />
          </div>
          <div className="summary-item">
            <span className="summary-label">ពន្ធ:</span> {/* TAX */}
            <span className="summary-value">$៦.៦៦</span> {/* $0.00 */}
          </div>
          <div className="summary-item">
            <label className="checkbox-label">
              <input type="checkbox" className="checkbox-input" />
              ដកពន្ធ {/* Remove Tax */}
            </label>
          </div>
          <div className="summary-item">
            <span className="summary-label">សរុប:</span> {/* Total */}
            <span className="summary-value">$៦.៦៦</span> {/* $0.00 */}
          </div>
          <div className="summary-item">
            <span className="summary-label">សរុប:</span> {/* Total */}
            <span className="summary-value">៛42000</span> {/* $0.00 */}
          </div>
          <button className="create-button">បង្កើតវិក្កយបត្រ</button> {/* Create Invoice */}
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;