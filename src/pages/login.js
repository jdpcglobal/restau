import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faKey, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './adminlogin.css'; // Ensure this file exists and is correctly styled

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/loginadmin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (response.ok) {
        // Store adminId in a cookie
        document.cookie = `adminId=${result.token}; path=/; max-age=3600`;
  
        // Redirect to Admin Panel
        router.push('/AdminPanel'); // Redirect to the Admin Panel
      } else {
        setError(result.message || 'Invalid credentials.');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login">
      <img src="login-bg.png" alt="Login Background" className="login__img" />

      <form onSubmit={handleLogin} className="login__form">
        <h1 className="login__title">Admin Login</h1>

        <div className="login__content">
          {/* Username Input */}
          <div className="login__box">
            <FontAwesomeIcon icon={faLock} className="login__icon" />
            <div className="login__box-input">
              <input
                type="text"
                required
                className={`login__input ${username ? "filled" : ""}`}
               
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <label htmlFor="" className={`login__label ${username ? "hidden" : ""}`}>
                Username
              </label>
            </div>
          </div>

          
          <div className="login__box">
            <FontAwesomeIcon icon={faKey} className="login__icon" />
            <div className="login__box-input">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className={`login__input ${password ? "filled" : ""}`}
               
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label htmlFor="" className={`login__label ${password? "hidden" : ""}`}>
                Password
              </label>
              <FontAwesomeIcon
                onClick={togglePasswordVisibility}
                icon={showPassword ? faEyeSlash : faEye}
                className="login__eye"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && <p className="error-message">{error}</p>}

        {/* Submit Button */}
        <button type="submit" className="login__button" disabled={loading}>
          {loading ? (
            <div className="spinner-login">
              <div className="spinner"></div>
            </div>
          ) : (
            'Login'
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
