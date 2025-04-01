import React from "react";
import { useLocation } from "react-router-dom";
import "./InvoiceDetail.css";

const InvoiceDetail = () => {
  const { state } = useLocation();
  const invoice = state?.invoice;

  if (!invoice) {
    return <div>No invoice data available.</div>;
  }

  // Utility functions to format numbers
  const formatCurrency = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const formatPercentage = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const formatNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  return (
    <div className="invoice-detail-container">
      <h1>Invoice Details</h1>

      {/* Customer Information */}
      <div className="invoice-info">
        <h2>Customer Information</h2>
        {invoice.customer ? (
          <>
            <p>
              <strong>Customer ID:</strong> {invoice.customer.customer_id}
            </p>
            <p>
              <strong>Name:</strong> {invoice.customer.first_name} {invoice.customer.last_name}
            </p>
            <p>
              <strong>Address:</strong> {invoice.customer.address || "-"}
              {invoice.customer.city ? `, ${invoice.customer.city}` : ""}
              {invoice.customer.country ? `, ${invoice.customer.country}` : ""}
            </p>
            <p>
              <strong>Phone:</strong> {invoice.customer.phone_number || "-"}
            </p>
          </>
        ) : (
          <p>No customer specified.</p>
        )}
      </div>

      {/* Rest of your component remains the same */}
      {/* Delivery Method Information */}
      <div className="invoice-info">
        <h2>Delivery Method</h2>
        {invoice.delivery_method ? (
          <>
            <p><strong>Delivery ID:</strong> {invoice.delivery_method.delivery_method_id}</p>
            <p><strong>Delivery Name:</strong> {invoice.delivery_method.delivery_name || "-"}</p>
            <p><strong>Car Number:</strong> {invoice.delivery_method.car_number || "-"}</p>
            <p><strong>Delivery Number:</strong> {invoice.delivery_method.delivery_number || "-"}</p>
          </>
        ) : (
          <p>No delivery method specified.</p>
        )}
      </div>

      {/* General Invoice Information */}
      <div className="invoice-info">
        <h2>Invoice Information</h2>
        <p><strong>Type:</strong> {invoice.type}</p>
        <p><strong>Status:</strong> {invoice.status}</p>
        <p><strong>Date:</strong> {invoice.date}</p>
        <p><strong>Due Date:</strong> {invoice.due_date}</p>
        <p><strong>Payment Method:</strong> {invoice.payment_method}</p>
        <p><strong>Notes:</strong> {invoice.notes || "-"}</p>
      </div>

      {/* Items Table */}
      <h2>Items</h2>
      <table className="items-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Size</th>
            <th>Color</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Discount (%)</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id}>
              <td>{item.product_name}</td>
              <td>{item.variant_size || "-"}</td>
              <td>{item.variant_color || "-"}</td>
              <td>{item.quantity}</td>
              <td>${formatCurrency(item.unit_price)}</td>
              <td>{formatPercentage(item.discount_percentage)}%</td>
              <td>${formatCurrency(item.total_price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="summary">
        <p><strong>Subtotal:</strong> ${formatCurrency(invoice.subtotal)}</p>
        <p><strong>Tax:</strong> ${formatCurrency(invoice.tax)}</p>
        <p><strong>Shipping Cost:</strong> ${formatCurrency(invoice.shipping_cost)}</p>
        <p><strong>Overall Discount:</strong> ${formatCurrency(invoice.overall_discount)}</p>
        <p><strong>Total (USD):</strong> ${formatCurrency(invoice.total)}</p>
        <p><strong>Total (KHR):</strong> ៛{formatNumber(invoice.total_in_riel).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default InvoiceDetail;