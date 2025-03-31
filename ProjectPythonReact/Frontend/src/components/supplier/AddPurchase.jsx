import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Purchases.css';

const AddPurchase = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [productVariants, setProductVariants] = useState([]);
  const [formData, setFormData] = useState([
    {
      supplier: '',
      product: '',
      product_variant: '',
      batch_number: '',
      quantity: '',
      purchase_price: '',
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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

  const fetchData = async (retryCount = 0) => {
    setLoading(true);
    setError(null);
    try {
      const [supplierRes, productRes, variantRes] = await Promise.all([
        api.get('/api/suppliers/'),
        api.get('/api/products/'),
        api.get('/api/variants/'),
      ]);
      setSuppliers(supplierRes.data);
      setProducts(productRes.data);
      setProductVariants(variantRes.data);
    } catch (err) {
      console.error('Fetch Error:', err);
      if (err.response?.status === 401) {
        setError('សូមចូលគណនីម្តងទៀត។ ការផ្ទៀងផ្ទាត់បានផុតកំណត់។');
      } else if (retryCount < 2) {
        console.log(`Retrying... Attempt ${retryCount + 1}`);
        setTimeout(() => fetchData(retryCount + 1), 2000);
      } else {
        setError(
          err.message === 'Network Error'
            ? 'មិនអាចភ្ជាប់ទៅម៉ាស៊ីនបម្រើបានទេ។ សូមពិនិត្យបណ្តាញរបស់អ្នក។'
            : 'បរាជ័យក្នុងការផ្ទុកជម្រើស។ សូមព្យាយាមម្តងទៀត។'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedFormData = [...formData];
    updatedFormData[index] = { ...updatedFormData[index], [name]: value };
    setFormData(updatedFormData);
  };

  const addPurchaseRow = () => {
    setFormData([
      ...formData,
      {
        supplier: '',
        product: '',
        product_variant: '',
        batch_number: '',
        quantity: '',
        purchase_price: '',
      },
    ]);
  };

  const removePurchaseRow = (index) => {
    if (formData.length === 1) {
      setError('អ្នកត្រូវតែមានយ៉ាងហោចណាស់មួយធាតុទិញ។');
      return;
    }
    const updatedFormData = formData.filter((_, i) => i !== index);
    setFormData(updatedFormData);
  };

  const openProductModal = (index) => {
    setSelectedRowIndex(index);
    setShowProductModal(true);
    setSearchTerm('');
  };

  const handleSelectProduct = (productId, variantId = '') => {
    const updatedFormData = [...formData];
    updatedFormData[selectedRowIndex] = {
      ...updatedFormData[selectedRowIndex],
      product: productId,
      product_variant: variantId,
    };
    setFormData(updatedFormData);
    setShowProductModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const purchaseDataList = formData.map((entry, index) => {
      const purchaseData = {
        supplier: parseInt(entry.supplier) || null,
        product: parseInt(entry.product) || null,
        product_variant: entry.product_variant ? parseInt(entry.product_variant) : null,
        batch_number: entry.batch_number || null,
        quantity: parseInt(entry.quantity) || null,
        purchase_price: parseFloat(entry.purchase_price) || null,
      };

      if (
        !purchaseData.supplier ||
        !purchaseData.product ||
        !purchaseData.batch_number ||
        !purchaseData.quantity ||
        !purchaseData.purchase_price
      ) {
        throw new Error(`ត្រូវបំពេញគ្រប់វាលដែលតម្រូវសម្រាប់ធាតុទិញទី ${index + 1}។`);
      }

      return purchaseData;
    });

    try {
      const response = await api.post('/api/purchases/bulk/', purchaseDataList);
      setSuccess('បានបន្ថែមការទិញដោយជោគជ័យ! ស្តុកត្រូវបានធ្វើបច្ចុប្បន្នភាព។');
      setIsSuccess(true);
      setTimeout(() => navigate('/purchases', { replace: true }), 1500);
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        'បរាជ័យក្នុងការបន្ថែមការទិញ។ សូមពិនិត្យមើលទិន្នន័យរបស់អ្នក។';
      setError(errorMsg);
      console.error(err.response?.data || err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = () => {
    const term = searchTerm.toLowerCase();
    const allItems = [];

    products.forEach((product) => {
      const matchingVariants = productVariants.filter((v) => v.product === product.id);
      
      // Only include variants that have both size and color
      matchingVariants.forEach((variant) => {
        if (variant.size && variant.color) { // Ensure both size and color exist
          const fullName = `${product.name} ${variant.size} ${variant.color}`.trim();
          if (fullName.toLowerCase().includes(term)) {
            allItems.push({ productId: product.id, variantId: variant.id, name: fullName });
          }
        }
      });
    });

    return allItems;
  };

  const getDisplayName = (entry) => {
    const product = products.find((p) => p.id === parseInt(entry.product));
    if (!product) return '';
    
    const variant = productVariants.find((v) => v.id === parseInt(entry.product_variant));
    if (!variant || !variant.size || !variant.color) return ''; // Return empty if no variant or missing size/color
    
    return `${product.name} ${variant.size} ${variant.color}`.trim();
  };

  if (loading) return <p className="loading-text">កំពុងផ្ទុក...</p>;

  return (
    <div className="product-table-container">
      <div className="product-header">
        <h2>បន្ថែមការទិញថ្មី</h2>
        {error && !success && (
          <button className="retry-button" onClick={() => fetchData()}>
            ព្យាយាមម្តងទៀត
          </button>
        )}
      </div>
      {error && <p className="error-message">{error}</p>}
      {success && (
        <p className={`success-message ${isSuccess ? 'fade-in' : ''}`}>{success}</p>
      )}
      <form onSubmit={handleSubmit} className={`add-form ${isSuccess ? 'fade-out' : ''}`}>
        <table className="purchase-table">
          <thead>
            <tr>
              <th>អ្នកផ្គត់ផ្គង់</th>
              <th>ផលិតផល/ប្រភេទ</th>
              <th>លេខបាច់</th>
              <th>បរិមាណ</th>
              <th>តម្លៃទិញ</th>
              <th>សកម្មភាព</th>
            </tr>
          </thead>
          <tbody>
            {formData.map((entry, index) => (
              <tr key={index}>
                <td>
                  <select
                    name="supplier"
                    value={entry.supplier}
                    onChange={(e) => handleChange(index, e)}
                    required
                    disabled={isSubmitting || products.length === 0}
                  >
                    <option value="">ជ្រើសរើសអ្នកផ្គត់ផ្គង់</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <div className="product-select-group">
                    <input
                      type="text"
                      value={getDisplayName(entry)}
                      readOnly
                      placeholder="ជ្រើសរើសផលិតផល"
                      className="product-display-input"
                    />
                    <button
                      type="button"
                      onClick={() => openProductModal(index)}
                      className="select-product-button"
                      disabled={isSubmitting || products.length === 0}
                    >
                      ជ្រើសរើស
                    </button>
                  </div>
                </td>
                <td>
                  <input
                    type="text"
                    name="batch_number"
                    value={entry.batch_number}
                    onChange={(e) => handleChange(index, e)}
                    required
                    disabled={isSubmitting}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name="quantity"
                    value={entry.quantity}
                    onChange={(e) => handleChange(index, e)}
                    min="1"
                    required
                    disabled={isSubmitting}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name="purchase_price"
                    value={entry.purchase_price}
                    onChange={(e) => handleChange(index, e)}
                    step="0.01"
                    min="0"
                    required
                    disabled={isSubmitting}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => removePurchaseRow(index)}
                    className="remove-button"
                    disabled={isSubmitting}
                  >
                    លុប
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="form-actions">
          <button
            type="button"
            onClick={addPurchaseRow}
            className="add-row-button"
            disabled={isSubmitting || products.length === 0}
          >
            បន្ថែមការទិញផ្សេងទៀត
          </button>
          <button
            type="submit"
            className="product-add-button"
            disabled={isSubmitting || products.length === 0}
          >
            {isSubmitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកការទិញទាំងអស់'}
          </button>
        </div>
      </form>

      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>ជ្រើសរើសផលិតផល</h2>
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="ស្វែងរកផលិតផល..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="modal-table-container">
              <table className="modal-table">
                <thead>
                  <tr>
                    <th>ឈ្មោះផលិតផល</th>
                    <th>ទំហំ</th>
                    <th>ពណ៌</th>
                    <th>សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems().length === 0 ? (
                    <tr>
                      <td colSpan="4" className="no-results">
                        គ្មានផលិតផលត្រូវនឹងការស្វែងរក
                      </td>
                    </tr>
                  ) : (
                    filteredItems().map((item) => {
                      const parts = item.name.split(' ');
                      const productName = parts[0] + (parts[1] && !['M', 'L', 'S', '39', '40'].includes(parts[1]) ? ' ' + parts[1] : '');
                      const sizeIndex = parts.findIndex(part => ['M', 'L', 'S', '39', '40'].includes(part));
                      const size = sizeIndex !== -1 ? parts[sizeIndex] : '';
                      const color = sizeIndex !== -1 && parts[sizeIndex + 1] ? parts[sizeIndex + 1] : '';
                      return (
                        <tr key={`${item.productId}-${item.variantId || 'no-variant'}`}>
                          <td>{productName}</td>
                          <td>{size}</td>
                          <td>{color}</td>
                          <td>
                            <button
                              className="select-button"
                              onClick={() => handleSelectProduct(item.productId, item.variantId)}
                            >
                              ជ្រើសរើស
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <button
              className="close-button"
              onClick={() => setShowProductModal(false)}
            >
              បិទ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPurchase;