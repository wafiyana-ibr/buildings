import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { baseAPI } from "@/api/dbAPI";
import { useAuth } from "@/hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faQuestionCircle, faCheckCircle, faExclamationTriangle, faLayerGroup, faSearch } from "@fortawesome/free-solid-svg-icons";
import BaseCard from "./components/Bases/BaseCard";

const Bases = () => {
    const [playerBases, setPlayerBases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchBases = async () => {
            try {
                const bases = await baseAPI.getUserBases(user.id);
                setPlayerBases(bases);
            } catch (err) {
                console.error("Error fetching bases:", err);
                setError("Failed to load bases. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        const handlePendingBaseAdd = async () => {
            const pendingBaseAdd = localStorage.getItem("pendingBaseAdd");
            const shouldAddBase =
                location.search.includes('addPendingBase=true') ||
                location.state?.addPendingBase;

            if (pendingBaseAdd && user) {
                try {
                    const baseData = JSON.parse(pendingBaseAdd);

                    // Validate townHallLevel before adding
                    if (baseData.townHallLevel <= 2 || baseData.townHallLevel >= 16) {
                        setNotification({
                            type: 'error',
                            message: `Cannot add base: We only support Town Hall levels 3 to 15.`
                        });
                        localStorage.removeItem("pendingBaseAdd");
                        return;
                    }

                    // Add the base to the user's account
                    const addedBase = await baseAPI.findOrSaveBase(user.id, baseData);

                    // If the base was added successfully, show a notification and refresh the base list
                    setNotification({
                        type: 'success',
                        message: `Successfully added base: ${baseData.name}`
                    });

                    // Refresh the base list to include the new base
                    fetchBases();

                    // Clear the pending base from localStorage
                    localStorage.removeItem("pendingBaseAdd");

                    // Remove the query parameter without page refresh
                    if (location.search.includes('addPendingBase=true')) {
                        navigate('/base', { replace: true });
                    }
                } catch (error) {
                    console.error("Error adding pending base:", error);
                    setNotification({
                        type: 'error',
                        message: `Failed to add base: ${error.message || 'Unknown error'}`
                    });
                    localStorage.removeItem("pendingBaseAdd");
                }
            }
        };

        if (user && user.id) {
            fetchBases();
            // Handle pending base add after fetching base list
            handlePendingBaseAdd();
        }
    }, [user, location, navigate]);

    // Clear notification after 5 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleDeleteBase = async (baseId) => {
        try {
            await baseAPI.deleteBase(baseId, user.id);

            // Update the local state to remove the deleted base
            setPlayerBases(prevBases =>
                prevBases.filter(base => base.wafi_id !== baseId)
            );

            setNotification({
                type: 'success',
                message: 'Base deleted successfully'
            });
        } catch (err) {
            console.error("Error deleting base:", err);
            setNotification({
                type: 'error',
                message: 'Failed to delete base. Please try again.'
            });
        }
    };

    const handleAddNewBase = () => {
        // Navigate to home page and then scroll to search section after page loads
        navigate('/', { replace: true });
        
        // Schedule scrolling to the search section after navigation completes
        setTimeout(() => {
            const searchSection = document.getElementById('search');
            if (searchSection) {
                searchSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="flex flex-col items-center">
                    <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-yellow-400 rounded-full mb-4"></div>
                    <p className="text-white/70">Loading your bases...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto my-20 sm:my-40 px-4 relative">
            {/* Decorative elements */}
            <div className="absolute -top-20 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl -z-10"></div>

            {/* Header Section */}
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-bold text-white mb-4 relative inline-block">
                    My Bases
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
                </h1>
                <p className="text-white/80 max-w-2xl mx-auto">
                    Manage your Clash of Clans bases, track upgrade progress, and optimize your village
                </p>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${notification.type === 'success'
                        ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                        : 'bg-red-500/20 border border-red-500/40 text-red-400'
                    } animate-fade-in`}>
                    <div className="flex items-center">
                        <FontAwesomeIcon
                            icon={notification.type === 'success' ? faCheckCircle : faExclamationTriangle}
                            className="mr-3 text-xl"
                        />
                        <span className="font-medium">{notification.message}</span>
                    </div>
                    <button
                        onClick={() => setNotification(null)}
                        className="text-white/70 hover:text-white"
                    >
                        &times;
                    </button>
                </div>
            )}

            {/* Error state */}
            {error && !notification && (
                <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-white">
                    <div className="flex items-center">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="mr-3 text-xl text-red-400" />
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {/* Actions Row */}
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/10">
                <div className="flex items-center text-white">
                    <FontAwesomeIcon icon={faLayerGroup} className="text-yellow-400 mr-3 text-xl" />
                    <div>
                        <h2 className="text-lg font-semibold">Base Collection</h2>
                        <p className="text-sm text-white/70">Select a base to view details or add a new one</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleAddNewBase}
                        className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white py-2.5 px-4 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-yellow-500/30"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        <span>Add New Base</span>
                    </button>
                </div>
            </div>

            {playerBases.length === 0 ? (
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-lg p-12 border border-white/20 text-center">
                    <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                        <FontAwesomeIcon icon={faQuestionCircle} size="2x" className="text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Bases Found</h3>
                    <p className="text-white/70 mb-6 max-w-md mx-auto">
                        You haven't added any bases to your collection yet. Add a base to start tracking your progress.
                    </p>
                    <button
                        onClick={handleAddNewBase}
                        className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white py-3 px-6 rounded-lg flex items-center gap-2 mx-auto transition-all duration-300 shadow-md hover:shadow-yellow-500/30"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        <span>Add Your First Base</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {playerBases.map((base) => (
                        <BaseCard
                            key={base.wafi_tag}
                            base={base}
                            onDelete={() => handleDeleteBase(base.wafi_id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Bases;