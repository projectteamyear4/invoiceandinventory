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
import ProductList from './components/productlist/productlist.jsx';
import Products from './components/productlist/products.jsx'; // Ensure this file exists
import SaleDetails from './components/productlist/SaleDetails.jsx';
import RightSide from './components/RigtSide/RightSide';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <Router> {/* Wrap the app with Router */}
      <div className="App">
      <Header />
        <div className="AppGlass">
          <Sidebar />
         
          <Routes> {/* Define routes */}
            <Route path="/" element={<><MainDash /><RightSide /></>} /> {/* Default route */}
            <Route path="/orders" element={<Orders />} /> {/* Orders route */}
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/add-customer" element={<AddCustomer />} />
            <Route path="/products" element={<><Products /><SaleDetails /></>} /> {/* Orders route */}
            <Route path="/CategoryList" element={<CategoryList />} /> {/* Orders route */}
            <Route path="/add-product" element={<AddProduct />} />{/*AddProduct */}
            <Route path="/productlist" element={<ProductList />} />{/*AddProduct */}
            <Route path="/invoice" element={< InvoiceForm />} />{/*AddProduct */}
            <Route path="/invoicelist" element={<  InvoiceList/>} />{/*AddProduct */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
