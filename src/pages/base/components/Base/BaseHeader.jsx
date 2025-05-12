import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSpinner, faShield, faHome, faBuilding, faBomb, faXmarksLines, faRefresh, 
    faCircleExclamation, faInfoCircle, faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'react-tooltip';
import cocAPI from '@/api/cocAPI';
import { updateBaseFromApiData } from '@/utils/updateApiCoc';

// Helper function to calculate percentage
const calculatePercentage = (current, max) => {
    if (max === 0) return 100; // Avoid division by zero if nothing is required
    return Math.min(100, Math.max(0, Math.round((current / max) * 100)));
};

const BaseHeader = ({ processedObjectData, wallData, base }) => {
    const { id } = useParams();
    const [apiUpdateLoading, setApiUpdateLoading] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');
    const tag = id.startsWith('#') ? id : `#${id}`; // Ensure tag starts with '#'
    // Expanded state for detailed progress percentages (levels)
    const [progressStats, setProgressStats] = useState({
        // Building Categories
        defenses: { current: 0, max: 0, percentage: 0 },
        resources: { current: 0, max: 0, percentage: 0 },
        army: { current: 0, max: 0, percentage: 0 },
        traps: { current: 0, max: 0, percentage: 0 },
        // Walls
        walls: { current: 0, max: 0, percentage: 0 },
    });

    const urlAssets = import.meta.env.VITE_ASSETS_URL || 'http://localhost:3000/assets';
    const thLevel = base?.wafi_th_level || 2;

    // Generate TH image URL
    const thImageUrl = `${urlAssets}/th/th-${thLevel}.png`;

    // Calculate progress and completion percentages
    useEffect(() => {
        if (processedObjectData) {
            calculateDetailedProgress(); // Calculate level-based progress
        }
    }, [processedObjectData, base, thLevel]);

    // Enhanced ProgressBar component with tooltip using react-tooltip
    const ProgressBar = ({ label, percentage, icon, type }) => {
        const tooltipId = `tooltip-${type}`;
        
        // Function to get tooltip descriptions
        const getTooltipDescription = () => {
            switch(type) {
                case 'defenses':
                    return "Total progress of all defensive buildings like Cannons, Archer Towers, etc.";
                case 'resources':
                    return "Total progress of resource buildings like Gold Mines, Elixir Collectors, etc.";
                case 'army':
                    return "Total progress of army buildings like Barracks, Camps, etc.";
                case 'traps':
                    return "Total progress of all trap buildings like Bombs, Spring Traps, etc.";
                case 'walls':
                    return "Total wall progress including all wall segments and levels.";
                default:
                    return "";
            }
        };
        
        return (
            <div>
                <div className="flex justify-between items-center text-xs mb-1">
                    <span className="flex items-center gap-1.5">
                        {icon && <FontAwesomeIcon icon={icon} className="w-3 h-3 text-white/60" />}
                        {label}
                    </span>
                    <div className="flex items-center">
                        <span>{percentage}%</span>
                        <FontAwesomeIcon 
                            icon={faQuestionCircle} 
                            className="ml-1 text-white/60 hover:text-white/90 text-xs cursor-help"
                            data-tooltip-id={tooltipId}
                        />
                    </div>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full w-full overflow-hidden">
                    <div
                        className="h-1.5 bg-blue-500 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
                
                {/* React Tooltip */}
                <Tooltip id={tooltipId} place="top" className="z-50 max-w-60">
                    <div className="text-xs p-1">
                        <p className="font-bold mb-1">{label} Progress Details</p>
                        <div className="flex justify-between text-sm">
                            <span>Current: {progressStats[type].current}</span>
                            <span>Maximum: {progressStats[type].max}</span>
                        </div>
                        <p className="mt-1 text-xs text-white/80">
                            {getTooltipDescription()}
                        </p>
                    </div>
                </Tooltip>
            </div>
        );
    };

    // Handle API update using the separated function
    const handleApiUpdate = async () => {
        try {
            setApiUpdateLoading(true);
            setUpdateMessage('');

            const playerDataResult = await cocAPI.getPlayer(id);
            if (!playerDataResult) {
                throw new Error("Failed to fetch player data from API.");
            }
            console.log(playerDataResult)
            const result = await updateBaseFromApiData(base.wafi_id, playerDataResult);
            setUpdateMessage(result.message);

            if (result.success) {
                // Reload the page to refresh data
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (error) {
            console.error("Error in API update handler:", error);
            setUpdateMessage(`Error updating: ${error.message}`);
        } finally {
            setApiUpdateLoading(false);
        }
    };

    // New function to calculate detailed level-based progress
    const calculateDetailedProgress = () => {
        const newProgress = {
            defenses: { current: 0, max: 0 },
            resources: { current: 0, max: 0 },
            army: { current: 0, max: 0 },
            traps: { current: 0, max: 0 },
            walls: { current: 0, max: 0 },
        };

        // Calculate Building Progress based on levels according to new structure
        if (processedObjectData) {
            // Process Defenses
            if (processedObjectData.Defenses) {
                Object.entries(processedObjectData.Defenses).forEach(([buildingName, buildings]) => {
                    buildings.forEach(building => {
                        newProgress.defenses.current += building.wafi_level || 0;
                        newProgress.defenses.max += building.wafi_max_level_th || 1;
                    });
                });
            }

            // Process Resources
            if (processedObjectData.Resources) {
                Object.entries(processedObjectData.Resources).forEach(([buildingName, buildings]) => {
                    buildings.forEach(building => {
                        newProgress.resources.current += building.wafi_level || 0;
                        newProgress.resources.max += building.wafi_max_level_th || 1;
                    });
                });
            }

            // Process Army
            if (processedObjectData.Army) {
                Object.entries(processedObjectData.Army).forEach(([buildingName, buildings]) => {
                    buildings.forEach(building => {
                        newProgress.army.current += building.wafi_level || 0;
                        newProgress.army.max += building.wafi_max_level_th || 1;
                    });
                });
            }

            // Process Traps
            if (processedObjectData.Traps) {
                Object.entries(processedObjectData.Traps).forEach(([buildingName, buildings]) => {
                    buildings.forEach(building => {
                        newProgress.traps.current += building.wafi_level || 0;
                        newProgress.traps.max += building.wafi_max_level_th || 1;
                    });
                });
            }

            // Process Walls - updated for new wall structure
            if (processedObjectData.Walls && processedObjectData.Walls.Wall) {
                const walls = processedObjectData.Walls.Wall;

                // Get the maximum wall level for current TH
                const maxWallLevel = walls.length > 0 ? walls[0].wafi_max_level_th || 1 : 1;

                // Get the total wall count
                const totalWallPieces = walls.length > 0 ? walls[0].wafi_wall_count_max || 0 : 0;

                // Maximum possible progress (all walls at max level)
                newProgress.walls.max = totalWallPieces * maxWallLevel;

                // Calculate current progress
                walls.forEach(wallInstance => {
                    newProgress.walls.current += (wallInstance.wafi_wall_count || 0) * (wallInstance.wafi_level || 0);
                });
            }
        }

        Object.keys(newProgress).forEach(key => {
            newProgress[key].percentage = calculatePercentage(newProgress[key].current, newProgress[key].max);
        });

        setProgressStats(newProgress);
    };


    return (
        <div className="bg-white/10 rounded-lg p-4 mb-6 border border-white/10">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* TH Image with Tooltip */}
                <div className="relative min-w-20 min-h-20">
                    <div className="relative">
                        <img 
                            src={thImageUrl} 
                            alt={`Town Hall ${thLevel}`} 
                            className="w-20 h-20"
                            data-tooltip-id="th-tooltip"
                        />
                        <button className="absolute top-0 right-0 p-0.5">
                            <FontAwesomeIcon 
                                icon={faInfoCircle} 
                                className="text-yellow-400"
                                data-tooltip-id="th-tooltip"
                            />
                        </button>
                    </div>
                    
                    {/* Town Hall Tooltip */}
                    <Tooltip id="th-tooltip" place="bottom" className="z-50 max-w-60">
                        <div className="text-xs p-1">
                            <p className="font-bold mb-1">Town Hall Level {thLevel}</p>
                            <p className="mb-1">
                                This base has Town Hall level {thLevel} which unlocks certain buildings and upgrades.
                            </p>
                            {thLevel >= 12 && (
                                <p className="mt-1">
                                    Town Hall {thLevel} has Giga Inferno/Tesla weapon functionality.
                                </p>
                            )}
                            <div className="mt-2 text-yellow-400 text-xs">
                                Update Town Hall level using the Update API button.
                            </div>
                        </div>
                    </Tooltip>
                </div>

                {/* Player Info */}
                <div className="flex-grow">
                    <div className="flex items-center justify-between">
                        <div className='flex items-center gap-2'>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                {base?.wafi_name || "Base"}
                            </h1>
                            <span className=''>→ Town Hall {thLevel}</span>
                        </div>
                        {/* API Update Button with Info Tooltip */}
                        <div className="flex items-center relative">
                            <button
                                onClick={handleApiUpdate}
                                disabled={apiUpdateLoading}
                                className={`px-3 py-1 text-sm rounded-lg flex items-center gap-1.5 transition-colors ${apiUpdateLoading
                                    ? "bg-gray-700 text-white/50 cursor-not-allowed"
                                    : "bg-blue-500 hover:bg-blue-600 text-white"
                                    }`}
                                title="Update base data from API"
                            >
                                <FontAwesomeIcon icon={apiUpdateLoading ? faSpinner : faRefresh}
                                    className={apiUpdateLoading ? "animate-spin" : ""} />
                                <span>{apiUpdateLoading ? "Updating..." : "Update API"}</span>
                            </button>
                            
                            {/* Info Icon with Tooltip */}
                            <FontAwesomeIcon 
                                icon={faCircleExclamation} 
                                className="ml-2 text-yellow-400 hover:text-yellow-300 cursor-help"
                                data-tooltip-id="api-update-tooltip"
                            />
                            
                            {/* API Update Info Tooltip */}
                            <Tooltip id="api-update-tooltip" place="left" className="z-50 max-w-64">
                                <div className="text-xs p-1">
                                    <p className="font-bold mb-1 flex items-center gap-1.5">
                                        <FontAwesomeIcon icon={faInfoCircle} />
                                        API Update Information
                                    </p>
                                    <p className="mb-1">
                                        This will automatically update specific buildings data from the COC API:
                                    </p>
                                    <ul className="list-disc pl-4 space-y-0.5">
                                        <li>Town Hall level & weapon level</li>
                                        <li>Clan Castle</li>
                                        <li>Barracks & Dark Barracks</li>
                                        <li>Spell Factory & Dark Spell Factory</li>
                                        <li>Workshop</li>
                                        <li>Blacksmith</li>
                                        <li>Pet House</li>
                                    </ul>
                                </div>
                            </Tooltip>
                        </div>
                    </div>

                    {updateMessage && (
                        <div className={`text-sm mt-1 mb-2 ${updateMessage.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                            {updateMessage}
                        </div>
                    )}

                    <div className="text-white/70 text-sm mt-1">
                        <span>{base?.wafi_tag || id}</span>
                    </div>

                    {/* Updated Progress Bars Section - with tooltips */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3 mt-3">
                        {/* Building Categories */}
                        <ProgressBar 
                            label="Defenses" 
                            percentage={progressStats.defenses.percentage} 
                            icon={faShield} 
                            type="defenses" 
                        />
                        <ProgressBar 
                            label="Resources" 
                            percentage={progressStats.resources.percentage} 
                            icon={faHome} 
                            type="resources" 
                        />
                        <ProgressBar 
                            label="Army" 
                            percentage={progressStats.army.percentage} 
                            icon={faBuilding} 
                            type="army" 
                        />
                        {thLevel >= 3 && (
                            <ProgressBar 
                                label="Traps" 
                                percentage={progressStats.traps.percentage} 
                                icon={faBomb} 
                                type="traps" 
                            />
                        )}
                        {/* Walls */}
                        <ProgressBar 
                            label="Walls" 
                            percentage={progressStats.walls.percentage} 
                            icon={faXmarksLines} 
                            type="walls" 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BaseHeader;
