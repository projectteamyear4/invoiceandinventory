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

    if (name === "image") {
      setFormData({
        ...formData,
        image: e.target.files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.price || isNaN(formData.price)) newErrors.price = "Valid price is required";
    if (!formData.stock_quantity || isNaN(formData.stock_quantity))
      newErrors.stock_quantity = "Valid stock quantity is required";
    if (!formData.barcode) newErrors.barcode = "Barcode is required";
    if (!formData.category_id || isNaN(formData.category_id))
      newErrors.category_id = "Valid category ID is required";
    if (!formData.supplier_id || isNaN(formData.supplier_id))
      newErrors.supplier_id = "Valid supplier ID is required";
    if (!formData.image) newErrors.image = "Image file is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form data submitted:", formData);

      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      alert("Product added successfully!");
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
    } else {
      console.log("Form validation failed");
    }
  };

  return (
    <div className="add-product-container">
      <h2 className="title">Add New Product</h2>
      <form onSubmit={handleSubmit} className="product-form">
        {/* Pair for Name and Price */}
        <div className="form-pair">
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              className="form-input"
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Price:</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Enter product price"
              step="0.01"
              className="form-input"
            />
            {errors.price && <span className="error">{errors.price}</span>}
          </div>
        </div>

        {/* Pair for Stock Quantity and Image */}
        <div className="form-pair">
          <div className="form-group">
            <label>Stock Quantity:</label>
            <input
              type="number"
              name="stock_quantity"
              value={formData.stock_quantity}
              onChange={handleChange}
              placeholder="Enter stock quantity"
              className="form-input"
            />
            {errors.stock_quantity && <span className="error">{errors.stock_quantity}</span>}
          </div>

          <div className="form-group">
            <label>Image:</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="form-input"
            />
            {errors.image && <span className="error">{errors.image}</span>}
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description"
            className="form-input"
          />
        </div>

        {/* Pair for Supplier ID and Category ID */}
        <div className="form-pair">
          <div className="form-group">
            <label>Supplier ID:</label>
            <input
              type="number"
              name="supplier_id"
              value={formData.supplier_id}
              onChange={handleChange}
              placeholder="Enter supplier ID"
              className="form-input"
            />
            {errors.supplier_id && <span className="error">{errors.supplier_id}</span>}
          </div>

          <div className="form-group">
            <label>Category ID:</label>
            <input
              type="number"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              placeholder="Enter category ID"
              className="form-input"
            />
            {errors.category_id && <span className="error">{errors.category_id}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Barcode:</label>
          <input
            type="text"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            placeholder="Enter barcode"
            className="form-input"
          />
          {errors.barcode && <span className="error">{errors.barcode}</span>}
        </div>

        <button type="submit" className="submit-button">
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
