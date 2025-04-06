// src/components/Products.jsx
import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Product.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [flattenedData, setFlattenedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleColumns, setVisibleColumns] = useState({
    image: true,
    name: true,
    barcode: true,
    category: true,
    description: true,
    brand: true,
    size: true,
    color: true,
    stock_quantity: true,
    purchase_price: true,
    selling_price: true,
    product_actions: true,
    variant_actions: true,
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: 'http://localhost:8000',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  // Fetch products with nested variants
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/api/products/');
        console.log('Total products fetched from API:', response.data); // Debug API response
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

  // Flatten the product and variant data for the table
  useEffect(() => {
    const flattened = filteredProducts.flatMap((product) => {
      if (product.variants && product.variants.length > 0) {
        return product.variants.map((variant, index) => {
          console.log(`Flattening product ${product.id}, variant ${variant.id}, stock_quantity: ${variant.stock_quantity}`); // Debug
          return {
            ...product,
            variant,
            isFirstVariant: index === 0,
            variantCount: product.variants.length,
          };
        });
      } else {
        return [{ ...product, variant: null, isFirstVariant: true, variantCount: 1 }];
      }
    });
    console.log('Flattened data:', flattened); // Debug
    setFlattenedData(flattened);
  }, [filteredProducts]);

  // Search and filter functionality
  useEffect(() => {
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleColumn = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
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
        const updatedProducts = products.filter((p) => p.id !== productId);
        setProducts(updatedProducts);
        setFilteredProducts(updatedProducts);
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

  const handleViewProductDetails = (productId) => {
    navigate(`/product-details/${productId}`);
  };

  // Define columns for the DataTable
  const columns = useMemo(
    () => [
      {
        name: 'រូបភាព',
        cell: (row) =>
          row.isFirstVariant ? (
            <div style={{ textAlign: 'center' }}>
              {row.image_url ? (
                <img
                  src={row.image_url}
                  alt={row.name}
                  className="product-image"
                  onError={(e) => (e.target.src = 'https://via.placeholder.com/50')}
                />
              ) : (
                '-'
              )}
            </div>
          ) : null,
        width: '80px',
        omit: !visibleColumns.image,
      },
      {
        name: 'ឈ្មោះ',
        cell: (row) =>
          row.isFirstVariant ? (
            <span
              className="product-name-link"
              onClick={() => handleViewProductDetails(row.id)}
            >
              {row.name}
            </span>
          ) : '',
        sortable: true,
        omit: !visibleColumns.name,
      },
      {
        name: 'បាកូដ',
        cell: (row) =>
          row.isFirstVariant ? (
            <div className="barcode-cell">
              <div className="barcode-display">{row.barcode}</div>
              <div className="barcode-number">{row.barcode}</div>
            </div>
          ) : null,
        sortable: true,
        omit: !visibleColumns.barcode,
      },
      {
        name: 'ប្រភេទ',
        selector: (row) => (row.isFirstVariant ? row.category?.name || '-' : ''),
        omit: !visibleColumns.category,
      },
      {
        name: 'ការពិពណ៌នា',
        selector: (row) => (row.isFirstVariant ? row.description || '-' : ''),
        omit: !visibleColumns.description,
      },
      {
        name: 'ម៉ាក',
        selector: (row) => (row.isFirstVariant ? row.brand || '-' : ''),
        omit: !visibleColumns.brand,
      },
      {
        name: 'ទំហំ',
        selector: (row) => (row.variant ? row.variant.size || '-' : 'គ្មានវ៉ារីយ៉ង់'),
        omit: !visibleColumns.size,
      },
      {
        name: 'ពណ៌',
        selector: (row) => (row.variant ? row.variant.color || '-' : 'គ្មានវ៉ារីយ៉ង់'),
        omit: !visibleColumns.color,
      },
      {
        name: 'បរិមាណស្តុក',
        selector: (row) => {
          const stock = row.variant ? row.variant.stock_quantity || 0 : 'គ្មានវ៉ារីយ៉ង់';
          console.log(`Displaying stock for variant ${row.variant?.id}: ${stock}`); // Debug
          return stock;
        },
        sortable: true,
        omit: !visibleColumns.stock_quantity,
      },
      {
        name: 'តម្លៃទិញ',
        selector: (row) => (row.variant ? row.variant.purchase_price || '-' : 'គ្មានវ៉ារីយ៉ង់'),
        sortable: true,
        omit: !visibleColumns.purchase_price,
      },
      {
        name: 'តម្លៃលក់',
        selector: (row) => (row.variant ? row.variant.selling_price || '-' : 'គ្មានវ៉ារីយ៉ង់'),
        sortable: true,
        omit: !visibleColumns.selling_price,
      },
      {
        name: 'សកម្មភាព (ផលិតផល)',
        cell: (row) =>
          row.isFirstVariant ? (
            <div className="action-buttons">
              <button
                className="product-add-variant-button"
                onClick={() => handleAddVariant(row.id)}
              >
                បន្ថែមវ៉ារីយ៉ង់
              </button>
              <button className="product-edit-button" onClick={() => handleEditProduct(row.id)}>
                កែសម្រួល
              </button>
              <button
                className="product-delete-button"
                onClick={() => handleDeleteProduct(row.id)}
              >
                លុប
              </button>
            </div>
          ) : null,
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
        omit: !visibleColumns.product_actions,
      },
      {
        name: 'សកម្មភាព (វ៉ារីយ៉ង់)',
        cell: (row) =>
          row.variant ? (
            <div className="action-buttons">
              <button
                className="variant-edit-button"
                onClick={() => handleEditVariant(row.variant.id)}
              >
                កែ
              </button>
              <button
                className="variant-delete-button"
                onClick={() => handleDeleteVariant(row.id, row.variant.id)}
              >
                លុប
              </button>
            </div>
          ) : null,
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
        omit: !visibleColumns.variant_actions,
      },
    ],
    [visibleColumns]
  );

  // Custom styles for the DataTable to match Product.css
  const customStyles = {
    table: {
      style: {
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        background: '#fff',
      },
    },
    headRow: {
      style: {
        background: 'linear-gradient(90deg, #3f7fc2, #0056b3)',
        color: 'white',
        textTransform: 'uppercase',
        fontSize: '16px',
      },
    },
    headCells: {
      style: {
        padding: '12px',
        '&:hover': {
          background: '#0056b3',
          cursor: 'pointer',
        },
      },
    },
    rows: {
      style: {
        fontSize: '16px',
        color: '#333',
        borderBottom: '1px solid #ddd',
        '&:hover': {
          background: 'rgba(0, 123, 255, 0.1)',
        },
      },
    },
    cells: {
      style: {
        padding: '12px',
      },
    },
    pagination: {
      style: {
        marginTop: '25px',
        padding: '10px',
        background: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
        border: 'none',
      },
      pageButtonsStyle: {
        padding: '8px 15px',
        background: 'linear-gradient(90deg, #007bff, #0056b3)',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover:not(:disabled)': {
          background: 'linear-gradient(90deg, #0056b3, #007bff)',
          boxShadow: '0 4px 10px rgba(0, 123, 255, 0.4)',
          transform: 'translateY(-2px)',
        },
        '&:disabled': {
          background: '#ccc',
          cursor: 'not-allowed',
        },
      },
    },
  };

  if (loading) return <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>កំពុងទាញយកផលិតផល...</motion.p>;

  return (
    <motion.div
      className="product-table-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="product-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h2>ផលិតផល</h2>
        <div className="product-controls">
          <motion.button
            className="product-add-button"
            onClick={handleAddProduct}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            បន្ថែមផលិតផល
          </motion.button>
          <motion.button
            className="warehouse-shelves-button"
            onClick={handleViewCategories}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            មើលប្រភេទផលិតផល
          </motion.button>
          <motion.button
            className="delivery-methods-button"
            onClick={() => navigate('/delivery-methods')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            មើលវិធីសាស្ត្រដឹកជញ្ជូន
          </motion.button>
        </div>
      </motion.div>

      {/* Controls (Search Bar and Column Selector) */}
      <motion.div
        className="product-controls"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <motion.div
          className="product-search-wrapper"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <input
            type="text"
            placeholder="ស្វែងរកផលិតផល ឬ បាកូដ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="product-search-input"
          />
        </motion.div>
        <div className="column-selector" ref={dropdownRef}>
          <label>ជ្រើសរើសជួរឈរ: </label>
          <div className="custom-dropdown">
            <button
              className="dropdown-toggle"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              ជ្រើសរើសជួរឈរ {isDropdownOpen ? '▲' : '▼'}
            </button>
            {isDropdownOpen && (
              <motion.div
                className="dropdown-menu"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {Object.keys(visibleColumns).map((column) => (
                  <label key={column} className="dropdown-item">
                    <input
                      type="checkbox"
                      checked={visibleColumns[column]}
                      onChange={() => toggleColumn(column)}
                    />
                    {column === 'image' ? 'រូបភាព' :
                     column === 'name' ? 'ឈ្មោះ' :
                     column === 'barcode' ? 'បាកូដ' :
                     column === 'category' ? 'ប្រភេទ' :
                     column === 'description' ? 'ការពិពណ៌នា' :
                     column === 'brand' ? 'ម៉ាក' :
                     column === 'size' ? 'ទំហំ' :
                     column === 'color' ? 'ពណ៌' :
                     column === 'stock_quantity' ? 'បរិមាណស្តុក' :
                     column === 'purchase_price' ? 'តម្លៃទិញ' :
                     column === 'selling_price' ? 'តម្លៃលក់' :
                     column === 'product_actions' ? 'សកម្មភាព (ផលិតផល)' :
                     column === 'variant_actions' ? 'សកម្មភាព (វ៉ារីយ៉ង់)' : column}
                  </label>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={flattenedData}
        pagination
        paginationPerPage={7}
        customStyles={customStyles}
        noDataComponent={<div className="no-results">គ្មានផលិតផលត្រូវនឹងលក្ខខណ្ឌស្វែងរក។</div>}
        highlightOnHover
        responsive
        progressPending={loading}
        progressComponent={<div className="loading">កំពុងទាញយកផលិតផល...</div>}
      />
    </motion.div>
  );
};

export default Products;