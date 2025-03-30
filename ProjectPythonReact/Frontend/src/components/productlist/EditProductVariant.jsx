import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Product.css';

const EditProductVariant = () => {
  const [formData, setFormData] = useState({
    product: '',
    size: '',
    color: '',
    stock_quantity: 0,
    purchase_price: '',
    selling_price: '',
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const { variantId } = useParams();
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
    const fetchVariant = async () => {
      try {
        const response = await api.get(`/api/variants/${variantId}/`);
        setFormData(response.data);
      } catch (error) {
        console.error('Error fetching variant:', error);
        setMessage('Failed to load variant.');
      }
    };
    fetchVariant();
  }, [variantId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message) setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await api.put(`/api/variants/${variantId}/`, formData);
      setMessage('Variant updated successfully!');
      setTimeout(() => navigate('/products'), 1000);
    } catch (error) {
      console.error('Error details:', error.response);
      if (error.response) {
        setMessage('Failed to update variant: ' + JSON.stringify(error.response.data));
      } else {
        setMessage('Error: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="product-form-container">
      <h2>កែសម្រួលវ៉ារីយ៉ង់</h2>
      <form onSubmit={handleSubmit} className="product-form">
        <input
          type="number"
          name="product"
          placeholder="Product ID"
          value={formData.product}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="product-input"
        />
        <input
          type="text"
          name="size"
          placeholder="Size"
          value={formData.size}
          onChange={handleChange}
          disabled={isLoading}
          className="product-input"
        />
        <input
          type="text"
          name="color"
          placeholder="Color"
          value={formData.color}
          onChange={handleChange}
          disabled={isLoading}
          className="product-input"
        />
            <input
          type="number"
          name="stock_quantity"
          placeholder="Stock Quantity"
          value={formData.stock_quantity}
          readOnly
          className="product-input"
        />
        <input
          type="number"
          name="purchase_price"
          placeholder="Purchase Price"
          value={formData.purchase_price}
          readOnly
          step="0.01"
          className="product-input"
        />

        <input
          type="number"
          name="selling_price"
          placeholder="Selling Price"
          value={formData.selling_price}
          onChange={handleChange}
          step="0.01"
          disabled={isLoading}
          className="product-input"
        />
        <button type="submit" disabled={isLoading} className="product-button">
          {isLoading ? 'កំពុងធ្វើបច្ចុប្បន្នភាព...' : 'ធ្វើបច្ចុប្បន្នភាពវ៉ារីយ៉ង់'}
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

export default EditProductVariant;