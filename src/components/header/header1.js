import React, { useEffect, useState } from 'react';
import './header2.css';

const Header = () => {
  const [headerImage, setHeaderImage] = useState(null);

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
        console.error('Error fetching header images:', error);
      }
    };

    fetchHeaderImages();
  }, []);

  return (
    <div className='header' style={{ backgroundImage: `url(${headerImage ? headerImage.imagePath : ''})` }}>
      <div className='header-contents'>
        <h2>{headerImage ? headerImage.title : 'Loading...'}</h2>
        <p>
          {headerImage ? headerImage.description : 'Loading description...'}
        </p>
        <a href={headerImage ? headerImage.url : '#'}>
          <button>View Menu</button>
        </a>
      </div>
    </div>
  );
};

export default Header;
