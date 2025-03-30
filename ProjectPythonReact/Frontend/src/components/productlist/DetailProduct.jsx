// src/components/DetailProduct.jsx
import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './DetailProduct.css';

const DetailProduct = () => {
  const [productName, setProductName] = useState('');
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
        // Step 1: Fetch the product by productId to get its name
        const productResponse = await api.get(`/api/products/${productId}/`);
        const targetProductName = productResponse.data.name;
        setProductName(targetProductName);

        // Step 2: Fetch all products
        const allProductsResponse = await api.get('/api/products/');
        console.log('All products fetched:', allProductsResponse.data);

        // Step 3: Filter products with the same name
        const matchingProducts = allProductsResponse.data.filter(
          (product) => product.name === targetProductName
        );

        // Step 4: Flatten all variants from matching products
        const allVariants = matchingProducts.flatMap((product) =>
          product.variants.map((variant) => ({
            ...variant,
            product_name: product.name,
            product_id: product.id,
          }))
        );

        console.log('Variants for products with name', targetProductName, ':', allVariants);

        // Step 5: Group variants by size and color
        const grouped = allVariants.reduce((acc, variant) => {
          const key = `${variant.size || '-'}_${variant.color || '-'}`;
          console.log(`Variant ID ${variant.id}: size=${variant.size}, color=${variant.color}, key=${key}`);

          const existingGroup = acc.find((group) => group.key === key);

          if (existingGroup) {
            existingGroup.variants.push(variant);
            existingGroup.stock_quantity += variant.stock_quantity || 0;
            const latestVariant = existingGroup.variants.sort((a, b) => b.id - a.id)[0];
            existingGroup.purchase_price = latestVariant.purchase_price || 0.00;
            existingGroup.selling_price = latestVariant.selling_price || '-';
          } else {
            acc.push({
              key,
              product_name: variant.product_name,
              size: variant.size || '-',
              color: variant.color || '-',
              stock_quantity: variant.stock_quantity || 0,
              purchase_price: variant.purchase_price || 0.00,
              selling_price: variant.selling_price || '-',
              variants: [variant],
            });
          }
          return acc;
        }, []);

        console.log('Grouped variants:', grouped);
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
    const firstVariantId = group.variants[0].id;
    navigate(`/edit-variant/${firstVariantId}`);
  };

  const handleDeleteVariantGroup = async (group) => {
    if (window.confirm(`តើអ្នកប្រាកដទេថាចង់លុបវ៉ារីយ៉ង់ទាំងអស់សម្រាប់ផលិតផល ${group.product_name} ដែលមានទំហំ ${group.size} និងពណ៌ ${group.color}?`)) {
      try {
        await Promise.all(
          group.variants.map((variant) =>
            api.delete(`/api/variants/${variant.id}/`)
          )
        );
        setGroupedVariants((prev) =>
          prev.filter((g) => g.key !== group.key)
        );
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
        <h2>ព័ត៌មានលម្អិតផលិតផល: {productName}</h2>
        <motion.button
          className="back-button"
          onClick={handleBackToProducts}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ត្រឡប់ទៅផលិតផល
        </motion.button>
      </motion.div>

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
                <th>ឈ្មោះផលិតផល</th>
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
                  <td>{group.product_name}</td>
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