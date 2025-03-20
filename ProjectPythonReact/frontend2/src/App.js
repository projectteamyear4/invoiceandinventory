import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import About from './components/about';
import CreatePost from './components/create';
import Home from './components/home';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/create" element={<CreatePost />} />
      </Routes>
    </Router>
  );
};

export default App;
