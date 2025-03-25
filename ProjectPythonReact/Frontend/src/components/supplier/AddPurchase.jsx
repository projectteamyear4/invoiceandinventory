// src/components/AddPurchase.jsx
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
    const fetchData = async () => {
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
        setError('បរាជ័យក្នុងការផ្ទុកជម្រើស។ សូមព្យាយាមម្តងទៀត។'); // "Failed to load options. Please try again."
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
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
      setError('អ្នកត្រូវតែមានយ៉ាងហោចណាស់មួយធាតុទិញ។'); // "You must have at least one purchase entry."
      return;
    }
    const updatedFormData = formData.filter((_, i) => i !== index);
    setFormData(updatedFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate and prepare data for submission
    const purchaseDataList = formData.map((entry, index) => {
      const purchaseData = {
        supplier: parseInt(entry.supplier) || null,
        product: parseInt(entry.product) || null,
        product_variant: entry.product_variant ? parseInt(entry.product_variant) : null,
        batch_number: entry.batch_number || null,
        quantity: parseInt(entry.quantity) || null,
        purchase_price: parseFloat(entry.purchase_price) || null,
      };

      // Validate each entry
      if (
        !purchaseData.supplier ||
        !purchaseData.product ||
        !purchaseData.batch_number ||
        !purchaseData.quantity ||
        !purchaseData.purchase_price
      ) {
        throw new Error(
          `ត្រូវបំពេញគ្រប់វាលដែលតម្រូវសម្រាប់ធាតុទិញទី ${index + 1}។` // "All required fields must be filled for purchase entry ${index + 1}."
        );
      }

      return purchaseData;
    });

    try {
      // Send all purchases in a single request
      const response = await api.post('/api/purchases/bulk/', purchaseDataList);
      setSuccess('បានបន្ថែមការទិញដោយជោគជ័យ! ស្តុកត្រូវបានធ្វើបច្ចុប្បន្នភាព។'); // "Purchases added successfully! Stock updated."
      setTimeout(() => navigate('/purchases'), 1000);
    } catch (err) {
      const errorMsg =
        err.response?.data || 'បរាជ័យក្នុងការបន្ថែមការទិញ។ សូមពិនិត្យមើលទិន្នន័យរបស់អ្នក។'; // "Failed to add purchases. Please check your input."
      setError(JSON.stringify(errorMsg));
      console.error(err.response?.data || err);
    }
  };

  if (loading) return <p>កំពុងផ្ទុក...</p>; // "Loading..."

  return (
    <div className="product-table-container">
      <div className="product-header">
        <h2>បន្ថែមការទិញថ្មី</h2> {/* "Add New Purchases" */}
      </div>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <form onSubmit={handleSubmit} className="add-form">
        <table className="purchase-table">
          <thead>
            <tr>
              <th>អ្នកផ្គត់ផ្គង់</th> {/* "Supplier" */}
              <th>ផលិតផល</th> {/* "Product" */}
              <th>ប្រភេទផលិតផល (ស្រេចចិត្ត)</th> {/* "Product Variant (Optional)" */}
              <th>លេខបាច់</th> {/* "Batch Number" */}
              <th>បរិមាណ</th> {/* "Quantity" */}
              <th>តម្លៃទិញ</th> {/* "Purchase Price" */}
              <th>សកម្មភាព</th> {/* "Actions" */}
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
                  >
                    <option value="">ជ្រើសរើសអ្នកផ្គត់ផ្គង់</option> {/* "Select Supplier" */}
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    name="product"
                    value={entry.product}
                    onChange={(e) => handleChange(index, e)}
                    required
                  >
                    <option value="">ជ្រើសរើសផលិតផល</option> {/* "Select Product" */}
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    name="product_variant"
                    value={entry.product_variant}
                    onChange={(e) => handleChange(index, e)}
                  >
                    <option value="">គ្មានប្រភេទ</option> {/* "No Variant" */}
                    {productVariants.map((variant) => (
                      <option key={variant.id} value={variant.id}>
                        {variant.product.name} - {variant.size || ''} {variant.color || ''}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    name="batch_number"
                    value={entry.batch_number}
                    onChange={(e) => handleChange(index, e)}
                    required
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
                  />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => removePurchaseRow(index)}
                    className="remove-button"
                  >
                    លុប {/* "Remove" */}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="form-actions">
          <button type="button" onClick={addPurchaseRow} className="add-row-button">
            បន្ថែមការទិញផ្សេងទៀត {/* "Add Another Purchase" */}
          </button>
          <button type="submit" className="product-add-button">
            រក្សាទុកការទិញទាំងអស់ {/* "Save All Purchases" */}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPurchase;