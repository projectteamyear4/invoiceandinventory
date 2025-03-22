// src/components/Shelves.jsx
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Shelf.css';

const Shelves = () => {
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  useEffect(() => {
    const fetchShelves = async () => {
      try {
        const response = await api.get('/api/shelves/');
        setShelves(response.data);
      } catch (error) {
        console.error('Error fetching shelves:', error);
        setMessage('Failed to load shelves.');
      } finally {
        setLoading(false);
      }
    };
    fetchShelves();
  }, []);

  const handleAddShelf = () => {
    navigate('/add-shelf');
  };

  const handleEditShelf = (id) => {
    navigate(`/edit-shelf/${id}`);
  };

  const handleDeleteShelf = async (id) => {
    if (window.confirm('Are you sure you want to delete this shelf?')) {
      try {
        await api.delete(`/api/shelves/${id}/`);
        setShelves(shelves.filter((s) => s.id !== id));
        setMessage('Shelf deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting shelf:', error);
        setMessage('Failed to delete shelf.');
      }
    }
  };

  if (loading) return <p>Loading shelves...</p>;

  return (
    <div className="shelf-container">
      <div className="shelf-header">
        <h2>Shelves</h2>
        <button className="shelf-add-button" onClick={handleAddShelf}>
          Add Shelf
        </button>
      </div>
      {message && (
        <p className={`shelf-message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}
      <table className="shelf-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Warehouse ID</th>
            <th>Shelf Name</th>
            <th>Section</th>
            <th>Capacity</th> {/* Added */}
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shelves.map((shelf) => (
            <tr key={shelf.id}>
              <td>{shelf.id}</td>
              <td>{shelf.warehouse}</td>
              <td>{shelf.shelf_name}</td>
              <td>{shelf.section || '-'}</td>
              <td>{shelf.capacity}</td> {/* Display capacity */}
              <td>{new Date(shelf.created_at).toLocaleDateString()}</td>
              <td>
                <button
                  className="shelf-edit-button"
                  onClick={() => handleEditShelf(shelf.id)}
                >
                  Edit
                </button>
                <button
                  className="shelf-delete-button"
                  onClick={() => handleDeleteShelf(shelf.id)}
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

export default Shelves;