import React, { useEffect, useState } from 'react';
import './exploremenu2.css';

const ExploreMenu = ({ category, setCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className='explore-menu' id='explore-menu'>
      {loading ? (
        <div className="animate-pulse">
          <h1>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </h1>
          <div className='explore-menu-text1'>
            <div className="h-4 bg-gray-200 rounded w-full mt-1 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mt-1"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mt-4"></div>
          <div className='explore-menu-list'>
            <div className="h-24 bg-gray-200 rounded-lg mt-4"></div>
            <div className="h-24 bg-gray-200 rounded-lg mt-4"></div>
            <div className="h-24 bg-gray-200 rounded-lg mt-4"></div>
          </div>
        </div>
      ) : (
        <>
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
                <img src={categoryItem.imageUrl} alt={categoryItem.name} className='img'/>
                <p className='explore-menu-text'>{categoryItem.name}</p>
              </div>
            ))}
          </div>
          <hr />
        </>
      )}
    </div>
  );
};

export default ExploreMenu;
