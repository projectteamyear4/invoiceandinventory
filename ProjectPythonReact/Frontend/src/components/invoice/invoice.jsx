import axios from "axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InvoiceForm.css";

const initialProduct = {
  product_id: "",
  variant_id: "",
  barcode: "",
  name: "",
  size: "",
  color: "",
  quantity: 1,
  unitPrice: 0,
  discount: 0,
  total: 0,
  stock: 0,
};

const initialFormData = {
  type: "invoice", // Updated to lowercase to match backend
  status: "DRAFT", // Updated to match backend
  date: new Date().toISOString().split("T")[0],
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  customerName: "",
  customerEmail: "",
  customerAddress1: "",
  customerTown: "",
  customerCountry: "",
  customerPhone: "",
  customerId: null, // Added to ensure customerId is tracked
  shippingName: "",
  shippingAddress1: "",
  shippingTown: "",
  shippingCountry: "",
  shippingPostcode: "",
  deliveryMethodId: null,
  notes: "",
  paymentMethod: "CASH", // Updated to match backend
  products: [initialProduct],
  shippingCost: 0,
  overallDiscount: 0,
  deductTax: false,
};

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
const TAX_RATE_PERCENT = parseFloat(process.env.REACT_APP_TAX_RATE || 10);
const EXCHANGE_RATE_KHR = parseFloat(process.env.REACT_APP_EXCHANGE_RATE || 4000);

const InvoiceForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [customers, setCustomers] = useState([]);
  const [deliveryMethods, setDeliveryMethods] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");

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
    submit: null,
  });

  const navigate = useNavigate();

  const api = useMemo(
    () =>
      axios.create({
        baseURL: API_BASE_URL,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }),
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      setError({ customers: null, delivery: null, products: null, variants: null, submit: null });
      setLoading({ customers: true, delivery: true, products: true, variants: true });

      try {
        const [customersRes, deliveryRes, productsRes, variantsRes] = await Promise.allSettled([
          api.get("/api/customers/"),
          api.get("/api/delivery-methods/"),
          api.get("/api/products/"),
          api.get("/api/variants/"),
        ]);

        if (customersRes.status === "fulfilled") setCustomers(customersRes.value.data);
        else setError((prev) => ({ ...prev, customers: "Failed to load customers" }));

        if (deliveryRes.status === "fulfilled") setDeliveryMethods(deliveryRes.value.data);
        else setError((prev) => ({ ...prev, delivery: "Failed to load delivery methods" }));

        if (productsRes.status === "fulfilled") setProducts(productsRes.value.data);
        else setError((prev) => ({ ...prev, products: "Failed to load products" }));

        if (variantsRes.status === "fulfilled") {
          const fetchedVariants = variantsRes.value.data.map((variant) => ({
            ...variant,
            selling_price: parseFloat(variant.selling_price || 0),
            stock_quantity: parseInt(variant.stock_quantity || 0, 10),
          }));
          setVariants(fetchedVariants);
        } else {
          setError((prev) => ({ ...prev, variants: "Failed to load product variants" }));
        }
      } catch (err) {
        console.error("API Fetch Error:", err);
        setError({
          customers: "Failed to load data",
          delivery: "Failed to load data",
          products: "Failed to load data",
          variants: "Failed to load data",
          submit: null,
        });
      } finally {
        setLoading({ customers: false, delivery: false, products: false, variants: false });
      }
    };

    fetchData();
  }, [api]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : type === "number" ? parseFloat(value) || 0 : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  }, []);

  const handleProductChange = useCallback(
    (index, e) => {
      const { name, value } = e.target;
      const updatedProducts = [...formData.products];
      const product = { ...updatedProducts[index] };

      if (name === "quantity" || name === "unitPrice" || name === "discount") {
        product[name] = parseFloat(value) || 0;
      } else {
        product[name] = value;
      }

      product.total = product.quantity * product.unitPrice * (1 - product.discount / 100);
      updatedProducts[index] = product;
      setFormData((prev) => ({ ...prev, products: updatedProducts }));
    },
    [formData.products]
  );

  const addProductRow = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, { ...initialProduct }],
    }));
  }, []);

  const removeProductRow = useCallback(
    (index) => {
      if (formData.products.length <= 1) return;
      const updatedProducts = [...formData.products];
      updatedProducts.splice(index, 1);
      setFormData((prev) => ({ ...prev, products: updatedProducts }));
    },
    [formData.products]
  );

  const handleSelectCustomer = useCallback((customer) => {
    setFormData((prev) => ({
      ...prev,
      customerName: `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),
      customerEmail: customer.email || "",
      customerAddress1: customer.address || "",
      customerTown: customer.city || "",
      customerCountry: customer.country || "",
      customerPhone: customer.phone_number || "",
      customerId: customer.id, // Ensure customerId is set
    }));
    setShowCustomerModal(false);
    setCustomerSearchTerm("");
  }, []);

  const handleSelectDelivery = useCallback((method) => {
    setFormData((prev) => ({
      ...prev,
      shippingName: method.delivery_name || "",
      shippingAddress1: method.car_number || "",
      shippingTown: method.delivery_number || "",
      shippingCountry: method.country || "",
      shippingPostcode: method.postcode || "",
      deliveryMethodId: method.id,
    }));
    setShowDeliveryModal(false);
  }, []);

  const handleSelectProduct = useCallback(
    (variant) => {
      const product = products.find((p) => p.id === variant.product);
      if (!product) return;

      const updatedProducts = [...formData.products];
      updatedProducts[selectedProductIndex] = {
        product_id: product.id,
        variant_id: variant.id || "",
        barcode: variant.barcode || "",
        name: product.name || "",
        size: variant.size || "",
        color: variant.color || "",
        unitPrice: variant.selling_price,
        stock: variant.stock_quantity,
        quantity: 1,
        discount: 0,
        total: variant.selling_price,
      };

      setFormData((prev) => ({ ...prev, products: updatedProducts }));
      setShowProductModal(false);
      setSearchTerm("");
    },
    [formData.products, selectedProductIndex, products]
  );

  const filteredVariants = useMemo(() => {
    if (!searchTerm) return variants;

    const term = searchTerm.toLowerCase();
    return variants.filter((variant) => {
      const product = products.find((p) => p.id === variant.product);
      const productName = product?.name.toLowerCase() || "";
      const barcode = variant.barcode?.toLowerCase() || "";
      return productName.includes(term) || barcode.includes(term);
    });
  }, [variants, products, searchTerm]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearchTerm) return customers;

    const term = customerSearchTerm.toLowerCase();
    return customers.filter((customer) => {
      const fullName = `${customer.first_name || ""} ${customer.last_name || ""}`
        .trim()
        .toLowerCase();
      const email = customer.email?.toLowerCase() || "";
      const phone = customer.phone_number?.toLowerCase() || "";
      return fullName.includes(term) || email.includes(term) || phone.includes(term);
    });
  }, [customers, customerSearchTerm]);

  const { subtotal, tax, total, totalInRiel, shippingDisplay, discountDisplay } = useMemo(() => {
    const calculatedSubtotal = formData.products.reduce((sum, product) => sum + product.total, 0);
    const discountAmount = calculatedSubtotal * (formData.overallDiscount / 100);
    const discountedSubtotal = calculatedSubtotal - discountAmount;
    const calculatedShipping = parseFloat(formData.shippingCost) || 0;
    const taxableAmount = discountedSubtotal;
    const calculatedTax = formData.deductTax ? 0 : taxableAmount * (TAX_RATE_PERCENT / 100);
    const calculatedTotal = taxableAmount + calculatedShipping + calculatedTax;
    const calculatedTotalInRiel = calculatedTotal * EXCHANGE_RATE_KHR;

    return {
      subtotal: calculatedSubtotal,
      discountDisplay: discountAmount,
      shippingDisplay: calculatedShipping,
      tax: calculatedTax,
      total: calculatedTotal,
      totalInRiel: calculatedTotalInRiel,
    };
  }, [formData.products, formData.shippingCost, formData.overallDiscount, formData.deductTax]);

  // Updated to match backend choices
  const typeOptions = [
    { value: "invoice", label: "វិក្កយបត្រ" },
    { value: "quotation", label: "សម្រង់តម្លៃ" },
  ];

  const statusOptions = [
    { value: "DRAFT", label: "ព្រាង" },
    { value: "PENDING", label: "មិនទាន់បង់" },
    { value: "PAID", label: "បានបង់" },
    { value: "CANCELLED", label: "បានលុបចោល" },
  ];

  const paymentMethods = [
    { value: "CASH", label: "សាច់ប្រាក់" },
    { value: "CREDIT", label: "ឥណទាន" },
    { value: "BANK_TRANSFER", label: "ផ្ទេរប្រាក់" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError((prev) => ({ ...prev, submit: null }));

    // Validate required fields
    if (!formData.customerName) {
      setError((prev) => ({
        ...prev,
        submit: "សូមបញ្ចូលឈ្មោះអតិថិជន",
      }));
      setIsSubmitting(false);
      return;
    }

    if (!formData.dueDate || !formData.paymentMethod) {
      setError((prev) => ({
        ...prev,
        submit: "សូមបំពេញគ្រប់វាលដែលត្រូវការ (កាលបរិច្ឆេទផុតកំណត់, វិធីបង់ប្រាក់)",
      }));
      setIsSubmitting(false);
      return;
    }

    // Validate products
    if (formData.products.length === 0 || formData.products.some((p) => !p.product_id)) {
      setError((prev) => ({
        ...prev,
        submit: "សូមបន្ថែមផលិតផលត្រឹមត្រូវយ៉ាងហោចណាស់មួយ។",
      }));
      setIsSubmitting(false);
      return;
    }

    // Check stock
    const outOfStockItems = formData.products.filter((p) => p.quantity > p.stock && p.product_id);
    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems
        .map((p) => `${p.name}${p.size || p.color ? ` (${p.size || ""}/${p.color || ""})` : ""}`)
        .join(", ");
      setError((prev) => ({ ...prev, submit: `បរិមាណលើសស្តុកសម្រាប់៖ ${itemNames}` }));
      setIsSubmitting(false);
      return;
    }

    try {
      // Ensure a customer is selected or created
      let customerId = formData.customerId;
      if (!customerId) {
        const nameParts = formData.customerName.trim().split(" ");
        const customerData = {
          first_name: nameParts[0] || formData.customerName.trim(),
          last_name: nameParts[1] || "",
          email: formData.customerEmail || null,
          address: formData.customerAddress1 || "",
          city: formData.customerTown || "",
          country: formData.customerCountry || "",
          phone_number: formData.customerPhone || "",
          status: "active",
        };

        // Check if customer already exists
        const existingCustomer = customers.find(
          (c) =>
            c.first_name === customerData.first_name &&
            c.last_name === customerData.last_name &&
            c.email === customerData.email
        );

        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          const customerResponse = await api.post("/api/customers/", customerData);
          if (!customerResponse.data.id) {
            throw new Error("Failed to create customer: No ID returned");
          }
          customerId = customerResponse.data.id;
          setCustomers((prev) => [...prev, customerResponse.data]); // Update customer list
          setFormData((prev) => ({ ...prev, customerId })); // Update formData with new customerId
        }
      }

      if (!customerId) {
        throw new Error("Customer ID is required but could not be determined");
      }

      const invoiceData = {
        type: formData.type,
        status: formData.status,
        date: formData.date,
        due_date: formData.dueDate, // Map to snake_case
        customer: customerId, // Send customer ID
        delivery_method: formData.deliveryMethodId || null,
        notes: formData.notes,
        payment_method: formData.paymentMethod, // Map to snake_case
        shipping_cost: shippingDisplay,
        overall_discount: discountDisplay,
        deduct_tax: formData.deductTax, // Map to snake_case
        subtotal: subtotal,
        tax: tax,
        total: total,
        total_in_riel: totalInRiel,
        items: formData.products
          .filter((p) => p.product_id)
          .map((p) => ({
            product_id: p.product_id,
            variant_id: p.variant_id || null,
            quantity: p.quantity,
            unit_price: p.unitPrice,
            discount_percentage: p.discount,
            total_price: p.total,
          })),
      };

      console.log("Submitting invoice data:", invoiceData);

      const response = await api.post("/api/invoices/", invoiceData);
      alert("វិក្កយបត្របានបង្កើតដោយជោគជ័យ!");

      navigate("/invoice-detail", { state: { invoice: response.data } });
      setFormData(initialFormData);
    } catch (err) {
      console.error("Error creating invoice:", err.response?.data || err.message || err);
      let errorMsg = "មានបញ្ហាក្នុងការបង្កើតវិក្កយបត្រ";

      if (err.response?.data) {
        const backendErrors = err.response.data;
        if (typeof backendErrors === "object") {
          errorMsg = Object.entries(backendErrors)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`)
            .join("; ");
        } else {
          errorMsg = backendErrors.toString();
        }
      } else if (err.message) {
        errorMsg = err.message;
      }

      setError((prev) => ({ ...prev, submit: errorMsg }));
      alert(`មានបញ្ហាក្នុងការបង្កើតវិក្កយបត្រ៖ ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                required
                disabled={isSubmitting}
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                className="select-input"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                type="date"
                className="date-input"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              <input
                type="date"
                className="date-input"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
              <div className="payment-section">
                <label className="payment-label">វិធីបង់ប្រាក់:</label>
                <select
                  className="payment-select"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
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

            <div className="form-section">
              <div className="section-header">
                <h2 className="section-title">ព័ត៌មានអតិថិជន</h2>
                <button
                  type="button"
                  className="select-customer-link"
                  onClick={() => setShowCustomerModal(true)}
                  disabled={loading.customers || isSubmitting}
                >
                  {loading.customers ? "កំពុងផ្ទុក..." : "ជ្រើសរើសអតិថិជន"}
                </button>
                {error.customers && <span className="error-text">{error.customers}</span>}
              </div>
              <input
                className="form-input"
                placeholder="បញ្ចូលឈ្មោះ"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              <input
                type="email"
                className="form-input"
                placeholder="អាសយដ្ឋានអ៊ីមែល"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <input
                className="form-input"
                placeholder="អាសយដ្ឋាន ១"
                name="customerAddress1"
                value={formData.customerAddress1}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <input
                className="form-input"
                placeholder="ទីប្រជុំជន"
                name="customerTown"
                value={formData.customerTown}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <input
                className="form-input"
                placeholder="ប្រទេស"
                name="customerCountry"
                value={formData.customerCountry}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <input
                type="tel"
                className="form-input"
                placeholder="លេខទូរស័ព្ទ"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-section">
              <div className="section-header">
                <h2 className="section-title">ព័ត៌មានដឹកជញ្ជូន</h2>
                <button
                  type="button"
                  className="select-customer-link"
                  onClick={() => setShowDeliveryModal(true)}
                  disabled={loading.delivery || isSubmitting}
                >
                  {loading.delivery ? "កំពុងផ្ទុក..." : "ជ្រើសរើសវិធីដឹកជញ្ជូន"}
                </button>
                {error.delivery && <span className="error-text">{error.delivery}</span>}
              </div>
              <input
                className="form-input"
                placeholder="ឈ្មោះអ្នកទទួល/ក្រុមហ៊ុនដឹក"
                name="shippingName"
                value={formData.shippingName}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <input
                className="form-input"
                placeholder="លេខឡាន"
                name="shippingAddress1"
                value={formData.shippingAddress1}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <input
                className="form-input"
                placeholder="លេខអ្នកដឹកជញ្ជូន"
                name="shippingTown"
                value={formData.shippingTown}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="product-table-card">
            <div className="product-table-header">
              <h2 className="product-table-title">ផលិតផល</h2>
              <button
                type="button"
                className="add-product-button"
                onClick={addProductRow}
                disabled={isSubmitting}
              >
                + បន្ថែមផលិតផល
              </button>
            </div>

            <table className="product-table">
              <thead>
                <tr>
                  <th className="table-header">បាកូដ</th>
                  <th className="table-header">ឈ្មោះ</th>
                  <th className="table-header">ទំហំ</th>
                  <th className="table-header">ពណ៌</th>
                  <th className="table-header">បរិមាណ</th>
                  <th className="table-header">តម្លៃឯកតា</th>
                  <th className="table-header">បញ្ចុះតម្លៃ (%)</th>
                  <th className="table-header">សរុប</th>
                  <th className="table-header">ស្តុក</th>
                  <th className="table-header">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody>
                {formData.products.map((product, index) => (
                  <tr key={index}>
                    <td>
                      <div className="product-input-group">
                        <input
                          className="table-input"
                          placeholder="បាកូដ"
                          name="barcode"
                          value={product.barcode}
                          readOnly
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          className="select-product-button"
                          onClick={() => {
                            setSelectedProductIndex(index);
                            setShowProductModal(true);
                          }}
                          disabled={isSubmitting || loading.products || loading.variants}
                        >
                          ជ្រើសរើស
                        </button>
                      </div>
                    </td>
                    <td>
                      <input
                        className="table-input"
                        placeholder="ឈ្មោះផលិតផល"
                        name="name"
                        value={product.name}
                        readOnly
                        disabled={isSubmitting}
                      />
                    </td>
                    <td>
                      <input
                        className="table-input"
                        placeholder="ទំហំ"
                        name="size"
                        value={product.size}
                        readOnly
                        disabled={isSubmitting}
                      />
                    </td>
                    <td>
                      <input
                        className="table-input"
                        placeholder="ពណ៌"
                        name="color"
                        value={product.color}
                        readOnly
                        disabled={isSubmitting}
                      />
                    </td>
                    <td>
                      <input
                        className="table-input"
                        type="number"
                        placeholder="០"
                        name="quantity"
                        value={product.quantity}
                        onChange={(e) => handleProductChange(index, e)}
                        min="1"
                        max={product.stock > 0 ? product.stock : undefined}
                        step="1"
                        required={!!product.product_id}
                        disabled={isSubmitting || !product.product_id}
                      />
                      {product.quantity > product.stock && product.product_id && (
                        <span className="error-text" style={{ fontSize: "0.8em", display: "block" }}>
                          លើសស្តុក!
                        </span>
                      )}
                    </td>
                    <td>
                      <input
                        className="table-input"
                        type="number"
                        placeholder="$0.00"
                        name="unitPrice"
                        value={product.unitPrice}
                        onChange={(e) => handleProductChange(index, e)}
                        min="0"
                        step="0.01"
                        readOnly
                        required={!!product.product_id}
                        disabled={isSubmitting || !product.product_id}
                      />
                    </td>
                    <td>
                      <input
                        className="table-input"
                        type="number"
                        placeholder="០"
                        name="discount"
                        value={product.discount}
                        onChange={(e) => handleProductChange(index, e)}
                        min="0"
                        max="100"
                        step="1"
                        disabled={isSubmitting || !product.product_id}
                      />
                    </td>
                    <td>
                      <span className="table-input-display">${product.total.toFixed(2)}</span>
                    </td>
                    <td>
                      <span className={`stock-value ${product.stock <= 0 ? "stock-zero" : ""}`}>
                        {product.product_id ? product.stock : "-"}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="remove-product-button"
                        onClick={() => removeProductRow(index)}
                        disabled={formData.products.length <= 1 || isSubmitting}
                      >
                        លុប
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="summary-section">
              <div className="summary-item">
                <span className="summary-label">សរុបរង:</span>
                <span className="summary-value">${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">បញ្ចុះតម្លៃរួម (%):</span>
                <input
                  type="number"
                  name="overallDiscount"
                  className="summary-input"
                  placeholder="0"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.overallDiscount}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className="summary-item">
                <span className="summary-label">ទឹកប្រាក់បញ្ចុះតម្លៃ:</span>
                <span className="summary-value">(${discountDisplay.toFixed(2)})</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">ដឹកជញ្ជូន:</span>
                <input
                  type="number"
                  name="shippingCost"
                  className="summary-input"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={formData.shippingCost}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className="summary-item">
                <span className="summary-label">ពន្ធ ({TAX_RATE_PERCENT}%):</span>
                <span className="summary-value">${tax.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="deductTax"
                    className="checkbox-input"
                    checked={formData.deductTax}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  ដកពន្ធ
                </label>
              </div>
              <div className="summary-item total-item">
                <span className="summary-label">សរុប (USD):</span>
                <span className="summary-value">${total.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">សរុប (KHR):</span>
                <span className="summary-value">៛{totalInRiel.toLocaleString()}</span>
              </div>
              {error.submit && <div className="error-text submit-error">{error.submit}</div>}
              <button
                type="submit"
                className="create-button"
                disabled={
                  isSubmitting ||
                  loading.customers ||
                  loading.delivery ||
                  loading.products ||
                  loading.variants
                }
              >
                {isSubmitting ? "កំពុងបង្កើត..." : "បង្កើតវិក្កយបត្រ"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {showCustomerModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>ជ្រើសរើសអតិថិជន</h2>
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="ស្វែងរកអតិថិជន (ឈ្មោះ, អ៊ីមែល, ទូរស័ព្ទ)..."
                value={customerSearchTerm}
                onChange={(e) => setCustomerSearchTerm(e.target.value)}
              />
            </div>
            {loading.customers ? (
              <div className="loading">កំពុងផ្ទុកអតិថិជន...</div>
            ) : error.customers ? (
              <div className="error-message">{error.customers}</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="info-message">
                {customerSearchTerm
                  ? "គ្មានអតិថិជនត្រូវនឹងលក្ខខណ្ឌស្វែងរក"
                  : "មិនមានអតិថិជនទេ"}
              </div>
            ) : (
              <div className="modal-table-container">
                <table className="modal-table customer-table">
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
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id}>
                        <td>{customer.id}</td>
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
              </div>
            )}
            <button
              className="close-button"
              onClick={() => {
                setShowCustomerModal(false);
                setCustomerSearchTerm("");
              }}
            >
              បិទ
            </button>
          </div>
        </div>
      )}

      {showDeliveryModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>ជ្រើសរើសវិធីសាស្រ្តដឹកជញ្ជូន</h2>
            {loading.delivery ? (
              <div className="loading">កំពុងផ្ទុកវិធីដឹកជញ្ជូន...</div>
            ) : error.delivery ? (
              <div className="error-message">{error.delivery}</div>
            ) : deliveryMethods.length === 0 ? (
              <div className="info-message">មិនមានវិធីដឹកជញ្ជូនទេ។</div>
            ) : (
              <div className="modal-table-container">
                <table className="modal-table customer-table">
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
                      <tr key={method.id}>
                        <td>{method.id}</td>
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
              </div>
            )}
            <button className="close-button" onClick={() => setShowDeliveryModal(false)}>
              បិទ
            </button>
          </div>
        </div>
      )}

      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>ជ្រើសរើសផលិតផល</h2>
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="ស្វែងរកផលិតផល..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {loading.variants || loading.products ? (
              <div className="loading">កំពុងផ្ទុកផលិតផល...</div>
            ) : error.variants || error.products ? (
              <div className="error-message">{error.variants || error.products}</div>
            ) : filteredVariants.length === 0 ? (
              <div className="info-message">មិនមានផលិតផលទេ។</div>
            ) : (
              <div className="modal-table-container">
                <table className="modal-table customer-table">
                  <thead>
                    <tr>
                      <th>បាកូដ</th>
                      <th>ឈ្មោះផលិតផល</th>
                      <th>ទំហំ</th>
                      <th>ពណ៌</th>
                      <th>តម្លៃ</th>
                      <th>ស្តុក</th>
                      <th>សកម្មភាព</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVariants.map((variant) => {
                      const product = products.find((p) => p.id === variant.product);
                      return (
                        <tr key={`${variant.product}-${variant.id}`}>
                          <td>{variant.barcode || "-"}</td>
                          <td>{product?.name || "មិនស្គាល់"}</td>
                          <td>{variant.size || "-"}</td>
                          <td>{variant.color || "-"}</td>
                          <td>${parseFloat(variant.selling_price).toFixed(2)}</td>
                          <td>{variant.stock_quantity}</td>
                          <td>
                            <button
                              className="select-button"
                              onClick={() => handleSelectProduct(variant)}
                              disabled={variant.stock_quantity <= 0}
                            >
                              {variant.stock_quantity <= 0 ? "អស់ស្តុក" : "ជ្រើសរើស"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <button
              className="close-button"
              onClick={() => {
                setShowProductModal(false);
                setSearchTerm("");
              }}
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