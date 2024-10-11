import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import '../../pages/order1.css';

const AddressPopup = ({
  setShowPopup,
  location,
  setLocation,
  flatNo,
  setFlatNo,
  landmark,
  setLandmark,
  onAddressSaved,
  setSavedAddresses,
  adminLocation,
  distanceThreshold
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const geocoder = useRef(null);
  const [isDeliverable, setIsDeliverable] = useState(true);
  // const [adminLocation, setAdminLocation] = useState('');
  // const [distanceThreshold, setDistanceThreshold] = useState(12); // Default distance in km

  // Validation state
  const [errors, setErrors] = useState({
    location: '',
    flatNo: '',
    landmark: '',
  });
console.log(adminLocation);
  // Fetch admin settings for deliverability threshold
  // useEffect(() => {
  //   const fetchAdminSettings = async () => {
  //     try {
  //       const response = await axios.get('/api/adminSettings');
  //       if (response.data.success) {
  //         setAdminLocation(response.data.adminLocation); // Admin's saved address
  //         setDistanceThreshold(response.data.distanceThreshold); // Max distance for delivery
  //       } else {
  //         console.error('Failed to fetch admin settings');
  //       }
  //     } catch (error) {
  //       console.error('Error fetching admin settings:', error);
  //     }
  //   };
  //   fetchAdminSettings();
  // });

  // Load Google Maps API and initialize the map
  useEffect(() => {
    const loadGoogleMaps = () => {
      const existingScript = document.getElementById('googleMaps');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCuro_Das6SA4HRZzGnqR6VHHgyfprryCg&libraries=places`;
        script.id = 'googleMaps';
        document.body.appendChild(script);

        script.onload = () => {
          initMap();
        };
      } else {
        initMap();
      }
    };

    const initMap = () => {
      if (window.google && mapRef.current) {
        const defaultLocation = { lat: 26.9124, lng: 75.7873 }; // Default map center
        const googleMap = new window.google.maps.Map(mapRef.current, {
          center: defaultLocation,
          zoom: 12,
        });

        setMap(googleMap);
        geocoder.current = new window.google.maps.Geocoder();

        const mapMarker = new window.google.maps.Marker({
          position: defaultLocation,
          map: googleMap,
          draggable: true,
        });

        setMarker(mapMarker);

        googleMap.addListener('click', (event) => {
          const clickedLocation = event.latLng;
          mapMarker.setPosition(clickedLocation);
          updateAddress(clickedLocation);
        });

        mapMarker.addListener('dragend', () => {
          const newPosition = mapMarker.getPosition();
          updateAddress(newPosition);
        });
      }
    };

    loadGoogleMaps();
  }, []);

  // Update the address using Google Maps Geocoding
  const updateAddress = (location) => {
    if (geocoder.current) {
      geocoder.current.geocode({ location }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const formattedAddress = results[0].formatted_address;
          setLocation(formattedAddress); // Set user's location
          checkDeliverability(formattedAddress, location); // Check distance from admin's address
        } else {
          alert('Failed to retrieve address');
        }
      });
    }
  };

  // Check whether the user's address is within the deliverable range
  const checkDeliverability = (userAddress1, location) => {
    if (window.google && adminLocation) {
      const service = new window.google.maps.DistanceMatrixService();

      geocoder.current.geocode({ address: adminLocation }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const adminLocationCoords = results[0].geometry.location;

          service.getDistanceMatrix(
            {
              origins: [adminLocationCoords],
              destinations: [userAddress1],
              travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (response, status) => {
              if (status === 'OK') {
                const distanceInMeters = response.rows[0].elements[0].distance.value;
                const distanceInKm = distanceInMeters / 1000;

                setIsDeliverable(distanceInKm <= distanceThreshold);
              } else {
                console.error('Error calculating distance:', status);
                alert('Failed to calculate distance. Please try again later.');
              }
            }
          );
        } else {
          console.error('Failed to retrieve admin location:', status);
          alert('Failed to retrieve admin location. Please check the admin settings.');
        }
      });
    } else {
      alert('Admin location is not set or invalid.');
    }
  };

  // Handle "Locate Me" button to get user's current location
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          if (map && marker) {
            map.setCenter(userLocation);
            marker.setPosition(userLocation);
            updateAddress(userLocation); // Update user's location
          }
        },
        (error) => {
          alert('Error getting location: ' + error.message);
        },
        { timeout: 10000 }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Handle address saving after validation
  const handleSaveAddress = async () => {
    let hasError = false;
    const newErrors = { location: '', flatNo: '', landmark: '' };

    if (!location) {
      newErrors.location = 'Please fill this field';
      hasError = true;
    }
    if (!flatNo) {
      newErrors.flatNo = 'Please fill this field';
      hasError = true;
    }
    if (!landmark) {
      newErrors.landmark = 'Please fill this field';
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError || !isDeliverable) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('User not authenticated');
      return;
    }

    const addressData = { token, location, flatNo, landmark };

    try {
      const response = await axios.post('/api/address', addressData);
      if (response.data.success) {
        const newAddress = response.data.address;

        if (onAddressSaved) onAddressSaved(newAddress);

        setSavedAddresses((prevAddresses) => [newAddress, ...prevAddresses]);

        setLocation(''); 
        setFlatNo(''); 
        setLandmark(''); 
        setShowPopup(false); // Hide the popup on success
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert('An unexpected error occurred');
    }
  };

  return (
    <div className="popup-container">
      <div className="popup">
        <div className="popup-header">
          <h3>Save Delivery Address</h3>
          <FontAwesomeIcon icon={faTimes} className="remove-icon" onClick={() => setShowPopup(false)} />
        </div>
        <div className="map-container">
          <div ref={mapRef} className="map"></div>
        </div>
        {!isDeliverable && <p className="error-message">Delivery is not available for this location.</p>}
        <p className="locate">
          <input
            type="text"
            placeholder="Enter Address"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="input-field1"
          />
          <button className="locate-me-btn" onClick={handleLocateMe}>Locate Me</button>
        </p>
        {errors.flatNo && <span className="error-text">{errors.flatNo}</span>}
        <input
          type="text"
          placeholder="Flat No."
          value={flatNo}
          onChange={(e) => setFlatNo(e.target.value)}
          className={`input-field ${errors.flatNo ? 'error-border' : ''}`}
          required
        />
        {errors.landmark && <span className="error-text">{errors.landmark}</span>}
        <input
          type="text"
          placeholder="Landmark"
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
          className={`input-field ${errors.landmark ? 'error-border' : ''}`}
          required
        />
        <button className="save-address-btn" onClick={handleSaveAddress}>Save Address</button>
      </div>
    </div>
  );
};

export default AddressPopup;
