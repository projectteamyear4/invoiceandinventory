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
  const [isSuccess, setIsSuccess] = useState(false); // New state for success animation
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
        console.error('មានបញ្ហាក្នុងការទាញយកប្រភេទផលិតផល:', error);
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
      setMessage('បានបន្ថែមផលិតផលដោយជោគជ័យ!');
      setIsSuccess(true); // Trigger success state for animation
      setTimeout(() => {
        navigate('/products', { replace: true }); // Replace history to prevent back navigation
      }, 1500); // Delay for smooth transition (1.5s)
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.detail || 'មិនអាចបន្ថែមផលិតផលបានទេ។');
      } else if (error.request) {
        setMessage('មិនអាចភ្ជាប់ទៅម៉ាស៊ីនបម្រើបានទេ។');
      } else {
        setMessage('កំហុស: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="product-form-container">
      <h2>បន្ថែមផលិតផល</h2>
      <form
        onSubmit={handleSubmit}
        className={`product-form ${isSuccess ? 'fade-out' : ''}`} // Add fade-out class on success
      >
        {products.map((product, index) => (
          <div key={index} className="product-row">
            <input
              type="text"
              name="name"
              placeholder="ឈ្មោះផលិតផល"
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
              <option value="">ជ្រើសប្រភេទ</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <textarea
              name="description"
              placeholder="សេចក្ដីពិពណ៌នា"
              value={product.description}
              onChange={(e) => handleChange(index, e)}
              disabled={isLoading}
              className="product-input product-textarea"
            />
            <input
              type="text"
              name="brand"
              placeholder="ម៉ាកផលិតផល"
              value={product.brand}
              onChange={(e) => handleChange(index, e)}
              disabled={isLoading}
              className="product-input"
            />
            <input
              type="url"
              name="image_url"
              placeholder="URL រូបភាព"
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
                លុប
              </button>
            )}
          </div>
        ))}
        <div className="product-button-group">
          <button
            type="button"
            onClick={addProductRow}
            disabled={isLoading}
            className="product-add-row-button"
          >
            បន្ថែមផលិតផលផ្សេងទៀត
          </button>
          <button type="submit" disabled={isLoading} className="product-button">
            {isLoading ? 'កំពុងបន្ថែម...' : 'បន្ថែមផលិតផល'}
          </button>
        </div>
      </form>
      {message && (
        <p
          className={`product-message ${message.includes('ជោគជ័យ') ? 'success fade-in' : 'error'}`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default AddProduct;