import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons'; // Import the refresh icon
import './orders.css';
import '../../app/globals.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token'); // Get token from local storage

    if (!token) {
      setError('No token found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/ordersList', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        console.error('Failed to fetch orders:', data.message);
        setError('Failed to fetch orders.');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Error fetching orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('No token found. Please log in.');
      return;
    }

    try {
      const response = await fetch('/api/changeOrderStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await response.json();

      if (data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        console.error('Failed to update order status:', data.message);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchOrders();
  };

  return (
    <div className='order-admin'>
      <div className='order-header'>
        <h1>Order Page</h1>
        <p className='refresh'>
        <FontAwesomeIcon
          icon={faSyncAlt} // Font Awesome refresh icon
          className='refresh-icon'
          onClick={handleRefresh}
          style={{ cursor: 'pointer' }}
        />
        </p>
      </div>
  
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className='error'>{error}</p>
      ) : (
        <div className='order-list-admin'>
          {/* Reverse orders so the newest appear first */}
          {orders.slice().reverse().map((order) => (
            <div key={order._id} className='order-item'>
              <div className='order-item-header'>
                <img src='/parcel_icon.png' alt='parcel icon' className='order-item-icon' />
              </div>
              <div className='order-item-details'>
              <p className='order-item-food'>
  {order.items
    .map(item => item.foodId ? `${item.foodId.name} x ${item.quantity}` : `Unknown Food x ${item.quantity}`)
    .join(', ')}
</p>
                
                <div className='order-item-address'>
                  <p>{order.selectedAddress.flatNo}, {order.selectedAddress.landmark}</p>
                  <p>{order.selectedAddress.location}</p>
                </div>
                <p>{order.user.mobileNumber}</p>
                <p className='order-item-date'>
                  {new Date(order.date).toLocaleString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </p>
              </div>
  
              <p className='order-item-total-items'>
                Items: {order.items.length}
              </p>
              <p className='order-item-total-amount'>
                ₹ {order.totalAmount}
              </p>
              <p>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                >
                   <option value='Food Accepted'>Food Accepted</option>
                  <option value='Food Processing'>Food Processing</option>
                  <option value='Out for delivery'>Out for delivery</option>
                  <option value='Delivered'>Delivered</option>
                  <option value='Cancelled'>Cancelled</option>
                </select>
                <div className='order-item-name'>
                <p className='order-item-date'>
                    Status: {order.status}
                  </p>
                  <p className='order-item-date'>
                    paymentStatus: {order.paymentStatus}
                  </p>
                  {order.paymentStatus !== 'Cash on Delivery' && (
                    <p className='order-item-total-items'>
                      UTR: {order.UTR}
                    </p>
                  )}
                </div>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
};

export default Orders;
