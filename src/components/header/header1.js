import React, { useEffect, useState } from 'react';
import './header2.css';

const Header = () => {
  const [headerImage, setHeaderImage] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchHeaderImages = async () => {
      try {
        const response = await fetch('/api/headerImage');
        const data = await response.json();
    
        // Assuming the image is hosted externally, update the image URL
        if (data.length > 0) {
          setHeaderImage(data[0]);
        }
      } catch (error) {
        setError('Error fetching header images');
        console.error('Error fetching header images:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Use image from CDN
    const imageUrl = `https://cdn.example.com/images/${headerImage?.imagePath}`;
    

    fetchHeaderImages();
  }, []);

  if (loading) {
    // Skeleton or loading state
    return (
      <div className="header animate-pulse bg-gray-500">
        <div className="header-contents w-full h-72 p-4">
          <div className="h-10 bg-gray-500 rounded w-1/2 my-4"></div>
          <div className="h-6 bg-gray-500 rounded w-3/4 my-4"></div>
          <div className="h-10 bg-gray-500 rounded w-1/6 my-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    // Error state
    return <div className="header-error">Error: {error}</div>;
  }

  // Main content when data is loaded
  return (
    <div
      className="header"
      style={{
        backgroundImage: `url(${headerImage?.imagePath || '/header_img.png'})`, // Fallback image
      }}
      
    >
      <div className="header-contents">
        <h2>{headerImage?.title || 'Default Title'}</h2>
        <p>{headerImage?.description || 'Default Description'}</p>
        <a href={headerImage?.url || '#'}>
          <button>View Menu</button>
        </a>
      </div>
    </div>
  );
};

export default Header;
