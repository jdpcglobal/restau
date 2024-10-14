import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Payment.css';
import '../AddCategory/addCategory.css';

const Payment = () => {
  const [items, setItems] = useState([]);
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null); // To hold the actual file for upload
  const [name, setName] = useState('');
  const [title, setTitle] = useState(''); // State for title
  const [loading, setLoading] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false); // State for loading payments
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch payments initially
    const fetchPayments = async () => {
      setLoadingPayments(true); // Set loading state to true
      try {
        const { data } = await axios.get('/api/payment');
        setItems(data);
      } catch (error) {
        setError('Failed to fetch payments');
      } finally {
        setLoadingPayments(false); // Set loading state to false after fetching
      }
    };

    fetchPayments();
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setImage(URL.createObjectURL(selectedFile)); // Preview image
      setImageFile(selectedFile); // Set the file for upload
    }
  };

  const handleAddPayment = async () => {
    if (imageFile && name && title) {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', name);
      formData.append('title', title); // Append title
      formData.append('image', imageFile);

      try {
        const { data } = await axios.post('/api/payment', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setItems([...items, data.Payment]); // Add new payment to the list
        setImage(null); // Clear preview
        setImageFile(null); // Clear file
        setName('');
        setTitle(''); // Clear title
      } catch (error) {
        setError('Failed to add payment');
      } finally {
        setLoading(false);
      }
    } else {
      setError('All fields and an image are required');
    }
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    setLoading(true);
    try {
      const newStatus = currentStatus === 'Active' ? 'Deactive' : 'Active'; // Toggle status
      const { data } = await axios.put(`/api/update-payment?id=${id}`, { status: newStatus });
      setItems(items.map(item => (item._id === id ? data : item)));
    } catch (error) {
      setError('Failed to update payment status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`/api/delete-payment?id=${id}`);
      setItems(items.filter(item => item._id !== id)); // Remove deleted item from list
    } catch (error) {
      setError('Failed to delete payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <div className="add-category">
        <h3>Add New Payment</h3>
        <div className='flex-row'>
          <label htmlFor="file-upload" className="custom-file-upload">
            <img 
              src={image || '/upload_area.png'} 
              alt='Upload Preview' 
              className='image-upload'
            />
          </label>
          
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          <p>
            <input
              type="text"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </p>
          <p>
            <input
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </p>
        </div>
        <button className='add-item-btn' onClick={handleAddPayment} disabled={loading}>
          {loading ? 'Adding...' : 'Add Payment'}
        </button>
        {error && <p className="error">{error}</p>}
      </div>

      <div className='payment-list'>
        <h3>Payment List</h3>
        {loadingPayments ? ( // Show loading when fetching payments
          <p>Loading payments...</p>
        ) : items.length > 0 ? (
          <ul className='list-table'>
            <li className='list-table-header'>
              <b>Image</b>
              <b>Name</b>
              <b>Title</b>
              <b>Status</b>
              <b>Actions</b>
            </li>
            {items.map((item) => (
              <li
                key={item._id}
                className={`payment-item ${item.status === 'Active' ? 'Active' : 'Deactive'}`}
              >
                <img src={item.imageUrl} alt="Uploaded" />
                <p>{item.name}</p>
                <p>{item.title}</p>
                <p>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={item.status === 'Active'}
                      onChange={() => handleUpdateStatus(item._id, item.status)}
                    />
                    <span className="slider"></span>
                  </label>
                </p>
                <p>
                  <button className="delete" onClick={() => handleDelete(item._id)}>
                    Delete
                  </button>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No payments available.</p> // Show if no payments found
        )}
      </div>
    </div>
  );
};

export default Payment;
