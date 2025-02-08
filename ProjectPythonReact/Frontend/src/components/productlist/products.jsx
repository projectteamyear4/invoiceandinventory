import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight, FaPlus } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import ProductCard from "./ProductCard";
import "./products.css";

const categoriesData = ["Shoes", "Shirts", "Watches", "Bags", "Hats", "Pants", "Glasses", "Belts", "Jackets", "Socks", "Gloves", "Scarves", "Sweaters"];

const productData = [
  { name: "Nike Air Max", price: 120, qty: 5, image: "https://m.media-amazon.com/images/I/41BWlPRK7IL._AC_SY780_.jpg" },
  { name: "Denim Jacket", price: 100, qty: 7, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHGatNztiRM7WtPcFuZZlqLtIgPSj2BQB1Lw&s" },
  { name: "Apple Watch Series 8", price: 250, qty: 10, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlwa4y1syoUi_KNK-soHde_bTP8BtnDcNwwQ&s" },
  { name: "Premium Leather Bag", price: 80, qty: 3, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2xIf_l1tQhUS-Jm7usXnGJ7IYGrVyLwH_tw&s" },
  { name: "Apple Watch Series 8", price: 250, qty: 10, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlwa4y1syoUi_KNK-soHde_bTP8BtnDcNwwQ&s" },
  { name: "Nike Air Max", price: 120, qty: 5, image: "https://m.media-amazon.com/images/I/41BWlPRK7IL._AC_SY780_.jpg" },
  { name: "Apple Watch Series 8", price: 250, qty: 10, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlwa4y1syoUi_KNK-soHde_bTP8BtnDcNwwQ&s" },
  { name: "Apple Watch Series 8", price: 250, qty: 10, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlwa4y1syoUi_KNK-soHde_bTP8BtnDcNwwQ&s" },
  { name: "Apple Watch Series 8", price: 250, qty: 10, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlwa4y1syoUi_KNK-soHde_bTP8BtnDcNwwQ&s" },
  { name: "Nike Air Max", price: 120, qty: 5, image: "https://m.media-amazon.com/images/I/41BWlPRK7IL._AC_SY780_.jpg" },
 
];

const Product = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [startIndex, setStartIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("Shoes");

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const scrollLeft = () => {
    setStartIndex((prev) => Math.max(prev - 4, 0));
  };

  const scrollRight = () => {
    setStartIndex((prev) => Math.min(prev + 4, categoriesData.length - 9));
  };

  return (
    <section className="PageProduct">
      <div className="product-container">
        {/* Header Section */}
        <header className="page-header">
          <h1 className="page-title">Discover Products</h1>
          <div className="search-box">
            <div className="search-input-container">
              
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search products..."
                className="search-input"
              />
            </div>
            <button 
            className="add-item-btn"
            onClick={() => navigate('/add-product')}
          >
            <FaPlus className="btn-icon" />
            Add Product
          </button>
          </div>
        </header>

        {/* Main Content Section */}
        <div className="main-content">
          {/* Left Side: Product List */}
          <div className="product-list">
            {/* Categories Section */}
            <section className="category-section">
              <div className="section-header">
                <h3 className="section-title">Categories</h3>
                <div className="scroll-controls">
                  <button 
                    className={`control-btn ${startIndex === 0 ? 'disabled' : ''}`} 
                    onClick={scrollLeft}
                    disabled={startIndex === 0}
                  >
                    <FaChevronLeft />
                  </button>
                  <button 
                    className={`control-btn ${startIndex >= categoriesData.length - 9 ? 'disabled' : ''}`} 
                    onClick={scrollRight}
                    disabled={startIndex >= categoriesData.length - 9}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
              
              <div className="categories-container">
                {categoriesData.slice(startIndex, startIndex + 9).map((category, index) => (
                  <button
                    key={index}
                    className={`category-btn ${category === selectedCategory ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </section>

            {/* Products Section */}
            <section className="products-section">
              <h3 className="section-title">Featured Products</h3>
              <div className="products-grid">
                {productData.map((product, index) => (
                  <ProductCard 
                    key={index} 
                    name={product.name} 
                    price={product.price} 
                    qty={product.qty} 
                    image={product.image} 
                  />
                ))}
              </div>
            </section>
          </div>
          </div>
             
      </div>
      
    </section>
  );
};

export default Product;