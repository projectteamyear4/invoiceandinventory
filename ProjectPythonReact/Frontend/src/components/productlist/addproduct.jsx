import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Product.css';

const AddProduct = () => {
  const [products, setProducts] = useState([
    { name: '', category_id: '', description: '', brand: '', image_url: '' },
  ]);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories/');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (index, e) => {
    const newProducts = [...products];
    newProducts[index][e.target.name] = e.target.value;
    setProducts(newProducts);
    if (message) setMessage('');
  };

  const addProductRow = () => {
    setProducts([...products, { name: '', category_id: '', description: '', brand: '', image_url: '' }]);
  };

  const removeProductRow = (index) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const responses = await Promise.all(
        products.map((product) => api.post('/api/products/', product))
      );
      setMessage('Products added successfully!');
      setProducts([{ name: '', category_id: '', description: '', brand: '', image_url: '' }]);
      setTimeout(() => navigate('/products'), 1000);
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.detail || 'Failed to add some products.');
      } else if (error.request) {
        setMessage('Unable to connect to server.');
      } else {
        setMessage('Error: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="product-form-container">
      <h2>Add Products</h2>
      <form onSubmit={handleSubmit} className="product-form">
        {products.map((product, index) => (
          <div key={index} className="product-row">
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={product.name}
              onChange={(e) => handleChange(index, e)}
              required
              disabled={isLoading}
              className="product-input"
            />
            <select
              name="category_id"
              value={product.category_id}
              onChange={(e) => handleChange(index, e)}
              disabled={isLoading}
              className="product-input"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <textarea
              name="description"
              placeholder="Description"
              value={product.description}
              onChange={(e) => handleChange(index, e)}
              disabled={isLoading}
              className="product-input product-textarea"
            />
            <input
              type="text"
              name="brand"
              placeholder="Brand"
              value={product.brand}
              onChange={(e) => handleChange(index, e)}
              disabled={isLoading}
              className="product-input"
            />
            <input
              type="url"
              name="image_url"
              placeholder="Image URL"
              value={product.image_url}
              onChange={(e) => handleChange(index, e)}
              disabled={isLoading}
              className="product-input"
            />
            {products.length > 1 && (
              <button
                type="button"
                onClick={() => removeProductRow(index)}
                disabled={isLoading}
                className="product-remove-button"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addProductRow} disabled={isLoading} className="product-add-row-button">
          Add Another Product
        </button>
        <button type="submit" disabled={isLoading} className="product-button">
          {isLoading ? 'Adding...' : 'Add Products'}
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

export default AddProduct;