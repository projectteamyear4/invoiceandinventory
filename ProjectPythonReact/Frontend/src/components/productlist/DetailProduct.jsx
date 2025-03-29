// src/components/DetailProduct.jsx
import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './DetailProduct.css';

const DetailProduct = () => {
  const [product, setProduct] = useState(null);
  const [groupedVariants, setGroupedVariants] = useState([]);
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
        setProduct(response.data);

        // Group variants by size and color
        const grouped = response.data.variants.reduce((acc, variant) => {
          const key = `${variant.size || '-'}_${variant.color || '-'}`;
          const existingGroup = acc.find((group) => group.key === key);

          if (existingGroup) {
            // Add the variant to the existing group
            existingGroup.variants.push(variant);
            // Sum the stock quantity
            existingGroup.stock_quantity += variant.purchases && variant.purchases.length > 0
              ? variant.purchases.reduce((sum, p) => sum + (p.quantity || 0), 0)
              : 0;
            // Update the purchase price and selling price based on the most recent purchase
            const allPurchases = existingGroup.variants.flatMap(v => v.purchases || []);
            if (allPurchases.length > 0) {
              const latestPurchase = allPurchases.sort(
                (a, b) => new Date(b.purchase_date) - new Date(a.purchase_date)
              )[0];
              existingGroup.purchase_price = latestPurchase.purchase_price || '-';
            }
            // Use the selling price from the most recent variant (by id, assuming higher id means more recent)
            const latestVariant = existingGroup.variants.sort((a, b) => b.id - a.id)[0];
            existingGroup.selling_price = latestVariant.selling_price || '-';
          } else {
            // Create a new group
            const stock_quantity = variant.purchases && variant.purchases.length > 0
              ? variant.purchases.reduce((sum, p) => sum + (p.quantity || 0), 0)
              : 0;
            const purchase_price = variant.purchases && variant.purchases.length > 0
              ? variant.purchases.sort(
                  (a, b) => new Date(b.purchase_date) - new Date(a.purchase_date)
                )[0].purchase_price || '-'
              : '-';
            acc.push({
              key,
              size: variant.size || '-',
              color: variant.color || '-',
              stock_quantity,
              purchase_price,
              selling_price: variant.selling_price || '-',
              variants: [variant], // Store all variants in the group for actions
            });
          }
          return acc;
        }, []);

        setGroupedVariants(grouped);
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

  const handleEditVariantGroup = (group) => {
    // Since we're grouping, we'll navigate to edit the first variant in the group
    // Alternatively, you could create a new route to edit all variants in the group
    const firstVariantId = group.variants[0].id;
    navigate(`/edit-variant/${firstVariantId}`);
  };

  const handleDeleteVariantGroup = async (group) => {
    if (window.confirm(`តើអ្នកប្រាកដទេថាចង់លុបវ៉ារីយ៉ង់ទាំងអស់ដែលមានទំហំ ${group.size} និងពណ៌ ${group.color}?`)) {
      try {
        // Delete all variants in the group
        await Promise.all(
          group.variants.map((variant) =>
            api.delete(`/api/variants/${variant.id}/`)
          )
        );
        // Update the state to remove the deleted group
        setGroupedVariants((prev) =>
          prev.filter((g) => g.key !== group.key)
        );
        setProduct((prevProduct) => ({
          ...prevProduct,
          variants: prevProduct.variants.filter(
            (v) => !group.variants.some((gv) => gv.id === v.id)
          ),
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
              className="product-imagedetails"
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
        {groupedVariants && groupedVariants.length > 0 ? (
          <table className="variants-table">
            <thead>
              <tr>
                <th>លេខសម្គាល់</th>
                <th>ទំហំ</th>
                <th>ពណ៌</th>
                <th>បរិមាណស្តុក</th>
                <th>តម្លៃទិញ (ចុងក្រោយ)</th>
                <th>តម្លៃលក់</th>
                <th>សកម្មភាព</th>
              </tr>
            </thead>
            <tbody>
              {groupedVariants.map((group, index) => (
                <motion.tr
                  key={group.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                >
                  <td>{group.variants[0].id}</td>
                  <td>{group.size}</td>
                  <td>{group.color}</td>
                  <td>{group.stock_quantity}</td>
                  <td>{group.purchase_price}</td>
                  <td>{group.selling_price}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="variant-edit-button"
                        onClick={() => handleEditVariantGroup(group)}
                      >
                        កែ
                      </button>
                      <button
                        className="variant-delete-button"
                        onClick={() => handleDeleteVariantGroup(group)}
                      >
                        លុប
                      </button>
                    </div>
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