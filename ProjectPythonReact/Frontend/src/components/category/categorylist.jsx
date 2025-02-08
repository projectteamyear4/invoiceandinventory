import React, { useState } from "react";
import "./categoryList.css"; // Import CSS

const CategoryList = () => {
  const [categories, setCategories] = useState(["Sales", "Revenue", "Expenses"]);
  const [newCategory, setNewCategory] = useState("");

  const addCategory = () => {
    if (newCategory.trim() !== "" && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory("");
    }
  };

  return (
    <div className="container">
      <h2 className="title">Category List</h2>
      <div className="input-container">
        <input
          type="text"
          className="input-field"
          placeholder="Enter a new category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addCategory()}
        />
        <button className="add-button" onClick={addCategory}>
          Add
        </button>
      </div>
      <ul className="list">
        {categories.map((category, index) => (
          <li key={index} className="list-item">
            {category}
            <button
              className="delete-button"
              onClick={() =>
                setCategories(categories.filter((cat) => cat !== category))
              }
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryList;