'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import './navbar2.css';
import { assets } from '../../assets/assets';
import { useRouter } from 'next/navigation';

const Navbar = ({ isLoggedIn, setShowLogin, handleLogout, setShowCart }) => {
  const [menu, setMenu] = useState("Home");
  const [isLoading, setIsLoading] = useState(false); // State for loading spinner
  const router = useRouter();

  const handleCheckoutClick = async () => {
    setIsLoading(true); // Show spinner
    setTimeout(async () => { // Simulate a delay for loading
      if (!isLoggedIn) {
        setShowLogin(true); // Show login popup if not logged in
      } else {
        await router.push('/Cart'); // Redirect to cart page if logged in
      }
      setIsLoading(false); // Hide spinner after navigation
    }, 1500); // Adjust delay as necessary
  };

  const handleOrderClick = () => {
    router.push('/MyOrder'); // Replace '/order' with the actual path to your order page
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <a href='/'><Image src={assets.logo} alt="Logo" /></a>
      </div>
      <div className="navbar-menu">
        <ul>
          <li>
            <a 
              href='/' 
              onClick={() => setMenu("Home")} 
              className={menu === "Home" ? "active" : ""}
            >
              Home
            </a>
          </li>
          <li>
            <a 
              href='About-us' 
              onClick={() => setMenu("About us")} 
              className={menu === "About us" ? "active" : ""}
            >
              About us
            </a>
          </li>
          <li>
            <a 
              href='/' 
              onClick={() => setMenu("Blog")} 
              className={menu === "Blog" ? "active" : ""}
            >
              Blog
            </a>
          </li>
          <li>
            <a 
              href='#footer' 
              onClick={() => setMenu("Contact us")} 
              className={menu === "Contact us" ? "active" : ""}
            >
              Contact us
            </a>
          </li>
        </ul>
      </div>
      <div className="navbar-right">
        <Image src={assets.search_icon} alt="Search" className="searchButton" />
      </div>
      <div className='navbar-search-icon'>
        {isLoading ? (
          <div className="spinner"></div> // Show spinner when loading
        ) : (
          <>
            <Image 
              src={assets.basket_icon} 
              alt='Cart' 
              onClick={handleCheckoutClick}
              className="basketIcon"
            />
            <div className='dot'></div>
          </>
        )}
      </div>

      {isLoggedIn ? (
        <div className="navbar-profile">
          <Image src={assets.profile_icon} alt="Profile" />
          <ul className="nav-profile-dropdown">
            <li onClick={handleOrderClick}>
              <Image src={assets.bag_icon} alt="Order" />
              <p>Order</p>
            </li>
            <hr />
            <li onClick={handleLogout}>
              <Image src={assets.logout_icon} alt="Logout" />
              <p>Logout</p>
            </li>
          </ul>
        </div>
      ) : (
        <button onClick={() => setShowLogin(true)} className="signInButton">Sign In</button>
      )}
    </nav>
  );
};

export default Navbar;
