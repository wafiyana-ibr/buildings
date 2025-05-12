import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft, faSpinner, faExclamationTriangle, faBuilding,
    faUser, faShield, faHome, faBomb, faChartBar,
    faListCheck, faXmarksLines, faEdit, faCamera, faRocket, faCalculator
} from "@fortawesome/free-solid-svg-icons";
import { baseAPI, objectAPI } from "@/api/dbAPI";
import BuildingsTab from './components/Base/BuildingsTab';
import PlayerInfo from './components/Base/PlayerInfoTab';
import BaseHeader from './components/Base/BaseHeader';
import ProgressTab from "./components/Base/ProgressTab";
import WallsTab from "./components/Base/WallsTab";
import UpgradePriorityTab from "./components/Base/UpgradePriorityTab";
import ResourcePlanner from "./components/Base/ResourcePlanner";
import { Tooltip } from "react-tooltip";
import { useAuth } from "@/hooks/useAuth";
// Import shared utility functions
import { initializeBuildingUtilsWafi } from "@/utils/initializeBuildingUtils"; // Corrected import
import { processBuildingsWafi } from "@/utils/processBuildingsWafi";
import cocAPI from "@/api/cocAPI";
import { getBuildingPriority } from "@/helpers/getPriority";
// Define tab configuration in one place for easy management
const TABS = {
    defenses: {
        name: "Defenses",
        icon: faShield,
        minTH: 1,
        component: (props) => <BuildingsTab {...props} tabTitle="Defenses" icon={faShield} />
    },
    traps: {
        name: "Traps",
        icon: faBomb,
        minTH: 3,
        component: (props) => <BuildingsTab {...props} tabTitle="Traps" icon={faBomb} />
    },
    resources: {
        name: "Resources",
        icon: faHome,
        minTH: 1,
        component: (props) => <BuildingsTab {...props} tabTitle="Resources" icon={faHome} />
    },
    army: {
        name: "Army",
        icon: faBuilding,
        minTH: 1,
        component: (props) => <BuildingsTab {...props} tabTitle="Army" icon={faBuilding} />
    },
    walls: {
        name: "Walls",
        icon: faXmarksLines,
        minTH: 2,
        component: (props) => <WallsTab {...props} tabTitle="Walls" icon={faXmarksLines} />
    },
    progress: {
        name: "Progress",
        icon: faListCheck,
        minTH: 1,
        component: (props) => <ProgressTab {...props} />
    },
    priority: {
        name: "Upgrade Priority",
        icon: faRocket,
        minTH: 1,
        component: (props) => <UpgradePriorityTab {...props} />
    },
    planner: {
        name: "Resource Planner",
        icon: faCalculator,
        minTH: 1,
        component: (props) => <ResourcePlanner {...props} />
    },
    playerinfo: {
        name: "Player Info",
        icon: faChartBar,
        minTH: 1,
        component: (props) => <PlayerInfo {...props} />
    }
};

const Base = () => {
    const { id } = useParams();
    const tag = id.startsWith('#') ? id : `#${id}`;
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // State management
    const [isLoadingBase, setIsLoadingBase] = useState(true);
    const [isLoadingPlayer, setIsLoadingPlayer] = useState(false);
    const [error, setError] = useState(null);
    const [isBaseExists, setIsBaseExists] = useState(false);
    const [base, setBase] = useState(null);
    const [dbObjectData, setDbObjectData] = useState([]);
    const [processedObjectData, setProcessedObjectData] = useState(null);
    const [activeTab, setActiveTab] = useState("defenses");
    const [playerData, setPlayerData] = useState(null);
    // Function to get tab name from URL hash
    const getTabFromHash = () => {
        const hash = location.hash.replace('#', '').toLowerCase();
        return hash && TABS[hash] ? hash : 'defenses';
    };

    // Update URL hash when tab changes
    const updateUrlHash = (tabName) => {
        if (typeof window !== 'undefined') {
            window.location.hash = tabName;
        }
    };

    // Handler for tab clicks - updates active tab and URL hash
    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        updateUrlHash(tabName);
    };

    // Set active tab based on URL hash
    useEffect(() => {
        setActiveTab(getTabFromHash());
    }, [location.hash]);

    // Fetch base and player data
    useEffect(() => {
        const fetchBaseData = async () => {
            setIsLoadingBase(true);
            try {
                // Fetch base data
                const baseData = await baseAPI.getUserBaseByTag(user.id, tag);

                // Update base state first
                setBase(baseData);
                setIsBaseExists(true);

                // If we have base data, fetch object data
                if (baseData && baseData.wafi_id) {
                    try {
                        // Try to get existing objects
                        let objectsData = [];
                        try {
                            objectsData = await objectAPI.getObject(baseData.wafi_id);
                        } catch (objFetchError) {
                            objectsData = [];
                        }

                        // Check if we need to initialize buildings
                        if (objectsData.length === 0) {
                            try {
                                // Initialize buildings with level 0 (without player data for now)
                                const initResult = await initializeBuildingUtilsWafi(
                                    baseData.wafi_id,
                                    baseData.wafi_th_level,
                                    null // We'll update this later if player data becomes available
                                );

                                if (initResult) {
                                    try {
                                        const refreshedData = await objectAPI.getObject(baseData.wafi_id);
                                        setDbObjectData(refreshedData);
                                    } catch (refreshError) {
                                        console.error("Terjadi kesalahan saat mengambil data objek setelah inisialisasi:", refreshError);
                                    }
                                }
                            } catch (initError) {
                                console.error("Terjadi kesalahan saat inisialisasi bangunan:", initError);
                            }
                        } else {
                            setDbObjectData(objectsData);
                        }
                    } catch (objError) {
                        console.error("Terjadi kesalahan saat memproses data objek:", objError);
                    }
                } else {
                    setError("Data base tidak ditemukan atau tidak valid");
                    setIsBaseExists(false);
                }
            } catch (err) {
                console.error("Terjadi kesalahan saat mengambil data:", err);
                setError(err.response?.data?.message || "Gagal mengambil data");
                setIsBaseExists(false);
            } finally {
                setIsLoadingBase(false);
            }
        };

        const fetchPlayerData = async () => {
            setIsLoadingPlayer(true);
            try {
                // Fetch player data in parallel, but don't block rendering
                const playerData = await cocAPI.getPlayer(tag);
                setPlayerData(playerData);

                // If we have player data and objects already initialized, we can update them
                if (playerData && base && base.wafi_id) {
                    // This could trigger a refresh of objects if needed based on player data
                    // Or implement additional logic to update objects with player data
                }
            } catch (playerError) {
                console.warn("Player data could not be fetched:", playerError);
                // Continue without player data - this won't block the UI
            } finally {
                setIsLoadingPlayer(false);
            }
        };

        if (user && user.id && tag) {
            // Start base data fetch - this controls the loading state
            fetchBaseData();

            // Start player data fetch in parallel - this doesn't block the UI
            fetchPlayerData();
        }
    }, [user?.id, tag]);

    // Process building data when base and dbObjectData are available
    useEffect(() => {
        // Hanya proses jika base ada dan memiliki level TH yang valid
        if (base && base.wafi_th_level) {
            // Reset processedObjectData ke struktur kosong terlebih dahulu
            const emptyProcessedData = {
                Defenses: {},
                Traps: {},
                Resources: {},
                Army: {},
                Walls: {}
            };

            // Tetapkan data kosong terlebih dahulu untuk menghindari bug rendering
            setProcessedObjectData(emptyProcessedData);

            // Hanya proses jika ada data objek
            if (Array.isArray(dbObjectData) && dbObjectData.length > 0) {
                try {
                    const processedData = processBuildingsWafi(dbObjectData, base.wafi_th_level);
                    setProcessedObjectData(processedData);
                } catch (err) {
                    console.error("Terjadi kesalahan saat memproses data bangunan:", err);
                }
            }
        }
    }, [base, dbObjectData]);

    const handleUpdateLevel = async (objectId, newLevel) => {
        try {
            if (newLevel < 0) {
                console.error("Level tidak valid:", newLevel);
                return;
            }
            await objectAPI.updateObjectLevel(objectId, newLevel);
            setDbObjectData((prevData) =>
                prevData.map((obj) => (obj.wafi_id === objectId ? { ...obj, wafi_level: newLevel } : obj))
            );
        } catch (error) {
            console.error("Error updating building level:", error);
        }
    };

    // Loading state - only dependent on base loading, not player data
    if (isLoadingBase) {
        return (
            <div className="my-20 p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate("/base")}
                        className="flex items-center gap-2 text-white/70 hover:text-white"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        <span>Kembali</span>
                    </button>
                </div>
                <div className="text-center py-10">
                    <FontAwesomeIcon icon={faSpinner} spin className="text-white text-4xl mb-4" />
                    <p>Memuat data pemain...</p>
                </div>
            </div>
        );
    }

    // Error state - base not found
    if (!isBaseExists) {
        return (
            <div className="my-28 p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate("/base")}
                        className="flex items-center gap-2 text-white/70 hover:text-white"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        <span>Kembali</span>
                    </button>
                </div>
                <div className="text-center py-10">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-400 text-4xl mb-4" />
                    <h2 className="text-xl font-bold">Base tidak ditemukan</h2>
                    <p className="text-white/70 mt-2">Base dengan tag {tag} tidak terdaftar di sistem.</p>
                </div>
            </div>
        );
    }

    // Prepare common props for all tabs
    const commonTabProps = {
        base,
        onUpdateLevel: handleUpdateLevel,
        processedObjectData,
        setBase
    };

    // Get current tab component
    const TabComponent = TABS[activeTab]?.component;

    // Get tab data for the current tab
    const getTabData = () => {
        if (activeTab === 'defenses') return { ...commonTabProps, objectData: processedObjectData?.Defenses };
        if (activeTab === 'traps') return { ...commonTabProps, objectData: processedObjectData?.Traps };
        if (activeTab === 'resources') return { ...commonTabProps, objectData: processedObjectData?.Resources };
        if (activeTab === 'army') return { ...commonTabProps, objectData: processedObjectData?.Army };
        if (activeTab === 'walls') return { ...commonTabProps, objectData: processedObjectData?.Walls?.Wall };
        if (activeTab === 'playerinfo') return { base, playerData };
        if (activeTab === 'progress') return { base, processedObjectData };
        if (activeTab === 'priority') return { base, processedObjectData }; 
        if (activeTab === 'planner') return { 
            upgradableBuildings: processedObjectData ? getUpgradableBuildings(processedObjectData) : [],
            activeMode: "max", 
            thLevel: base?.wafi_th_level || 1
        };
        return commonTabProps;
    };

    // Helper function to convert processedObjectData to upgradableBuildings format for the ResourcePlanner
    const getUpgradableBuildings = (processedData) => {
        if (!processedData) return [];
        
        const buildingsToUpgrade = [];
        
        // For each category (Defenses, Resources, etc.)
        Object.entries(processedData).forEach(([category, buildingTypes]) => {
            // For each building type (e.g., Cannon, Archer Tower)
            Object.entries(buildingTypes).forEach(([buildingName, instances]) => {
                // Get priority for this building
                const priority = getBuildingPriority(buildingName);
                
                // Skip if there are no instances
                if (!instances || !instances.length) return;
                
                // Add to list of buildings to upgrade
                buildingsToUpgrade.push({
                    name: buildingName,
                    priority: priority,
                    instances: instances,
                    category: category
                });
            });
        });
        
        return buildingsToUpgrade;
    };

    return (
        <div className="w-full p-4 my-22 sm:my-26 bg-white/10 rounded-lg border border-white/20 text-white">
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate("/base")}
                    className="flex items-center gap-2 text-white/70 hover:text-white text-base"
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    <span>Kembali</span>
                </button>

                <div className="flex gap-2">
                    <Link
                        to={`/base/${id}/scan`}
                        className="bg-green-600 hover:bg-green-700 text-white py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 text-sm transition-colors"
                    >
                        <FontAwesomeIcon icon={faCamera} />
                        <span className="hidden md:inline">Scan Base</span>
                    </Link>
                    <Link
                        to={`/base/${id}/edit`}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 text-sm transition-colors"
                    >
                        <FontAwesomeIcon icon={faEdit} />
                        <span className="hidden md:inline">Edit Base Manually</span>
                    </Link>
                </div>
            </div>

            {/* Base Header with upgrade progress */}
            <BaseHeader
                base={base}
                processedObjectData={processedObjectData}
            />

            {/* Tab Navigation - Only show if we should display tabs */}
            <div className="flex space-x-1 mb-6 bg-white/5 p-1 rounded-lg overflow-x-auto">
                {Object.entries(TABS).map(([key, tab]) => {
                    // Only show tab if TH level requirement is met
                    if (base && tab.minTH > base.wafi_th_level) return null;

                    return (
                        <button
                            key={key}
                            onClick={() => handleTabClick(key)}
                            className={`flex items-center gap-2 justify-center px-3 py-2 rounded-md transition-all ${activeTab === key
                                ? "bg-yellow-400 text-gray-900 font-medium"
                                : "hover:bg-white/10 text-white/70 hover:text-white"
                                }`}
                            data-tooltip-id="tab-tooltip"
                            data-tooltip-content={tab.name}
                        >
                            <FontAwesomeIcon icon={tab.icon} className="text-lg" />
                            <span className="hidden lg:block">{tab.name}</span>
                        </button>
                    );
                })}

                <Tooltip id="tab-tooltip" className="z-50" />
            </div>

            {/* Tab Content - Render the current tab component */}
            <div className="tab-content">
                {TabComponent && <TabComponent {...getTabData()} />}
            </div>

        </div>
    );
};

export default Base;
