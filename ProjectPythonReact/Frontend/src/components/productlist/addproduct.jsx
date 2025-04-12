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
  const [errors, setErrors] = useState([{}]);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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
        setFormError('មិនអាចទាញយកប្រភេទផលិតផលបានទេ។');
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const newProducts = [...products];
    newProducts[index][name] = value;
    setProducts(newProducts);

    const newErrors = [...errors];
    newErrors[index] = { ...newErrors[index], [name]: '' };
    setErrors(newErrors);

    if (formError || formSuccess) {
      setFormError('');
      setFormSuccess('');
    }
  };

  const addProductRow = () => {
    setProducts([...products, { name: '', category_id: '', description: '', brand: '', image_url: '' }]);
    setErrors([...errors, {}]);
  };

  const removeProductRow = (index) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
      setErrors(errors.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    const newErrors = products.map((product) => {
      const productErrors = {};
      if (!product.name.trim()) productErrors.name = 'តម្រូវឱ្យបញ្ចូលឈ្មោះផលិតផល'; // Product name is required
      if (!product.category_id) productErrors.category_id = 'តម្រូវឱ្យជ្រើសប្រភេទ'; // Category is required
      if (product.image_url && !/^https?:\/\/.+\..+/.test(product.image_url)) {
        productErrors.image_url = 'URL រូបភាពមិនត្រឹមត្រូវ'; // Invalid image URL
      }
      return productErrors;
    });

    // Removed duplicate name validation
    setErrors(newErrors);
    return newErrors.every((err) => Object.keys(err).length === 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsLoading(true);

    if (!validateForm()) {
      setFormError('សូមបំពេញទិន្នន័យឱ្យបានត្រឹមត្រូវ');
      setIsLoading(false);
      return;
    }

    try {
      const results = [];
      for (const [index, product] of products.entries()) {
        try {
          const response = await api.post('/api/products/', product);
          results.push({ success: true, data: response.data });
        } catch (error) {
          const errorMessage = error.response?.data
            ? Object.entries(error.response.data)
                .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`)
                .join("; ")
            : error.message;
          results.push({ success: false, error: `ផលិតផល ${index + 1}: ${errorMessage}` });
        }
      }

      const failed = results.filter((r) => !r.success);
      if (failed.length > 0) {
        setFormError(failed.map((f) => f.error).join(" | "));
      } else {
        setFormSuccess('បានបន្ថែមផលិតផលដោយជោគជ័យ!');
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/products', { replace: true });
        }, 1500);
      }
    } catch (error) {
      setFormError('កំហុសមិននឹកស្មានដល់: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="product-form-container">
      <h2>បន្ថែមផលិតផល</h2>
      {formSuccess && (
        <p className="product-message success fade-in">{formSuccess}</p>
      )}
      {formError && (
        <p className="product-message error">{formError}</p>
      )}
      <form
        onSubmit={handleSubmit}
        className={`product-form ${isSuccess ? 'fade-out' : ''}`}
      >
        {products.map((product, index) => (
          <div key={index} className="product-row">
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="ឈ្មោះផលិតផល"
                value={product.name}
                onChange={(e) => handleChange(index, e)}
                disabled={isLoading}
                className="product-input"
              />
              {errors[index]?.name && <span className="error">{errors[index].name}</span>}
            </div>
            <div className="form-group">
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
              {errors[index]?.category_id && <span className="error">{errors[index].category_id}</span>}
            </div>
            <div className="form-group">
              <textarea
                name="description"
                placeholder="សេចក្ដីពិពណ៌នា"
                value={product.description}
                onChange={(e) => handleChange(index, e)}
                disabled={isLoading}
                className="product-input product-textarea"
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="brand"
                placeholder="ម៉ាកផលិតផល"
                value={product.brand}
                onChange={(e) => handleChange(index, e)}
                disabled={isLoading}
                className="product-input"
              />
            </div>
            <div className="form-group">
              <input
                type="url"
                name="image_url"
                placeholder="URL រូបភាព"
                value={product.image_url}
                onChange={(e) => handleChange(index, e)}
                disabled={isLoading}
                className="product-input"
              />
              {errors[index]?.image_url && <span className="error">{errors[index].image_url}</span>}
            </div>
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
    </div>
  );
};

export default AddProduct;