import React, { useState } from "react";
import "./InvoiceForm.css";

const InvoiceForm = () => {
  const [formData, setFormData] = useState({
    type: "វិក្កយបត្រ", // Default to Invoice
    status: "បើក", // Default to Open
    date: "",
    dueDate: "",
    customerName: "",
    customerEmail: "",
    customerAddress1: "",
    customerTown: "",
    customerCountry: "",
    customerPhone: "",
    shippingName: "",
    shippingAddress1: "",
    shippingTown: "",
    shippingCountry: "",
    shippingPostcode: "",
    notes: "",
    paymentMethod: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form data submitted:", formData);
    alert("វិក្កយបត្របានបង្កើតដោយជោគជ័យ!"); // Invoice created successfully!
  };

  const paymentMethods = [
    { value: "សាច់ប្រាក់", label: "សាច់ប្រាក់" }, // Cash
    { value: "ផ្ទេរប្រាក់", label: "ផ្ទេរប្រាក់" }, // Bank Transfer
    { value: "កាតឥណទាន", label: "កាតឥណទាន" }, // Credit Card
    { value: "អេឡិចត្រូនិច", label: "ការទូទាត់អេឡិចត្រូនិច" }, // Electronic Payment
  ];

  return (
    <div className="invoice-container">
      <h1 className="invoice-title">
        <span className="title-highlight">បង្កើតថ្មី</span> វិក្កយបត្រ
      </h1>
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="select-section">
            <label className="select-label">ជ្រើសរើសប្រភេទ:</label>
            <div className="select-group">
              <select
                className="select-input"
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="វិក្កយបត្រ">វិក្កយបត្រ</option> {/* Invoice */}
                <option value="សម្រង់តម្លៃ">សម្រង់តម្លៃ</option> {/* Quote */}
              </select>
              <select
                className="select-input"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="បើក">បើក</option> {/* Open */}
                <option value="បិទ">បិទ</option> {/* Closed */}
              </select>
              <input
                type="date"
                className="date-input"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
              <input
                type="date"
                className="date-input"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-grid">
            <div className="form-section">
              <h2 className="section-title">កំណត់សម្គាល់</h2> {/* Notes */}
              <textarea
                className="form-textarea"
                placeholder="បញ្ចូលកំណត់សម្គាល់" // Enter Notes
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
              <div className="payment-section">
                <label className="payment-label">វិធីបង់ប្រាក់:</label> {/* Method of Payment */}
                <select
                  className="payment-select"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="">ជ្រើសរើសវិធីបង់ប្រាក់</option> {/* Select Payment Method */}
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-section">
              <div className="section-header">
                <h2 className="section-title">ព័ត៌មានអតិថិជន</h2> {/* Customer Information */}
                <a href="#select-customer" className="select-customer-link">ជ្រើសរើសអតិថិជន</a> {/* Select Customer */}
              </div>
              <input
                className="form-input"
                placeholder="បញ្ចូលឈ្មោះ" // Enter Name
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
              />
              <input
                className="form-input"
                placeholder="អាសយដ្ឋានអ៊ីមែល" // E-mail Address
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
              />
              <input
                className="form-input"
                placeholder="អាសយដ្ឋាន ១" // Address 1
                name="customerAddress1"
                value={formData.customerAddress1}
                onChange={handleChange}
              />
              <input
                className="form-input"
                placeholder="ទីប្រជុំជន" // Town
                name="customerTown"
                value={formData.customerTown}
                onChange={handleChange}
              />
              <input
                className="form-input"
                placeholder="ប្រទេស" // Country
                name="customerCountry"
                value={formData.customerCountry}
                onChange={handleChange}
              />
              <input
                className="form-input"
                placeholder="លេខទូរស័ព្ទ" // Phone Number
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
              />
            </div>
            <div className="form-section">
              <div className="section-header">
                <h2 className="section-title">ព័ត៌មានដឹកជញ្ជូន</h2> {/* Shipping Information */}
                <a href="#select-customer" className="select-customer-link">ជ្រើសរើសអតិថិជន</a> {/* Select Customer */}
              </div>
              <input
                className="form-input"
                placeholder="បញ្ចូលឈ្មោះ" // Enter Name
                name="shippingName"
                value={formData.shippingName}
                onChange={handleChange}
              />
              <input
                className="form-input"
                placeholder="អាសយដ្ឋាន ១" // Address 1
                name="shippingAddress1"
                value={formData.shippingAddress1}
                onChange={handleChange}
              />
              <input
                className="form-input"
                placeholder="ទីប្រជុំជន" // Town
                name="shippingTown"
                value={formData.shippingTown}
                onChange={handleChange}
              />
              <input
                className="form-input"
                placeholder="ប្រទេស" // Country
                name="shippingCountry"
                value={formData.shippingCountry}
                onChange={handleChange}
              />
              <input
                className="form-input"
                placeholder="លេខកូដប្រៃសណីយ៍" // Postcode
                name="shippingPostcode"
                value={formData.shippingPostcode}
                onChange={handleChange}
              />
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
                  <th className="table-header">តម្លៃឯកតា</th> {/* Unit Price */}
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
                    <input className="table-input" type="number" placeholder="$0.00" disabled /> {/* 0 */}
                  </td>
                  <td>
                    <input className="table-input" type="number" placeholder="៦" /> {/* 0 */}
                  </td>
                  <td>
                    <input className="table-input" placeholder="$៦.៦៦" disabled /> {/* $0.00 */}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Summary Section */}
            <div className="summary-section">
              <div className="summary-item">
                <span className="summary-label">សរុបរង:</span> {/* Subtotal */}
                <span className="summary-value">$៦.៦៦</span> {/* $0.00 */}
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
              <button type="submit" className="create-button">បង្កើតវិក្កយបត្រ</button> {/* Create Invoice */}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;