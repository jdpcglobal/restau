// app/page.js
'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar/navbar.js';
import Header from '../components/Header/header.js';
import Exploremenu from '../components/EexplorMenu/exploremenu.js'; // Fixed typo
import FoodDisplay from '../components/FoodDisplay/fooddisplay.js';
import Footer from '../components/Footer/footer.js';
import LoginPopup from '../components/LoginPopup/loginpopup.js';
import CartPopup from '../components/CartPopup/cartpopup.js';

const Page = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [category, setCategory] = useState("All");
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Check if the token is valid or expired
  const isTokenExpired = (expiration) => {
    return new Date().getTime() > expiration;
  };

  useEffect(() => {
    const userToken = localStorage.getItem('token');
    const tokenExpiration = localStorage.getItem('tokenExpiration'); // Store expiration during login

    if (userToken && tokenExpiration && !isTokenExpired(tokenExpiration)) {
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem('token'); // Clear invalid token
      localStorage.removeItem('tokenExpiration'); // Clear expiration
      const timer = setTimeout(() => {
        setShowLogin(true); // Show login popup after delay
      }, 3000);
      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiration'); // Remove expiration on logout
    setIsLoggedIn(false);
    setShowLogin(true);
  };

  return (
    <>
      {showCart && (
        <CartPopup
          cartItems={cartItems}
          setShowCart={setShowCart}
          handleRemoveClick={(itemId) => 
            setCartItems(cartItems.filter(item => item._id !== itemId))
          }
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
          setShowLogin={setShowLogin} 
        />
      </div>
      <Footer />
    </>
  );
};

export default Page;
