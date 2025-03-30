// src/components/InvoiceForm.jsx
import axios from "axios";
import React, { useEffect, useState } from "react";
import "./InvoiceForm.css"; // Make sure you have this CSS file or remove/replace the import

const InvoiceForm = () => {
  // Form state
  const [formData, setFormData] = useState({
    type: "វិក្កយបត្រ", // Default: Invoice
    status: "បើក",       // Default: Open
    date: new Date().toISOString().split("T")[0], // Default: Today's date
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
    shippingPostcode: "", // Note: This wasn't used in the form fields but is in state
    notes: "",
    paymentMethod: "",
    products: [ // Initial product row
      {
        product_id: "",
        variant_id: "",
        barcode: "",
        name: "", // Name will be constructed on selection
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
    // Totals will be calculated, not part of initial state usually sent to backend directly from here
  });

  // API data states
  const [customers, setCustomers] = useState([]);
  const [deliveryMethods, setDeliveryMethods] = useState([]);
  const [products, setProducts] = useState([]); // Base products list
  const [variants, setVariants] = useState([]); // Product variants list

  // UI states
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0); // Index of product row being edited
  const [loading, setLoading] = useState({
    customers: true,
    delivery: true,
    products: true,
    variants: true,
    submit: false, // Added for submit button state
  });
  const [error, setError] = useState({
    customers: null,
    delivery: null,
    products: null,
    variants: null,
  });

  // Create axios instance (Ensure backend is running at http://localhost:8000)
  const api = axios.create({
    baseURL: "http://localhost:8000", // Use environment variables in production
    headers: {
      "Content-Type": "application/json",
      // Make sure 'access_token' is correctly set in localStorage upon login
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  // Fetch all required data on component mount
  useEffect(() => {
    const fetchData = async () => {
      // Reset loading and error states
       setLoading({ customers: true, delivery: true, products: true, variants: true, submit: false });
       setError({ customers: null, delivery: null, products: null, variants: null });

      try {
        // Using Promise.all for potentially faster parallel fetching
        const [customersRes, deliveryRes, productsRes, variantsRes] = await Promise.all([
          api.get("/api/customers/"),
          api.get("/api/delivery-methods/"),
          api.get("/api/products/"),
          api.get("/api/variants/")
        ]);

        setCustomers(customersRes.data);
        setDeliveryMethods(deliveryRes.data);
        setProducts(productsRes.data);
        setVariants(variantsRes.data);

      } catch (err) {
        console.error("API Error:", err);
         setError({
           customers: "Failed to load customers",
           delivery: "Failed to load delivery methods",
           products: "Failed to load products",
           variants: "Failed to load product variants",
         });
      } finally {
         // Set all loading states to false regardless of success or failure
         setLoading({ customers: false, delivery: false, products: false, variants: false, submit: false });
      }
    };

    fetchData();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount

  // Handle general form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle product input changes (quantity, discount) with safe number handling
  const handleProductChange = (index, e) => {
    const { name, value } = e.target;
    const updatedProducts = [...formData.products];
    const currentProduct = updatedProducts[index];

    // Update the specific field, converting numeric fields appropriately
    updatedProducts[index] = {
      ...currentProduct,
      [name]: name === "quantity" || name === "unitPrice" || name === "discount"
        ? parseFloat(value) || 0 // Ensure it's a number, default to 0 if parsing fails
        : value,
    };

    // Recalculate total for the changed product row
    const quantity = Number(updatedProducts[index].quantity) || 0;
    const unitPrice = Number(updatedProducts[index].unitPrice) || 0;
    const discount = Number(updatedProducts[index].discount) || 0;
    const stock = Number(updatedProducts[index].stock) || 0;

    // Prevent quantity from exceeding stock if stock is known and greater than 0
    const validatedQuantity = stock > 0 && quantity > stock ? stock : (quantity < 1 ? 1 : quantity); // Ensure quantity is at least 1

     // Update quantity in the array if it was adjusted
    updatedProducts[index].quantity = validatedQuantity;

    // Calculate total using the validated quantity
    updatedProducts[index].total = validatedQuantity * unitPrice * (1 - discount / 100);

    setFormData({ ...formData, products: updatedProducts });
  };

  // Add new empty product row
  const addProductRow = () => {
    setFormData({
      ...formData,
      products: [
        ...formData.products,
        // Add a new product object with default/empty values
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

  // Remove product row by index
  const removeProductRow = (index) => {
    // Prevent removing the last row
    if (formData.products.length <= 1) return;

    const updatedProducts = [...formData.products];
    updatedProducts.splice(index, 1); // Remove the item at the specified index
    setFormData({ ...formData, products: updatedProducts });
  };

  // Select customer from modal and update form
  const handleSelectCustomer = (customer) => {
    setFormData({
      ...formData,
      customerName: `${customer.first_name} ${customer.last_name}`,
      customerEmail: customer.email || "", // Handle potentially null email
      customerAddress1: customer.address || "",
      customerTown: customer.city || "",
      customerCountry: customer.country || "",
      customerPhone: customer.phone_number || "",
    });
    setShowCustomerModal(false); // Close modal
  };

  // Select delivery method from modal and update form
  const handleSelectDelivery = (method) => {
    setFormData({
      ...formData,
      shippingName: method.delivery_name || "",
      shippingAddress1: method.car_number || "", // Assuming car number -> address1
      shippingTown: method.delivery_number || "", // Assuming delivery number -> town/phone? Check mapping
    });
    setShowDeliveryModal(false); // Close modal
  };

// ========================================================================
//  MODIFIED FUNCTION TO CONSTRUCT PRODUCT NAME WITH VARIANT DETAILS
// ========================================================================
  const handleSelectVariant = (variant) => {
    const updatedProducts = [...formData.products];
    const product = products.find((p) => p.product_id === variant.product_id);

    // --- START: Modified Name Construction ---
    const baseName = product?.name || "N/A";
    const variantSize = variant.size || "";
    const variantColor = variant.color || "";

    let combinedName = baseName;
    const details = [];
    if (variantColor) details.push(variantColor);
    if (variantSize) details.push(variantSize);

    if (details.length > 0) {
      combinedName += ` (${details.join(", ")})`; // e.g., "T-Shirt (Red, M)"
    }
    // --- END: Modified Name Construction ---

    const unitPrice = Number(variant.selling_price) || 0;
    const stock = Number(variant.stock_quantity) || 0;
    const purchasePrice = Number(variant.purchase_price) || 0;
    const quantity = 1;
    const discount = 0;

    updatedProducts[selectedProductIndex] = {
      ...updatedProducts[selectedProductIndex],
      product_id: variant.product_id,
      variant_id: variant.id,
      barcode: variant.barcode || "",
      // --- Use the newly constructed combined name ---
      name: combinedName,
      // --- Store original size and color separately too ---
      size: variantSize,
      color: variantColor,
      purchasePrice: purchasePrice,
      unitPrice: unitPrice,
      stock: stock,
      quantity: quantity,
      discount: discount,
      total: quantity * unitPrice * (1 - discount / 100),
    };

    setFormData({ ...formData, products: updatedProducts });
    setShowProductModal(false);
  };
// ========================================================================
//  END OF MODIFIED FUNCTION
// ========================================================================


  // Calculate invoice totals (Subtotal, Tax, Total)
  const calculateTotals = () => {
    const subtotal = formData.products.reduce((sum, product) => {
      return sum + (Number(product.total) || 0);
    }, 0);

    const taxRate = 0.10; // 10% Tax Rate
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    const exchangeRate = 4000; // Example: 1 USD = 4000 KHR
    const totalInRiel = total * exchangeRate;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
      totalInRiel: Number(totalInRiel.toFixed(0)), // Riel usually doesn't use decimals
    };
  };

  // Get calculated totals
  const { subtotal, tax, total, totalInRiel } = calculateTotals();

  // Available payment methods (Khmer)
  const paymentMethods = [
    { value: "សាច់ប្រាក់", label: "សាច់ប្រាក់" },       // Cash
    { value: "ផ្ទេរប្រាក់", label: "ផ្ទេរប្រាក់" },      // Bank Transfer
    { value: "កាតឥណទាន", label: "កាតឥណទាន" },    // Credit Card
    { value: "អេឡិចត្រូនិច", label: "ការទូទាត់អេឡិចត្រូនិច" }, // Electronic Payment
  ];

  // Format number for display, ensuring it's a number and has 2 decimal places
  const formatNumber = (value, decimals = 2) => {
    const num = Number(value);
    return isNaN(num) ? (0).toFixed(decimals) : num.toFixed(decimals);
  };

   // Handle form submission
   const handleSubmit = async (e) => {
     e.preventDefault();

     // Basic Validation
     if (!formData.dueDate || !formData.customerName || !formData.paymentMethod || formData.products.some(p => !p.variant_id)) {
       alert("សូមបំពេញគ្រប់ព័ត៌មានចាំបាច់ (ថ្ងៃផុតកំណត់, ឈ្មោះអតិថិជន, វិធីបង់ប្រាក់, និងជ្រើសរើសផលិតផល).");
       return;
     }

     setLoading(prev => ({ ...prev, submit: true }));

     try {
       const invoiceData = {
         invoice_type: formData.type,
         status: formData.status,
         invoice_date: formData.date,
         due_date: formData.dueDate,
         customer_name: formData.customerName,
         customer_email: formData.customerEmail,
         customer_address: formData.customerAddress1,
         customer_city: formData.customerTown,
         customer_country: formData.customerCountry,
         customer_phone: formData.customerPhone,
         shipping_name: formData.shippingName,
         shipping_address: formData.shippingAddress1,
         shipping_city: formData.shippingTown,
         shipping_country: formData.shippingCountry,
         notes: formData.notes,
         payment_method: formData.paymentMethod,
         subtotal: subtotal,
         tax: tax,
         total_amount: total,
         total_amount_riel: totalInRiel,
         items: formData.products.map(p => ({
           product_variant_id: p.variant_id,
           // NOTE: Send the constructed name if the backend needs it,
           // otherwise, it might only need variant_id
           // product_name_display: p.name, // Optional: send the combined name
           quantity: Number(p.quantity) || 0,
           unit_price: Number(p.unitPrice) || 0,
           discount: Number(p.discount) || 0,
           total_price: Number(p.total) || 0,
         })),
       };

        console.log("Sending Invoice Data:", JSON.stringify(invoiceData, null, 2));
        const response = await api.post("/api/invoices/", invoiceData);

        console.log("Invoice created successfully:", response.data);
        alert("វិក្កយបត្របានបង្កើតដោយជោគជ័យ!");

       // Consider resetting form or navigating away
       // setFormData({ ...initialFormData }); // Reset form state if needed

     } catch (err) {
       console.error("Error creating invoice:", err.response ? err.response.data : err.message);
       const errorMessage = err.response?.data?.detail || err.message || "មានបញ្ហាក្នុងការបង្កើតវិក្កយបត្រ។ សូមព្យាយាមម្តងទៀត។";
       alert(`Error: ${errorMessage}`);
     } finally {
       setLoading(prev => ({ ...prev, submit: false }));
     }
   };


  // Main component render
  return (
    <div className="invoice-container">
      {/* Page Title */}
      <h1 className="invoice-title">
        <span className="title-highlight">បង្កើតថ្មី</span> វិក្កយបត្រ{" "}
        {/* Create New Invoice */}
      </h1>

      {/* Form Card */}
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {/* Invoice Type, Dates */}
          <div className="select-section">
            <label className="select-label">ជ្រើសរើសប្រភេទ:</label>{" "}
            {/* Select Type */}
            <div className="select-group">
              <select
                className="select-input"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="វិក្កយបត្រ">វិក្កយបត្រ</option> {/* Invoice */}
                <option value="វិក្កយបត្របញ្ជាទិញ">វិក្កយបត្របញ្ជាទិញ</option>{" "}
                {/* Purchase Order Invoice */}
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
                placeholder="ថ្ងៃផុតកំណត់" // Due Date
              />
            </div>
          </div>

          {/* Main Form Grid (Notes, Customer, Delivery) */}
          <div className="form-grid">
            {/* Notes and Payment Section */}
            <div className="form-section">
              <h2 className="section-title">កំណត់សម្គាល់</h2> {/* Notes */}
              <textarea
                className="form-textarea"
                placeholder="បញ្ចូលកំណត់សម្គាល់" /* Enter notes */
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
              <div className="payment-section">
                <label className="payment-label">វិធីបង់ប្រាក់:</label>{" "}
                {/* Payment Method */}
                <select
                  className="payment-select"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  required
                >
                  <option value="">ជ្រើសរើសវិធីបង់ប្រាក់</option>{" "}
                  {/* Select Payment Method */}
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Customer Information Section */}
            <div className="form-section">
              <div className="section-header">
                <h2 className="section-title">ព័ត៌មានអតិថិជន</h2>{" "}
                {/* Customer Information */}
                <button
                  type="button"
                  className="select-customer-link"
                  onClick={() => setShowCustomerModal(true)}
                  disabled={loading.customers} // Disable while loading
                >
                  {loading.customers ? "កំពុងផ្ទុក..." : "ជ្រើសរើសអតិថិជន"}
                  {/* Loading... / Select Customer */}
                </button>
                {error.customers && (
                  <span className="error-text">{error.customers}</span>
                )}
              </div>
              <input
                className="form-input"
                placeholder="បញ្ចូលឈ្មោះ" /* Enter Name */
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
              />
              <input
                className="form-input"
                type="email"
                placeholder="អាសយដ្ឋានអ៊ីមែល" /* Email Address */
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
              />
              <input
                className="form-input"
                placeholder="អាសយដ្ឋាន ១" /* Address 1 */
                name="customerAddress1"
                value={formData.customerAddress1}
                onChange={handleChange}
              />
              <input
                className="form-input"
                placeholder="ទីប្រជុំជន" /* Town/City */
                name="customerTown"
                value={formData.customerTown}
                onChange={handleChange}
              />
              <input
                className="form-input"
                placeholder="ប្រទេស" /* Country */
                name="customerCountry"
                value={formData.customerCountry}
                onChange={handleChange}
              />
              <input
                 className="form-input"
                 type="tel"
                 placeholder="លេខទូរស័ព្ទ" /* Phone Number */
                 name="customerPhone"
                 value={formData.customerPhone}
                 onChange={handleChange}
               />
            </div>

            {/* Delivery Information Section */}
            <div className="form-section">
              <div className="section-header">
                <h2 className="section-title">ព័ត៌មានដឹកជញ្ជូន</h2>{" "}
                {/* Delivery Information */}
                <button
                  type="button"
                  className="select-customer-link" // Reusing class, consider renaming
                  onClick={() => setShowDeliveryModal(true)}
                  disabled={loading.delivery} // Disable while loading
                >
                  {loading.delivery ? "កំពុងផ្ទុក..." : "ជ្រើសរើសវិធីដឹកជញ្ជូន"}
                  {/* Loading... / Select Delivery Method */}
                </button>
                {error.delivery && (
                  <span className="error-text">{error.delivery}</span>
                )}
              </div>
              <input
                className="form-input"
                placeholder="ឈ្មោះអ្នកដឹក/ក្រុមហ៊ុន" /* Driver/Company Name */
                name="shippingName"
                value={formData.shippingName}
                onChange={handleChange}
              />
              <input
                className="form-input"
                placeholder="ស្លាកលេខ/អាសយដ្ឋាន" /* Plate No./Address */
                name="shippingAddress1"
                value={formData.shippingAddress1}
                onChange={handleChange}
              />
              <input
                className="form-input"
                placeholder="លេខទូរស័ព្ទអ្នកដឹក" /* Driver Phone */
                name="shippingTown" // Check if this field is correct for Driver Phone
                value={formData.shippingTown}
                onChange={handleChange}
              />
               <input
                 className="form-input"
                 placeholder="ប្រទេស" /* Country (Optional for shipping) */
                 name="shippingCountry"
                 value={formData.shippingCountry}
                 onChange={handleChange}
               />
            </div>
          </div> {/* End Form Grid */}

          {/* Product Table Section */}
          <div className="product-table-card">
            <div className="product-table-header">
              <h2 className="product-table-title">ផលិតផល</h2> {/* Products */}
              <button
                type="button"
                className="add-product-button"
                onClick={addProductRow}
              >
                + បន្ថែមផលិតផល {/* + Add Product */}
              </button>
            </div>

            <table className="product-table">
              <thead>
                <tr>
                  {/* Now the Name column will show the combined name */}
                  <th>ឈ្មោះផលិតផល</th> {/* Product Name */}
                  <th>ទំហំ</th> {/* Size */}
                  <th>ពណ៌</th> {/* Color */}
                  <th>តម្លៃទិញ</th> {/* Purchase Price */}
                  <th>តម្លៃលក់</th> {/* Selling Price */}
                  <th>បរិមាណ</th> {/* Quantity */}
                  <th>បញ្ចុះតម្លៃ (%)</th> {/* Discount (%) */}
                  <th>សរុប</th> {/* Total */}
                  <th>ស្តុក</th> {/* Stock */}
                  <th>សកម្មភាព</th> {/* Actions */}
                </tr>
              </thead>
              <tbody>
                {formData.products.map((product, index) => (
                  <tr key={index}>
                    {/* Product Name (Now shows combined name, selected via Modal) */}
                    <td>
                      <div className="product-input-group">
                         {/* Display the constructed name */}
                        <input
                          className="table-input product-name-display" // Added class for styling
                          value={product.name || " "} // Show space if no name yet
                          disabled
                          title={product.name} // Show full name on hover if it overflows
                        />
                        <button
                           type="button"
                           className="select-product-button"
                           onClick={() => {
                             setSelectedProductIndex(index); // Set index for which row to update
                             setShowProductModal(true);      // Open modal
                           }}
                           disabled={loading.products || loading.variants} // Disable if products/variants loading
                         >
                           {loading.products || loading.variants ? "..." : "ជ្រើសរើស"} {/* Select */}
                         </button>
                      </div>
                    </td>
                     {/* Size (Still shown, but also part of name now) */}
                     <td>
                       <input
                         className="table-input"
                         value={product.size || "-"}
                         disabled
                         placeholder="-"
                       />
                     </td>
                     {/* Color (Still shown, but also part of name now) */}
                     <td>
                       <input
                         className="table-input"
                         value={product.color || "-"}
                         disabled
                         placeholder="-"
                       />
                     </td>
                     {/* Purchase Price */}
                     <td>
                       <input
                         className="table-input"
                         value={`$${formatNumber(product.purchasePrice)}`}
                         disabled
                         placeholder="$0.00"
                       />
                     </td>
                     {/* Unit Price */}
                     <td>
                       <input
                         className="table-input"
                         value={`$${formatNumber(product.unitPrice)}`}
                         disabled
                         placeholder="$0.00"
                       />
                     </td>
                     {/* Quantity */}
                     <td>
                       <input
                         className="table-input"
                         type="number"
                         name="quantity"
                         value={product.quantity}
                         onChange={(e) => handleProductChange(index, e)}
                         min="1"
                         step="1"
                         disabled={!product.variant_id}
                       />
                     </td>
                     {/* Discount */}
                     <td>
                       <input
                         className="table-input"
                         type="number"
                         name="discount"
                         value={product.discount}
                         onChange={(e) => handleProductChange(index, e)}
                         min="0"
                         max="100"
                         step="0.01"
                         disabled={!product.variant_id}
                       />
                     </td>
                     {/* Total */}
                     <td>
                       <input
                         className="table-input"
                         value={`$${formatNumber(product.total)}`}
                         disabled
                         placeholder="$0.00"
                       />
                     </td>
                     {/* Stock */}
                     <td>
                       <span className={`stock-value ${product.stock <= 0 ? 'stock-zero' : ''}`}>
                         {product.variant_id ? product.stock : "-"}
                        </span>
                     </td>
                     {/* Actions */}
                     <td>
                       <button
                         type="button"
                         className="remove-product-button"
                         onClick={() => removeProductRow(index)}
                         disabled={formData.products.length <= 1}
                       >
                         លុប {/* Remove */}
                       </button>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary Section */}
            <div className="summary-section">
              <div className="summary-item">
                <span className="summary-label">សរុបរង:</span> {/* Subtotal */}
                <span className="summary-value">${formatNumber(subtotal)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">ពន្ធ (10%):</span> {/* Tax (10%) */}
                <span className="summary-value">${formatNumber(tax)}</span>
              </div>
              <div className="summary-item total-item">
                <span className="summary-label">សរុប (USD):</span> {/* Total */}
                <span className="summary-value">${formatNumber(total)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">សរុប (KHR):</span> {/* Total */}
                <span className="summary-value">
                  ៛{totalInRiel.toLocaleString("km-KH")} {/* Format Riel */}
                </span>
              </div>
              {/* Submit Button */}
              <button
                  type="submit"
                  className="create-button"
                  disabled={loading.submit} // Disable button when submitting
                >
                  {loading.submit ? "កំពុងបង្កើត..." : "បង្កើតវិក្កយបត្រ"}
                  {/* Creating... / Create Invoice */}
              </button>
            </div>
          </div> {/* End Product Table Card */}
        </form>
      </div> {/* End Form Card */}

      {/* --- Modals --- */}

      {/* Customer Selection Modal */}
      {showCustomerModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>ជ្រើសរើសអតិថិជន</h2> {/* Select Customer */}
            {loading.customers ? (
              <div className="loading">កំពុងផ្ទុកអតិថិជន...</div> /* Loading Customers... */
            ) : error.customers ? (
              <div className="error-message">{error.customers}</div>
            ) : (
              <table className="customer-table"> {/* Use a more specific class? */}
                <thead>
                  <tr>
                    <th>លេខសម្គាល់</th> {/* ID */}
                    <th>ឈ្មោះ</th> {/* First Name */}
                    <th>នាមត្រកូល</th> {/* Last Name */}
                    <th>អ៊ីមែល</th> {/* Email */}
                    <th>លេខទូរស័ព្ទ</th> {/* Phone Number */}
                    <th>សកម្មភាព</th> {/* Action */}
                  </tr>
                </thead>
                <tbody>
                  {customers.length > 0 ? customers.map((customer) => (
                    <tr key={customer.customer_id}>
                      <td>{customer.customer_id}</td>
                      <td>{customer.first_name}</td>
                      <td>{customer.last_name}</td>
                      <td>{customer.email || "-"}</td>
                      <td>{customer.phone_number || "-"}</td>
                      <td>
                        <button
                          className="select-button"
                          onClick={() => handleSelectCustomer(customer)}
                        >
                          ជ្រើសរើស {/* Select */}
                        </button>
                      </td>
                    </tr>
                  )) : (
                     <tr><td colSpan="6">No customers found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
            <button
              className="close-button"
              onClick={() => setShowCustomerModal(false)}
            >
              បិទ {/* Close */}
            </button>
          </div>
        </div>
      )}

      {/* Delivery Method Modal */}
      {showDeliveryModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>ជ្រើសរើសវិធីសាស្រ្តដឹកជញ្ជូន</h2> {/* Select Delivery Method */}
             {loading.delivery ? (
               <div className="loading">កំពុងផ្ទុកវិធីដឹកជញ្ជូន...</div> /* Loading Delivery Methods... */
             ) : error.delivery ? (
               <div className="error-message">{error.delivery}</div>
             ) : (
               <table className="customer-table"> {/* Reusing class */}
                 <thead>
                   <tr>
                     <th>លេខសម្គាល់</th> {/* ID */}
                     <th>ឈ្មោះដឹកជញ្ជូន</th> {/* Delivery Name */}
                     <th>លេខឡាន</th> {/* Car Number */}
                     <th>លេខដឹកជញ្ជូន</th> {/* Delivery Number */}
                     <th>សកម្មភាព</th> {/* Action */}
                   </tr>
                 </thead>
                 <tbody>
                   {deliveryMethods.length > 0 ? deliveryMethods.map((method) => (
                     <tr key={method.delivery_method_id}>
                       <td>{method.delivery_method_id}</td>
                       <td>{method.delivery_name}</td>
                       <td>{method.car_number || "-"}</td>
                       <td>{method.delivery_number || "-"}</td>
                       <td>
                         <button
                           className="select-button"
                           onClick={() => handleSelectDelivery(method)}
                         >
                           ជ្រើសរើស {/* Select */}
                         </button>
                       </td>
                     </tr>
                   )) : (
                      <tr><td colSpan="5">No delivery methods found.</td></tr>
                   )}
                 </tbody>
               </table>
             )}
             <button
               className="close-button"
               onClick={() => setShowDeliveryModal(false)}
             >
               បិទ {/* Close */}
             </button>
          </div>
        </div>
      )}

       {/* Product Variant Selection Modal (Displays base name, applies combined name on select) */}
       {showProductModal && (
         <div className="modal-overlay">
           {/* Made modal slightly wider for better table view */}
           <div className="modal-content modal-content-large">
             <h2>ជ្រើសរើសវ៉ារ្យ៉ង់ផលិតផល</h2> {/* Select Product Variant */}
             {loading.products || loading.variants ? (
               <div className="loading">កំពុងផ្ទុកផលិតផល...</div> /* Loading Products... */
             ) : error.products || error.variants ? (
               <div className="error-message">
                 {error.products || error.variants}
               </div>
             ) : (
               <table className="customer-table product-variant-table"> {/* Added specific class */}
                 <thead>
                   <tr>
                     {/* Modal still shows base name for clarity */}
                     <th>ឈ្មោះផលិតផល</th> {/* Product Name */}
                     <th>ទំហំ</th> {/* Size */}
                     <th>ពណ៌</th> {/* Color */}
                     <th>តម្លៃលក់</th> {/* Selling Price */}
                     <th>ស្តុក</th> {/* Stock */}
                     <th>Barcode</th> {/* Barcode */}
                     <th>សកម្មភាព</th> {/* Action */}
                   </tr>
                 </thead>
                 <tbody>
                   {variants.length > 0 ? variants.map((variant) => {
                     // Find the corresponding base product name
                     const product = products.find(
                       (p) => p.product_id === variant.product_id
                     );
                     const currentStock = Number(variant.stock_quantity) ?? 0;
                     return (
                       <tr key={variant.id} className={currentStock <= 0 ? 'out-of-stock-row' : ''}>
                         <td>{product?.name || "N/A"}</td> {/* Show base name in modal */}
                         <td>{variant.size || "-"}</td>
                         <td>{variant.color || "-"}</td>
                         <td>${formatNumber(variant.selling_price)}</td>
                         <td>{currentStock}</td>
                         <td>{variant.barcode || "-"}</td>
                         <td>
                           <button
                             className="select-button"
                             onClick={() => handleSelectVariant(variant)}
                             disabled={currentStock <= 0} // Disable select if no stock
                           >
                             {currentStock <= 0 ? "អស់ស្តុក" : "ជ្រើសរើស"} {/* Out of Stock / Select */}
                           </button>
                         </td>
                       </tr>
                     );
                   }) : (
                      <tr><td colSpan="7">No product variants found.</td></tr>
                   )}
                 </tbody>
               </table>
             )}
             <button
               className="close-button"
               onClick={() => setShowProductModal(false)}
             >
               បិទ {/* Close */}
             </button>
           </div>
         </div>
       )}

    </div> // End invoice-container
  );
};

export default InvoiceForm;