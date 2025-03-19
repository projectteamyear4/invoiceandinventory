import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import CategoryList from './components/category/categorylist.jsx';
import { AddCustomer } from './components/CustomerReview/Addcustomer.jsx';
import CustomerList from './components/CustomerReview/CustomerList.jsx';
import Header from "./components/header/header";
import InvoiceForm from './components/invoice/invoice.jsx';
import InvoiceList from './components/invoice/invoicelist.jsx';
import MainDash from './components/MainDash/MainDash';
import Orders from './components/Orderlist/Orders.jsx';
import AddProduct from './components/productlist/addproduct.jsx';
import Products from './components/productlist/products.jsx'; // Ensure this file exists
import Sidebar from './components/Sidebar';
import InventoryTable from './components/stock/InventoryTable.jsx';
import CabinetTable from './components/stock/listcabinet.jsx';
import ShelfTable from './components/stock/ShelfTable.jsx';
import StockMovementTable from './components/stock/StockMovementTable.jsx';
import WarehouseTable from './components/stock/warehouse.jsx';
import SupplierTable from './components/supplier/SupplierTable.jsx';

function App() {
  return (
    <Router> {/* Wrap the app with Router */}
      <div className="App">
      <Header />
        <div className="AppGlass">
          <Sidebar />
          <Routes> 
            <Route path="/" element={<><MainDash /></>} /> {/* Default route */}
            <Route path="/orders" element={<Orders />} /> {/* Orders route */}
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/add-customer" element={<AddCustomer />} />
            <Route path="/products" element={<><Products /></>} /> {/* Orders route */}
            <Route path="/CategoryList" element={<CategoryList />} /> {/* Orders route */}
            <Route path="/add-product" element={<AddProduct />} />{/*AddProduct */}
            <Route path="/inventory/:warehouseId/:cabinetId/:shelfId" element={<InventoryTable />} />
            <Route path="/warehouse" element={<WarehouseTable />} />{/*AddProduct */}
            <Route path="/invoice" element={< InvoiceForm />} />{/*AddProduct */}
            <Route path="/invoicelist" element={<  InvoiceList/>} />{/*AddProduct */}
            <Route path="/cabinets/:warehouseId" element={<CabinetTable />} />
            <Route path="/shelves/:warehouseId/:cabinetId" element={<ShelfTable />} />
            <Route path="/stock-movement/:warehouseId" element={<StockMovementTable />} />
            <Route path="/suppliers" element={<SupplierTable />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
