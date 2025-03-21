import axios from 'axios';
import React, { useState } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password2) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/register/', formData);
      if (response.data && response.data.message) {
        setMessage(response.data.message);  // Use the response message
      } else {
        setMessage("Registration successful!");
      }
    } catch (error) {
      if (error.response) {
        const errorMsg = error.response.data?.message || "Registration failed!";
        setMessage(errorMsg);
      } else if (error.request) {
        setMessage("No response from server. Please try again.");
      } else {
        setMessage("An error occurred: " + error.message);
      }
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password2"
          placeholder="Confirm Password"
          onChange={handleChange}
          required
        />
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Register;
