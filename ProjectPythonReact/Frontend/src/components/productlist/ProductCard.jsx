import React from "react";
import "./products.css"; // Import CSS for styling

const ProductCard = ({ name, price, qty, image }) => {
  return (
    <div className="product-card">
      <div className="card-image-container">
        <img src={image} alt={name} className="product-image" />
      </div>
      <div className="card-content">
        <h4 className="product-title">{name}</h4>
        <div className="product-details">
          <div className="price-qty">
            <span className="price">${price}</span>
            <span className="quantity">{qty} in stock</span>
          </div>
          <button className="add-to-cart-btn">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;