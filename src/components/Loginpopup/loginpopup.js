'use client';
import React, { useState, useEffect } from 'react';
import './loginpopup.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const countryCodes = [
  { code: '+91', flag: '🇮🇳' },
  { code: '+1', flag: '🇺🇸' },
  { code: '+44', flag: '🇬🇧' },
];

const OTP_EXPIRY_TIME = 30; // For OTP expiration countdown
const TOKEN_EXPIRY_TIME = 3600 * 9000000000; // Token expires in 1 hour (3600 seconds)

const LoginPopup = ({ setShowLogin, setIsLoggedIn }) => {
  const [currentState, setCurrentState] = useState("Enter details");
  const [formData, setFormData] = useState({
    mobileNumber: '',
    otp: '',
    countryCode: '+91',
  });
  const [error, setError] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(null);

  useEffect(() => {
    // OTP timer countdown
    if (isOtpSent) {
      const timer = setInterval(() => {
        setOtpExpiry((prev) => (prev ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOtpSent]);

  useEffect(() => {
    // Check if token exists and if it has expired
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    const now = new Date().getTime();

    if (token && tokenExpiry && now > tokenExpiry) {
      // Token has expired, clear it and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
      toast.info('Session expired. Please log in again.');
      setIsLoggedIn(false);
      setShowLogin(true); // Show login popup again
    }
  }, [setIsLoggedIn, setShowLogin]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCountryCodeChange = (e) => {
    setFormData({ ...formData, countryCode: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (currentState === "Enter details") {
        // Validate mobile number
        if (!/^\d{10}$/.test(formData.mobileNumber)) {
          setError('Please enter a valid 10-digit mobile number');
          setLoading(false);
          return;
        }

        // Send OTP request
        const res = await fetch('/api/send-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mobileNumber: `${formData.countryCode}${formData.mobileNumber}`,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to send OTP');
        }

        // OTP sent successfully
        setIsOtpSent(true);
        setOtpExpiry(OTP_EXPIRY_TIME);
        setCurrentState("Verify OTP");
        toast.success("OTP sent successfully");

      } else if (currentState === "Verify OTP") {
        // Verify OTP request
        const res = await fetch('/api/verify-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mobileNumber: `${formData.countryCode}${formData.mobileNumber}`,
            otp: formData.otp,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Invalid OTP');
        }

        // Save token and its expiry time in localStorage
        const now = new Date().getTime();
        const tokenExpiry = now + TOKEN_EXPIRY_TIME; // Token expires in 1 hour
        localStorage.setItem('token', data.token);
        localStorage.setItem('tokenExpiry', tokenExpiry);

        toast.success("Login successful");
        setIsLoggedIn(true);
        setShowLogin(false);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpExpiry <= 0) {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/send-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mobileNumber: `${formData.countryCode}${formData.mobileNumber}`,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to resend OTP');
        }

        setOtpExpiry(OTP_EXPIRY_TIME);
        toast.success("OTP resent successfully");
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    } else {
      toast.info("Please wait until the OTP expires before requesting a new one");
    }
  };

  return (
    <div className='login-popup'>
      <ToastContainer />
      <form className='login-popup-container' onSubmit={handleSubmit}>
        <div className='login-popup-title'>
          <h2>{currentState}</h2>
          <img onClick={() => setShowLogin(false)} src='/cross_icon.png' alt="Close" />
        </div>
        {error && <p className='error'>{error}</p>}
        <div className='login-popup-inputs'>
          {currentState === "Enter details" && (
            <>
              <div className='country-code-dropdown'>
                <select
                  name='countryCode'
                  value={formData.countryCode}
                  onChange={handleCountryCodeChange}
                >
                  {countryCodes.map((country, index) => (
                    <option key={index} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <div className='mobile-number-input'>
                  <input
                    type='number'
                    name='mobileNumber'
                    placeholder='Your mobile number'
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    disabled={isOtpSent} // Disable after OTP is sent
                    required
                    pattern="\d{10}"
                    minLength={10}
                    maxLength={10}
                    title="Please enter exactly 10 digits."
                  />
                </div>
              </div>
            </>
          )}
          {isOtpSent && (
            <div className='otp-input'>
              <input
                type='text'
                name='otp'
                placeholder='Enter OTP'
                value={formData.otp}
                onChange={handleChange}
                required
              />
            </div>
          )}
        </div>
        <div className='button-container'>
          {loading && <div className="spinner"></div>}
          {currentState === "Enter details" && !isOtpSent && (
            <button type="submit">Send OTP</button>
          )}
          {isOtpSent && (
            <>
              <span className='icon success-icon'>✔️</span>
              <button type="submit" disabled={loading}>Verify OTP</button>
              <p className='otp-expiry-info'>
                {otpExpiry > 0 ? `Expires in: ${otpExpiry} seconds` : "OTP expired"}
              </p>
              {otpExpiry <= 0 && (
                <button type="button" onClick={handleResendOtp} disabled={loading}>
                  Resend OTP
                </button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPopup;
