// src/components/AddPurchase.jsx
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Purchases.css';

const AddPurchase = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [productVariants, setProductVariants] = useState([]);
  const [formData, setFormData] = useState({
    supplier: '',
    product: '',
    product_variant: '',
    batch_number: '',
    quantity: '',
    purchase_price: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: 'http://localhost:8000',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supplierRes, productRes, variantRes] = await Promise.all([
          api.get('/api/suppliers/'),
          api.get('/api/products/'),
          api.get('/api/variants/'),
        ]);
        console.log('Suppliers:', supplierRes.data);
        console.log('Products:', productRes.data);
        console.log('Variants:', variantRes.data);
        setSuppliers(supplierRes.data);
        setProducts(productRes.data);
        setProductVariants(variantRes.data);
      } catch (err) {
        setError('Failed to load options. Please try again.');
        console.error('Fetch error:', err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field ${name} changed to: ${value}`);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const purchaseData = {
      supplier: parseInt(formData.supplier) || null,
      product: parseInt(formData.product) || null,
      product_variant: formData.product_variant ? parseInt(formData.product_variant) : null,
      batch_number: formData.batch_number || null,
      quantity: parseInt(formData.quantity) || null,
      purchase_price: parseFloat(formData.purchase_price) || null,
    };
    console.log('Submitting purchase data:', purchaseData);
    if (!purchaseData.supplier || !purchaseData.product || !purchaseData.batch_number || !purchaseData.quantity || !purchaseData.purchase_price) {
      setError('All required fields must be filled.');
      return;
    }
    try {
      const response = await api.post('/api/purchases/', purchaseData);
      console.log('Server response:', response.data);
      setSuccess('Purchase added successfully!');
      setTimeout(() => navigate('/purchases'), 1000);
    } catch (err) {
      const errorMsg = err.response?.data || 'Failed to add purchase. Please check your input.';
      setError(JSON.stringify(errorMsg));
      console.error('Full error:', err.response?.data || err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="product-table-container">
      <div className="product-header">
        <h2>Add New Purchase</h2>
      </div>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <form onSubmit={handleSubmit} className="add-form">
        <div className="form-group">
          <label>Supplier:</label>
          <select name="supplier" value={formData.supplier} onChange={handleChange} required>
            <option value="">Select Supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Product:</label>
          <select name="product" value={formData.product} onChange={handleChange} required>
            <option value="">Select Product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Product Variant (Optional):</label>
          <select name="product_variant" value={formData.product_variant} onChange={handleChange}>
            <option value="">No Variant</option>
            {productVariants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.product.name} - {variant.size || ''} {variant.color || ''}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Batch Number:</label>
          <input
            type="text"
            name="batch_number"
            value={formData.batch_number}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Quantity:</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            required
          />
        </div>
        <div className="form-group">
          <label>Purchase Price:</label>
          <input
            type="number"
            name="purchase_price"
            value={formData.purchase_price}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
          />
        </div>
        <button type="submit" className="product-add-button">
          Save Purchase
        </button>
      </form>
    </div>
  );
};

export default AddPurchase;