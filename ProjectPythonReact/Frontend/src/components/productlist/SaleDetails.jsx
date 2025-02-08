import React from "react";
import { FaTrash } from "react-icons/fa"; // Importing delete and check icons
import "./SaleDetails.css";

const SaleDetails = () => {
  return (
    <div className="sale-details-container">
      <div className="sale-details-card">
        <h2 className="sale-title">Sale Details</h2>
        
        <div className="billed-to-section">
          <h3>Billed to</h3>
          <div className="client-details">
            {/* Client Item with Image */}
            <div className="client-item">
              <div className="item-image-container">
                <img
                  src="https://m.media-amazon.com/images/I/41BWlPRK7IL._AC_SY780_.jpg"
                  alt="Black headset"
                  className="item-image"
                />
              </div>
              <div className="item-info">
                <span className="item-name">Black headset</span>
                <span className="item-price">$30.78</span>
                <div className="tax-detail">Tax: EST 1.5%</div>
              </div>
              <div className="item-actions">
                <button className="icon-btn delete-btn">
                  <FaTrash />
                </button>
              
              </div>
            </div>

            {/* Repeat for other items */}
            <div className="client-item">
              <div className="item-image-container">
                <img
                  src="https://m.media-amazon.com/images/I/41BWlPRK7IL._AC_SY780_.jpg"
                  alt="Black headset"
                  className="item-image"
                />
              </div>
              <div className="item-info">
                <span className="item-name">Black headset</span>
                <span className="item-price">$30.78</span>
                <div className="tax-detail">Tax: EST 1.5%</div>
              </div>
              <div className="item-actions">
                <button className="icon-btn delete-btn">
                  <FaTrash />
                </button>
              
              </div>
            </div>

            <div className="client-item">
              <div className="item-image-container">
                <img
                  src="https://m.media-amazon.com/images/I/41BWlPRK7IL._AC_SY780_.jpg"
                  alt="Black headset"
                  className="item-image"
                />
              </div>
              <div className="item-info">
                <span className="item-name">Black headset</span>
                <span className="item-price">$30.78</span>
                <div className="tax-detail">Tax: EST 1.5%</div>
              </div>
              <div className="item-actions">
                <button className="icon-btn delete-btn">
                  <FaTrash />
                </button>
             
              </div>
            </div>
          </div>
        </div>

        <div className="calculation-section">
          <div className="subtotal">
            <h4>Sub total (USD)</h4>
            <div className="tax-breakdown">
              <div className="tax-item">
                <span>Tax (EST 1.5%) of $400</span>
                <span>$8.00</span>
              </div>
              <div className="tax-item">
                <span>Tax (VAT 3%) of $300</span>
                <span>$9.00</span>
              </div>
            </div>
          </div>

          <div className="total-section">
            <div className="discount-add">
              <button className="add-discount-btn">Add Discount</button>
            </div>
            <div className="total-amount">
              <span>Total (USD)</span>
              <span className="amount">$540.00</span>
            </div>
           
         
          </div>
          <div className="discount-add">
              <button className="add-discount-btn">CheckOut</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SaleDetails;