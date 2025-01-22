'use client';
import React, { useState, useEffect } from 'react';
import './search.css'; // Add your CSS file
import { assets } from '../../assets/assets';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const SearchPopup = ({ setShowSearchPopup }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]); // Items state for search results
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/categories'); // Replace with your categories API
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          throw new Error('Failed to fetch categories');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch items based on category or search text
  const fetchItems = async (category = '', searchText = '') => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/selectitem?category=${category}&searchText=${searchText}`
      );
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        throw new Error('Failed to fetch items');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchText.trim() !== '' && !selectedCategory) {
      fetchItems('', searchText);
    } else {
      setItems([]);
    }
  }, [searchText]);

  const handleCategorySelect = (categoryName) => {
    setSearchText("");
    setSelectedCategory(categoryName);
    fetchItems(categoryName); 
  };

  const handleArrowClick = () => {
    setSelectedCategory(''); // Clear selected category
    setSearchText(''); // Reset the search bar
    setItems([]); // Clear displayed items
  };

  const clearCategorySelection = () => {
    setSearchText('');
    setSelectedCategory('');
    setItems([]); // Clear items
  };

  return (
    <div className="search-popup-overlay">
      <div className="search-popup">
        <div className="search-popup-header">
          <h2>Search Items</h2>
        </div>
        <div className="search-popup-body">
          <div className="search-input-container">
          {(searchText || selectedCategory) && (
              <div
                className="arrow-icon-button"
                onClick={handleArrowClick}
              >
                 <FontAwesomeIcon icon={faArrowLeft} className="arrow-icon" />
                
              </div>
            )}
            <input
              type="text"
              className="search-popup-input"
              placeholder={
                selectedCategory
                  ? `${selectedCategory}`
                  : 'Search for items...'
              }
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              disabled={!!selectedCategory} // Disable input if a category is selected
            />
            {(searchText ||selectedCategory)? (
              <button
                className="clear-category-button"
                onClick={clearCategorySelection}
              >
                ×
              </button>
            ) : (
              <button className="search-icon-button">
                <Image
                  src={assets.search_icon}
                  alt="Search"
                  className="searchButton"
                />
              </button>
            )}
          </div>
        </div>

        <div className="search-popup-categories">
          <div className='categories-title'>
          {!selectedCategory && !searchText && (
    <div className="categories-title">Popular Cuisines</div>
  )}
          </div>
          {searchText|| selectedCategory ? (
            <div className="filtered-items">
              {isLoading ? (
                <p>Loading items...</p>
              ) : error ? (
                <p className="error">{error}</p>
              ) : items.length > 0 ? (
                <ul className="items-list">
                  {items.map((item) => (
                    <li className='item-name' key={item._id}>{item.name}</li>
                  ))}
                </ul>
              ) : (
                <p>No items found for {selectedCategory || searchText}.</p>
              )}
            </div>
          ) : (
            <div className="categories-list">
              {isLoading ? (
                <p>Loading categories...</p>
              ) : error ? (
                <p className="error">{error}</p>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <div 
                    key={category._id}
                    className="category-item"
                    onClick={() => handleCategorySelect(category.name)}
                  >
                    
                    {category.name}
                    
                  </div>
                ))
              ) : (
                <p>No categories found.</p>
              )}
            </div>
          )}
        </div>

        <div>
          <button
            className="search-popup-close"
            onClick={() => setShowSearchPopup(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchPopup;
