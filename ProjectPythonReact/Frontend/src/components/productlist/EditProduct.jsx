// src/components/EditProduct.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Product.css';

const EditProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    category_id: '', // Use category_id instead of category
    description: '',
    brand: '',
    image_url: '',
  });
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { productId } = useParams();
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
        const productResponse = await api.get(`/api/products/${productId}/`);
        // Map category object to category_id
        const productData = {
          ...productResponse.data,
          category_id: productResponse.data.category?.id || '', // Extract category ID
        };
        setFormData(productData);

        const categoryResponse = await api.get('/api/categories/');
        setCategories(categoryResponse.data);
      } catch (error) {
        setMessage('Failed to load product or categories.');
      }
    };
    fetchData();
  }, [productId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message) setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Create payload with category_id
      const payload = {
        ...formData,
        category_id: formData.category_id || null, // Ensure category_id is sent
      };
      await api.put(`/api/products/${productId}/`, payload);
      setMessage('Product updated successfully!');
      setTimeout(() => navigate('/products'), 1000);
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to update product.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="product-form-container">
      <h2>កែសម្រួលផលិតផល</h2>
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-row">
          <input
            type="text"
            name="name"
            placeholder="ឈ្មោះផលិតផល"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="product-input"
          />
          <select
            name="category_id" // Use category_id instead of category
            value={formData.category_id}
            onChange={handleChange}
            disabled={isLoading}
            className="product-input"
          >
            <option value="">ជ្រើសរើសប្រភេទ</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <input
            type="text"
            name="description"
            placeholder="ការពិពណ៌នា"
            value={formData.description}
            onChange={handleChange}
            disabled={isLoading}
            className="product-input"
          />
          <input
            type="text"
            name="brand"
            placeholder="ម៉ាក"
            value={formData.brand}
            onChange={handleChange}
            disabled={isLoading}
            className="product-input"
          />
        </div>
        <div className="form-row">
          <input
            type="text"
            name="image_url"
            placeholder="URL រូបភាព"
            value={formData.image_url}
            onChange={handleChange}
            disabled={isLoading}
            className="product-input"
          />
        </div>
        <button type="submit" disabled={isLoading} className="product-button">
          {isLoading ? 'កំពុងធ្វើបច្ចុប្បន្នភាព...' : 'ធ្វើបច្ចុប្បន្នភាពផលិតផល'}
        </button>
      </form>
      {message && (
        <p className={`product-message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default EditProduct;