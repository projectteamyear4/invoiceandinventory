import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Product.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
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

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/api/products/');
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error('កំហុសក្នុងការទាញយកផលិតផល៖', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Search functionality
  useEffect(() => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Sort functionality
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredProducts].sort((a, b) => {
      if (key === 'name') {
        return direction === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (key === 'stock_quantity' || key === 'purchase_price' || key === 'selling_price') {
        const aValue = a.variants[0]?.[key] || 0;
        const bValue = b.variants[0]?.[key] || 0;
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
    setFilteredProducts(sorted);
  };

  const handleAddProduct = () => {
    navigate('/add-product');
  };

  const handleAddVariant = (productId) => {
    navigate(`/add-variant/${productId}`);
  };

  const handleEditProduct = (productId) => {
    navigate(`/edit-product/${productId}`);
  };

  const handleEditVariant = (variantId) => {
    navigate(`/edit-variant/${variantId}`);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('តើអ្នកប្រាកដទេថាចង់លុបផលិតផលនេះ?')) {
      try {
        await api.delete(`/api/products/${productId}/`);
        setProducts(products.filter((p) => p.id !== productId));
        setFilteredProducts(filteredProducts.filter((p) => p.id !== productId));
      } catch (error) {
        console.error('កំហុសក្នុងការលុបផលិតផល៖', error);
      }
    }
  };

  const handleDeleteVariant = async (productId, variantId) => {
    if (window.confirm('តើអ្នកប្រាកដទេថាចង់លុបវ៉ារីយ៉ង់នេះ?')) {
      try {
        await api.delete(`/api/variants/${variantId}/`);
        const updatedProducts = products.map((p) =>
          p.id === productId
            ? { ...p, variants: p.variants.filter((v) => v.id !== variantId) }
            : p
        );
        setProducts(updatedProducts);
        setFilteredProducts(updatedProducts);
      } catch (error) {
        console.error('កំហុសក្នុងការលុបវ៉ារីយ៉ង់៖', error);
      }
    }
  };

  if (loading) return <p>កំពុងទាញយកផលិតផល...</p>;

  return (
    <div className="product-table-container">
      <div className="product-header">
        <h2>ផលិតផល</h2>
        <div className="product-controls">
          <input
            type="text"
            placeholder="ស្វែងរកផលិតផល..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="product-search-input"
          />
          <button className="product-add-button" onClick={handleAddProduct}>
            បន្ថែមផលិតផល
          </button>
        </div>
      </div>
      <table className="product-table">
        <thead>
          <tr>
          
            <th>រូបភាព</th>
            <th onClick={() => handleSort('name')}>ឈ្មោះ {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
            <th>ប្រភេទ</th>
            <th>ការពិពណ៌នា</th>
            <th>ម៉ាក</th>
            <th>ទំហំ</th>
            <th>ពណ៌</th>
            <th onClick={() => handleSort('stock_quantity')}>
              បរិមាណស្តុក {sortConfig.key === 'stock_quantity' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th onClick={() => handleSort('purchase_price')}>
              តម្លៃទិញ {sortConfig.key === 'purchase_price' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th onClick={() => handleSort('selling_price')}>
              តម្លៃលក់ {sortConfig.key === 'selling_price' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th>សកម្មភាព</th>
            <th>សកម្មភាព</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            product.variants.length > 0 ? (
              product.variants.map((variant, index) => (
                <tr key={variant.id}>
                  {index === 0 && (
                    <>
                    
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
                      <button
                        className="product-edit-button"
                        onClick={() => handleEditProduct(product.id)}
                      >
                        កែសម្រួល
                      </button>
                      <button
                        className="product-delete-button"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        លុប
                      </button>
                    </td>
                  )}
                  <td>
                    <button
                      className="variant-edit-button"
                      onClick={() => handleEditVariant(variant.id)}
                    >
                      កែ
                    </button>
                    <button
                      className="variant-delete-button"
                      onClick={() => handleDeleteVariant(product.id, variant.id)}
                    >
                      លុប
                    </button>
                  </td>
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
                <td colSpan={5}>គ្មានវ៉ារីយ៉ង់</td>
                <td>
                  <button
                    className="product-add-variant-button"
                    onClick={() => handleAddVariant(product.id)}
                  >
                    បន្ថែមវ៉ារីយ៉ង់
                  </button>
                  <button
                    className="product-edit-button"
                    onClick={() => handleEditProduct(product.id)}
                  >
                    កែសម្រួល
                  </button>
                  <button
                    className="product-delete-button"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    លុប
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