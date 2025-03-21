import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import CategoryList from './components/category/categorylist.jsx';
import { AddCustomer } from './components/CustomerReview/Addcustomer.jsx';
import CustomerList from './components/CustomerReview/CustomerList.jsx';
import Header from "./components/header/header";
import InvoiceForm from './components/invoice/invoice.jsx';
import InvoiceList from './components/invoice/invoicelist.jsx';
import MainDash from './components/MainDash/MainDash';
import Orders from './components/Orderlist/Orders.jsx';
import AddProduct from './components/productlist/addproduct.jsx';
import Products from './components/productlist/products.jsx';
import Sidebar from './components/Sidebar';
import InventoryTable from './components/stock/InventoryTable.jsx';
import CabinetTable from './components/stock/listcabinet.jsx';
import ShelfTable from './components/stock/ShelfTable.jsx';
import StockMovementTable from './components/stock/StockMovementTable.jsx';
import WarehouseTable from './components/stock/warehouse.jsx';
import SupplierTable from './components/supplier/SupplierTable.jsx';

// NotFound Component for handling undefined routes
const NotFound = () => (
  <div style={{ textAlign: "center", marginTop: "50px" }}>
    <h2>404 - Page Not Found</h2>
    <p>The page you are looking for does not exist.</p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <div className="AppGlass">
          <Sidebar />
          <Routes>
            <Route path="/" element={<Register />} /> {/* Move this inside Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<MainDash />} /> {/* Default Route */}
            <Route path="/orders" element={<Orders />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/add-customer" element={<AddCustomer />} />
            <Route path="/products" element={<Products />} />
            <Route path="/category-list" element={<CategoryList />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/inventory/:warehouseId/:cabinetId/:shelfId" element={<InventoryTable />} />
            <Route path="/warehouse" element={<WarehouseTable />} />
            <Route path="/invoice" element={<InvoiceForm />} />
            <Route path="/invoicelist" element={<InvoiceList />} />
            <Route path="/cabinets/:warehouseId" element={<CabinetTable />} />
            <Route path="/shelves/:warehouseId/:cabinetId" element={<ShelfTable />} />
            <Route path="/stock-movement/:warehouseId" element={<StockMovementTable />} />
            <Route path="/suppliers" element={<SupplierTable />} />
            <Route path="*" element={<NotFound />} /> {/* Catch-all for 404 */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
