import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight, FaEllipsisV, FaPlus, FaSort, FaTrash } from "react-icons/fa"; // Added FaTrash for delete
import { useNavigate } from 'react-router-dom';
import "./products.css";

const categoriesData = ["ស្បែកជើង", "អាវ", "នាឡិកា", "កាបូប", "មួក", "ខោ", "វ៉ែនតា", "ខ្សែក្រវ៉ាត់", "អាវធំ", "ស្រោមជើង", "ស្រោមដៃ", "កន្សែង", "អាវយឺត"];

const initialProductData = [
  { name: "Nike Air Max", price: 120, qty: 5, image: "https://m.media-amazon.com/images/I/41BWlPRK7IL._AC_SY780_.jpg", barcode: "123456789012", status: "មានស្តុក", description: "ស្បែកជើងកីឡាដ៏ពេញនិយម", category: "ស្បែកជើង", brand: "Nike", sold: 10, totalStock: 15 },
  { name: "អាវធំ Denim", price: 100, qty: 2, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn9GcTHGatNztiRM7WtPcFuZZlqLtIgPSj2BQB1Lw&s", barcode: "234567890123", status: "ស្តុកតិច", description: "អាវធំទាន់សម័យ", category: "អាវធំ", brand: "Levi's", sold: 8, totalStock: 10 },
  { name: "Apple Watch Series 8", price: 250, qty: 10, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn9GcTlwa4y1syoUi_KNK-soHde_bTP8BtnDcNwwQ&s", barcode: "345678901234", status: "មានស្តុក", description: "នាឡិកាឆ្លាតវៃ", category: "នាឡិកា", brand: "Apple", sold: 5, totalStock: 15 },
  { name: "កាបូបស្បែកល្អ", price: 80, qty: 0, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn9GcQ2xIf_l1tQhUS-Jm7usXnGJ7IYGrVyLwH_tw&s", barcode: "456789012345", status: "អស់ស្តុក", description: "កាបូបធ្វើពីស្បែកពិត", category: "កាបូប", brand: "Gucci", sold: 12, totalStock: 12 },
  { name: "ស្បែកជើងរត់", price: 90, qty: 15, image: "https://m.media-amazon.com/images/I/81D6z6EXKPL._AC_SY695_.jpg", barcode: "567890123456", status: "មានស្តុក", description: "ស្បែកជើងសម្រាប់រត់", category: "ស្បែកជើង", brand: "Adidas", sold: 3, totalStock: 18 },
  { name: "ខ្សែក្រវ៉ាត់ស្បែក", price: 30, qty: 8, image: "https://m.media-amazon.com/images/I/71TMRwVa3nL._AC_SX679_.jpg", barcode: "678901234567", status: "មានស្តុក", description: "ខ្សែក្រវ៉ាត់បុរស", category: "ខ្សែក្រវ៉ាត់", brand: "Tommy Hilfiger", sold: 7, totalStock: 15 },
  { name: "វ៉ែនតាឆ្លាត", price: 300, qty: 4, image: "https://m.media-amazon.com/images/I/51D2fV5LZOL._AC_SY679_.jpg", barcode: "789012345678", status: "ស្តុកតិច", description: "វ៉ែនតាបច្ចេកវិទ្យា", category: "វ៉ែនតា", brand: "Ray-Ban", sold: 6, totalStock: 10 },
  { name: "កន្សែងរោមចៀម", price: 50, qty: 6, image: "https://m.media-amazon.com/images/I/71dMJRE6LPL._AC_SX679_.jpg", barcode: "890123456789", status: "មានស្តុក", description: "កន្សែងកក់ក្តៅ", category: "កន្សែង", brand: "Uniqlo", sold: 4, totalStock: 10 }
];

const itemsPerPage = 4;

const Product = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [startIndex, setStartIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("ស្បែកជើង");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState(null);
  const [editedProduct, setEditedProduct] = useState({});
  const [productData, setProductData] = useState(initialProductData);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const totalPages = Math.ceil(productData.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const displayedProducts = productData.slice(start, end);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "មានស្តុក": return "status-in";
      case "ស្តុកតិច": return "status-low";
      case "អស់ស្តុក": return "status-out";
      default: return "";
    }
  };

  const toggleRow = (index) => {
    if (expandedRow === index) {
      setExpandedRow(null);
    } else {
      setExpandedRow(index);
      setEditedProduct({ ...displayedProducts[index] });
    }
  };

  const handleInputChange = (field, value) => {
    setEditedProduct(prev => ({ ...prev, [field]: value }));
  };

  const saveChanges = (index) => {
    const updatedProducts = [...productData];
    updatedProducts[start + index] = { ...editedProduct };
    setProductData(updatedProducts);
    setExpandedRow(null);
    console.log("Updated Product:", updatedProducts[start + index]);
  };

  const deleteProduct = (index) => {
    if (window.confirm("តើអ្នកប្រាកដជាចង់លុបផលិតផលនេះមែនទេ?")) {
      const updatedProducts = [...productData];
      updatedProducts.splice(start + index, 1); // Remove the product at the index
      setProductData(updatedProducts);
      setExpandedRow(null); // Collapse the row after deletion
      console.log("Deleted Product:", displayedProducts[index]);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedProducts = [...productData].sort((a, b) => {
      if (key === 'name') {
        return direction === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      if (key === 'price' || key === 'qty') {
        return direction === 'asc' ? a[key] - b[key] : b[key] - a[key];
      }
      return 0;
    });
    setProductData(sortedProducts);
    setCurrentPage(1);
  };

  return (
    <section className="PageProduct">
      <div className="product-container">
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

        <section className="products-section">
          <h3 className="section-title">ផលិតផលពិសេស</h3>
          <table className="products-table">
            <thead>
              <tr>
                <th>រូបភាព</th>
                <th>បាកូដ</th>
                <th>
                  <a className="sort-btn" onClick={() => handleSort('name')}>
                    ឈ្មោះ
                    <FaSort />
                  </a>
                </th>
                <th>
                  <a className="sort-btn" onClick={() => handleSort('price')}>
                    តម្លៃ ($)
                    <FaSort />
                  </a>
                </th>
                <th>
                  <a className="sort-btn" onClick={() => handleSort('qty')}>
                    បរិមាណ
                    <FaSort />
                  </a>
                </th>
                <th>ស្ថានភាព</th>
                <th>សកម្មភាព</th>
              </tr>
            </thead>
            <tbody>
              {displayedProducts.map((product, index) => (
                <React.Fragment key={index}>
                  <tr>
                    <td><img src={product.image} alt={product.name} className="product-image" /></td>
                    <td className="barcode">{product.barcode}</td>
                    <td>{product.name}</td>
                    <td>${product.price}</td>
                    <td>{product.qty}</td>
                    <td><span className={`status ${getStatusStyle(product.status)}`}>{product.status}</span></td>
                    <td>
                      <button className="expand-btn" onClick={() => toggleRow(index)}>
                        <FaEllipsisV />
                      </button>
                    </td>
                  </tr>
                  {expandedRow === index && (
                    <tr className="details-row">
                      <td colSpan="7">
                        <div className="product-details">
                          <div className="detail-field">
                            <label>ឈ្មោះ:</label>
                            <input
                              type="text"
                              value={editedProduct.name || ""}
                              onChange={(e) => handleInputChange("name", e.target.value)}
                            />
                          </div>
                          <div className="detail-field">
                            <label>តម្លៃ ($):</label>
                            <input
                              type="number"
                              value={editedProduct.price || 0}
                              onChange={(e) => handleInputChange("price", e.target.value)}
                            />
                          </div>
                          <div className="detail-field">
                            <label>រូបភាព (URL):</label>
                            <input
                              type="text"
                              value={editedProduct.image || ""}
                              onChange={(e) => handleInputChange("image", e.target.value)}
                            />
                          </div>
                          <div className="detail-field">
                            <label>បរិយាយ:</label>
                            <input
                              type="text"
                              value={editedProduct.description || ""}
                              onChange={(e) => handleInputChange("description", e.target.value)}
                            />
                          </div>
                          <div className="detail-field">
                            <label>ប្រភេទ:</label>
                            <select
                              value={editedProduct.category || ""}
                              onChange={(e) => handleInputChange("category", e.target.value)}
                            >
                              {categoriesData.map((cat, idx) => (
                                <option key={idx} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>
                          <div className="detail-field">
                            <label>ម៉ាក:</label>
                            <input
                              type="text"
                              value={editedProduct.brand || ""}
                              onChange={(e) => handleInputChange("brand", e.target.value)}
                            />
                          </div>
                          <div className="detail-field">
                            <label>លក់រួច:</label>
                            <input
                              type="number"
                              value={editedProduct.sold || 0}
                              onChange={(e) => handleInputChange("sold", e.target.value)}
                            />
                          </div>
                          <div className="detail-field">
                            <label>ស្តុកសរុប:</label>
                            <input
                              type="number"
                              value={editedProduct.totalStock || 0}
                              onChange={(e) => handleInputChange("totalStock", e.target.value)}
                            />
                          </div>
                          <div className="button-group">
                            <button className="save-btn" onClick={() => saveChanges(index)}>
                              រក្សាទុកការផ្លាស់ប្តូរ
                            </button>
                            <button className="delete-btn" onClick={() => deleteProduct(index)}>
                              <FaTrash className="btn-icon" />
                              លុប
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

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