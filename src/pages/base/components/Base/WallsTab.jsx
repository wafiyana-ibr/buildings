import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faXmarksLines, faExclamationTriangle,
    faPlus, faMinus, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import dataBuildings from '../../dataBuildings';
import { formatCost } from '@/utils/formatUtils';
import CocIcon from '@/components/CocIcon';

// Get upgrade cost for a single wall level
const getWallUpgradeCost = (level) => {
    const wallData = dataBuildings.find(b => b.name === "Wall");
    if (!wallData) return 0;

    const levelInfo = wallData.lvls.find(l => l.lv === level);
    return levelInfo ? levelInfo.cost : 0;
};

// Get cost for upgrading a wall from one level to another or to max
const getWallUpgradeCostRange = (fromLevel, toLevel) => {
    const wallData = dataBuildings.find(b => b.name === "Wall");
    if (!wallData || fromLevel >= toLevel) return 0;

    let totalCost = 0;
    // Sum up the costs for each level increment
    for (let level = fromLevel + 1; level <= toLevel; level++) {
        const levelInfo = wallData.lvls.find(l => l.lv === level);
        if (levelInfo) {
            totalCost += levelInfo.cost;
        }
    }
    return totalCost;
};

// Wall Level Row Component
const WallLevelRow = ({ wallInstance, maxPieces, onUpdateLevel, totalWallsPlaced, maxWallLevel }) => {
    const urlAssets = import.meta.env.VITE_ASSETS_URL || 'http://localhost:3000/assets';
    const imageUrl = `${urlAssets}/wall/wall-${wallInstance.wafi_level}.png`;

    // Add state for the input value
    const [inputValue, setInputValue] = useState(wallInstance.wafi_wall_count);
    // Update local input value when the wall count changes from parent component
    useEffect(() => {
        setInputValue(wallInstance.wafi_wall_count);
    }, [wallInstance.wafi_wall_count]);

    const handleCountChange = (change) => {
        const newCount = wallInstance.wafi_wall_count + change;
        const otherWallsCount = totalWallsPlaced - wallInstance.wafi_wall_count;

        // Don't allow negative counts
        if (newCount < 0) return;

        // Only check the max wall limit when increasing the count (not when decreasing)
        if (change > 0 && otherWallsCount + newCount > maxPieces) {
            alert(`Cannot add more walls. Maximum wall count is ${maxPieces}.`);
            return;
        }

        // Pass wall name ("Wall X"), new count, and wall flag (true)
        onUpdateLevel(wallInstance.wafi_obj_id, newCount);
    };

    // Handle direct input change
    const handleInputChange = (e) => {
        // Allow only numeric input
        const value = e.target.value.replace(/\D/g, '');
        setInputValue(value === '' ? 0 : parseInt(value, 10) || 0);
    };

    // Submit the input value when blurring or pressing Enter
    const handleInputBlur = () => {
        const newCount = inputValue;
        const otherWallsCount = totalWallsPlaced - wallInstance.wafi_wall_count;

        // Don't allow negative counts
        if (newCount < 0) {
            setInputValue(0);
            return;
        }

        // Check if the new count would exceed the max wall limit
        if (otherWallsCount + newCount > maxPieces) {
            const adjustedCount = Math.max(0, maxPieces - otherWallsCount);
            setInputValue(adjustedCount);
            alert(`Wall count adjusted to ${adjustedCount}. Maximum wall count is ${maxPieces}.`);
            onUpdateLevel(wallInstance.wafi_obj_id, adjustedCount);
        } else {
            onUpdateLevel(wallInstance.wafi_obj_id, newCount);
        }
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleInputBlur();
        }
    };

    // Get all upgrade costs for display
    const upgradeCosts = [];
    if (wallInstance.wafi_level < maxWallLevel) {
        for (let targetLevel = wallInstance.wafi_level + 1; targetLevel <= maxWallLevel; targetLevel++) {
            const cost = getWallUpgradeCost(targetLevel);
            if (cost) {
                upgradeCosts.push({ level: targetLevel, cost: cost * wallInstance.wafi_wall_count });
            }
        }
    }

    return (
        <div className="flex flex-col bg-white/5 rounded-lg mb-3 overflow-hidden">
            <div className="flex items-center justify-between p-3">
                {/* Left section: Wall image and level */}
                <div className="flex items-center gap-2 w-1/4">
                    <img src={imageUrl} alt={`Wall Lv.${wallInstance.wafi_level}`} className="w-10 h-10" />
                    <div>
                        <span className="font-medium text-white">Lv. {wallInstance.wafi_level}</span>
                        {wallInstance.wafi_level < maxWallLevel && (
                            <div className="text-xs text-white/70">
                                {wallInstance.wafi_wall_count > 0 ? `${wallInstance.wafi_wall_count} walls` : 'None placed'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Middle section: Buttons and count input */}
                <div className="flex items-center gap-2 w-1/4 justify-center">
                    <button
                        onClick={() => handleCountChange(-1)}
                        disabled={wallInstance.wafi_wall_count <= 0}
                        className="bg-red-500 text-white h-7 w-7 rounded flex items-center justify-center hover:bg-red-600 disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faMinus} />
                    </button>

                    {/* Replace span with input field */}
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyDown={handleInputKeyDown}
                        className="w-10 sm:w-16 h-8 text-center font-semibold bg-gray-800 border border-gray-700 rounded text-white"
                        aria-label="Wall count"
                    />

                    <button
                        onClick={() => handleCountChange(1)}
                        disabled={totalWallsPlaced > maxPieces || (totalWallsPlaced >= maxPieces && wallInstance.wafi_wall_count === 0)}
                        className="bg-green-500 text-white h-7 w-7 rounded flex items-center justify-center hover:bg-green-600 disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                </div>

                {/* Right section: Compact upgrade costs (in two columns) */}
                <div className="w-1/2 text-right">
                    <div className="grid grid-cols-2 gap-1 text-xs">
                        {wallInstance.wafi_wall_count > 0 && upgradeCosts.map(upgrade => (
                            <div key={upgrade.level} className="flex items-center justify-end gap-1">
                                <span>Lv {upgrade.level}:</span>
                                <CocIcon iconName="gold" />
                                <span className="text-yellow-400">{formatCost(upgrade.cost)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Enhanced Summary Panel for Walls
const WallSummaryPanel = ({ objectData, totalWallPieces, totalWallsPlaced, maxWallLevel }) => {
    // Calculate total cost to max all walls
    const totalCostToMax = useMemo(() => {
        if (!objectData) return 0;

        const wallBuildingData = dataBuildings.find(b => b.name === "Wall");
        if (!wallBuildingData) return 0;

        let totalCost = 0;
        let totalWallsPlaced = 0;
        // 1. Calculate cost to upgrade existing walls to max
        objectData.forEach(instance => {
            if (instance.wafi_wall_count > 0) {
                totalWallsPlaced += instance.wafi_wall_count;

                // Calculate cost to upgrade these walls to max level
                const costToMax = getWallUpgradeCostRange(instance.wafi_level, maxWallLevel);
                totalCost += costToMax * instance.wafi_wall_count;
            }
        });

        // 2. Calculate cost for remaining walls that need to be built and upgraded
        const remainingWalls = totalWallPieces - totalWallsPlaced;
        if (remainingWalls > 0) {
            // Cost to build and upgrade walls from level 1 to max
            const costFromLevel1 = getWallUpgradeCostRange(1, maxWallLevel);
            totalCost += costFromLevel1 * remainingWalls;
        }

        return totalCost;
    }, [objectData]);

    // Add remaining count that can be placed and handle overflow
    const remainingPieces = Math.max(0, totalWallPieces - totalWallsPlaced);
    const overflowCount = totalWallsPlaced > totalWallPieces
        ? totalWallsPlaced - totalWallPieces
        : 0;

    // Check if all walls are placed and maxed
    const allWallsMaxed = useMemo(() => {
        if (!objectData || totalWallsPlaced !== totalWallPieces) return false;
        
        // Check if all placed walls are at max level
        return !objectData.some(wall => 
            wall.wafi_wall_count > 0 && wall.wafi_level < maxWallLevel
        );
    }, [objectData, totalWallsPlaced, totalWallPieces, maxWallLevel]);

    return (
        <div className="bg-black/20 shadow-md rounded-lg border border-white/10 p-4 mb-4">
            <h3 className="text-lg font-medium mb-3 text-white">Wall Summary</h3>
            <div className="space-y-3">
                {allWallsMaxed ? (
                    // Show simplified completion message in English
                    <div className="py-2">
                        <div className="flex items-center gap-3 bg-green-500/20 text-green-400 rounded-lg p-3 mb-2">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-xl" />
                            <span className="font-medium">All walls maxed out!</span>
                        </div>
                        <div className="text-white/80 text-sm mt-2">
                            You have placed and fully upgraded all {totalWallPieces} walls to level {maxWallLevel}.
                        </div>
                    </div>
                ) : (
                    // Show simplified summary when walls need upgrading
                    <>
                        <div className="flex justify-between items-center">
                            <span className="text-white/80">Placed</span>
                            <span className={`font-medium ${totalWallsPlaced > totalWallPieces ? 'text-red-400' : 'text-white'}`}>
                                {totalWallsPlaced} / {totalWallPieces}
                            </span>
                        </div>

                        {overflowCount > 0 ? (
                            <div className="flex justify-between items-center">
                                <span className="text-white/80">Excess</span>
                                <span className="font-medium text-red-400">
                                    +{overflowCount}
                                </span>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center">
                                <span className="text-white/80">Available</span>
                                <span className={`font-medium ${remainingPieces > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                                    {remainingPieces}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-2 border-t border-white/10">
                            <div className="flex items-center gap-2">
                                <CocIcon iconName="gold" />
                                <span className="text-white/80">Cost to Max</span>
                            </div>
                            <span className="text-yellow-400 font-medium">{formatCost(totalCostToMax)}</span>
                        </div>
                        <div className="text-xs text-white/60 pt-2">
                            Wall upgrades cost Gold and are instant.
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// Main WallsTab Component
const WallsTab = ({ objectData, base, onUpdateLevel, tabTitle = "Walls", icon = faXmarksLines }) => {
    const { id } = useParams();
    const isEmpty = !objectData || objectData.length === 0;
    let totalWallsPlaced = 0;
    let totalWallPieces = 0;
    let maxWallLevel = 0;
    if (objectData) {
        totalWallsPlaced = objectData.reduce((total, instance) => {
            return total + (instance.wafi_wall_count || 0);
        }, 0);
        totalWallPieces = objectData[0]?.wafi_wall_count_max;
        maxWallLevel = objectData[0]?.wafi_max_level_th || 1;
    }
    // Sort wall instances by wall count in descending order
    const sortedWallInstances = objectData
        ? [...objectData].sort((a, b) => b.wafi_wall_count - a.wafi_wall_count)
        : [];

    if (sortedWallInstances.length === 0) {
        return (
            <div className="bg-white/5 rounded-lg border border-white/10 p-6 mb-2 w-full text-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 text-4xl mb-2" />
                <h3 className="text-xl font-semibold text-white">No Wall data available</h3>
                <p className="text-white/70 mb-4">Wall data could not be processed.</p>
            </div>
        );
    }

    return (
        <div className="walls-tab">
            {/* Header - Add count info with warning if needed */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <FontAwesomeIcon icon={icon} />
                    {tabTitle}
                </h2>
                <div className="flex items-center gap-3">
                    <span className={`text-sm ${totalWallsPlaced > totalWallPieces ? 'text-red-400' : 'text-white/80'}`}>
                        {totalWallsPlaced}/{totalWallPieces} Placed | Max Level: {maxWallLevel}
                        {totalWallsPlaced > totalWallPieces &&
                            " (Exceeds limit!)"}
                    </span>
                </div>
            </div>

            <div className="lg:grid lg:grid-cols-3 gap-4">
                {/* Wall Level Rows - Takes 2/3 - Now using sortedWallInstances */}
                <div className="lg:col-span-2">
                    {sortedWallInstances.map((instance) => (
                        <WallLevelRow
                            key={instance.wafi_level}
                            wallInstance={instance}
                            maxPieces={totalWallPieces}
                            onUpdateLevel={onUpdateLevel}
                            totalWallsPlaced={totalWallsPlaced}
                            maxWallLevel={maxWallLevel}
                        />
                    ))}
                </div>

                {/* Summary Panel - Takes 1/3 */}
                <div className="mt-4 lg:mt-0">
                    <WallSummaryPanel objectData={objectData} totalWallsPlaced={totalWallsPlaced} maxWallLevel={maxWallLevel} totalWallPieces={totalWallPieces} />
                </div>
            </div>
        </div>
    );
};

export default WallsTab;
