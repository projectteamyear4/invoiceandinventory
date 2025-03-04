import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight, FaPlus } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import "./products.css";

const categoriesData = ["ស្បែកជើង", "អាវ", "នាឡិកា", "កាបូប", "មួក", "ខោ", "វ៉ែនតា", "ខ្សែក្រវ៉ាត់", "អាវធំ", "ស្រោមជើង", "ស្រោមដៃ", "កន្សែង", "អាវយឺត"];

const productData = [
  { name: "Nike Air Max", price: 120, qty: 5, image: "https://m.media-amazon.com/images/I/41BWlPRK7IL._AC_SY780_.jpg", barcode: "123456789012", status: "មានស្តុក" },
  { name: "អាវធំ Denim", price: 100, qty: 2, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHGatNztiRM7WtPcFuZZlqLtIgPSj2BQB1Lw&s", barcode: "234567890123", status: "ស្តុកតិច" },
  { name: "Apple Watch Series 8", price: 250, qty: 10, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlwa4y1syoUi_KNK-soHde_bTP8BtnDcNwwQ&s", barcode: "345678901234", status: "មានស្តុក" },
  { name: "កាបូបស្បែកល្អ", price: 80, qty: 0, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2xIf_l1tQhUS-Jm7usXnGJ7IYGrVyLwH_tw&s", barcode: "456789012345", status: "អស់ស្តុក" },
  { name: "ស្បែកជើងរត់", price: 90, qty: 15, image: "https://m.media-amazon.com/images/I/81D6z6EXKPL._AC_SY695_.jpg", barcode: "567890123456", status: "មានស្តុក" },
  { name: "ខ្សែក្រវ៉ាត់ស្បែក", price: 30, qty: 8, image: "https://m.media-amazon.com/images/I/71TMRwVa3nL._AC_SX679_.jpg", barcode: "678901234567", status: "មានស្តុក" },
  { name: "វ៉ែនតាឆ្លាត", price: 300, qty: 4, image: "https://m.media-amazon.com/images/I/51D2fV5LZOL._AC_SY679_.jpg", barcode: "789012345678", status: "ស្តុកតិច" },
  { name: "កន្សែងរោមចៀម", price: 50, qty: 6, image: "https://m.media-amazon.com/images/I/71dMJRE6LPL._AC_SX679_.jpg", barcode: "890123456789", status: "មានស្តុក" }
];

const itemsPerPage = 4; // ចំនួនផលិតផលក្នុងមួយទំព័រ

const Product = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [startIndex, setStartIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("ស្បែកជើង");
  const [currentPage, setCurrentPage] = useState(1);

  // តក្កវិជ្ជាទំព័រ
  const totalPages = Math.ceil(productData.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const displayedProducts = productData.slice(start, end);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "មានស្តុក":
        return "status-in";
      case "ស្តុកតិច":
        return "status-low";
      case "អស់ស្តុក":
        return "status-out";
      default:
        return "";
    }
  };

  return (
    <section className="PageProduct">
      <div className="product-container">
        {/* ផ្នែកក្បាលទំព័រ */}
        <header className="page-header">
          <h1 className="page-title">ស្វែងរកផលិតផល</h1>
          <div className="search-box">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="ស្វែងរកផលិតផល..."
              className="search-input"
            />
            <button className="add-item-btn" onClick={() => navigate('/add-product')}>
              <FaPlus className="btn-icon" />
              បន្ថែមផលិតផល
            </button>
          </div>
        </header>

        {/* ផ្នែកប្រភេទ */}
        <section className="category-section">
          <div className="section-header">
            <h3 className="section-title">ប្រភេទ</h3>
            <div className="scroll-controls">
              <button className={`control-btn ${startIndex === 0 ? "disabled" : ""}`} onClick={() => setStartIndex(prev => Math.max(prev - 4, 0))} disabled={startIndex === 0}>
                <FaChevronLeft />
              </button>
              <button className={`control-btn ${startIndex >= categoriesData.length - 9 ? "disabled" : ""}`} onClick={() => setStartIndex(prev => Math.min(prev + 4, categoriesData.length - 9))} disabled={startIndex >= categoriesData.length - 9}>
                <FaChevronRight />
              </button>
            </div>
          </div>

          <div className="categories-container">
            {categoriesData.slice(startIndex, startIndex + 9).map((category, index) => (
              <button key={index} className={`category-btn ${category === selectedCategory ? "active" : ""}`} onClick={() => setSelectedCategory(category)}>
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* ផ្នែកតារាងផលិតផល */}
        <section className="products-section">
          <h3 className="section-title">ផលិតផលពិសេស</h3>
          <table className="products-table">
            <thead>
              <tr>
                <th>រូបភាព</th>
                <th>បាកូដ</th>
                <th>ឈ្មោះ</th>
                <th>តម្លៃ ($)</th>
                <th>បរិមាណ</th>
                <th>ស្ថានភាព</th>
              </tr>
            </thead>
            <tbody>
              {displayedProducts.map((product, index) => (
                <tr key={index}>
                  <td>
                    <img src={product.image} alt={product.name} className="product-image" />
                  </td>
                  <td className="barcode">{product.barcode}</td>
                  <td>{product.name}</td>
                  <td>${product.price}</td>
                  <td>{product.qty}</td>
                  <td>
                    <span className={`status ${getStatusStyle(product.status)}`}>
                      {product.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ការគ្រប់គ្រងទំព័រ */}
          <div className="pagination">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
              ថយក្រោយ
            </button>

            {Array.from({ length: totalPages }, (_, index) => (
              <button 
                key={index + 1} 
                onClick={() => setCurrentPage(index + 1)} 
                className={currentPage === index + 1 ? "active" : ""}
              >
                {index + 1}
              </button>
            ))}

            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
              បន្ទាប់
            </button>
          </div>
        </section>
      </div>
    </section>
  );
};

export default Product;