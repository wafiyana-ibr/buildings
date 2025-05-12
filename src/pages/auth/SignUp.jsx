import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSpinner, faExclamationCircle, faUser } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/hooks/useAuth';
import { userAPI } from '@/api/dbAPI';
const SignUp = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const validateForm = () => {
        const newErrors = {};

        // Username validation
        if (!formData.username) {
            newErrors.username = 'Username cannot be empty';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email cannot be empty';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password cannot be empty';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirm password cannot be empty';
        } else if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = 'Passwords do not match';
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

    const { fetchUser } = useAuth();
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form before submission
        if (!validateForm()) return;

        setIsLoading(true);
        setApiError(null);

        try {
            const { confirmPassword, ...signupData } = formData;
            await userAPI.signUp(signupData.username, signupData.email, signupData.password);
            
            // Login otomatis setelah signup
            try {
                await userAPI.signIn(signupData.email, signupData.password);
                await fetchUser(); // Update auth context dengan data user baru
                
                // Check if there's a pending base to add - check all possible sources
                const pendingBaseAdd = localStorage.getItem("pendingBaseAdd");
                const shouldAddBase = location.state?.pendingBaseAdd;
                const urlParams = new URLSearchParams(window.location.search);
                const urlHasPendingBase = urlParams.get('addPendingBase') === 'true';
                
                if (pendingBaseAdd) {
                    // Don't remove from localStorage yet, we'll do that after the base is added
                    window.location.href = '/base?addPendingBase=true'; // Use window.location for full page refresh
                } else {
                    // Standard redirect after registration
                    navigate('/', {
                        state: {
                            notification: {
                                type: 'success',
                                message: 'Registration successful! Welcome to our application.'
                            }
                        }   
                    });
                }
            } catch (loginError) {
                console.error('Auto login error:', loginError);
                // Jika login otomatis gagal, tetap arahkan ke homepage
                navigate('/');
            }
        } catch (error) {
            console.error('Signup error:', error);
            const errorMessage = error.response?.data?.error || 'An error occurred during registration';
            setApiError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="my-16 sm:my-18 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-lg border border-white/20">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-white">Create a New Account</h2>
                    <p className="mt-2 text-sm text-white/70">
                        Or{' '}
                        <Link to="/sign-in" className="font-medium text-yellow-400 hover:text-yellow-300">
                            sign in to an existing account
                        </Link>
                    </p>
                </div>

                {apiError && (
                    <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-3 rounded-lg relative" role="alert">
                        <div className="flex items-center">
                            <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
                            <span>{apiError}</span>
                        </div>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md space-y-4">
                        {/* Username Field */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-white/90 mb-1">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon={faUser} className="text-white/60" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={`appearance-none rounded-lg relative block w-full px-10 py-3 border ${errors.username ? 'border-red-500/70 bg-red-500/10' : 'border-white/20 bg-white/5'
                                        } placeholder-white/40 text-white focus:outline-none focus:ring-yellow-500/70 focus:border-yellow-500/70 focus:z-10`}
                                    placeholder="Username"
                                />
                            </div>
                            {errors.username && <p className="mt-2 text-sm text-red-400">{errors.username}</p>}
                        </div>

                        {/* Email Field */}
                        <div>
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

                        {/* Password Field */}
                        <div>
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
                                    autoComplete="new-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`appearance-none rounded-lg relative block w-full px-10 py-3 border ${errors.password ? 'border-red-500/70 bg-red-500/10' : 'border-white/20 bg-white/5'
                                        } placeholder-white/40 text-white focus:outline-none focus:ring-yellow-500/70 focus:border-yellow-500/70 focus:z-10`}
                                    placeholder="Password"
                                />
                            </div>
                            {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password}</p>}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon={faLock} className="text-white/60" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`appearance-none rounded-lg relative block w-full px-10 py-3 border ${errors.confirmPassword ? 'border-red-500/70 bg-red-500/10' : 'border-white/20 bg-white/5'
                                        } placeholder-white/40 text-white focus:outline-none focus:ring-yellow-500/70 focus:border-yellow-500/70 focus:z-10`}
                                    placeholder="Confirm Password"
                                />
                            </div>
                            {errors.confirmPassword && <p className="mt-2 text-sm text-red-400">{errors.confirmPassword}</p>}
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
                                'Sign Up'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUp;
