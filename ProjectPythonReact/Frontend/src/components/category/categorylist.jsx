import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext'; // Fixed path
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
        console.error('Error fetching categories:', error);
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
      console.error('Error updating category:', error);
      alert('Failed to update category.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/api/categories/${id}/`);
        setCategories(categories.filter((cat) => cat.id !== id));
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category.');
      }
    }
  };

  if (loading) return <p>Loading categories...</p>;

  return (
    <div className="category-table-container">
      <div className="category-header">
        <h2>Categories</h2>
        <button className="category-add-button" onClick={handleAddCategory}>
          Add Category
        </button>
      </div>
      <table className="category-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Actions</th>
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
                    Save
                  </button>
                ) : (
                  <button
                    className="category-edit-button"
                    onClick={() => handleEditCategory(category)}
                  >
                    Edit
                  </button>
                )}
                <button
                  className="category-delete-button"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  Delete
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