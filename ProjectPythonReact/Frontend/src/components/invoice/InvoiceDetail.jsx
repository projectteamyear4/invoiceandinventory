import React from "react";
import { useLocation } from "react-router-dom";
import "./InvoiceDetail.css"; // Ensure this CSS file is imported

const InvoiceDetail = () => {
  const { state } = useLocation();
  const invoice = state?.invoice;

  if (!invoice) {
    return <div className="no-data">គ្មានទិន្នន័យវិក័យប័ត្រ។ សូមត្រលប់ក្រោយហើយជ្រើសរើសវិក័យប័ត្រ។</div>;
  }

  // Formatting utilities (keep these as they are good)
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
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "កាលបរិច្ឆេទមិនត្រឹមត្រូវ";
        }
        return date.toLocaleDateString('en-US', options);
    } catch (error) {
        return "កាលបរិច្ឆេទមិនត្រឹមត្រូវ";
    }
  };

  const getStatusBadge = (status) => {
    const statusText = status ? String(status).toLowerCase() : 'unknown';
    const statusClasses = {
      paid: "badge-success",
      unpaid: "badge-warning",
      overdue: "badge-danger",
      draft: "badge-secondary",
      partial: "badge-info",
      pending: "badge-primary",
      cancelled: "badge-dark",
      unknown: "badge-secondary"
    };
    
    const statusTranslations = {
      paid: "បានបង់",
      unpaid: "មិនទាន់បង់",
      overdue: "ហួសកំណត់",
      draft: "ព្រាង",
      partial: "បានបង់ដោយផ្នែក",
      pending: "កំពុងរង់ចាំ",
      cancelled: "បានលុបចោល",
      unknown: "មិនស្គាល់"
    };
    
    const badgeClass = statusClasses[statusText] || 'badge-primary';
    const displayText = statusTranslations[statusText] || statusTranslations.unknown;
    return <span className={`badge ${badgeClass}`}>{displayText}</span>;
  };

  const items = Array.isArray(invoice.items) ? invoice.items : [];

  return (
    <div className="invoice-wrapper">
      <div className="invoice-container">
        {/* Invoice Header with Company Info */}
        <div className="invoice-header">
          <div className="invoice-title">
             <h1>វិក័យប័ត្រ</h1>
             <div className="company-info-header">
               <p className="company-name">ឈ្មោះក្រុមហ៊ុនរបស់អ្នក</p>
               <p>១២៣ ផ្លូវអាជីវកម្ម, អគារ ១០០</p>
               <p>ទីក្រុង, ខេត្ត ១២៣៤៥</p>
               <p>កម្ពុជា</p>
               <p>អ៊ីមែល: contact@yourcompany.com</p>
               <p>ទូរស័ព្ទ: +១២៣ ៤៥៦ ៧៨៩០</p>
             </div>
          </div>
          <div className="invoice-header-right">
            <p className="invoice-number">លេខ #{invoice.invoice_id || "មិនមាន"}</p>
            <div className="invoice-status">
              {getStatusBadge(invoice.status)}
            </div>
          </div>
        </div>

        {/* Invoice Meta */}
        <div className="invoice-meta">
          <div className="meta-item">
            <span>កាលបរិច្ឆេទចេញ:</span>
            <strong>{formatDate(invoice.date)}</strong>
          </div>
          <div className="meta-item">
            <span>កាលបរិច្ឆេទនៃការបង់ប្រាក់:</span>
            <strong>{formatDate(invoice.due_date)}</strong>
          </div>
          <div className="meta-item">
            <span>វិធីសារបង់ប្រាក់:</span>
            <strong>{invoice.payment_method || "មិនមាន"}</strong>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="invoice-columns">
          {/* Left Column - Customer Info */}
          <div className="invoice-section bill-to-section">
            <h3>អតិថិជន</h3>
            {invoice.customer ? (
              <div className="customer-info">
                <p className="customer-name">{invoice.customer.first_name} {invoice.customer.last_name}</p>
                <p>{invoice.customer.address || "គ្មានអាសយដ្ឋាន"}</p>
                {invoice.customer.city && <p>{invoice.customer.city}, {invoice.customer.state} {invoice.customer.zip_code}</p>}
                {invoice.customer.country && <p>{invoice.customer.country}</p>}
                {invoice.customer.email && <p>អ៊ីមែល: {invoice.customer.email}</p>}
                {invoice.customer.phone_number && <p>ទូរស័ព្ទ: {invoice.customer.phone_number}</p>}
              </div>
            ) : (
              <p className="no-customer">គ្មានអតិថិជន</p>
            )}
          </div>

          {/* Right Column - Delivery Info (Conditional) */}
          {invoice.delivery_method && (
            <div className="invoice-section delivery-section">
              <h3>ព័ត៌មានដឹកជញ្ជូន</h3>
              <div className="delivery-info">
                <p><span>វិធីសារ:</span> {invoice.delivery_method.delivery_name || "មិនមាន"}</p>
                <p><span>យានយន្ត:</span> {invoice.delivery_method.car_number || "មិនមាន"}</p>
                <p><span>លេខតាមដាន:</span> {invoice.delivery_method.delivery_number || "មិនមាន"}</p>
              </div>
            </div>
          )}
        </div>

        {/* Items Table */}
        <div className="invoice-section items-section">
          <h3>ធាតុ</h3>
          <div className="table-responsive">
            <table className="items-table">
              <thead>
                <tr>
                  <th>ផលិតផល</th>
                  <th>ទំហំ</th>
                  <th>ពណ៌</th>
                  <th className="text-right">បរិមាណ</th>
                  <th className="text-right">តម្លៃឯកតា</th>
                  <th className="text-right">បញ្ចុះតម្លៃ</th>
                  <th className="text-right">សរុប</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <tr key={item.id || `item-${index}`}>
                      <td>{item.product_name || "ផលិតផលគ្មានឈ្មោះ"}</td>
                      <td>{item.variant_size || "-"}</td>
                      <td>{item.variant_color || "-"}</td>
                      <td className="text-right">{item.quantity}</td>
                      <td className="text-right">${formatCurrency(item.unit_price)}</td>
                      <td className="text-right">{formatPercentage(item.discount_percentage)}%</td>
                      <td className="text-right">${formatCurrency(item.total_price)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-items">គ្មានធាតុនៅក្នុងវិក័យប័ត្រនេះ។</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes (if any) */}
        {invoice.notes && (
          <div className="invoice-section notes-section">
            <h3>កំណត់សម្គាល់</h3>
            <p className="notes-content">{invoice.notes}</p>
          </div>
        )}

        {/* Summary */}
        <div className="invoice-summary-section">
            <div className="invoice-summary">
              <div className="summary-row">
                <span>សរុបរង:</span>
                <span>${formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.tax > 0 && (
                <div className="summary-row">
                  <span>ពន្ធ ({invoice.tax_rate || 0}%):</span>
                  <span>${formatCurrency(invoice.tax)}</span>
                </div>
              )}
               {invoice.shipping_cost > 0 && (
                <div className="summary-row">
                  <span>ដឹកជញ្ជូន:</span>
                  <span>${formatCurrency(invoice.shipping_cost)}</span>
                </div>
              )}
              {invoice.overall_discount > 0 && (
                <div className="summary-row discount-row">
                  <span>បញ្ចុះតម្លៃ:</span>
                  <span>-${formatCurrency(invoice.overall_discount)}</span>
                </div>
              )}
              <div className="summary-row total-row">
                <span>សរុប (ដុល្លារ):</span>
                <span>${formatCurrency(invoice.total)}</span>
              </div>
               {invoice.total_in_riel > 0 && (
                <div className="summary-row currency-khmer">
                  <span>សរុប (រៀល):</span>
                  <span>៛{parseFloat(invoice.total_in_riel).toLocaleString('km-KH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                </div>
               )}
            </div>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <p>សូមអរគុណសម្រាប់ការប្រើប្រាស់សេវាកម្មរបស់យើង!</p>
          {invoice.payment_terms && <p className="footer-note">លក្ខខណ្ឌនៃការបង់ប្រាក់: {invoice.payment_terms}</p>}
          {invoice.due_date && <p className="footer-note">សូមបង់ប្រាក់មុនថ្ងៃ {formatDate(invoice.due_date)}។</p>}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;