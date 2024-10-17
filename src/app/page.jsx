// app/page.js
'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar/navbar1.js';
import Header from '../components/header/header1.js';
import Exploremenu from '../components/explormenu/exploremenu1.js'; // Fixed typo
import FoodDisplay from '../components/fooddisplay/fooddisplay1.js';
import Footer from '../components/footer/footer1.js';
import LoginPopup from '../components/loginpopup/loginpopup1.js';
import CartPopup from '../components/cartpopup/cartpopup1.js';

const Page = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [category, setCategory] = useState("All");
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const userToken = localStorage.getItem('token');
    if (userToken) {
      setIsLoggedIn(true);
    } else {
      const timer = setTimeout(() => {
        setShowLogin(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    setShowLogin(true);
  };

  return (
    <>
      {showCart && (
        <CartPopup
          cartItems={cartItems}
          setShowCart={setShowCart}
          handleRemoveClick={(itemId) => setCartItems(cartItems.filter(item => 'item._id' !== itemId))}
        />
      )}
      {showLogin && !isLoggedIn && (
        <LoginPopup setShowLogin={setShowLogin} setIsLoggedIn={setIsLoggedIn} />
      )}
      
      <div className='app'>
        <div className="navbar-fixed">
          <Navbar 
            isLoggedIn={isLoggedIn} 
            setShowLogin={setShowLogin} 
            handleLogout={handleLogout} 
            setShowCart={setShowCart} 
          />
        </div>
        <Header />
        <Exploremenu category={category} setCategory={setCategory} />
        <FoodDisplay 
          category={category} 
          setCartItems={setCartItems} 
          cartItems={cartItems} 
          setShowCart={setShowCart} 
          isLoggedIn={isLoggedIn} 
          setShowLogin={setShowLogin} // Pass setShowLogin to FoodDisplay
        />
      </div>
      <Footer />
    </>
  );
};

export default Page;