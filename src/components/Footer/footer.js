import React from 'react';
import './footer.css';
import { useRouter } from 'next/navigation';

const Footer = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push('/');
  };

  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <img src="/logo.png" alt="Logo" />
          <p>
            Welcome to our food website, where we bring you an exquisite collection 
            of mouth-watering dishes that cater to every taste. Explore our diverse 
            categories, including salads, rolls, desserts, sandwiches, cakes, pure veg, 
            pasta, and noodles.
          </p>
          <div className="footer-social-icon">
            <img src="/facebook_icon.png" alt="Facebook" />
            <img src="/twitter_icon.png" alt="Twitter" />
            <img src="/linkedin_icon.png" alt="LinkedIn" />
          </div>
        </div>
        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
            <li onClick={handleClick}>Home</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy policy</li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          <ul>
            <li>+91-9001498993</li>
            <li>info@temoto.com</li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">
        Copyright 2024 © Tomato.com - All Right Reserved.
      </p>
    </div>
  );
};

export default Footer;
