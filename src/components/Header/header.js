import React from 'react';
import './header.css'
const header = () => {
  return (
    <div className='header'>
        <div className='header-contents'>
            <h2>Order your favourite food here</h2>
            <p>
                Choose from a diverse menu featuring a delecable array of dishes craffed with the finest ingredients 
                and culinary expertise. Our mission is to satisfy your cravings and elevate your dining experience, one delicious meal at a time
            </p>
            <a href='#explore-menu'>
            <button  >View Menu</button></a>
        </div>
      
    </div>
  )
}

export default header
