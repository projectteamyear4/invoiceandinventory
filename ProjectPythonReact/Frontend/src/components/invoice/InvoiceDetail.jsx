import React from "react";
import { useLocation } from "react-router-dom";
import "./InvoiceDetail.css";

const InvoiceDetail = () => {
  const { state } = useLocation();
  const invoice = state?.invoice;

  if (!invoice) {
    return <div className="no-data">No invoice data available.</div>;
  }

  // Formatting utilities
  const formatCurrency = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? "0.00" : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatPercentage = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      paid: "badge-success",
      unpaid: "badge-warning",
      overdue: "badge-danger",
      draft: "badge-secondary",
      partial: "badge-info"
    };
    return <span className={`badge ${statusClasses[status.toLowerCase()] || 'badge-primary'}`}>{status}</span>;
  };

  return (
    <div className="invoice-container">
      {/* Invoice Header with Company Info */}
      <div className="invoice-header">
        <div className="invoice-title">
          <h1>INVOICE</h1>
          <div className="company-info-header">
            <p className="company-name">Your Company Name</p>
            <p>123 Business Street</p>
            <p>City, State ZIP</p>
            <p>Country</p>
            <p>contact@yourcompany.com</p>
            <p>+123 456 7890</p>
          </div>
        </div>
        <div className="invoice-header-right">
          <p className="invoice-number">#{invoice.invoice_id || "N/A"}</p>
          <div className="invoice-status">
            {getStatusBadge(invoice.status)}
          </div>
        </div>
      </div>

      {/* Invoice Meta */}
      <div className="invoice-meta">
        <div className="meta-item">
          <span>Date Issued:</span>
          <strong>{formatDate(invoice.date)}</strong>
        </div>
        <div className="meta-item">
          <span>Due Date:</span>
          <strong>{formatDate(invoice.due_date)}</strong>
        </div>
        <div className="meta-item">
          <span>Payment Method:</span>
          <strong>{invoice.payment_method || "N/A"}</strong>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="invoice-columns">
        {/* Left Column - Customer Info */}
        <div className="invoice-section">
          <div className="to">
            <h3>Bill To</h3>
            {invoice.customer ? (
              <div className="customer-info">
                <p className="customer-name">{invoice.customer.first_name} {invoice.customer.last_name}</p>
                <p>{invoice.customer.address || "No address provided"}</p>
                {invoice.customer.city && <p>{invoice.customer.city}</p>}
                {invoice.customer.country && <p>{invoice.customer.country}</p>}
                {invoice.customer.phone_number && <p>{invoice.customer.phone_number}</p>}
              </div>
            ) : (
              <p>No customer specified</p>
            )}
          </div>
        </div>

        {/* Right Column - Delivery */}
        {invoice.delivery_method && (
          <div className="invoice-section delivery-section">
            <h3>Delivery Information</h3>
            <div className="delivery-info">
              <p><span>Method:</span> {invoice.delivery_method.delivery_name || "N/A"}</p>
              <p><span>Car Number:</span> {invoice.delivery_method.car_number || "N/A"}</p>
              <p><span>Tracking Number:</span> {invoice.delivery_method.delivery_number || "N/A"}</p>
            </div>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="invoice-section">
        <h3>Items</h3>
        <div className="table-responsive">
          <table className="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Size</th>
                <th>Color</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Unit Price</th>
                <th className="text-right">Discount</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={`${item.id}-${index}`}>
                  <td>{item.product_name || "Unnamed Product"}</td>
                  <td>{item.variant_size || "-"}</td>
                  <td>{item.variant_color || "-"}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">${formatCurrency(item.unit_price)}</td>
                  <td className="text-right">{formatPercentage(item.discount_percentage)}%</td>
                  <td className="text-right">${formatCurrency(item.total_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes (if any) */}
      {invoice.notes && (
        <div className="invoice-section notes-section">
          <h3>Notes</h3>
          <p className="notes-content">{invoice.notes}</p>
        </div>
      )}

      {/* Summary */}
      <div className="invoice-summary">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(invoice.subtotal)}</span>
        </div>
        {invoice.tax > 0 && (
          <div className="summary-row">
            <span>Tax:</span>
            <span>${formatCurrency(invoice.tax)}</span>
          </div>
        )}
        {invoice.shipping_cost > 0 && (
          <div className="summary-row">
            <span>Shipping:</span>
            <span>${formatCurrency(invoice.shipping_cost)}</span>
          </div>
        )}
        {invoice.overall_discount > 0 && (
          <div className="summary-row">
            <span>Discount:</span>
            <span>-${formatCurrency(invoice.overall_discount)}</span>
          </div>
        )}
        <div className="summary-row total-row">
          <span>Total (USD):</span>
          <span>${formatCurrency(invoice.total)}</span>
        </div>
        {invoice.total_in_riel > 0 && (
          <div className="summary-row">
            <span>Total (KHR):</span>
            <span>៛{parseFloat(invoice.total_in_riel).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="invoice-footer">
        <p>Thank you for your business!</p>
        <p className="footer-note">Please make payments within {invoice.due_date ? `${formatDate(invoice.due_date)}` : "the due date"}</p>
      </div>
    </div>
  );
};

export default InvoiceDetail;