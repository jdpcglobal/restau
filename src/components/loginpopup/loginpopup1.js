'use client';
import React, { useState, useEffect, useRef } from 'react';
import './loginpopup2.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const countryCodes = [
  { code: '+91', flag: '🇮🇳' },
  { code: '+1', flag: '🇺🇸' },
  { code: '+44', flag: '🇬🇧' },
];

const OTP_EXPIRY_TIME = 60; // 1 minute for OTP expiration countdown
const EXTENDED_EXPIRY_TIME = 15 * 60; // 15 minutes for extended wait time
const TOKEN_EXPIRY_TIME = 3600 * 1000; // 1 hour for token expiration

const LoginPopup = ({ setShowLogin, setIsLoggedIn }) => {
  const [currentState, setCurrentState] = useState('Enter details');
  const [formData, setFormData] = useState({
    mobileNumber: '',
    countryCode: '+91',
    otp: ['', '', '', '', '', ''],
  });
  const [error, setError] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);

  const otpInputRefs = useRef([]);

  useEffect(() => {
    if (isOtpSent && otpExpiry > 0) {
      const timer = setInterval(() => {
        setOtpExpiry((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOtpSent, otpExpiry]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (index, value) => {
    if (/^\d$/.test(value) || value === '') {
      const updatedOtp = [...formData.otp];
      updatedOtp[index] = value;
      setFormData({ ...formData, otp: updatedOtp });

      if (value && index < formData.otp.length - 1) {
        otpInputRefs.current[index + 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    const pastedData = e.clipboardData.getData('Text');
    if (/^\d{6}$/.test(pastedData)) {
      const otpArray = pastedData.split('');
      setFormData({ ...formData, otp: otpArray });
      otpArray.forEach((digit, index) => {
        if (otpInputRefs.current[index]) {
          otpInputRefs.current[index].value = digit;
        }
      });
    } else {
      toast.error('Please paste a valid 6-digit OTP');
    }
  };

  const handleOtpFocus = (index) => {
    otpInputRefs.current[index].select();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const updatedOtp = [...formData.otp];
      if (formData.otp[index] === '') {
        if (index > 0) {
          otpInputRefs.current[index - 1].focus();
          updatedOtp[index - 1] = '';
        }
      } else {
        updatedOtp[index] = '';
      }
      setFormData({ ...formData, otp: updatedOtp });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (currentState === 'Enter details') {
        if (!/^\d{10}$/.test(formData.mobileNumber)) {
          setError('Please enter a valid 10-digit mobile number');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mobileNumber: `${formData.countryCode}${formData.mobileNumber}`,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to send OTP');
        }

        setIsOtpSent(true);
        setOtpExpiry(OTP_EXPIRY_TIME);
        setCurrentState('Verify OTP');
        toast.success('OTP sent successfully');
      } else if (currentState === 'Verify OTP') {
        const otpCode = formData.otp.join('');

        if (otpCode.length !== 6) {
          setError('Please enter the complete OTP');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mobileNumber: `${formData.countryCode}${formData.mobileNumber}`,
            otp: otpCode,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Invalid OTP');
        }

        const now = new Date().getTime();
        const tokenExpiry = now + TOKEN_EXPIRY_TIME;
        localStorage.setItem('token', data.token);
        localStorage.setItem('tokenExpiry', tokenExpiry);

        toast.success('Login successful');
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
    if (otpExpiry > 0) {
      toast.info('Please wait until the OTP expires');
      return;
    }

    if (resendAttempts >= 3) {
      setOtpExpiry(EXTENDED_EXPIRY_TIME);
      toast.warning('Too many attempts. Please try again after 15 minutes.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileNumber: `${formData.countryCode}${formData.mobileNumber}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setOtpExpiry(OTP_EXPIRY_TIME);
      setResendAttempts((prev) => prev + 1);
      toast.success('OTP resent successfully');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return minutes > 0 ? `${minutes}m:${seconds}s` : `${seconds}s`;
  };

  return (
    <div className='login-popup'>
      <ToastContainer />
      <form className='login-popup-container' onSubmit={handleSubmit}>
        <div className='login-popup-title'>
          <h2>{currentState}</h2>
          <img
            onClick={() => setShowLogin(false)}
            src='/cross_icon.png'
            alt='Close'
          />
        </div>
        {error && <p className='error'>{error}</p>}
        <div className='login-popup-inputs'>
          {currentState === 'Enter details' && (
            <>
              <div className='country-code-dropdown'>
                <select
                  name='countryCode'
                  value={formData.countryCode}
                  onChange={handleChange}
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
                    disabled={isOtpSent}
                    required
                  />
                </div>
              </div>
            </>
          )}
          {isOtpSent && (
            <div className='otp-container' onPaste={handlePaste}>
              {formData.otp.map((digit, index) => (
                <input
                  key={index}
                  className='otp-input'
                  type='text'
                  value={digit}
                  maxLength={1}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onFocus={() => handleOtpFocus(index)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                />
              ))}
            </div>
          )}
        </div>
        <div className='button-container'>
          {loading && <div className='spinner'></div>}
          {!isOtpSent && (
            <button type='submit' disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          )}
          {isOtpSent && (
            <button type='submit' disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          )}
          {isOtpSent && otpExpiry > 0 && (
            <p className='otp-expiry-info'>Resend OTP in:{formatTime(otpExpiry)}</p>
          )}
        </div>
        {isOtpSent && otpExpiry === 0 && (
          <p className='resend-otp'>
            Didn’t receive code?{' '}
            <span className='request-again' onClick={handleResendOtp}>
              Request again
            </span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;
