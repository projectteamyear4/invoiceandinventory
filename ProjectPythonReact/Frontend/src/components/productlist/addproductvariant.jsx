import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Product.css';

const AddProductVariant = () => {
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
  const { user, logout } = useContext(AuthContext); // Added 'logout' here
  const { productId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (productId) {
      setFormData((prev) => ({ ...prev, product: productId }));
    }
  }, [productId]);

  const api = axios.create({
    baseURL: 'http://localhost:8000',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message) setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      console.log('ទទួលបានទិន្នន័យ:', formData);
      const response = await api.post('/api/variants/', formData);
      console.log('ប្រតិកម្ម:', response.data);
      setMessage('បន្ថែមវ៉ារីអង់តបានជោគជ័យ!');
      setFormData({
        product: productId || '',
        size: '',
        color: '',
        stock_quantity: 0,
        purchase_price: '',
        selling_price: '',
      });
      setTimeout(() => navigate('/products'), 1000);
    } catch (error) {
      console.error('ព័ត៌មានកំហុស:', error.response);
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        if (status === 401) {
          setMessage('សមាជិកหมดសុពលភាព។ សូមចូលម៉ាស៊ីនម្តងទៀត។');
          if (user && typeof logout === 'function') logout(); // Now logout is defined
          setTimeout(() => navigate('/login'), 1000);
        } else if (status === 400) {
          setMessage('បរាជ័យក្នុងការបន្ថែមវ៉ារីអង់ត: ' + JSON.stringify(data));
        } else {
          setMessage('បរាជ័យក្នុងការបន្ថែមវ៉ារីអង់ត: ' + (data.detail || 'កំហុសដែលមិនស្គាល់'));
        }
      } else if (error.request) {
        setMessage('មិនអាចភ្ជាប់ទៅកាន់ម៉ាស៊ីនបម្រើបាន។');
      } else {
        setMessage('កំហុស: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="product-form-container">
      <h2>បន្ថែមវ៉ារីអង់តផលិតផល</h2>
      <form onSubmit={handleSubmit} className="product-form">
        <input
          type="number"
          name="product"
          placeholder="លេខសម្គាល់ផលិតផល"
          value={formData.product}
          onChange={handleChange}
          required
          disabled={isLoading || !!productId}
          className="product-input"
        />
        <input
          type="text"
          name="size"
          placeholder="ទំហំ (ដូចជា, S, M, L)"
          value={formData.size}
          onChange={handleChange}
          disabled={isLoading}
          className="product-input"
        />
        <input
          type="text"
          name="color"
          placeholder="ពណ៌ (ដូចជា, ក្រហម, ខៀវ)"
          value={formData.color}
          onChange={handleChange}
          disabled={isLoading}
          className="product-input"
        />
        <input
          type="number"
          name="stock_quantity"
          placeholder="បរិមាណស្តុក"
          value={formData.stock_quantity}
          onChange={handleChange}
          required
         readOnly
          className="product-input"
        />
        <input
          type="number"
          name="purchase_price"
          placeholder="តម្លៃទិញ"
          value={formData.purchase_price}
          onChange={handleChange}
          step="0.01"
          readOnly
          className="product-input"
        />
        <input
          type="number"
          name="selling_price"
          placeholder="តម្លៃលក់"
          value={formData.selling_price}
          onChange={handleChange}
          step="0.01"
          disabled={isLoading}
          className="product-input"
        />
        <button type="submit" disabled={isLoading} className="product-button">
          {isLoading ? 'កំពុងបន្ថែម...' : 'បន្ថែមវ៉ារីអង់ត'}
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

export default AddProductVariant;
