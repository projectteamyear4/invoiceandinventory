import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { AuthProvider } from './components/AuthContext';
import AddCategory from './components/category/AddCategory.jsx';
import CategoryList from './components/category/Categorylist.jsx';
import { AddCustomer } from './components/CustomerReview/Addcustomer.jsx';
import CustomerList from './components/CustomerReview/CustomerList.jsx';
import Header from './components/header/header';
import InvoiceForm from './components/invoice/invoice.jsx';
import InvoiceList from './components/invoice/invoicelist.jsx';
import MainDash from './components/MainDash/MainDash';
import Orders from './components/Orderlist/Orders.jsx';
import AddProduct from './components/productlist/addproduct.jsx';
import AddProductVariant from './components/productlist/addproductvariant.jsx';
import EditProduct from './components/productlist/EditProduct.jsx';
import EditProductVariant from './components/productlist/EditProductVariant.jsx';
import Products from './components/productlist/products.jsx';
import Sidebar from './components/Sidebar';
import AddShelf from './components/stock/AddShelf.jsx';
import AddWarehouse from './components/stock/AddWarehouse.jsx';
import EditShelf from './components/stock/EditShelf.jsx';
import EditWarehouse from './components/stock/EditWarehouse.jsx';
import InventoryTable from './components/stock/InventoryTable.jsx';
import Shelves from './components/stock/Shelves.jsx';
import StockMovementTable from './components/stock/StockMovementTable.jsx';
import Warehouses from './components/stock/Warehouses.jsx';
import AddSupplier from './components/supplier/AddSupplier.jsx';
import EditSupplier from './components/supplier/EditSupplier.jsx';
import SupplierTable from './components/supplier/SupplierTable.jsx';
import ProtectedRoute from './ProtectedRoute';

const NotFound = () => (
  <div style={{ textAlign: 'center', marginTop: '50px' }}>
    <h2>404 - Page Not Found</h2>
    <p>The page you are looking for does not exist.</p>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Header />
          <div className="AppGlass">
            <Sidebar />
            <Routes>
              <Route path="/" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<ProtectedRoute><MainDash /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/customers" element={<ProtectedRoute><CustomerList /></ProtectedRoute>} />
              <Route path="/add-customer" element={<ProtectedRoute><AddCustomer /></ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
              <Route path="/category-list" element={<ProtectedRoute><CategoryList /></ProtectedRoute>} />
              <Route path="/add-category" element={<ProtectedRoute><AddCategory /></ProtectedRoute>} />
              <Route path="/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
              <Route path="/add-variant/:productId" element={<ProtectedRoute><AddProductVariant /></ProtectedRoute>} />
              <Route path="/edit-variant/:variantId" element={<ProtectedRoute><EditProductVariant /></ProtectedRoute>} />
              <Route path="/edit-product/:productId" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
              <Route path="/inventory/:warehouseId/:cabinetId/:shelfId" element={<ProtectedRoute><InventoryTable /></ProtectedRoute>} />
              <Route path="/warehouses" element={<ProtectedRoute><Warehouses /></ProtectedRoute>} />
              <Route path="/add-warehouse" element={<ProtectedRoute><AddWarehouse /></ProtectedRoute>} />
              <Route path="/edit-warehouse/:id" element={<ProtectedRoute><EditWarehouse /></ProtectedRoute>} />
              <Route path="/invoice" element={<ProtectedRoute><InvoiceForm /></ProtectedRoute>} />
              <Route path="/invoicelist" element={<ProtectedRoute><InvoiceList /></ProtectedRoute>} />
              <Route path="/shelves" element={<ProtectedRoute><Shelves /></ProtectedRoute>} />
              <Route path="/add-shelf" element={<ProtectedRoute><AddShelf /></ProtectedRoute>} />
              <Route path="/edit-shelf/:id" element={<ProtectedRoute><EditShelf /></ProtectedRoute>} />
              <Route path="/stock-movement/:warehouseId" element={<ProtectedRoute><StockMovementTable /></ProtectedRoute>} />
              <Route path="/suppliers" element={<ProtectedRoute><SupplierTable /></ProtectedRoute>} />
              <Route path="/add-supplier" element={<ProtectedRoute><AddSupplier /></ProtectedRoute>} />
              <Route path="/edit-supplier/:id" element={<ProtectedRoute><EditSupplier /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;