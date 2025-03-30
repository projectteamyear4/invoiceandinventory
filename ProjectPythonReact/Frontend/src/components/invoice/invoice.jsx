// src/components/InvoiceForm.jsx
import axios from "axios";
import React, { useEffect, useState } from "react";
import "./InvoiceForm.css";

const InvoiceForm = () => {
  // Form state
  const [formData, setFormData] = useState({
    type: "វិក្កយបត្រ",
    status: "បើក",
    date: new Date().toISOString().split("T")[0],
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
    products: [
      {
        product_id: "",
        variant_id: "",
        barcode: "",
        name: "",
        size: "",
        color: "",
        purchasePrice: 0,
        unitPrice: 0,
        quantity: 1,
        discount: 0,
        total: 0,
        stock: 0,
      },
    ],
  });

  // API data states
  const [customers, setCustomers] = useState([]);
  const [deliveryMethods, setDeliveryMethods] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [filteredVariants, setFilteredVariants] = useState([]);

  // UI states
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [loading, setLoading] = useState({
    customers: true,
    delivery: true,
    products: true,
    variants: true,
  });
  const [error, setError] = useState({
    customers: null,
    delivery: null,
    products: null,
    variants: null,
  });

  // Create axios instance
  const api = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  // Fetch all required data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch customers
        const customersRes = await api.get("/api/customers/");
        setCustomers(customersRes.data);

        // Fetch delivery methods
        const deliveryRes = await api.get("/api/delivery-methods/");
        setDeliveryMethods(deliveryRes.data);

        // Fetch products
        const productsRes = await api.get("/api/products/");
        setProducts(productsRes.data);

        // Fetch variants
        const variantsRes = await api.get("/api/variants/");
        setVariants(variantsRes.data);
      } catch (err) {
        setError({
          customers: "Failed to load customers",
          delivery: "Failed to load delivery methods",
          products: "Failed to load products",
          variants: "Failed to load product variants",
        });
        console.error("API Error:", err);
      } finally {
        setLoading({
          customers: false,
          delivery: false,
          products: false,
          variants: false,
        });
      }
    };

    fetchData();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle product input changes with safe number handling
  const handleProductChange = (index, e) => {
    const { name, value } = e.target;
    const updatedProducts = [...formData.products];

    updatedProducts[index] = {
      ...updatedProducts[index],
      [name]: name === "quantity" || name === "unitPrice" || name === "discount"
        ? parseFloat(value) || 0
        : value,
    };

    // Ensure all values are numbers before calculation
    const quantity = Number(updatedProducts[index].quantity) || 0;
    const unitPrice = Number(updatedProducts[index].unitPrice) || 0;
    const discount = Number(updatedProducts[index].discount) || 0;

    // Calculate total as a number
    updatedProducts[index].total = quantity * unitPrice * (1 - discount / 100);

    setFormData({ ...formData, products: updatedProducts });
  };

  // Add new product row with proper initial values
  const addProductRow = () => {
    setFormData({
      ...formData,
      products: [
        ...formData.products,
        {
          product_id: "",
          variant_id: "",
          barcode: "",
          name: "",
          size: "",
          color: "",
          purchasePrice: 0,
          unitPrice: 0,
          quantity: 1,
          discount: 0,
          total: 0,
          stock: 0,
        },
      ],
    });
  };

  // Remove product row
  const removeProductRow = (index) => {
    if (formData.products.length <= 1) return;
    const updatedProducts = [...formData.products];
    updatedProducts.splice(index, 1);
    setFormData({ ...formData, products: updatedProducts });
  };

  // Select customer from modal
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
    setShowCustomerModal(false);
  };

  // Select delivery method from modal
  const handleSelectDelivery = (method) => {
    setFormData({
      ...formData,
      shippingName: method.delivery_name,
      shippingAddress1: method.car_number,
      shippingTown: method.delivery_number,
    });
    setShowDeliveryModal(false);
  };

  // Select product from modal
  const handleSelectProduct = (product, index) => {
    setSelectedProductIndex(index);
    const productVariants = variants.filter(
      (v) => v.product_id === product.product_id
    );
    setFilteredVariants(productVariants);
    setShowProductModal(false);
    setShowVariantModal(true);
  };

  // Select variant from modal with proper number handling
  const handleSelectVariant = (variant) => {
    const updatedProducts = [...formData.products];
    const product = products.find((p) => p.product_id === variant.product_id);

    updatedProducts[selectedProductIndex] = {
      ...updatedProducts[selectedProductIndex],
      product_id: variant.product_id,
      variant_id: variant.id,
      barcode: variant.barcode || "",
      name: product?.name || "",
      size: variant.size,
      color: variant.color,
      purchasePrice: Number(variant.purchase_price) || 0,
      unitPrice: Number(variant.selling_price) || 0,
      stock: Number(variant.stock_quantity) || 0,
      quantity: 1,
      discount: 0,
      total: Number(variant.selling_price) || 0,
    };

    setFormData({ ...formData, products: updatedProducts });
    setShowVariantModal(false);
  };

  // Calculate invoice totals with proper number handling
  const calculateTotals = () => {
    const subtotal = formData.products.reduce((sum, product) => {
      return sum + (Number(product.total) || 0);
    }, 0);

    const tax = subtotal * 0.1; // Assuming 10% tax
    const total = subtotal + tax;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
      totalInRiel: Number((total * 4000).toFixed(2)), // Assuming 1 USD = 4000 KHR
    };
  };

  const { subtotal, tax, total, totalInRiel } = calculateTotals();

  // Payment methods
  const paymentMethods = [
    { value: "សាច់ប្រាក់", label: "សាច់ប្រាក់" },
    { value: "ផ្ទេរប្រាក់", label: "ផ្ទេរប្រាក់" },
    { value: "កាតឥណទាន", label: "កាតឥណទាន" },
    { value: "អេឡិចត្រូនិច", label: "ការទូទាត់អេឡិចត្រូនិច" },
  ];

  // Format number safely for display
  const formatNumber = (value) => {
    const num = Number(value) || 0;
    return num.toFixed(2);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const invoiceData = {
        ...formData,
        subtotal,
        tax,
        total,
        totalInRiel,
      };

      const response = await api.post("/api/invoices/", invoiceData);
      console.log("Invoice created:", response.data);
      alert("វិក្កយបត្របានបង្កើតដោយជោគជ័យ!");
    } catch (err) {
      console.error("Error creating invoice:", err);
      alert("មានបញ្ហាក្នុងការបង្កើតវិក្កយបត្រ");
    }
  };

  return (
    <div className="invoice-container">
      <h1 className="invoice-title">
        <span className="title-highlight">បង្កើតថ្មី</span> វិក្កយបត្រ
      </h1>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {/* Invoice Type and Dates */}
          <div className="select-section">
            <label className="select-label">ជ្រើសរើសប្រភេទ:</label>
            <div className="select-group">
              <select
                className="select-input"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="វិក្កយបត្រ">វិក្កយបត្រ</option>
                <option value="វិក្កយបត្របញ្ជាទិញ">វិក្កយបត្របញ្ជាទិញ</option>
              </select>
              <input
                type="date"
                className="date-input"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
              <input
                type="date"
                className="date-input"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Main Form Grid */}
          <div className="form-grid">
            {/* Notes and Payment Section */}
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
                  required
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

            {/* Customer Information */}
            <div className="form-section">
              <div className="section-header">
                <h2 className="section-title">ព័ត៌មានអតិថិជន</h2>
                <button
                  type="button"
                  className="select-customer-link"
                  onClick={() => setShowCustomerModal(true)}
                  disabled={loading.customers}
                >
                  {loading.customers ? "កំពុងផ្ទុក..." : "ជ្រើសរើសអតិថិជន"}
                </button>
                {error.customers && (
                  <span className="error-text">{error.customers}</span>
                )}
              </div>
              <input
                className="form-input"
                placeholder="បញ្ចូលឈ្មោះ"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
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

            {/* Delivery Information */}
            <div className="form-section">
              <div className="section-header">
                <h2 className="section-title">ព័ត៌មានដឹកជញ្ជូន</h2>
                <button
                  type="button"
                  className="select-customer-link"
                  onClick={() => setShowDeliveryModal(true)}
                  disabled={loading.delivery}
                >
                  {loading.delivery ? "កំពុងផ្ទុក..." : "ជ្រើសរើសវិធីដឹកជញ្ជូន"}
                </button>
                {error.delivery && (
                  <span className="error-text">{error.delivery}</span>
                )}
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
            <div className="product-table-header">
              <h2 className="product-table-title">ផលិតផល</h2>
              <button
                type="button"
                className="add-product-button"
                onClick={addProductRow}
              >
                + បន្ថែមផលិតផល
              </button>
            </div>

            <table className="product-table">
              <thead>
                <tr>
                  <th>ឈ្មោះផលិតផល</th>
                  <th>ទំហំ</th>
                  <th>ពណ៌</th>
                  <th>តម្លៃទិញ</th>
                  <th>តម្លៃលក់</th>
                  <th>បរិមាណ</th>
                  <th>បញ្ចុះតម្លៃ (%)</th>
                  <th>សរុប</th>
                  <th>ស្តុក</th>
                  <th>សកម្មភាព</th>
                </tr>
              </thead>
              <tbody>
                {formData.products.map((product, index) => (
                  <tr key={index}>
                    <td>
                      <div className="product-input-group">
                        <input
                          className="table-input"
                          value={product.name}
                          disabled
                        />
                        <button
                          type="button"
                          className="select-product-button"
                          onClick={() => {
                            setSelectedProductIndex(index);
                            setShowProductModal(true);
                          }}
                        >
                          ជ្រើសផលិតផល
                        </button>
                      </div>
                    </td>
                    <td>
                      <input
                        className="table-input"
                        value={product.size}
                        disabled
                      />
                    </td>
                    <td>
                      <input
                        className="table-input"
                        value={product.color}
                        disabled
                      />
                    </td>
                    <td>
                      <input
                        className="table-input"
                        value={`$${formatNumber(product.purchasePrice)}`}
                        disabled
                      />
                    </td>
                    <td>
                      <input
                        className="table-input"
                        value={`$${formatNumber(product.unitPrice)}`}
                        disabled
                      />
                    </td>
                    <td>
                      <input
                        className="table-input"
                        type="number"
                        name="quantity"
                        value={product.quantity}
                        onChange={(e) => handleProductChange(index, e)}
                        min="1"
                        max={product.stock}
                      />
                    </td>
                    <td>
                      <input
                        className="table-input"
                        type="number"
                        name="discount"
                        value={product.discount}
                        onChange={(e) => handleProductChange(index, e)}
                        min="0"
                        max="100"
                      />
                    </td>
                    <td>
                      <input
                        className="table-input"
                        value={`$${formatNumber(product.total)}`}
                        disabled
                      />
                    </td>
                    <td>
                      <span className="stock-value">{product.stock}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="remove-product-button"
                        onClick={() => removeProductRow(index)}
                        disabled={formData.products.length <= 1}
                      >
                        លុប
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary Section */}
            <div className="summary-section">
              <div className="summary-item">
                <span className="summary-label">សរុបរង:</span>
                <span className="summary-value">${formatNumber(subtotal)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">បញ្ចុះតម្លៃ:</span>
                <span className="summary-value">$0.00</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">ដឹកជញ្ជូន:</span>
                <input
                  type="number"
                  className="summary-input"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="summary-item">
                <span className="summary-label">ពន្ធ (10%):</span>
                <span className="summary-value">${formatNumber(tax)}</span>
              </div>
              <div className="summary-item">
                <label className="checkbox-label">
                  <input type="checkbox" className="checkbox-input" />
                  ដកពន្ធ
                </label>
              </div>
              <div className="summary-item total-item">
                <span className="summary-label">សរុប:</span>
                <span className="summary-value">${formatNumber(total)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">សរុប:</span>
                <span className="summary-value">
                  ៛{totalInRiel.toLocaleString()}
                </span>
              </div>
              <button type="submit" className="create-button">
                បង្កើតវិក្កយបត្រ
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Customer Selection Modal */}
      {showCustomerModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>ជ្រើសរើសអតិថិជន</h2>
            {loading.customers ? (
              <div className="loading">កំពុងផ្ទុកអតិថិជន...</div>
            ) : error.customers ? (
              <div className="error-message">{error.customers}</div>
            ) : (
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>លេខសម្គាល់</th>
                    <th>ឈ្មោះ</th>
                    <th>នាមត្រកូល</th>
                    <th>អ៊ីមែល</th>
                    <th>លេខទូរស័ព្ទ</th>
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
            )}
            <button
              className="close-button"
              onClick={() => setShowCustomerModal(false)}
            >
              បិទ
            </button>
          </div>
        </div>
      )}

      {/* Delivery Method Modal */}
      {showDeliveryModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>ជ្រើសរើសវិធីសាស្រ្តដឹកជញ្ជូន</h2>
            {loading.delivery ? (
              <div className="loading">កំពុងផ្ទុកវិធីដឹកជញ្ជូន...</div>
            ) : error.delivery ? (
              <div className="error-message">{error.delivery}</div>
            ) : (
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>លេខសម្គាល់</th>
                    <th>ឈ្មោះដឹកជញ្ជូន</th>
                    <th>លេខឡាន</th>
                    <th>លេខដឹកជញ្ជូន</th>
                    <th>សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryMethods.map((method) => (
                    <tr key={method.delivery_method_id}>
                      <td>{method.delivery_method_id}</td>
                      <td>{method.delivery_name}</td>
                      <td>{method.car_number}</td>
                      <td>{method.delivery_number}</td>
                      <td>
                        <button
                          className="select-button"
                          onClick={() => handleSelectDelivery(method)}
                        >
                          ជ្រើសរើស
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button
              className="close-button"
              onClick={() => setShowDeliveryModal(false)}
            >
              បិទ
            </button>
          </div>
        </div>
      )}

      {/* Product Selection Modal */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>ជ្រើសរើសផលិតផល</h2>
            {loading.products ? (
              <div className="loading">កំពុងផ្ទុកផលិតផល...</div>
            ) : error.products ? (
              <div className="error-message">{error.products}</div>
            ) : (
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>ឈ្មោះផលិតផល</th>
                    <th>សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.product_id}>
                      <td>{product.name}</td>
                      <td>
                        <button
                          className="select-button"
                          onClick={() =>
                            handleSelectProduct(product, selectedProductIndex)
                          }
                        >
                          ជ្រើសរើស
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button
              className="close-button"
              onClick={() => setShowProductModal(false)}
            >
              បិទ
            </button>
          </div>
        </div>
      )}

      {/* Variant Selection Modal */}
      {showVariantModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>ជ្រើសរើសវ៉ារ្យ៉ង់ផលិតផល</h2>
            {loading.variants ? (
              <div className="loading">កំពុងផ្ទុកវ៉ារ្យ៉ង់...</div>
            ) : error.variants ? (
              <div className="error-message">{error.variants}</div>
            ) : (
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>ឈ្មោះផលិតផល</th>
                    <th>ទំហំ</th>
                    <th>ពណ៌</th>
                    <th>តម្លៃទិញ</th>
                    <th>តម្លៃលក់</th>
                    <th>ស្តុក</th>
                    <th>សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVariants.map((variant) => {
                    const product = products.find(
                      (p) => p.product_id === variant.product_id
                    );
                    return (
                      <tr key={variant.id}>
                        <td>{product?.name || "N/A"}</td>
                        <td>{variant.size}</td>
                        <td>{variant.color}</td>
                        <td>${formatNumber(variant.purchase_price)}</td>
                        <td>${formatNumber(variant.selling_price)}</td>
                        <td>{variant.stock_quantity}</td>
                        <td>
                          <button
                            className="select-button"
                            onClick={() => handleSelectVariant(variant)}
                          >
                            ជ្រើសរើស
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            <button
              className="close-button"
              onClick={() => setShowVariantModal(false)}
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