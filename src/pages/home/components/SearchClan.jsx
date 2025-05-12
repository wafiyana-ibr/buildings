import React, { useState, useRef, useEffect } from "react";
import { getClans, getClanMembers } from "../../../api/cocAPI";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faFilter, faTrophy, faStar, faXmark, faUserPlus, faUsers, faSearch, faHistory, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { baseAPI } from "../../../api/dbAPI";
import { useAuth } from "../../../hooks/useAuth"
import getLeagueIcon from "@/helpers/getLeagueIcon";
import getTownhallIcon from "@/helpers/getTownhallIcon";
import Swal from "sweetalert2"; // Add this import for SweetAlert

const SearchClan = () => {
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [clansData, setClansData] = useState(null);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        minMembers: "",
        maxMembers: "",
        minClanLevel: "",
        warFrequency: "",
        minClanPoints: "",
        locationId: "",
        limit: "10"
    });

    // Add clan search history state
    const [clanHistories, setClanHistories] = useState(() => {
        return JSON.parse(localStorage.getItem("clanHistories")) || [];
    });

    const abortControllerRef = useRef(null);
    const timeoutRef = useRef(null);
    const [selectedClan, setSelectedClan] = useState(null);
    const [clanMembers, setClanMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [memberError, setMemberError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        if (value.length >= 3) {
            timeoutRef.current = setTimeout(() => {
                handleSearchSubmit();
            }, 500);
        } else {
            setClansData(null);
            setError(null);
            setIsLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearchSubmit = async () => {
        if (search.length < 3 || search.trim().length < 1) {
            setError("Please enter at least 4 characters to search for clans");
            return;
        }

        setIsLoading(true);
        setClansData(null);
        setError(null);

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        try {
            // Prepare search options
            const searchOptions = {
                name: search,
                limit: filters.limit || "10"
            };

            // Add filters if they have values
            if (filters.minMembers) searchOptions.minMembers = filters.minMembers;
            if (filters.maxMembers) searchOptions.maxMembers = filters.maxMembers;
            if (filters.minClanLevel) searchOptions.minClanLevel = filters.minClanLevel;
            if (filters.warFrequency) searchOptions.warFrequency = filters.warFrequency;
            if (filters.minClanPoints) searchOptions.minClanPoints = filters.minClanPoints;
            if (filters.locationId) searchOptions.locationId = filters.locationId;

            const data = await getClans(searchOptions, abortControllerRef.current.signal);
            setClansData(data);
            if (data.items && data.items.length === 0) {
                setError("No clans found matching your search criteria");
            }
        } catch (err) {
            if (err.name === "AbortError") {
                setIsLoading(false);
                return;
            }
            console.error("API Error:", err);

            if (err.response) {
                if (err.response.status === 404) {
                    setError("No clans found. Try different search terms or filters.");
                } else {
                    setError(
                        `Error: ${err.response.status} - ${err.response.data?.message || "An error occurred"}`
                    );
                }
            } else {
                setError("Failed to search for clans. Please try again later.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const resetFilters = () => {
        setFilters({
            minMembers: "",
            maxMembers: "",
            minClanLevel: "",
            warFrequency: "",
            minClanPoints: "",
            locationId: "",
            limit: "10"
        });
    };

    const handleSelectClan = async (clan) => {
        setSelectedClan(clan);
        setLoadingMembers(true);
        setClanMembers([]);
        setMemberError(null);

        try {
            const members = await getClanMembers(clan.tag);
            setClanMembers(members || []);

            // Add to search history when selecting a clan
            setClanHistories((prev) => {
                const newHistory = [...prev];
                // Check if this clan is already in history
                if (!newHistory.find((c) => c.tag === clan.tag)) {
                    // If history is full (3 items), remove oldest
                    if (newHistory.length >= 3) {
                        newHistory.pop();
                    }
                    // Add new clan to beginning of history
                    newHistory.unshift({
                        name: clan.name,
                        tag: clan.tag,
                        badge: clan.badge?.url || null
                    });
                    // Save to localStorage
                    localStorage.setItem("clanHistories", JSON.stringify(newHistory));
                }
                return newHistory;
            });

            if (members.length === 0) {
                setMemberError("No members found for this clan.");
            }
        } catch (err) {
            console.error("Error fetching clan members:", err);
            setMemberError("Failed to load clan members. Please try again.");
        } finally {
            setLoadingMembers(false);
        }
    };

    // Handle deleting a clan from history
    const handleDeleteClanHistory = (tag, e) => {
        e.stopPropagation(); // Prevent triggering parent onClick
        setClanHistories((prev) => {
            const newHistory = prev.filter((c) => c.tag !== tag);
            localStorage.setItem("clanHistories", JSON.stringify(newHistory));
            return newHistory;
        });
    };

    // Handle clicking on a clan history item - directly load members
    const handleHistoryClick = async (clanHistory) => {
        // Create a minimal clan object from history to pass to handleSelectClan
        const clan = {
            name: clanHistory.name,
            tag: clanHistory.tag,
            badge: { url: clanHistory.badge }
        };

        await handleSelectClan(clan);
    };

    const handleAddBase = async (player) => {
        if (!user) {
            // Store base data in localStorage before redirecting
            localStorage.setItem("pendingBaseAdd", JSON.stringify({
                tag: player.tag,
                name: player.name || 'Unnamed Base',
                townHallLevel: player.townHallLevel || 1
            }));

            // Navigate to sign-in with pendingBaseAdd flag
            navigate("/sign-in", {
                state: {
                    redirectUrl: "/base",
                    pendingBaseAdd: true,
                    message: "Please log in first to add this base"
                }
            });
            return;
        }

        // Show confirmation dialog
        const result = await Swal.fire({
            title: 'Add Base',
            html: `
                <div class="flex items-center justify-center mb-3">
                    <img src="${getTownhallIcon(player.townHallLevel || 1)}" alt="TH${player.townHallLevel}" class="w-12 h-12 mr-2" />
                    <span class="text-lg font-bold">${player.name}</span>
                </div>
                <p>Are you sure you want to add this base to your collection?</p>
                <p class="text-sm text-gray-500 mt-1">${player.tag}</p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, add it!',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#4F46E5',
            cancelButtonColor: '#6B7280',
        });

        // If user confirms, proceed with adding the base
        if (result.isConfirmed) {
            try {
                await baseAPI.findOrSaveBase(user.id, {
                    tag: player.tag,
                    name: player.name || 'Unnamed Base',
                    townHallLevel: player.townHallLevel || 1
                });
                const existingPlayerHistory = JSON.parse(localStorage.getItem("playerHistories") || "[]");

                // Create new history array by filtering out the current player (if exists)
                let newPlayerHistory = existingPlayerHistory.filter(p => p.tag !== player.tag);

                // Add the current player to the beginning of the array
                newPlayerHistory.unshift({
                    name: player.name,
                    tag: player.tag
                });

                // Limit to 3 items by removing the last one if needed
                if (newPlayerHistory.length > 3) {
                    newPlayerHistory.pop();
                }

                // Save updated history back to localStorage
                localStorage.setItem("playerHistories", JSON.stringify(newPlayerHistory));

                // Show success message
                Swal.fire({
                    title: 'Success!',
                    text: `Base "${player.name}" has been added to your collection`,
                    icon: 'success',
                    confirmButtonColor: '#4F46E5',
                    timer: 2000
                });

                navigate("/base");
            } catch (error) {
                console.error("Error managing base:", error);
                setMemberError(`Failed to add or update base: ${error.message}`);

                // Show error message
                Swal.fire({
                    title: 'Error',
                    text: `Failed to add base: ${error.message}`,
                    icon: 'error',
                    confirmButtonColor: '#4F46E5',
                });
            }
        }
    };

    const closeMembers = () => {
        setSelectedClan(null);
        setClanMembers([]);
        setMemberError(null);
    };

    return (
        <>
            <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-xl flex items-center border border-white/20 relative overflow-hidden group transition-all focus-within:border-yellow-400/50 focus-within:shadow-md focus-within:shadow-yellow-400/20">
                <FontAwesomeIcon icon={faSearch} className="text-yellow-400 text-lg ml-4" />
                <input
                    value={search}
                    onChange={handleSearchChange}
                    type="text"
                    placeholder="Enter clan name (min 4 characters)"
                    className="w-full bg-transparent text-white placeholder-white/70 outline-none px-4 py-3.5"
                />
                <div className="flex items-center">
                    {search && (
                        <button
                            className="text-white/50 hover:text-white/80 transition-colors px-2"
                            onClick={() => {
                                setSearch("");
                                setClansData(null);
                                setError(null);
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faCircleXmark}
                                className="text-xl"
                            />
                        </button>
                    )}
                    <button
                        className={`px-4 py-3.5 ${showFilters ? 'text-yellow-400 bg-white/10' : 'text-white/70 hover:text-white/90 hover:bg-white/5'} transition-colors`}
                        onClick={toggleFilters}
                    >
                        <FontAwesomeIcon icon={faFilter} />
                    </button>
                </div>
            </div>

            {/* Clan Search History */}
            {clanHistories.length > 0 && (
                <div className="mt-4 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-xl p-5 border border-white/20 text-white relative">
                    <div className="absolute -top-3 left-3 rounded-full px-3 py-1 text-xs bg-yellow-500 text-gray-900 font-semibold flex items-center gap-1">
                        <FontAwesomeIcon icon={faHistory} />
                        Clan History
                    </div>

                    <div className="flex flex-wrap gap-3 mt-2">
                        {clanHistories.map((clanHistory, index) => (
                            <div className="relative group/item" key={index}>
                                <button
                                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg px-3 py-2 transition-all duration-300 flex items-center gap-2 hover:border-yellow-400/30"
                                    onClick={() => handleHistoryClick(clanHistory)}
                                >
                                    {clanHistory.badge && (
                                        <img
                                            src={clanHistory.badge}
                                            alt={clanHistory.name}
                                            className="w-10 h-10"
                                        />
                                    )}
                                    <div className="text-left">
                                        <div className="font-semibold text-yellow-400">{clanHistory.name}</div>
                                        <div className="text-xs text-white/60">{clanHistory.tag}</div>
                                    </div>
                                </button>
                                <button
                                    onClick={(e) => handleDeleteClanHistory(clanHistory.tag, e)}
                                    className="absolute -top-2 -right-2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"
                                >
                                    <FontAwesomeIcon
                                        icon={faCircleXmark}
                                        className="text-lg text-red-400 bg-gray-900 rounded-full p-0.5"
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters Panel */}
            {showFilters && (
                <div className="mt-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-5 border border-white/20 text-white">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg flex items-center">
                            <FontAwesomeIcon icon={faFilter} className="text-yellow-400 mr-2" />
                            Filter Options
                        </h3>
                        <button
                            className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
                            onClick={resetFilters}
                        >
                            Reset Filters
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-white/90 mb-1 text-sm font-medium">Min Members</label>
                            <input
                                type="number"
                                name="minMembers"
                                value={filters.minMembers}
                                onChange={handleFilterChange}
                                placeholder="1-50"
                                min="1"
                                max="50"
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:border-yellow-400/50 focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-white/90 mb-1 text-sm font-medium">Max Members</label>
                            <input
                                type="number"
                                name="maxMembers"
                                value={filters.maxMembers}
                                onChange={handleFilterChange}
                                placeholder="1-50"
                                min="1"
                                max="50"
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:border-yellow-400/50 focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-white/90 mb-1 text-sm font-medium">Min Clan Level</label>
                            <input
                                type="number"
                                name="minClanLevel"
                                value={filters.minClanLevel}
                                onChange={handleFilterChange}
                                placeholder="1-30"
                                min="1"
                                max="30"
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:border-yellow-400/50 focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-white/90 mb-1 text-sm font-medium">Min Clan Points</label>
                            <input
                                type="number"
                                name="minClanPoints"
                                value={filters.minClanPoints}
                                onChange={handleFilterChange}
                                placeholder="Min points"
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:border-yellow-400/50 focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-white/90 mb-1 text-sm font-medium">War Frequency</label>
                            <select
                                name="warFrequency"
                                value={filters.warFrequency}
                                onChange={handleFilterChange}
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-yellow-400/50 focus:outline-none transition-colors"
                            >
                                <option value="">Any frequency</option>
                                <option value="always">Always</option>
                                <option value="moreThanOncePerWeek">More than once per week</option>
                                <option value="oncePerWeek">Once per week</option>
                                <option value="lessThanOncePerWeek">Less than once per week</option>
                                <option value="never">Never</option>
                                <option value="unknown">Unknown</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-white/90 mb-1 text-sm font-medium">Results Limit</label>
                            <select
                                name="limit"
                                value={filters.limit}
                                onChange={handleFilterChange}
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-yellow-400/50 focus:outline-none transition-colors"
                            >
                                <option value="5">5 results</option>
                                <option value="10">10 results</option>
                                <option value="20">20 results</option>
                                <option value="30">30 results</option>
                                <option value="50">50 results</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-5">
                        <button
                            onClick={handleSearchSubmit}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 px-4 rounded-lg font-medium transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                        >
                            <FontAwesomeIcon icon={faSearch} />
                            Apply Filters & Search
                        </button>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="mt-6 py-4 flex justify-center items-center bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-md rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="h-5 w-5 border-t-2 border-r-2 border-yellow-400 rounded-full animate-spin"></div>
                        <span className="text-white/80">Searching for clans...</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="mt-6 bg-gradient-to-r from-red-500/10 to-red-500/5 backdrop-blur-md rounded-xl p-4 border border-red-500/20 text-white">
                    <p className="text-red-400 text-center">{error}</p>
                </div>
            )}

            {/* Clans Results */}
            {clansData && clansData.length > 0 && (
                <div className="mt-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl border border-white/20 text-white overflow-hidden">
                    <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                        <h2 className="font-bold text-lg flex items-center">
                            <FontAwesomeIcon icon={faUsers} className="text-yellow-400 mr-2" />
                            Found {clansData.length} Clans
                        </h2>
                        {clansData.length > 5 && (
                            <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
                                Showing {clansData.length} results
                            </span>
                        )}
                    </div>

                    <div className="divide-y divide-white/10">
                        {clansData.map((clan) => {
                            // Define colors for labels
                            const labelColors = ['bg-red-500', 'bg-yellow-500', 'bg-green-500'];
                            // Slice labels to a maximum of 3
                            const limitedLabels = clan.labels ? clan.labels.slice(0, 3) : [];

                            return (
                                <div key={clan.tag} className="p-4 hover:bg-white/5 transition-colors">
                                    <div className="flex items-start gap-4">
                                        {/* Clan Badge */}
                                        <div className="flex-shrink-0 p-1 bg-white/5 rounded-lg border border-white/10">
                                            {clan.badge?.url && (
                                                <img
                                                    src={clan.badge.url}
                                                    alt={clan.name}
                                                    className="w-16 h-16"
                                                />
                                            )}
                                        </div>

                                        {/* Clan Info Area */}
                                        <div className="flex-1 min-w-0">
                                            {/* Row 1: Name & Labels */}
                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                {/* Name (takes remaining space) */}
                                                <div className="flex-grow min-w-0">
                                                    <h3 className="text-xl font-bold truncate text-yellow-400">{clan.name}</h3>
                                                </div>

                                                {/* Labels (Right side) */}
                                                {limitedLabels.length > 0 && (
                                                    <div className="flex gap-1 flex-shrink-0 mt-1">
                                                        {limitedLabels.map((label, index) => (
                                                            <div
                                                                key={index}
                                                                className={`${labelColors[index % labelColors.length]} p-1 rounded-full`}
                                                            >
                                                                <img
                                                                    src={label.iconUrls.small}
                                                                    alt="Clan Label"
                                                                    className="h-6 w-6"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Clan Metadata Badges */}
                                            <div className="flex flex-wrap gap-2 my-2">
                                                <span className="inline-flex items-center rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-medium text-indigo-400 border border-indigo-500/30">
                                                    Level {clan.level}
                                                </span>
                                                <span className="inline-flex items-center rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-medium text-blue-400 border border-blue-500/30">
                                                    <img
                                                        src={`${import.meta.env.VITE_ASSETS_URL}/trophy/trophy.png`}
                                                        alt="Trophy"
                                                        className="inline h-3 w-3 mr-1"
                                                    />
                                                    {clan.points}
                                                </span>
                                                <span className="inline-flex items-center rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-400 border border-green-500/30">
                                                    <FontAwesomeIcon icon={faUsers} className="mr-1 text-xs" />
                                                    {clan.memberCount}/50
                                                </span>
                                                {clan.location && (
                                                    <span className="inline-flex items-center rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-medium text-purple-400 border border-purple-500/30">
                                                        {clan.location.name}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Clan Tag */}
                                            <div className="text-white/70 text-sm mb-3">
                                                {clan.tag}
                                            </div>

                                            {/* Add Select Clan Button */}
                                            <button
                                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-blue-500/20"
                                                onClick={() => handleSelectClan(clan)}
                                            >
                                                <FontAwesomeIcon icon={faUsers} />
                                                <span>View Members</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Clan Members Modal with improved styling */}
            {selectedClan && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-white/20 shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-5 border-b border-white/10 bg-white/5">
                            <div className="flex items-center gap-4">
                                {selectedClan.badge?.url && (
                                    <img
                                        src={selectedClan.badge.url}
                                        alt={selectedClan.name}
                                        className="w-12 h-12 bg-white/5 p-1 rounded-lg border border-white/10"
                                    />
                                )}
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedClan.name}</h3>
                                    <p className="text-white/70 text-sm">{selectedClan.tag}</p>
                                </div>
                            </div>
                            <button
                                className="text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition-colors"
                                onClick={closeMembers}
                            >
                                <FontAwesomeIcon icon={faXmark} className="text-xl" />
                            </button>
                        </div>

                        {/* Modal Body - Member List */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
                            {loadingMembers ? (
                                <div className="flex justify-center items-center h-40">
                                    <div className="h-8 w-8 border-t-2 border-r-2 border-yellow-400 rounded-full animate-spin mr-3"></div>
                                    <span className="text-white/70 text-lg">Loading clan members...</span>
                                </div>
                            ) : memberError ? (
                                <div className="text-red-400 text-center p-6 bg-red-500/10 rounded-xl border border-red-500/20">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl mb-2" />
                                    <p>{memberError}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center mb-5">
                                        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <FontAwesomeIcon icon={faUsers} className="text-yellow-400" />
                                            Clan Members
                                            <span className="bg-white/10 text-white/80 text-sm px-2 py-0.5 rounded-full ml-2">
                                                {clanMembers.length}
                                            </span>
                                        </h4>
                                        <div className="text-xs text-white/60">
                                            Click "Add Base" to add a player to your collection
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {clanMembers.map((member) => (
                                            <div key={member.tag} className="bg-gradient-to-r from-white/5 to-transparent rounded-xl p-4 border border-white/10 flex justify-between items-center gap-4 transition-all duration-300 hover:border-white/20 hover:bg-white/5">
                                                {/* Left Section: Town Hall Icon, Name, and Info Block */}
                                                <div className="flex items-start flex-grow min-w-0">
                                                    {/* Town Hall Icon (using the provided function) */}
                                                    <div className="mr-3 flex-shrink-0 p-1 bg-white/5 rounded-lg border border-white/10">
                                                        <img
                                                            src={getTownhallIcon(member.townHallLevel || 1)}
                                                            alt={`TH${member.townHallLevel || 1}`}
                                                            className="w-10 h-10"
                                                        />
                                                    </div>

                                                    <div className="min-w-0">
                                                        {/* Player Name with League Icon next to it */}
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold text-white truncate">{member.name}</p>
                                                            {/* League Icon moved here */}
                                                            <img
                                                                src={getLeagueIcon(member.trophies)}
                                                                alt="League"
                                                                className="inline h-5 w-5"
                                                            />
                                                        </div>

                                                        {/* Stats below Name (arranged as requested) */}
                                                        <div className="mt-1 text-sm text-white/70 flex flex-col gap-1">
                                                            {/* Line 1: Exp Level & Tag */}
                                                            <div className="flex items-center gap-x-3 flex-wrap">
                                                                {/* Exp Level */}
                                                                <span className="flex-shrink-0">Lv: <span className="font-semibold text-white">{member.expLevel}</span></span>
                                                                {/* Tag */}
                                                                <span className="flex-shrink-0">Tag: <span className="font-semibold text-white truncate">{member.tag}</span></span>
                                                                <span className="flex-shrink-0"><span className="text-white truncate">{member.role.charAt(0).toUpperCase() + member.role.slice(1).toLowerCase()}</span></span>
                                                            </div>

                                                            {/* Line 2: Trophies & Builder Base Trophies */}
                                                            <div className="flex items-center gap-x-3 flex-wrap min-w-0">
                                                                {/* Regular Trophies */}
                                                                <span className="flex items-center flex-shrink-0 flex-wrap">
                                                                    {/* Trophy Icon */}
                                                                    <img
                                                                        src={`${import.meta.env.VITE_ASSETS_URL}/trophy/trophy.png`}
                                                                        alt="Trophy"
                                                                        className="inline h-4 w-4 mr-1"
                                                                    />
                                                                    <span className="font-semibold text-white">{member.trophies}</span>
                                                                </span>

                                                                {/* Builder Base Trophies */}
                                                                <span className="flex items-center flex-shrink-0 flex-wrap">
                                                                    <img
                                                                        src={`${import.meta.env.VITE_ASSETS_URL}/trophy/builder-base-trophy.webp`}
                                                                        alt="Builder Base Trophy"
                                                                        className="inline h-4 w-4 mr-1"
                                                                    />
                                                                    <span className="font-semibold text-white">{member.builderBaseTrophies}</span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-shrink-0">
                                                    <button
                                                        className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 
                                                            ${!user
                                                                ? "bg-gradient-to-r from-blue-600/70 to-blue-700/70 text-white/90"
                                                                : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-green-600/20"
                                                            } transition-all duration-300`}
                                                        onClick={() => handleAddBase(member)}
                                                        title={!user ? "Sign-in required" : "Add this base"}
                                                    >
                                                        <FontAwesomeIcon icon={faUserPlus} />
                                                        {!user ? "Sign-in to Add" : "Add Base"}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SearchClan;
