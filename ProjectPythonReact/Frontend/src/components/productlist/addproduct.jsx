import React, { useState } from "react";
import "./AddProduct.css";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    image: null,
    barcode: "",
    category_id: "",
    supplier_id: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "image" ? e.target.files[0] : value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "តម្រូវឱ្យមាន"; // Required
    if (!formData.price || isNaN(formData.price)) newErrors.price = "តម្រូវឱ្យជាលេខត្រឹមត្រូវ"; // Valid number needed
    if (!formData.stock_quantity || isNaN(formData.stock_quantity))
      newErrors.stock_quantity = "តម្រូវឱ្យជាលេខត្រឹមត្រូវ"; // Valid number needed
    if (!formData.barcode) newErrors.barcode = "តម្រូវឱ្យមាន"; // Required
    if (!formData.category_id || isNaN(formData.category_id))
      newErrors.category_id = "តម្រូវឱ្យជាលេខត្រឹមត្រូវ"; // Valid number needed
    if (!formData.supplier_id || isNaN(formData.supplier_id))
      newErrors.supplier_id = "តម្រូវឱ្យជាលេខត្រឹមត្រូវ"; // Valid number needed
    if (!formData.image) newErrors.image = "តម្រូវឱ្យមាន"; // Required
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => formDataToSend.append(key, formData[key]));
      console.log("Form data submitted:", formData);
      alert("ផលិតផលបានបន្ថែមដោយជោគជ័យ!"); // Product added successfully!
      setFormData({
        name: "",
        description: "",
        price: "",
        stock_quantity: "",
        image: null,
        barcode: "",
        category_id: "",
        supplier_id: "",
      });
    }
  };

  return (
    <div className="add-product-container">
      <h2 className="title">បន្ថែមផលិតផល</h2> {/* Add Product */}
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="ឈ្មោះផលិតផល" // Product Name
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="តម្លៃ" // Price
              step="0.01"
            />
            {errors.price && <span className="error">{errors.price}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <input
              type="number"
              name="stock_quantity"
              value={formData.stock_quantity}
              onChange={handleChange}
              placeholder="បរិមាណស្តុក" // Stock Quantity
            />
            {errors.stock_quantity && <span className="error">{errors.stock_quantity}</span>}
          </div>
          <div className="form-group">
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />
            {errors.image && <span className="error">{errors.image}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="ការពិពណ៌នា" // Description
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
              placeholder="បាកូដ" // Barcode
            />
            {errors.barcode && <span className="error">{errors.barcode}</span>}
          </div>
          <div className="form-group">
            <input
              type="number"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              placeholder="លេខសម្គាល់ប្រភេទ" // Category ID
            />
            {errors.category_id && <span className="error">{errors.category_id}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <input
              type="number"
              name="supplier_id"
              value={formData.supplier_id}
              onChange={handleChange}
              placeholder="លេខសម្គាល់អ្នកផ្គត់ផ្គង់" // Supplier ID
            />
            {errors.supplier_id && <span className="error">{errors.supplier_id}</span>}
          </div>
          <div className="form-group empty"></div>
        </div>

        <button type="submit" className="submit-button">
          បន្ថែមផលិតផល {/* Add Product */}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;