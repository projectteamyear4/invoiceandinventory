import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext'; // ធ្វើឲ្យផ្លូវត្រឹមត្រូវ
import './Category.css';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCategory, setEditCategory] = useState(null);
  const [editName, setEditName] = useState('');
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
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories/');
        setCategories(response.data);
      } catch (error) {
        console.error('មានកំហុសក្នុងការទាញយកប្រភេទ:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    navigate('/add-category');
  };

  const handleEditCategory = (category) => {
    setEditCategory(category);
    setEditName(category.name);
  };

  const handleUpdateCategory = async (id) => {
    try {
      const response = await api.patch(`/api/categories/${id}/`, { name: editName });
      setCategories(categories.map((cat) => (cat.id === id ? response.data : cat)));
      setEditCategory(null);
      setEditName('');
    } catch (error) {
      console.error('មានកំហុសក្នុងការធ្វើបច្ចុប្បន្នភាពប្រភេទ:', error);
      alert('បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាពប្រភេទ។');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('តើអ្នកប្រាកដជាចង់លុបប្រភេទនេះមែនទេ?')) {
      try {
        await api.delete(`/api/categories/${id}/`);
        setCategories(categories.filter((cat) => cat.id !== id));
      } catch (error) {
        console.error('មានកំហុសក្នុងការលុបប្រភេទ:', error);
        alert('បរាជ័យក្នុងការលុបប្រភេទ។');
      }
    }
  };

  if (loading) return <p>កំពុងផ្ទុកប្រភេទ...</p>;

  return (
    <div className="category-table-container">
      <div className="category-header">
        <h2>ប្រភេទ</h2>
        <button className="category-add-button" onClick={handleAddCategory}>
          បន្ថែមប្រភេទ
        </button>
      </div>
      <table className="category-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>ឈ្មោះ</th>
            <th>សកម្មភាព</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.id}</td>
              <td>
                {editCategory && editCategory.id === category.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="category-input"
                  />
                ) : (
                  category.name
                )}
              </td>
              <td>
                {editCategory && editCategory.id === category.id ? (
                  <button
                    className="category-save-button"
                    onClick={() => handleUpdateCategory(category.id)}
                  >
                    រក្សាទុក
                  </button>
                ) : (
                  <button
                    className="category-edit-button"
                    onClick={() => handleEditCategory(category)}
                  >
                    កែសម្រួល
                  </button>
                )}
                <button
                  className="category-delete-button"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  លុប
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryList;
