// src/components/InvoiceForm.jsx
import React, { useEffect, useState } from "react";
import "./InvoiceForm.css";

const InvoiceForm = () => {
  const [formData, setFormData] = useState({
    type: "វិក្កយបត្រ",
    status: "បើក",
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

  const [customers, setCustomers] = useState([]); // State for customer data
  const [showCustomerModal, setShowCustomerModal] = useState(false); // State to show/hide modal

  // Simulate fetching customer data (replace with API call in a real app)
  useEffect(() => {
    // Hardcoded customer data for now
    const customerData = [
      { customer_id: 1, first_name: "សុខ", last_name: "សុខ", email: "sok@gmail.com", phone_number: "23123123", address: "PhnomPenh", city: "PhnomPenh", country: "Cambodia", order_history: 1 },
      { customer_id: 2, first_name: "sadad", last_name: "asdasd", email: "asdasd@asdasda.com", phone_number: "21313", address: "PhnomPenh", city: "PhnomPenh", country: "Cambodia", order_history: 1 },
      { customer_id: 3, first_name: "asdasd", last_name: "asdasd", email: "dasd@es.com", phone_number: "32312312", address: "PhnomPenh", city: "PhnomPenh", country: "Cambodia", order_history: 1 },
      { customer_id: 4, first_name: "dfasdas", last_name: "sdasdasd", email: "asdasdas@com.comcsad", phone_number: "232312312", address: "PhnomPenh", city: "PhnomPenh", country: "Cambodia", order_history: 2 },
      { customer_id: 5, first_name: "asdasd", last_name: "kloin", email: "asdasd@gmail.com", phone_number: "2131234", address: "PhnomPenh", city: "PhnomPenh", country: "Cambodia", order_history: 3 },
      { customer_id: 6, first_name: "asdasd", last_name: "asadas", email: "asjd.asiduasiue@ads.com", phone_number: "23212323", address: "sdasdasd", city: "PhnomPenh", country: "Cambodia", order_history: 19 },
      { customer_id: 7, first_name: "dasdasd", last_name: "sdasdf", email: "dada@asads.com", phone_number: "1232312", address: "PhnomPenh", city: "PhnomPenh", country: "Cambodia", order_history: 1 },
      { customer_id: 8, first_name: "dasdasd", last_name: "dstsdasa", email: "dstsd@esdta.com", phone_number: "2313", address: "ស្តី", city: "ស្តី", country: "ស្តី", order_history: 1 },
      { customer_id: 9, first_name: "saasd", last_name: "sdasdasd", email: "sdasd@sdad.com", phone_number: "a123123", address: "asdasd", city: "dasdasd", country: "asdasd", order_history: 3 },
      { customer_id: 10, first_name: "dasdasd", last_name: "dsadsasa", email: "dstsd@sd.comcom", phone_number: "2313", address: "PhnomPenh", city: "asdasd", country: "asdasd", order_history: 1 },
      { customer_id: 11, first_name: "sadasd", last_name: "asdasd", email: "admin@gmail.com", phone_number: "273", address: "PhnomPenh", city: "PhnomPenh", country: "Cambodia", order_history: 1 },
    ];
    setCustomers(customerData);
  }, []);

  // Uncomment this to fetch customers from your API instead of hardcoding
  /*
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const api = axios.create({
          baseURL: 'http://localhost:8000',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        const response = await api.get('/api/customers/');
        setCustomers(response.data);
      } catch (err) {
        console.error('Error fetching customers:', err);
      }
    };
    fetchCustomers();
  }, []);
  */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Function to handle customer selection
  const handleSelectCustomer = (customer) => {
    setFormData({
      ...formData,
      customerName: `${customer.first_name} ${customer.last_name}`,
      customerEmail: customer.email,
      customerAddress1: customer.address,
      customerTown: customer.city,
      customerCountry: customer.country,
      customerPhone: customer.phone_number,
    });
    setShowCustomerModal(false); // Close the modal after selection
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form data submitted:", formData);
    alert("វិក្កយបត្របានបង្កើតដោយជោគជ័យ!"); // Invoice created successfully!
  };

  const paymentMethods = [
    { value: "សាច់ប្រាក់", label: "សាច់ប្រាក់" },
    { value: "ផ្ទេរប្រាក់", label: "ផ្ទេរប្រាក់" },
    { value: "កាតឥណទាន", label: "កាតឥណទាន" },
    { value: "អេឡិចត្រូនិច", label: "ការទូទាត់អេឡិចត្រូនិច" },
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
                <option value="វិក្កយបត្រ">វិក្កយបត្រ</option>
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
              <h2 className="section-title">កំណត់សម្គាល់</h2>
              <textarea
                className="form-textarea"
                placeholder="បញ្ចូលកំណត់សម្គាល់"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
              <div className="payment-section">
                <label className="payment-label">វិធីបង់ប្រាក់:</label>
                <select
                  className="payment-select"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="">ជ្រើសរើសវិធីបង់ប្រាក់</option>
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form en">
              <div className="section-header">
                <h2 className="section-title">ព័ត៌មានអតិថិជន</h2>
                <a
                  href="#select-customer"
                  className="select-customer-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowCustomerModal(true);
                  }}
                >
                  ជ្រើសរើសអតិថិជន
                </a>
              </div>
              <input
                className="form-input"
                placeholder="បញ្ចូលឈ្មោះ"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
              />
              <input
                className="form-input"
                placeholder="អាសយដ្ឋានអ៊ីមែល"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
              />
              <input
                className="form-input"
                placeholder="អាសយដ្ឋាន ១"
                name="customerAddress1"
                value={formData.customerAddress1}
                onChange={handleChange}
              />
              <input
                className="form-input"
                placeholder="ទីប្រជុំជន"
                name="customerTown"
                value={formData.customerTown}
                onChange={handleChange}
              />
              <input
                className="form-input"
                placeholder="ប្រទេស"
                name="customerCountry"
                value={formData.customerCountry}
                onChange={handleChange}
              />
              <input
                className="form-input"
                placeholder="លេខទូរស័ព្ទ"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
              />
            </div>
            <div className="form-section">
              <div className="section-header">
                <h2 className="section-title">ព័ត៌មានដឹកជញ្ជូន</h2>
                <a href="#select-customer" className="select-customer-link">
                  ជ្រើសរើសDelivery
                </a>
              </div>
              <input
                className="form-input"
                placeholder="បញ្ចូលឈ្មោះ"
                name="shippingName"
                value={formData.shippingName}
                onChange={handleChange}
              />
              <input
                className="form-input"
                placeholder="អាសយដ្ឋាន ១"
                name="shippingAddress1"
                value={formData.shippingAddress1}
                onChange={handleChange}
              />
              <input
                className="form-input"
                placeholder="ទីប្រជុំជន"
                name="shippingTown"
                value={formData.shippingTown}
                onChange={handleChange}
              />
              <input
                className="form-input"
                placeholder="ប្រទេស"
                name="shippingCountry"
                value={formData.shippingCountry}
                onChange={handleChange}
              />
            </div>
          </div>
          {/* Product Table */}
          <div className="product-table-card">
            <h2 className="product-table-title">ផលិតផល</h2>
            <table className="product-table">
              <thead>
                <tr>
                  <th className="table-header">បាកូដ</th>
                  <th className="table-header">ឈ្មោះ</th>
                  <th className="table-header">បរិមាណ</th>
                  <th className="table-header">តម្លៃឯកតា</th>
                  <th className="table-header">បញ្ចុះតម្លៃ (%)</th>
                  <th className="table-header">សរុប</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <input className="table-input" placeholder="បាកូដ" />
                  </td>
                  <td>
                    <input className="table-input" placeholder="ឈ្មោះផលិតផល" />
                  </td>
                  <td>
                    <input className="table-input" type="number" placeholder="០" />
                  </td>
                  <td>
                    <input className="table-input" type="number" placeholder="$0.00" disabled />
                  </td>
                  <td>
                    <input className="table-input" type="number" placeholder="៦" />
                  </td>
                  <td>
                    <input className="table-input" placeholder="$៦.៦៦" disabled />
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Summary Section */}
            <div className="summary-section">
              <div className="summary-item">
                <span className="summary-label">សរុបរង:</span>
                <span className="summary-value">$៦.៦៦</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">បញ្ចុះតម្លៃ:</span>
                <span className="summary-value">$៦.៦៦</span>
              </div>
              <div className="summary-item">
                <span className="summary-label"> (ដឹកជញ្ជូន):</span>
                <input
                  type="number"
                  className="summary-input"
                  placeholder="៦.៦៦"
                />
              </div>
              <div className="summary-item">
                <span className="summary-label">ពន្ធ:</span>
                <span className="summary-value">$៦.៦៦</span>
              </div>
              <div className="summary-item">
                <label className="checkbox-label">
                  <input type="checkbox" className="checkbox-input" />
                  ដកពន្ធ
                </label>
              </div>
              <div className="summary-item">
                <span className="summary-label">សរុប:</span>
                <span className="summary-value">$៦.៦៦</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">សរុប:</span>
                <span className="summary-value">៛42000</span>
              </div>
              <button type="submit" className="create-button">បង្កើតវិក្កយបត្រ</button>
            </div>
          </div>
        </form>
      </div>

      {/* Customer Selection Modal */}
      {showCustomerModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>ជ្រើសរើសអតិថិជន</h2>
            <table className="customer-table">
              <thead>
                <tr>
                  <th>លេខសម្គាល់</th>
                  <th>ឈ្មោះ</th>
                  <th>នាមត្រកូល</th>
                  <th>អ៊ីមែល</th>
                  <th>លេខទូរស័ព្ទ</th>
                  <th>អាសយដ្ឋាន</th>
                  <th>ទីក្រុង</th>
                  <th>ប្រទេស</th>
                  <th>ប្រវត្តិការបញ្ជាទិញ</th>
                  <th>សកម្មភាព</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.customer_id}>
                    <td>{customer.customer_id}</td>
                    <td>{customer.first_name}</td>
                    <td>{customer.last_name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone_number}</td>
                    <td>{customer.address}</td>
                    <td>{customer.city}</td>
                    <td>{customer.country}</td>
                    <td>{customer.order_history}</td>
                    <td>
                      <button
                        className="select-button"
                        onClick={() => handleSelectCustomer(customer)}
                      >
                        ជ្រើសរើស
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="close-button"
              onClick={() => setShowCustomerModal(false)}
            >
              បិទ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceForm;