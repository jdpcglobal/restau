import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import './cartpopup2.css';

const CartPopup = ({ setShowCart }) => {
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState(null);
  const [showUserDetailsPopup, setShowUserDetailsPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem('token'); // Replace with actual token retrieval

        if (!token) {
          throw new Error('No token found');
        }

        const response = await axios.get('/api/getCartItems', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

    fetchCartItems();
  }, []);

  const updateCartItem = async (itemId, newQuantity) => {
    try {
      const token = localStorage.getItem('token'); // Replace with actual token retrieval

      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.put('/api/updateCartItem', {
        itemId,
        quantity: newQuantity
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setCartItems(prevItems => prevItems.map(item => 
          item._id === itemId ? { ...item, quantity: newQuantity } : item
        ));
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      setError('Error updating cart item');
    }
  };

  const handleRemoveClick = async (itemId) => {
    try {
      const token = localStorage.getItem('token'); // Replace with actual token retrieval

      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.delete('/api/removeCartItem', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { itemId }
      });

      if (response.data.success) {
        setCartItems(prevItems => prevItems.filter(item => item._id !== itemId));
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Error removing cart item:', error);
      setError('Error removing cart item');
    }
  };

  const incrementQuantity = (itemId, currentQuantity) => {
    updateCartItem(itemId, currentQuantity + 1);
  };

  const decrementQuantity = (itemId, currentQuantity) => {
    if (currentQuantity > 1) {
      updateCartItem(itemId, currentQuantity - 1);
    }
  };

  const subtotal = cartItems.reduce((total, item) => {
    if (item.foodId) {
      return total + item.foodId.price * item.quantity;
    }
    return total;
  }, 0);

  const deliveryFee = 2;
  const total = subtotal + deliveryFee;



 

  const handlePaymentSuccess = () => {
    setShowPaymentPopup(false);
    alert('Payment Successful! Thank you for your order.');
    setShowCart(false);

    const userId = 'yourUserId'; // Replace with actual user ID

    axios.post('/api/saveCartItems', { cartItems, userId })
      .then(response => {
        console.log('Cart items saved successfully');
      })
      .catch(error => {
        console.error('Error saving cart items:', error);
      });
  };
  const handleCheckoutClick = () => {
    router.push('/Order'); // Redirect to checkout page
  };

  return (
    <div className='cart-popup'>
      <div className='cart-popup-container'>
        <div className='cart-popup-header'>
          <h2>Cart</h2>
          <img
            className='close-icon'
            src='/cross_icon.png'
            alt='Close'
            onClick={() => setShowCart(false)}
          />
        </div>
        <div className='cart-popup-body'>
          <div className='cart-popup-header1'>
            <span>Item</span>
            <span>Title</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Total</span>
            <span>Remove</span>
          </div>
          <div className='cart-items-container'>
            {error && <p>{error}</p>}
            {cartItems.length === 0 ? (
              <p>Your cart is empty</p>
            ) : (
              cartItems.map(item => (
                <div key={item._id} className='cart-item'>
                  <div className='cart-item-img'>
                    {item.foodId && (
                      <img src={item.foodId.imageUrl} alt={item.foodId.name} className='item-image' />
                    )}
                  </div>
                  <div className='cart-item-details'>
                    <h3>{item.foodId ? item.foodId.name : 'Unknown Item'}</h3>
                  </div>
                  <div className='cart-item-price'>
                    <p>₹{item.foodId ? item.foodId.price : 'N/A'}</p>
                  </div>
                  <div className='cart-item-quantity'>
                    <button onClick={() => decrementQuantity(item._id, item.quantity)}>-</button>
                    <p>{item.quantity}</p>
                    <button onClick={() => incrementQuantity(item._id, item.quantity)}>+</button>
                  </div>
                  <div className='cart-item-total'>
                    <p>₹{item.foodId ? item.foodId.price * item.quantity : 'N/A'}</p>
                  </div>
                  <div className='cart-item-remove'>
                    <img
                      src='/cross_icon.png'
                      alt='Remove'
                      onClick={() => handleRemoveClick(item._id)}
                      className='remove-icon'
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className='cart-bottom'>
          <div className='cart-total'>
            <h2>Cart Total</h2>
            <div className='cart-total-details'>
              <p>Subtotal</p>
              <p>₹{subtotal}</p>
            </div>
            <hr />
            <div className='cart-total-details'>
              <p>Delivery Fee</p>
              <p>₹{deliveryFee}</p>
            </div>
            <hr />
            <div className='cart-total-details'>
              <b>Total</b>
              <b>₹{total}</b>
            </div>
            <div className="checkout-button">
            <button onClick={handleCheckoutClick} className='checkout-button'>PROCEED TO CHECKOUT</button>
            </div>
          </div>
          <div className='cart-promocode'>
            <div>
              <p>If you have a promo code, enter it here:</p>
              <div className='cart-promocode-input'>
                <input type='text' placeholder='Promo code' />
                <button>Submit</button>
              </div>
            </div>
          </div>
        </div>

       </div>
       </div>
  );
};

export default CartPopup;
