import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar/adminnavmar';
import Sidebar from '../components/Sidebar/sidebar';
import AddItems from '../components/AddItems/addItems';
import ListItems from '../components/ListItems/listItems';
import Orders from '../components/Orders/orders';
import './adminpanel.css';
import { ToastContainer } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';
import AddCategory from '../components/AddCategory/AddCategory';
import Payment from '../components/Payment/Payment';
import Admin from '../components/adminaddress/admin';
import Gst from '../components/GST/gst';
import Coupon from '../components/coupon/coupon';
import Couponlist from '../components/couponlist/couponlist';


const AdminPanel = () => {
  const [selectedComponent, setSelectedComponent] = useState(''); // State to track the selected component

  const renderComponent = () => {
    <ToastContainer/>
    switch (selectedComponent) {
      case 'AddItems':
        return <AddItems />;
      case 'ListItems':
        return <ListItems />;
        
      case 'Orders':
        return <Orders />;
        case 'AddCategory':
        return <AddCategory />;
        case 'Payment':
        return <Payment/>;
        case 'Admin':
          return <Admin />;
          case 'Gst':
          return <Gst />;
          case 'Coupon':
            return <Coupon />;
            case 'Couponlist':
              return <Couponlist />;
      default:
        return ;
    }
  };

  return (
    <div className='admin-panel'>
      <AdminNavbar />
      
      <div className='admin-panel-content'>
        <Sidebar setSelectedComponent={setSelectedComponent} />
        <div className='admin-panel-right'>
          {renderComponent()}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
