import React, { useState } from "react";
import "./AddProduct.css";

const AddProduct = () => {
  const [products, setProducts] = useState([
    {
      name: "",
      description: "",
      price: "",
      stock_quantity: "",
      image: null,
      barcode: "",
      category_id: "",
      supplier_id: "",
    },
  ]);

  const [errors, setErrors] = useState([{}]);

  // Sample categories
  const categories = [
    { id: "1", name: "អាហារ" }, // Food
    { id: "2", name: "ភេសជ្ជៈ" }, // Drinks
    { id: "3", name: "គ្រឿងសម្អាង" }, // Cosmetics
    { id: "4", name: "គ្រឿងអេឡិចត្រូនិច" }, // Electronics
  ];

  // Sample suppliers
  const suppliers = [
    { id: "1", name: "អ្នកផ្គត់ផ្គង់ ១" }, // Supplier 1
    { id: "2", name: "អ្នកផ្គត់ផ្គង់ ២" }, // Supplier 2
    { id: "3", name: "អ្នកផ្គត់ផ្គង់ ៣" }, // Supplier 3
    { id: "4", name: "អ្នកផ្គត់ផ្គង់ ៤" }, // Supplier 4
  ];

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [name]: name === "image" ? e.target.files[0] : value,
    };
    setProducts(updatedProducts);
  };

  const addProduct = () => {
    setProducts([
      ...products,
      {
        name: "",
        description: "",
        price: "",
        stock_quantity: "",
        image: null,
        barcode: "",
        category_id: "",
        supplier_id: "",
      },
    ]);
    setErrors([...errors, {}]);
  };

  const removeProduct = (index) => {
    if (products.length > 1) {
      const updatedProducts = products.filter((_, i) => i !== index);
      const updatedErrors = errors.filter((_, i) => i !== index);
      setProducts(updatedProducts);
      setErrors(updatedErrors);
    }
  };

  const validateForm = () => {
    const newErrors = products.map((product) => {
      const productErrors = {};
      if (!product.name) productErrors.name = "តម្រូវឱ្យមាន"; // Required
      if (!product.price || isNaN(product.price)) productErrors.price = "តម្រូវឱ្យជាលេខត្រឹមត្រូវ"; // Valid number needed
      if (!product.stock_quantity || isNaN(product.stock_quantity))
        productErrors.stock_quantity = "តម្រូវឱ្យជាលេខត្រឹមត្រូវ"; // Valid number needed
      if (!product.barcode) productErrors.barcode = "តម្រូវឱ្យមាន"; // Required
      if (!product.category_id) productErrors.category_id = "តម្រូវឱ្យជ្រើសរើស"; // Required to select
      if (!product.supplier_id) productErrors.supplier_id = "តម្រូវឱ្យជ្រើសរើស"; // Required to select
      if (!product.image) productErrors.image = "តម្រូវឱ្យមាន"; // Required
      return productErrors;
    });
    setErrors(newErrors);
    return newErrors.every((err) => Object.keys(err).length === 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const formDataToSend = new FormData();
      products.forEach((product, index) => {
        Object.keys(product).forEach((key) => {
          formDataToSend.append(`${key}[${index}]`, product[key]);
        });
      });
      console.log("Form data submitted:", products);
      alert("ផលិតផលបានបន្ថែមដោយជោគជ័យ!"); // Products added successfully!
      setProducts([{
        name: "",
        description: "",
        price: "",
        stock_quantity: "",
        image: null,
        barcode: "",
        category_id: "",
        supplier_id: "",
      }]);
      setErrors([{}]);
    }
  };

  return (
    <div className="add-product-container">
      <h2 className="title">បន្ថែមផលិតផល</h2> {/* Add Products */}
      <form onSubmit={handleSubmit} className="product-form">
        <table className="product-table">
          <thead>
            <tr>
              <th>ឈ្មោះផលិតផល</th> {/* Product Name */}
              <th>តម្លៃ</th> {/* Price */}
              <th>បរិមាណស្តុក</th> {/* Stock Quantity */}
              <th>រូបភាព</th> {/* Image */}
              <th>ការពិពណ៌នា</th> {/* Description */}
              <th>បាកូដ</th> {/* Barcode */}
              <th>ប្រភេទ</th> {/* Category */}
              <th>អ្នកផ្គត់ផ្គង់</th> {/* Supplier */}
              <th>សកម្មភាព</th> {/* Action */}
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    name="name"
                    value={product.name}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="ឈ្មោះផលិតផល" // Product Name
                  />
                  {errors[index]?.name && <span className="error">{errors[index].name}</span>}
                </td>
                <td>
                  <input
                    type="number"
                    name="price"
                    value={product.price}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="តម្លៃ" // Price
                    step="0.01"
                  />
                  {errors[index]?.price && <span className="error">{errors[index].price}</span>}
                </td>
                <td>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={product.stock_quantity}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="បរិមាណស្តុក" // Stock Quantity
                  />
                  {errors[index]?.stock_quantity && <span className="error">{errors[index].stock_quantity}</span>}
                </td>
                <td>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={(e) => handleChange(index, e)}
                  />
                  {errors[index]?.image && <span className="error">{errors[index].image}</span>}
                </td>
                <td>
                  <textarea
                    name="description"
                    value={product.description}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="ការពិពណ៌នា" // Description
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="barcode"
                    value={product.barcode}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="បាកូដ" // Barcode
                  />
                  {errors[index]?.barcode && <span className="error">{errors[index].barcode}</span>}
                </td>
                <td>
                  <select
                    name="category_id"
                    value={product.category_id}
                    onChange={(e) => handleChange(index, e)}
                  >
                    <option value="">ជ្រើសរើសប្រភេទ</option> {/* Select Category */}
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors[index]?.category_id && <span className="error">{errors[index].category_id}</span>}
                </td>
                <td>
                  <select
                    name="supplier_id"
                    value={product.supplier_id}
                    onChange={(e) => handleChange(index, e)}
                  >
                    <option value="">ជ្រើសរើសអ្នកផ្គត់ផ្គង់</option> {/* Select Supplier */}
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  {errors[index]?.supplier_id && <span className="error">{errors[index].supplier_id}</span>}
                </td>
                <td>
                  {products.length > 1 && (
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => removeProduct(index)}
                    >
                      លុប {/* Remove */}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button type="button" className="add-more-button" onClick={addProduct}>
          បន្ថែមផលិតផលថ្មី {/* Add Another Product */}
        </button>
        <button type="submit" className="submit-button">
        បន្ថែមផលិតផលទាំងអស់ {/* Add All Products */}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;