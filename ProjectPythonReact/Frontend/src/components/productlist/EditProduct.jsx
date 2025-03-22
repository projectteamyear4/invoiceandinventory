import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Product.css';

const EditProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    brand: '',
    image_url: '',
  });
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(AuthContext);
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

  // Fetch product data and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch product details
        const productResponse = await api.get(`/api/products/${productId}/`);
        setFormData(productResponse.data);

        // Fetch categories for dropdown
        const categoryResponse = await api.get('/api/categories/');
        setCategories(categoryResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
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
      console.log('Sending data:', formData);
      const response = await api.put(`/api/products/${productId}/`, formData);
      console.log('Response:', response.data);
      setMessage('Product updated successfully!');
      setTimeout(() => navigate('/products'), 1000);
    } catch (error) {
      console.error('Error details:', error.response);
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        if (status === 401) {
          setMessage('Session expired. Please log in again.');
          setTimeout(() => navigate('/login'), 1000);
        } else if (status === 400) {
          setMessage('Failed to update product: ' + JSON.stringify(data));
        } else {
          setMessage('Failed to update product: ' + (data.detail || 'Unknown error'));
        }
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
      <h2>កែសម្រួលផលិតផល</h2>
      <form onSubmit={handleSubmit} className="product-form">
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
          name="category"
          value={formData.category}
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
        <input
          type="text"
          name="image_url"
          placeholder="URL រូបភាព"
          value={formData.image_url}
          onChange={handleChange}
          disabled={isLoading}
          className="product-input"
        />
        <button type="submit" disabled={isLoading} className="product-button">
          {isLoading ? 'កំពុងធ្វើបច្ចុប្បន្នភាព...' : 'ធ្វើបច្ចុប្បន្នភាពផលិតផល'}
        </button>
      </form>
      {message && (
        <p
          className={`product-message ${message.includes('successfully') ? 'success' : 'error'}`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default EditProduct;