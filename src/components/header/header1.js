import React, { useEffect, useState } from 'react';
import './header2.css';

const Header = () => {
  const [headerImage, setHeaderImage] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchHeaderImages = async () => {
      try {
        const response = await fetch('/api/headerImage'); // Adjust this path if necessary
        const data = await response.json();

        // Assuming the data is an array and you want the first image
        if (data.length > 0) {
          setHeaderImage(data[0]); // Set the first header image
        }
      } catch (error) {
        setError('Error fetching header images'); // Set error state if fetch fails
        console.error('Error fetching header images:', error);
      } finally {
        setLoading(false); // Set loading to false once data is fetched or if there is an error
      }
    };

    fetchHeaderImages();
  }, []);

  if (loading) {
    return (
      <div className="header loading">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="header error">
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="header" style={{ backgroundImage: `url(${headerImage ? headerImage.imagePath : ''})` }}>
      <div className="header-contents">
        <h2>{headerImage ? headerImage.title : 'Image Loaded'}</h2>
        <p>{headerImage ? headerImage.description : 'Description loaded'}</p>
        <a href={headerImage ? headerImage.url : '#'}>
          <button>View Menu</button>
        </a>
      </div>
    </div>
  );
};

export default Header;
