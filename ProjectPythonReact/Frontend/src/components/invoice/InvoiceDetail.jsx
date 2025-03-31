import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./InvoiceDetail.css";

const InvoiceDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { invoice } = location.state || {};

  if (!invoice) {
    return <div>មិនមានទិន្នន័យវិក្កយបត្រ។ សូមត្រលប់ទៅបង្កើតវិក្កយបត្រថ្មី។</div>;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("km-KH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="invoice-detail-container">
      <div className="invoice-paper">
        <div className="invoice-header">
          <h1>វិក្កយបត្រ</h1>
          <p>លេខវិក្កយបត្រ: {invoice.id || "N/A"}</p>
          <p>កាលបរិច្ឆេទ: {formatDate(invoice.date)}</p>
          <p>កាលបរិច្ឆេទផុតកំណត់: {formatDate(invoice.due_date)}</p>
        </div>

        <div className="invoice-section customer-info">
          <h2>ព័ត៌មានអតិថិជន</h2>
          <p><strong>ឈ្មោះ:</strong> {invoice.customer_name}</p>
          {invoice.customer_email && <p><strong>អ៊ីមែល:</strong> {invoice.customer_email}</p>}
          {invoice.customer_address1 && <p><strong>អាសយដ្ឋាន:</strong> {invoice.customer_address1}</p>}
          {invoice.customer_town && <p><strong>ទីប្រជុំជន:</strong> {invoice.customer_town}</p>}
          {invoice.customer_country && <p><strong>ប្រទេស:</strong> {invoice.customer_country}</p>}
          {invoice.customer_phone && <p><strong>លេខទូរស័ព្ទ:</strong> {invoice.customer_phone}</p>}
        </div>

        <div className="invoice-section shipping-info">
          <h2>ព័ត៌មានដឹកជញ្ជូន</h2>
          {invoice.shipping_name && <p><strong>ឈ្មោះអ្នកទទួល/ក្រុមហ៊ុនដឹក:</strong> {invoice.shipping_name}</p>}
          {invoice.shipping_address1 && <p><strong>លេខឡាន:</strong> {invoice.shipping_address1}</p>}
          {invoice.shipping_town && <p><strong>លេខអ្នកដឹកជញ្ជូន:</strong> {invoice.shipping_town}</p>}
          {invoice.shipping_cost > 0 && <p><strong>ថ្លៃដឹកជញ្ជូន:</strong> ${invoice.shipping_cost.toFixed(2)}</p>}
        </div>

        <div className="invoice-section">
          <h2>ផលិតផល</h2>
          <table className="invoice-items-table">
            <thead>
              <tr>
                <th>ឈ្មោះផលិតផល</th>
                <th>ទំហំ</th>
                <th>ពណ៌</th>
                <th>បរិមាណ</th>
                <th>តម្លៃឯកតា</th>
                <th>បញ្ចុះតម្លៃ (%)</th>
                <th>សរុប</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name || "N/A"}</td>
                  <td>{item.size || "-"}</td>
                  <td>{item.color || "-"}</td>
                  <td>{item.quantity}</td>
                  <td>${item.unit_price.toFixed(2)}</td>
                  <td>{item.discount_percentage}%</td>
                  <td>${item.total_price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="invoice-section summary">
          <h2>សរុប</h2>
          <p><strong>សរុបរង:</strong> ${invoice.subtotal.toFixed(2)}</p>
          {invoice.overall_discount > 0 && (
            <p><strong>ទឹកប្រាក់បញ្ចុះតម្លៃ:</strong> ${invoice.overall_discount.toFixed(2)}</p>
          )}
          {invoice.tax > 0 && <p><strong>ពន្ធ:</strong> ${invoice.tax.toFixed(2)}</p>}
          <p><strong>សរុប (USD):</strong> ${invoice.total.toFixed(2)}</p>
          <p><strong>សរុប (KHR):</strong> ៛{invoice.total_in_riel.toLocaleString()}</p>
        </div>

        <div className="invoice-section">
          <h2>ព័ត៌មានបន្ថែម</h2>
          <p><strong>វិធីបង់ប្រាក់:</strong> {invoice.payment_method}</p>
          {invoice.notes && <p><strong>កំណត់សម្គាល់:</strong> {invoice.notes}</p>}
        </div>

        <div className="invoice-footer">
          <p>សូមអរគុណសម្រាប់ការទិញរបស់អ្នក!</p>
        </div>
      </div>

      <div className="invoice-actions">
        <button className="print-button" onClick={handlePrint}>
          បោះពុម្ព
        </button>
        <button className="back-button" onClick={() => navigate("/invoice-form")}>
          ត្រលប់ទៅបង្កើតវិក្កយបត្រថ្មី
        </button>
      </div>
    </div>
  );
};

export default InvoiceDetail;