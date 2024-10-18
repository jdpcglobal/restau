import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPlus, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './order1.css';
import './order2.css';
import Navbar from '../components/navbar/navbar1';
import Footer from '../components/footer/footer1';
import AddressPopup from '../components/addresspopup/addresspopup1';
import LoginPopup from '../components/loginpopup/loginpopup1';
import axios from 'axios';
import { useRouter } from 'next/router';
import '../components/cartpopup/cartpopup2.css';
import '../app/globals.css';

const Order = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [location, setLocation] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [landmark, setLandmark] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [error, setError] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [cartTotal, setCartTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCartTotalId, setSelectedCartTotalId] = useState(null);
  const [adminLocation, setAdminLocation] = useState('');
  const [distanceThreshold, setDistanceThreshold] = useState(12);
  const router = useRouter();
 // Replace with actual user ID
 
 useEffect(() => {
  const fetchAdminSettings = async () => {
    try {
      const response = await axios.get('/api/adminSettings');
      if (response.data.success) {
        setAdminLocation(response.data.adminLocation);
        setDistanceThreshold(response.data.distanceThreshold);
      } else {
        console.error('Failed to fetch admin settings');
      }
    } catch (error) {
      console.error('Error fetching admin settings:', error);
    }
  };

  const fetchAddresses = async (token) => {
    try {
      const response = await axios.get('/api/getAddresses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setSavedAddresses(response.data.deliveries);
      }
    } catch (error) {
      console.error('Error fetching saved addresses:', error);
    }
  };

  const fetchCartItems = async (token) => {
    try {
      const response = await axios.get('/api/getCartItems', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setCartItems(response.data.cartItems);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setError('Error fetching cart items');
    }
  };

  const fetchCartTotal = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.get('/api/getCartInfo', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setCartTotal(response.data.cartTotal);
        setSelectedCartTotalId(response.data.cartTotal._id); // Assuming cartTotal has an _id field
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching cart total:', error);
      setError('Error fetching cart total');
    } finally {
      setLoading(false);
    }
  };

  const token = localStorage.getItem('token');

  if (token) {
    setIsLoggedIn(true);
    fetchAddresses(token);
    fetchCartItems(token);
  } else {
    setShowLogin(true);
  }

  fetchCartTotal();
  fetchAdminSettings();
}, []);


  const handleSaveAddress = (newAddress) => {
    setSavedAddresses((prevAddresses) => [newAddress, ...prevAddresses]);
    setLocation('');
    setFlatNo('');
    setLandmark('');
    setShowPopup(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setShowLogin(true);
    router.push('/');
  };

  const handleCheckoutClick = async () => {
    if (!selectedAddress) {
      alert('Please select a delivery address.');
      return;
    }

    setLoading(true); // Set loading to true when the button is clicked

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found');
        setLoading(false); // Stop loading if no token is found
        return;
      }

      const response = await axios.post(
        '/api/saveCheckoutAddress',
        {
          addressId: selectedAddress._id,
          cartTotalId: selectedCartTotalId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        router.push('/orderpayment');
      } else {
        setError(response.data.message || 'Failed to save address.');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      setError(error.response?.data.message || 'Network error, please try again later.');
    } finally {
      setLoading(false); // Reset loading state
    }
  };
  const subtotal = cartTotal ? cartTotal.subtotal : 0;
  const itemDiscount= cartTotal ? cartTotal.itemDiscount : 0;
  const  couponDiscount= cartTotal ? cartTotal.couponDiscount : 0;
  const  totalGst= cartTotal ? cartTotal.totalGst : 0;
  const deliveryFee = cartTotal ? cartTotal.deliveryFee : 0;
  const total = cartTotal ? cartTotal.total : 0;

  const handleAddressChange = (index) => {
    setSelectedAddress(savedAddresses[index]);
  };

  return (
    <>
      {showLogin && !isLoggedIn && (
        <LoginPopup setShowLogin={setShowLogin} setIsLoggedIn={setIsLoggedIn} />
      )}
      <div className="app">
        <div className="navbar-fixed">
          <Navbar
            isLoggedIn={isLoggedIn}
            setShowLogin={setShowLogin}
            handleLogout={handleLogout}
          />
           <div className="back-arrow">
            <FontAwesomeIcon 
              icon={faArrowLeft} 
              className="back-arrow-icon" 
              onClick={() => router.back()} 
            />
          </div>
        </div>
        <div className="cart-page">
          <div className="back-arrow">
            <FontAwesomeIcon
              icon={faArrowLeft}
              className="back-arrow-icon"
              onClick={() => window.history.back()}
            />
          </div>
          <div className="place-order">
            <div className='place-order-left'>
              <div className="address-header">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="location-icon" />
                <h2>Delivery Addresses</h2>
              </div>

              {savedAddresses.length > 0 && (
                <div className="address-list">
                  {savedAddresses.map((addr, index) => (
                    <div key={index} className="address-item">
                      <input
                        type="radio"
                        name="saved-address"
                        value={index}
                        onChange={() => handleAddressChange(index)}
                      />
                      <span>{addr.flatNo}, {addr.location}</span>
                    </div>
                  ))}
                </div>
              )}

              <p className="add-new-btn" onClick={() => setShowPopup(true)}>
                <span>
                  <FontAwesomeIcon icon={faPlus} className="location-icon1" />
                </span>{' '}
                Add New Address
              </p>
            </div>
            <div className='place-order-right'>
              <div className="cart-bottom1">
                <div className="cart-total">
                  <h2>Cart Total</h2>
                  <div className="cart-total-details">
                    <p>Subtotal</p>
                    <p>₹{subtotal.toFixed(2)}</p>
                  </div>
                  <hr />
                  <div className="cart-total-details">
                    <p>Item Discount</p>
                    <p>₹{itemDiscount.toFixed(2)}</p>
                  </div>
                  <hr />
                  {couponDiscount > 0 && (
                    <>
  <div className="cart-total-details">
    <p>Coupon Discount</p>
    <p>₹{Math.round(couponDiscount).toFixed(2)}</p>
  </div>
  <hr />
 </>
 
)}

                  <div className="cart-total-details">
                    <p>GST</p>
                    <p>₹{totalGst.toFixed(2)}</p>
                  </div>
                  <hr />
                  <div className="cart-total-details">
                    <p>Delivery Fee</p>
                    <p>₹{deliveryFee}</p>
                  </div>
                  <hr />
                  <div className="cart-total-details">
                    <b>Total</b>
                   
                    <b>₹{total.toFixed(2)}</b>
                  </div>
                  <div className="checkout-btn">
                    <button
                      onClick={handleCheckoutClick}
                      className="checkout-button"
                      disabled={cartItems.length === 0}
                    >
                     {loading ? 'Processing...' : 'Proceed to payment'.toUpperCase()}
                     
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {showPopup && (
               <AddressPopup
               setShowPopup={setShowPopup}
               location={location}
               setLocation={setLocation}
               flatNo={flatNo}
               setFlatNo={setFlatNo}
               landmark={landmark}
               setLandmark={setLandmark}
               adminLocation={adminLocation}
               distanceThreshold={distanceThreshold}
               setSavedAddresses={setSavedAddresses}
             />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Order;
