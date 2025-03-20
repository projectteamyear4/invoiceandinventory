import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import About from './components/about';
import CreatePost from './components/create';
import Home from './components/home';
import Navbar from './components/Navbar';

function AppContent() {
  const location = useLocation();
  
  return (
    <>
      <Navbar currentPath={location.pathname} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/create" element={<CreatePost />} />
      </Routes>
    </>
  );
}

const App = () => {
  return <AppContent />;
};

export default App;