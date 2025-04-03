import axios from 'axios';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext'; // សូមកែសម្រួល path បើចាំបាច់
import './AddCategory.css'; // រក្សា CSS ដដែល

const AddCategory = () => {
  const [formData, setFormData] = useState({ name: '' });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, logout } = useContext(AuthContext); // រួមបញ្ចូល logout
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: 'http://localhost:8000', // URL របស់ Backend API
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`, // យក Token ពី Local Storage
    },
  });

  // មុខងារនៅពេលមានការផ្លាស់ប្តូរក្នុង Input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message) setMessage(''); // លុបសារចាស់ចោលពេលចាប់ផ្តើមវាយបញ្ចូល
  };

  // មុខងារនៅពេល Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault(); // ការពារការផ្ទុកទំព័រឡើងវិញ
    setIsLoading(true); // បង្ហាញថា កំពុងដំណើរការ
    setMessage(''); // សម្អាតសារចាស់

    try {
      const response = await api.post('/api/categories/', formData); // ផ្ញើសំណើរ POST
      setMessage('បានបន្ថែមប្រភេទដោយជោគជ័យ!'); // សារជោគជ័យ
      setFormData({ name: '' }); // សម្អាត Input Field
      setTimeout(() => navigate('/category-list'), 1000); // រងចាំ 1 វិនាទី រួចទៅកាន់ទំព័រ Category List
    } catch (error) {
      // ករណីមាន Error កើតឡើង
      if (error.response) {
        // Error ពី Server (មាន Response)
        const status = error.response.status;
        // ព្យាយាមយក detail ពី error response, បើមិនមាន ប្រើសារ default
        const detail = error.response.data.detail || 'ការបន្ថែមប្រភេទបានបរាជ័យ។';
        if (status === 401) { // Unauthorized (Token មិនត្រឹមត្រូវ ឬផុតកំណត់)
          setMessage('សម័យប្រើប្រាស់បានផុតកំណត់។ សូមចូលប្រើម្តងទៀត។');
          logout(); // សម្អាត User និង Token
          setTimeout(() => navigate('/login'), 1000); // រងចាំ 1 វិនាទី រួចទៅកាន់ទំព័រ Login
        } else {
          // Error ផ្សេងទៀតពី Server
          setMessage(detail);
        }
      } else if (error.request) {
        // Error ក្នុងការផ្ញើសំណើរ (គ្មាន Response ពី Server)
        setMessage('មិនអាចភ្ជាប់ទៅកាន់ម៉ាស៊ីនមេបានទេ។');
      } else {
        // Error ផ្សេងទៀត (ឧ. Error ក្នុងកូដ JavaScript)
        setMessage('កំហុស៖ ' + error.message);
      }
    } finally {
      setIsLoading(false); // បញ្ឈប់ការបង្ហាញថា កំពុងដំណើរការ
    }
  };

  // ផ្នែកបង្ហាញលើ UI
  return (
    <div className="category-form-container">
      <h2>បន្ថែមប្រភេទ</h2> {/* <--- Translated */}
      <form onSubmit={handleSubmit} className="category-form">
        <input
          type="text"
          name="name"
          placeholder="ឈ្មោះប្រភេទ"  /* <--- Translated */
          value={formData.name}
          onChange={handleChange}
          required // តម្រូវឲ្យបំពេញ
          disabled={isLoading} // បិទ Input ពេលកំពុងដំណើរការ
          className="category-input"
        />
        <button type="submit" disabled={isLoading} className="category-button">
          {/* ប្តូរអក្សរលើប៊ូតុងអាស្រ័យលើ isLoading */}
          {isLoading ? 'កំពុងបន្ថែម...' : 'បន្ថែមប្រភេទ'} {/* <--- Translated */}
        </button>
      </form>
      {/* បង្ហាញសារ បើមាន */}
      {message && (
        <p
          className={`category-message ${message.includes('ជោគជ័យ') ? 'success' : 'error'}`} /* <--- Check for Khmer success word */
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default AddCategory;