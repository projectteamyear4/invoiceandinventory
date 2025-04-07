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
  const [sortOrder, setSortOrder] = useState('asc'); // For sorting by stock
  const { productId } = useParams();
  const navigate = useNavigate();

  // Axios instance for API requests
  const api = axios.create({
    baseURL: 'http://localhost:8000',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  // Fetch product details and variants
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
            existingGroup.stock += variant.stock || 0; // Use stock
            const latestVariant = existingGroup.variants.sort((a, b) => b.id - a.id)[0];
            existingGroup.purchase_price = latestVariant.purchase_price || 0.00;
            existingGroup.selling_price = latestVariant.selling_price || '-';
          } else {
            acc.push({
              key,
              product_name: variant.product_name,
              size: variant.size || '-',
              color: variant.color || '-',
              stock: variant.stock || 0, // Use stock
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

  // Navigate back to the products list
  const handleBackToProducts = () => {
    navigate('/products');
  };




  // Sort variants by stock
  const handleSortByStock = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    setGroupedVariants((prev) =>
      [...prev].sort((a, b) =>
        newOrder === 'asc'
          ? a.stock - b.stock
          : b.stock - a.stock
      )
    );
  };



  // Loading state
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

  // Error state
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

  // Main render
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
        {/* Display total stock summary */}
        <h3>
          វ៉ារីយ៉ង់នៃផលិតផល (ស្តុកសរុប: {groupedVariants.reduce((sum, group) => sum + group.stock, 0)})
        </h3>
        {groupedVariants && groupedVariants.length > 0 ? (
          <table className="variants-table">
            <thead>
              <tr>
                <th>លេខសម្គាល់</th>
                <th>ឈ្មោះផលិតផល</th>
                <th>ទំហំ</th>
                <th>ពណ៌</th>
                <th onClick={handleSortByStock} style={{ cursor: 'pointer' }}>
                  បរិមាណស្តុក {sortOrder === 'asc' ? '↑' : '↓'}
                </th>
                <th>តម្លៃទិញ (ចុងក្រោយ)</th>
                <th>តម្លៃលក់</th>
               
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
                  <td className={group.stock < 5 ? 'low-stock' : ''}>
                    {group.stock}
                    {group.stock < 5 && <span className="low-stock-warning"> (ស្តុកទាប)</span>}
                    
                  </td>
                  <td>{group.purchase_price}</td>
                  <td>{group.selling_price}</td>
                
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