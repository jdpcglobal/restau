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
      style={{ backgroundImage: `url(${headerImage ? headerImage.imagePath : ''})` }}
    >
      <div className="header-contents">
        <h2>{headerImage.title}</h2>
        <p>{headerImage.description}</p>
        <a href={headerImage.url}>
          <button>View Menu</button>
        </a>
      </div>
    </div>
  );
};

export default Header;
