import React, { useState } from 'react';
import AdminNavbar from '../components/adminnavbar/adminnavbar';
import Sidebar from '../components/sidebar/sidebar';
import AddItems from '../components/additems/additems';
import ListItems from '../components/listitems/listitems';
import Orders from '../components/orders/orders';
import './adminpanel.css';
import { ToastContainer } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';
import AddCategory from '../components/addcategory/addcategory';
import Payment from '../components/payment/payment';
import Admin from '../components/adminaddress/admin';
import Gst from '../components/gst/gst';
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
