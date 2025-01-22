// fooddisplay.js
import React, { useState, useEffect } from 'react';
import './fooddisplay2.css';

const FoodDisplay = ({ category, setCartItems, cartItems, setShowCart, isLoggedIn, setShowLogin }) => {
  const [foodItems, setFoodItems] = useState([]);
  const [itemCounts, setItemCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('/api/items');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setFoodItems(data);
      } catch (error) {
        setError('Error fetching items: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const filteredFoodList = category === 'All' ? foodItems : foodItems.filter(item => item.category === category);

  const handleAddClick = async (food) => {
    if (!isLoggedIn) {
      setShowLogin(true); // Show the login popup
      return;
    }

    const newCount = (itemCounts[food._id] || 0) + 1;

    setItemCounts(prevCounts => ({
      ...prevCounts,
      [food._id]: newCount
    }));

    const updatedCartItems = [...cartItems];
    const existingItemIndex = updatedCartItems.findIndex(item => item._id === food._id);

    if (existingItemIndex > -1) {
      updatedCartItems[existingItemIndex].count = newCount;
    } else {
      updatedCartItems.push({ ...food, count: newCount });
    }

    setCartItems(updatedCartItems);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in first.');
      }

      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          foodId: food._id,
          quantity: newCount,
          imageUrl: food.imageUrl,
          name: food.name,
          price: food.price
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        console.error('Failed to add item to cart:', result.message);
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  const handleRemoveClick = async (food) => {
    if (!isLoggedIn) {
      setShowLogin(true); // Show the login popup
      return;
    }

    const currentCount = itemCounts[food._id] || 0;

    if (currentCount > 1) {
      const newCount = currentCount - 1;

      setItemCounts(prevCounts => ({
        ...prevCounts,
        [food._id]: newCount
      }));

      const updatedCartItems = [...cartItems];
      const existingItemIndex = updatedCartItems.findIndex(item => item._id === food._id);

      if (existingItemIndex > -1) {
        updatedCartItems[existingItemIndex].count = newCount;
      }

      setCartItems(updatedCartItems);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found. Please log in first.');
        }

        const response = await fetch('/api/cart/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            foodId: food._id,
            quantity: newCount,
          }),
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
          console.error('Failed to update item quantity:', result.message);
        }
      } catch (error) {
        console.error('Error updating item quantity:', error);
      }
    } else {
      setItemCounts(prevCounts => ({
        ...prevCounts,
        [food._id]: 0
      }));

      const updatedCartItems = cartItems.filter(item => item._id !== food._id);

      setCartItems(updatedCartItems);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found. Please log in first.');
        }

        const response = await fetch('/api/cart/remove', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            foodId: food._id,
          }),
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
          console.error('Failed to remove item from cart:', result.message);
        }
      } catch (error) {
        console.error('Error removing item from cart:', error);
      }
    }
  };

  const calculateDiscountedPrice = (price, discount) => {
    const discount1 =  price * (discount / 100);
    const discountedPrice = price -discount1;
   return discountedPrice;
  };
  const updateItemInState = (updatedItem) => {
    setData((prevData) =>
      prevData.map((item) =>
        item._id === updatedItem._id ? updatedItem : item
      )
    );
  };

  return (
   
    
      <div>
        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse mb-4">
          <h2 className="title">Top dishes near you</h2>
        </div>
        
        {loading ? (
          <div className="food-display animate-pulse">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="food-display-list mb-6">
                <div className="add-food mb-4">
                  <div className="h-24 bg-gray-200 rounded w-full"></div>
                  <div className="h-12 bg-gray-200 rounded w-full mt-2"></div>
                </div>
                <div className="name-reting mb-2">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="food-price">
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <div className="food-display grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredFoodList.length === 0 ? (
              <p>No items available in this category.</p>
            ) : (
              filteredFoodList.map((food) => {
                const discountedPrice = food.discount > 0 ? calculateDiscountedPrice(food.price, food.discount) : null;
                return (
                  <div key={food._id} className="food-display-list bg-white shadow rounded p-4">
                    <div className="add-food relative">
                      <img src={food.imageUrl} alt={food.name} className="food-img rounded-lg" />
                      {food.discount > 0 && (
                        <p className="food-discount bg-red-500 text-white text-xs rounded px-2 py-1 absolute top-2 left-2">
                          {food.discount}% OFF
                        </p>
                      )}
                      <div className="nonveg absolute top-2 right-2">
                        {food.vegOrNonVeg === 'Non-Veg' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 100 100">
                            <rect x="5" y="5" width="90" height="90" fill="none" stroke="red" strokeWidth="2" />
                            <circle cx="50" cy="50" r="30" fill="red" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 100 100">
                            <rect x="5" y="5" width="90" height="90" fill="none" stroke="green" strokeWidth="2" />
                            <circle cx="50" cy="50" r="30" fill="green" />
                          </svg>
                        )}
                      </div>
                      {!itemCounts[food._id] || itemCounts[food._id] === 0 ? (
                        <img
                          className="add-icon cursor-pointer mt-2"
                          onClick={() => handleAddClick(food)}
                          src="add_icon_white.png"
                          alt="Add"
                        />
                      ) : (
                        <div className="food-item-counter flex items-center justify-center mt-2">
                          <img
                            onClick={() => handleRemoveClick(food)}
                            src="remove_icon_red.png"
                            alt="Remove"
                            className="cursor-pointer"
                          />
                          <p className="mx-2">{itemCounts[food._id]}</p>
                          <img
                            onClick={() => handleAddClick(food)}
                            src="add_icon_green.png"
                            alt="Add"
                            className="cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                    <div className="name-reting mt-4">
                      <h2 className="food-name font-semibold text-lg">{food.name}</h2>
                      <img src="rating_starts.png" alt="img" className="reting mt-1" />
                    </div>
                    <p className="food-description text-gray-600 mt-2">{food.description}</p>
                    <div className="food-price flex items-center mt-4">
                      {food.discount > 0 && (
                        <div className="price-show flex items-baseline">
                          <p className="discounted-price text-red-500 font-bold">₹{discountedPrice}</p>
                          <div className="space-left ml-2">
                            <p className="original-price line-through text-gray-400">₹{food.price}</p>
                          </div>
                        </div>
                      )}
                      {food.discount === 0 && <p className="text-gray-700 font-bold">₹{food.price}</p>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  };

export default FoodDisplay;
