import React, { useEffect, useState } from 'react';
import './exploremenu2.css';

const ExploreMenu = ({ category, setCategory }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className='explore-menu' id='explore-menu'>
      <h1>Explore our menu</h1>
      <p className='explore-menu-text1'>
        Choose from a diverse menu featuring a delectable array of dishes. Our mission is to satisfy your craving and elevate
        your dining experience, one delicious meal at a time.
      </p>
      <div className='explore-menu-list'>
        {categories.map(categoryItem => (
          <div
            key={categoryItem.name}
            className={`explore-menu-list-item ${category === categoryItem.name ? 'active' : ''}`}
            onClick={() => setCategory(prev => (prev === categoryItem.name ? 'All' : categoryItem.name))}
          >
            <img src={categoryItem.imageUrl} alt={categoryItem.name} className='img' />
            <p className='explore-menu-text'>{categoryItem.name}</p>
          </div>
        ))}
      </div>
      <hr />
    </div>
  );
};

export default ExploreMenu;
