import React, { useEffect, useState } from "react";
import "./ProductList.css"; // Assuming you will create the corresponding CSS file

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" for ascending, "desc" for descending
  const [loading, setLoading] = useState(false);

  // Static product data
  const staticData = [
    {
      product_id: 1,
      name: "Product 1",
      description: "This is product 1",
      price: 19.99,
      stock_quantity: 50,
      barcode: "1234567890",
      status: "Available",
    },
    {
      product_id: 2,
      name: "Product 2",
      description: "This is product 2",
      price: 29.99,
      stock_quantity: 35,
      barcode: "2345678901",
      status: "Out of Stock",
    },
    {
      product_id: 3,
      name: "Product 3",
      description: "This is product 3",
      price: 15.49,
      stock_quantity: 100,
      barcode: "3456789012",
      status: "Available",
    },
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setProducts(staticData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (column) => {
    const sortedProducts = [...products].sort((a, b) => {
      if (sortOrder === "asc") {
        return a[column] > b[column] ? 1 : -1;
      } else {
        return a[column] < b[column] ? 1 : -1;
      }
    });
    setProducts(sortedProducts);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleEdit = (productId) => {
    alert(`Editing product with ID: ${productId}`);
    // Add your edit logic here
  };

  const handleDelete = (productId) => {
    const filteredProducts = products.filter((product) => product.product_id !== productId);
    setProducts(filteredProducts);
    alert(`Deleted product with ID: ${productId}`);
  };

  const handleAddProduct = () => {
    alert("Add Product functionality");
    // Implement logic for adding a product here
  };

  // Filter products based on search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div className="product-list-container">
      <h2 className="title">Product List</h2>

      {/* Search Bar and Add Product Button */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        <button className="add-product-btn" onClick={handleAddProduct}>Add Product</button>
      </div>

      <table className="product-table">
        <thead>
          <tr>
            <th onClick={() => handleSortChange("name")}>Name</th>
            <th>Description</th>
            <th onClick={() => handleSortChange("price")}>Price</th>
            <th onClick={() => handleSortChange("stock_quantity")}>Stock Quantity</th>
            <th>Barcode</th>
            <th>Status</th> {/* New Status column */}
            <th>Actions</th> {/* New Actions column */}
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product.product_id}>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>${product.price}</td>
              <td>{product.stock_quantity}</td>
              <td>{product.barcode}</td>
              <td>{product.status}</td> {/* Status display */}
              <td>
                <button onClick={() => handleEdit(product.product_id)}>Edit</button>
                <button onClick={() => handleDelete(product.product_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
