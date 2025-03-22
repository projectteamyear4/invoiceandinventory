// src/components/Products.jsx
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
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 7;
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

  // Fetch products with nested variants and purchases
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/api/products/');
        console.log('Total products fetched:', response.data);
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

  // Search and filter functionality
  useEffect(() => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchTerm, products]);

  // Sort functionality
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredProducts].sort((a, b) => {
      if (key === 'name' || key === 'barcode') {
        const aValue = a[key] || '';
        const bValue = b[key] || '';
        return direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (key === 'stock_quantity' || key === 'purchase_price' || key === 'selling_price') {
        const aValue = key === 'stock_quantity'
          ? (a.variants[0]?.purchases?.reduce((sum, p) => sum + p.quantity, 0) || 0)
          : key === 'purchase_price'
          ? (a.variants[0]?.purchases?.sort((x, y) => new Date(y.purchase_date) - new Date(x.purchase_date))[0]?.purchase_price || 0)
          : (a.variants[0]?.selling_price || 0);
        const bValue = key === 'stock_quantity'
          ? (b.variants[0]?.purchases?.reduce((sum, p) => sum + p.quantity, 0) || 0)
          : key === 'purchase_price'
          ? (b.variants[0]?.purchases?.sort((x, y) => new Date(y.purchase_date) - new Date(x.purchase_date))[0]?.purchase_price || 0)
          : (b.variants[0]?.selling_price || 0);
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
    setFilteredProducts(sorted);
  };

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
        if (currentProducts.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        console.error('កំហុសក្នុងការលុបផលិតផល៖', error);
      }
    }
  };

  const handleViewCategories = () => {
    navigate('/category-list');
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
            placeholder="ស្វែងរកផលិតផល ឬ បាកូដ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="product-search-input"
          />
          <button className="product-add-button" onClick={handleAddProduct}>
            បន្ថែមផលិតផល
          </button>
          <button className="warehouse-shelves-button" onClick={handleViewCategories}>
            មើលប្រភេទផលិតផល
          </button>
        </div>
      </div>
      <table className="product-table">
        <thead>
          <tr>
            <th>រូបភាព</th>
            <th onClick={() => handleSort('name')}>
              ឈ្មោះ {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th onClick={() => handleSort('barcode')}>
              បាកូដ {sortConfig.key === 'barcode' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
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
          {currentProducts.map((product) =>
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
                      <td rowSpan={product.variants.length} className="barcode-cell">
                        <div className="barcode-display">{product.barcode}</div>
                        <div className="barcode-number">{product.barcode}</div>
                      </td>
                      <td rowSpan={product.variants.length}>{product.category?.name || '-'}</td>
                      <td rowSpan={product.variants.length}>{product.description || '-'}</td>
                      <td rowSpan={product.variants.length}>{product.brand || '-'}</td>
                    </>
                  )}
                  <td>{variant.size || '-'}</td>
                  <td>{variant.color || '-'}</td>
                  <td>
                    {variant.purchases ? variant.purchases.reduce((sum, p) => sum + p.quantity, 0) : 0}
                  </td>
                  <td>
                    {variant.purchases && variant.purchases.length > 0
                      ? variant.purchases.sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date))[0].purchase_price
                      : '-'}
                  </td>
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
                <td className="barcode-cell">
                  <div className="barcode-display">{product.barcode}</div>
                  <div className="barcode-number">{product.barcode}</div>
                </td>
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
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            មុន
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`pagination-button ${currentPage === page ? 'active' : ''}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            បន្ទាប់
          </button>
        </div>
      )}
    </div>
  );
};

export default Products;