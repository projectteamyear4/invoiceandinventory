import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext'; // Fixed path
import './Product.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const fetchProducts = async () => {
      try {
        const response = await api.get('/api/products/');
        setProducts(response.data);
      } catch (error) {
        console.error('កំហុសក្នុងការទាញយកផលិតផល៖', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    navigate('/add-product');
  };

  const handleAddVariant = (productId) => {
    navigate(`/add-variant/${productId}`);
  };

  if (loading) return <p>កំពុងទាញយកផលិតផល...</p>;

  return (
    <div className="product-table-container">
      <div className="product-header">
        <h2>ផលិតផល</h2>
        <button className="product-add-button" onClick={handleAddProduct}>
          បន្ថែមផលិតផល
        </button>
      </div>
      <table className="product-table">
        <thead>
          <tr>
            <th>លេខសម្គាល់</th>
            <th>រូបភាព</th>
            <th>ឈ្មោះ</th>
            <th>ប្រភេទ</th>
            <th>ការពិពណ៌នា</th>
            <th>ម៉ាក</th>
            {/* <th>លេខសម្គាល់វ៉ារីយ៉ង់</th> */}
            <th>ទំហំ</th>
            <th>ពណ៌</th>
            <th>បរិមាណស្តុក</th>
            <th>តម្លៃទិញ</th>
            <th>តម្លៃលក់</th>
            <th>សកម្មភាព</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            product.variants.length > 0 ? (
              product.variants.map((variant, index) => (
                <tr key={variant.id}>
                  {index === 0 && (
                    <>
                      <td rowSpan={product.variants.length}>{product.id}</td>
                      <td rowSpan={product.variants.length}>
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="product-image"
                            onError={(e) => (e.target.src = 'https://via.placeholder.com/50')}
                          />
                        ) : '-'}
                      </td>
                      <td rowSpan={product.variants.length}>{product.name}</td>
                      <td rowSpan={product.variants.length}>{product.category?.name || '-'}</td>
                      <td rowSpan={product.variants.length}>{product.description || '-'}</td>
                      <td rowSpan={product.variants.length}>{product.brand || '-'}</td>
                    </>
                  )}
                  {/* <td>{variant.id}</td> */}
                  <td>{variant.size || '-'}</td>
                  <td>{variant.color || '-'}</td>
                  <td>{variant.stock_quantity}</td>
                  <td>{variant.purchase_price || '-'}</td>
                  <td>{variant.selling_price || '-'}</td>
                  {index === 0 && (
                    <td rowSpan={product.variants.length}>
                      <button
                        className="product-add-variant-button"
                        onClick={() => handleAddVariant(product.id)}
                      >
                        បន្ថែមវ៉ារីយ៉ង់
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="product-image"
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/50')}
                    />
                  ) : '-'}
                </td>
                <td>{product.name}</td>
                <td>{product.category?.name || '-'}</td>
                <td>{product.description || '-'}</td>
                <td>{product.brand || '-'}</td>
                <td colSpan={6}>គ្មានវ៉ារីយ៉ង់</td>
                <td>
                  <button
                    className="product-add-variant-button"
                    onClick={() => handleAddVariant(product.id)}
                  >
                    បន្ថែមវ៉ារីយ៉ង់
                  </button>
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Products;
