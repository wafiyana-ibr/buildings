import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSpinner, faExclamationCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { userAPI } from '@/api/dbAPI';
import { useAuth } from '@/hooks/useAuth';
const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [notification, setNotification] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();


  useEffect(() => {
    if (user) {
      navigate('/base', { replace: true });
    }
    if (location.state?.notification) {
      setNotification(location.state.notification);

      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [location, user]);

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }

    // Clear API error when user makes changes
    if (apiError) {
      setApiError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError(null);

    try {
      await userAPI.signIn(formData.email, formData.password);

      // Check if there's a pending base to add
      const pendingBaseAdd = localStorage.getItem("pendingBaseAdd");
      
      if (pendingBaseAdd && location.state?.pendingBaseAdd) {
        // Don't remove from localStorage yet, we'll do that after the base is added
        window.location.href = '/base?addPendingBase=true'; // Pass a parameter to indicate we should add the pending base
      } else {
        // Standard redirect after login
        window.location.href = location.state?.redirectUrl || '/base';
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'An error occurred during login';
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="my-16 sm:my-18 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-lg border border-white/20">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">Sign In to Your Account</h2>
          <p className="mt-2 text-sm text-white/70">
            Or{' '}
            <Link to="/sign-up" className="font-medium text-yellow-400 hover:text-yellow-300">
              create a new account
            </Link>
          </p>
        </div>

        {notification && (
          <div className={`${notification.type === 'success' ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'} border text-white px-4 py-3 rounded-lg relative`} role="alert">
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={notification.type === 'success' ? faCheckCircle : faExclamationCircle}
                className="mr-2"
              />
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {apiError && (
          <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-3 rounded-lg relative" role="alert">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
              <span>{apiError}</span>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md -space-y-px">
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faEnvelope} className="text-white/60" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none rounded-lg relative block w-full px-10 py-3 border ${errors.email ? 'border-red-500/70 bg-red-500/10' : 'border-white/20 bg-white/5'
                    } placeholder-white/40 text-white focus:outline-none focus:ring-yellow-500/70 focus:border-yellow-500/70 focus:z-10`}
                  placeholder="Email address"
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faLock} className="text-white/60" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none rounded-lg relative block w-full px-10 py-3 border ${errors.password ? 'border-red-500/70 bg-red-500/10' : 'border-white/20 bg-white/5'
                    } placeholder-white/40 text-white focus:outline-none focus:ring-yellow-500/70 focus:border-yellow-500/70 focus:z-10`}
                  placeholder="Password"
                />
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password}</p>}
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-70"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                  Processing...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
