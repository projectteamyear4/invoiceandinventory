import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Login from './components/auth/Login';
import { AuthProvider } from './components/AuthContext';
import AddCategory from './components/category/AddCategory.jsx';
import CategoryList from './components/category/Categorylist.jsx';
import { AddCustomer } from './components/CustomerReview/Addcustomer.jsx';
import Customers from './components/CustomerReview/Customers.jsx';
import Header from './components/header/header';
import InvoiceForm from './components/invoice/invoice.jsx';
import InvoiceList from './components/invoice/invoicelist.jsx';
import MainDash from './components/MainDash/MainDash';
import DeliveryMethods from './components/Orderlist/DeliveryMethods.jsx';
import Orders from './components/Orderlist/Orders.jsx';
import AddProduct from './components/productlist/addproduct.jsx';
import AddProductVariant from './components/productlist/addproductvariant.jsx';
import DetailProduct from './components/productlist/DetailProduct.jsx';
import EditProduct from './components/productlist/EditProduct.jsx';
import EditProductVariant from './components/productlist/EditProductVariant.jsx';
import Products from './components/productlist/products.jsx';
import Sidebar from './components/Sidebar';
import AddShelf from './components/stock/AddShelf.jsx';
import AddWarehouse from './components/stock/AddWarehouse.jsx';
import EditShelf from './components/stock/EditShelf.jsx';
import EditStockMovement from './components/stock/EditStockMovement.jsx';
import EditWarehouse from './components/stock/EditWarehouse.jsx';
import Shelves from './components/stock/Shelves.jsx';
import StockMovements from './components/stock/StockMovements.jsx';
import Warehouses from './components/stock/Warehouses.jsx';
import AddPurchase from './components/supplier/AddPurchase.jsx';
import AddSupplier from './components/supplier/AddSupplier.jsx';
import EditSupplier from './components/supplier/EditSupplier.jsx';
import Purchases from './components/supplier/Purchases.jsx';
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
              {/* <Route path="/" element={<Register />} /> */}
              <Route path="/" element={<Login />} />
              <Route path="/dashboard" element={<ProtectedRoute><MainDash /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/customers" element={<ProtectedRoute>< Customers /></ProtectedRoute>} />
              <Route path="/add-customer" element={<ProtectedRoute><AddCustomer /></ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
              <Route path="/product-details/:productId" element={<ProtectedRoute><DetailProduct /></ProtectedRoute>} />
              <Route path="/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
              <Route path="/add-purchase" element={<ProtectedRoute><AddPurchase /></ProtectedRoute>} />
              <Route path="/category-list" element={<ProtectedRoute><CategoryList /></ProtectedRoute>} />
              <Route path="//delivery-methods" element={<ProtectedRoute><DeliveryMethods /></ProtectedRoute>} />
              <Route path="/add-category" element={<ProtectedRoute><AddCategory /></ProtectedRoute>} />
              <Route path="/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
              <Route path="/add-variant/:productId" element={<ProtectedRoute><AddProductVariant /></ProtectedRoute>} />
              <Route path="/edit-variant/:variantId" element={<ProtectedRoute><EditProductVariant /></ProtectedRoute>} />
              <Route path="/edit-product/:productId" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
              <Route path="/stock-movements" element={<ProtectedRoute><StockMovements /></ProtectedRoute>} />
              <Route path="/warehouses" element={<ProtectedRoute><Warehouses /></ProtectedRoute>} />
              <Route path="/add-warehouse" element={<ProtectedRoute><AddWarehouse /></ProtectedRoute>} />
              <Route path="/edit-warehouse/:id" element={<ProtectedRoute><EditWarehouse /></ProtectedRoute>} />
              <Route path="/edit-stock-movement/:id" element={<ProtectedRoute><EditStockMovement /></ProtectedRoute>} />
              <Route path="/invoice" element={<ProtectedRoute><InvoiceForm /></ProtectedRoute>} />
              <Route path="/invoicelist" element={<ProtectedRoute><InvoiceList /></ProtectedRoute>} />
              <Route path="/shelves/:warehouseId" element={<ProtectedRoute><Shelves /></ProtectedRoute>} /> {/* Updated */}
              <Route path="/add-shelf/:warehouseId" element={<ProtectedRoute><AddShelf /></ProtectedRoute>} /> {/* Updated */}
              <Route path="/edit-shelf/:id" element={<ProtectedRoute><EditShelf /></ProtectedRoute>} />
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