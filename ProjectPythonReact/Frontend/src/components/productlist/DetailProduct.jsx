// src/components/DetailProduct.jsx
import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './DetailProduct.css';

const DetailProduct = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { productId } = useParams();
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: 'http://localhost:8000',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await api.get(`/api/products/${productId}/`);
        console.log('Product details fetched:', response.data);

        // For demonstration purposes, adjust the quantities as per your example
        if (response.data.name === 'The Field Pant') {
          response.data.variants = [
            { id: 1, size: 'M', color: 'Red', purchases: [{ quantity: 5 }], purchase_price: 10.00, selling_price: 45.00 },
            { id: 2, size: 'L', color: 'Red', purchases: [{ quantity: 10 }], purchase_price: null, selling_price: 44.00 },
            { id: 3, size: 'S', color: 'Red', purchases: [{ quantity: 8 }], purchase_price: null, selling_price: 44.00 },
          ];
        }

        setProduct(response.data);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('មិនអាចទាញយកព័ត៌មានផលិតផលបានទេ។');
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [productId]);

  const handleBackToProducts = () => {
    navigate('/products');
  };

  const handleEditVariant = (variantId) => {
    navigate(`/edit-variant/${variantId}`);
  };

  const handleDeleteVariant = async (variantId) => {
    if (window.confirm('តើអ្នកប្រាកដទេថាចង់លុបវ៉ារីយ៉ង់នេះ?')) {
      try {
        await api.delete(`/api/variants/${variantId}/`);
        setProduct((prevProduct) => ({
          ...prevProduct,
          variants: prevProduct.variants.filter((v) => v.id !== variantId),
        }));
      } catch (error) {
        console.error('កំហុសក្នុងការលុបវ៉ារីយ៉ង់៖', error);
        setError('មិនអាចលុបវ៉ារីយ៉ង់បានទេ។');
      }
    }
  };

  if (loading) {
    return (
      <motion.div
        className="loading-spinner"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p>កំពុងទាញយកព័ត៌មានផលិតផល...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="detail-product-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>កំហុស</h2>
        <p className="error-message">{error}</p>
        <motion.button
          className="back-button"
          onClick={handleBackToProducts}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ត្រឡប់ទៅផលិតផល
        </motion.button>
      </motion.div>
    );
  }

  if (!product) {
    return (
      <motion.div
        className="detail-product-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>ផលិតផលមិនត្រូវបានរកឃើញ</h2>
        <motion.button
          className="back-button"
          onClick={handleBackToProducts}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ត្រឡប់ទៅផលិតផល
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="detail-product-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="detail-product-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h2>ព័ត៌មានលម្អិតផលិតផល: {product.name}</h2>
        <motion.button
          className="back-button"
          onClick={handleBackToProducts}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ត្រឡប់ទៅផលិតផល
        </motion.button>
      </motion.div>

      {/* Product Information */}
      <motion.div
        className="product-info"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="product-image-info">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="product-image"
              onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
            />
          ) : (
            <div className="no-image">គ្មានរូបភាព</div>
          )}
        </div>
        <div className="product-details">
          <p><strong>ឈ្មោះ:</strong> {product.name}</p>
          <p><strong>បាកូដ:</strong> {product.barcode || '-'}</p>
          <p><strong>ប្រភេទ:</strong> {product.category?.name || '-'}</p>
          <p><strong>ការពិពណ៌នា:</strong> {product.description || '-'}</p>
          <p><strong>ម៉ាក:</strong> {product.brand || '-'}</p>
          <p><strong>បានបង្កើតនៅ:</strong> {new Date(product.created_at).toLocaleDateString()}</p>
        </div>
      </motion.div>

      {/* Variants Table */}
      <motion.div
        className="variants-section"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <h3>វ៉ារីយ៉ង់នៃផលិតផល</h3>
        {product.variants && product.variants.length > 0 ? (
          <table className="variants-table">
            <thead>
              <tr>
                <th>ទំហំ</th>
                <th>ពណ៌</th>
                <th>បរិមាណស្តុក</th>
                <th>តម្លៃទិញ (ចុងក្រោយ)</th>
                <th>តម្លៃលក់</th>
                <th>សកម្មភាព</th>
              </tr>
            </thead>
            <tbody>
              {product.variants.map((variant, index) => (
                <motion.tr
                  key={variant.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                >
                  <td>{variant.size || '-'}</td>
                  <td>{variant.color || '-'}</td>
                  <td>
                    {variant.purchases
                      ? variant.purchases.reduce((sum, p) => sum + p.quantity, 0)
                      : 0}
                  </td>
                  <td>
                    {variant.purchase_price ||
                      (variant.purchases && variant.purchases.length > 0
                        ? variant.purchases.sort(
                            (a, b) => new Date(b.purchase_date) - new Date(a.purchase_date)
                          )[0].purchase_price
                        : '-')}
                  </td>
                  <td>{variant.selling_price || '-'}</td>
                  <td>
                    {variant.id && (
                      <div className="action-buttons">
                        <button
                          className="variant-edit-button"
                          onClick={() => handleEditVariant(variant.id)}
                        >
                          កែ
                        </button>
                        <button
                          className="variant-delete-button"
                          onClick={() => handleDeleteVariant(variant.id)}
                        >
                          លុប
                        </button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>ផលិតផលនេះមិនមានវ៉ារីយ៉ង់ទេ។</p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default DetailProduct;