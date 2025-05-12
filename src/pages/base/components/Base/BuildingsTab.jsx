import React, { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowUp, faArrowDown, faEdit, faCamera, faExclamationTriangle,
    faBuilding, faPlus, faMinus, faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import dataBuildings from '../../dataBuildings';
import CocIcon from '@/components/CocIcon';
import { formatCost, formatTime, getCostAndTimeToMax, getUpgradeCostAndTime } from '@/utils/formatUtils';



// Building Image component
const BuildingImage = ({ src, alt, size = "w-8 h-8" }) => {
    return (<img
        src={src}
        alt={alt}
        className={`${size} object-contain`}
        onError={(e) => {
            e.target.onerror = null;
        }}
    />)
};

// Level Controls component
const LevelControls = ({ building, onLevelChange }) => (
    <div className="flex gap-1">
        <button
            className="bg-green-500 text-white text-xs px-2 py-1 rounded hover:bg-green-600 disabled:opacity-50"
            onClick={() => onLevelChange(building, 1)}
            disabled={building.wafi_level === building.wafi_max_level_th}
        >
            <FontAwesomeIcon icon={faArrowUp} />
        </button>
        <button
            className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600 disabled:opacity-50"
            onClick={() => onLevelChange(building, -1)}
            disabled={building.wafi_level === 0 || (building.wafi_name === "Town Hall Weapon" && building.wafi_level < 2)}
        >
            <FontAwesomeIcon icon={faArrowDown} />
        </button>
    </div>
);


// Empty State component
const EmptyState = ({ id, tabTitle }) => (
    <div className="bg-white/5 rounded-lg border border-white/10 p-6 mb-2 w-full text-center">
        <div className="flex flex-col items-center justify-center gap-4">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 text-4xl mt-10 mb-2" />
            <h3 className="text-xl font-semibold text-white">No {tabTitle} data available</h3>
            <p className="text-white/70 mb-4">Please add your buildings data first to track your base progress.</p>

            <div className="flex flex-col sm:flex-row gap-4 mt-2">
                {tabTitle !== "Traps" && (<Link
                    to={`/base/${id}/scan`}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                    <FontAwesomeIcon icon={faCamera} />
                    <span>Scan Base (Recommended)</span>
                </Link>
                )}
                <Link
                    to={`/base/${id}/edit${tabTitle ? `#${tabTitle.toLowerCase()}` : ''}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                    <FontAwesomeIcon icon={faEdit} />
                    <span>Edit Base Manually</span>
                </Link>
            </div>
        </div>
    </div>
);

// Summary component to display total resource costs
const SummaryPanel = ({ totals, builderCount }) => (
    <div className="bg-black/20 shadow-md rounded-lg p-4 mb-4">
        <h3 className="text-lg font-medium mb-3 text-white">Upgrades Needed</h3>

        <div className="space-y-3">
            {totals.gold === 0 && totals.elixir === 0 && totals.time === 0 ? (
                <div className="flex justify-between items-center py-2">
                    <span className="text-green-400 font-semibold flex items-center gap-2">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        These buildings are fully upgraded!
                    </span>
                </div>
            ) : (
                <>
                    {/* Gold Section */}
                    {totals.gold > 0 && (
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <CocIcon iconName="gold" />
                                <span className="text-white/80">Gold</span>
                            </div>
                            <span className="text-yellow-400 font-semibold">{formatCost(totals.gold)}</span>
                        </div>
                    )}

                    {/* Elixir Section */}
                    {totals.elixir > 0 && (
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <CocIcon iconName="elixir" />
                                <span className="text-white/80">Elixir</span>
                            </div>
                            <span className="text-pink-400 font-semibold">{formatCost(totals.elixir)}</span>
                        </div>
                    )}


                    {/* Time Section */}
                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                        <div className="flex items-center gap-2">
                            <CocIcon iconName="stopwatch" />
                            <span className="text-white/80">Total Time</span>
                        </div>
                        <span className="text-blue-400 font-semibold">{formatTime(totals.time)}</span>
                    </div>

                    {/* Estimated time with builders */}
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <CocIcon iconName="stopwatch" />
                            <span className="text-white/60">With Current {builderCount} Builders</span>
                        </div>
                        <span className="text-white/90 font-semibold">{formatTime(Math.ceil(totals.time / builderCount))}</span>
                    </div>
                    {builderCount < 5 && (
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <CocIcon iconName="stopwatch" />
                                <span className="text-white/60">With 5 Builders</span>
                            </div>
                            <span className="text-white/90 font-semibold">{formatTime(Math.ceil(totals.time / 5))}</span>
                        </div>
                    )}
                </>
            )}
        </div>
    </div>
);

// Building Card component
const BuildingCard = ({
    thLevel,
    buildingName,
    buildings,
    isCollapsed,
    onToggleCollapse,
    onLevelChange,
}) => {
    // Calculate active buildings (level > 0)
    const activeBuildingsCount = buildings.filter(b => b.wafi_level > 0).length;
    const totalBuildingsCount = buildings.length;
    const upgradesRemaining = buildings.reduce((total, building) =>
        total + (building.wafi_max_level_th - building.wafi_level), 0);
    const allMaxed = upgradesRemaining === 0;
    const urlAssets = import.meta.env.VITE_ASSETS_URL || 'http://localhost:3000/assets';


    const getBuildingImageUrl = (buildingName, level) => {
        const normalizedName = buildingName
            .toLowerCase()
            .replace(/[']/g, '')
            .replace(/\s+/g, '-');

        const displayLevel = level > 0 ? level : 1;
        return `${urlAssets}/${normalizedName}/${normalizedName}-${displayLevel}.png`;
    };
    let buildingImageSrc = getBuildingImageUrl(buildingName, buildings.find(b => b.wafi_name === buildingName).wafi_max_level_th);
    if (buildingName === "Town Hall Weapon") {
        buildingImageSrc = `${urlAssets}/th/th-${thLevel}-${buildings.find(b => b.wafi_name === buildingName).wafi_max_level_th}.png`;
    }
    // Calculate total costs by resource type - Modified to include level 0 buildings
    const getTotalUpgradeCosts = (buildings) => {
        let totalGold = 0;
        let totalElixir = 0;
        let totalTime = 0;

        buildings.forEach(building => {
            // Include buildings with level 0 as well (removed the level > 0 check)
            if (building.wafi_level < building.wafi_max_level_th) {
                // For level 0 buildings, we need to calculate from level 1 to max
                const startLevel = building.wafi_level === 0 ? 1 : building.wafi_level + 1;

                // Get building data for cost calculation
                const buildingData = dataBuildings.find(b => b.name === building.wafi_name);
                const costType = buildingData?.ct || 'gold';
                // Calculate cost for each level upgrade
                for (let level = startLevel; level <= building.wafi_max_level_th; level++) {
                    const levelData = buildingData?.lvls.find(l => l.lv === level);
                    if (levelData) {
                        // Add cost to appropriate resource type
                        if (costType === 'gold') {
                            totalGold += levelData.cost;
                        } else if (costType === 'elixir') {
                            totalElixir += levelData.cost;
                        }
                        totalTime += levelData.time;
                    }
                }
            }
        });

        return {
            gold: totalGold,
            elixir: totalElixir,
            time: totalTime
        };
    };

    const totals = isCollapsed ? getTotalUpgradeCosts(buildings) : { gold: 0, elixir: 0, time: 0 };

    // Get cost type for this building
    const costType = buildings[0]?.wafi_cost_type || 'gold';

    return (
        <div className="bg-white/5 rounded-lg border border-white/10 mb-4 overflow-hidden">
            {/* Building Header */}
            <div className="flex items-center justify-between bg-white/10 p-3">
                <div className="flex items-center gap-3">
                    <BuildingImage src={buildingImageSrc} alt={buildingName} size="w-10 h-10" />
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-medium text-white">{buildingName}</h3>
                            <CocIcon iconName={costType} />
                            <span className="text-xs px-2 py-0.5 rounded-md bg-white/10"
                                title={`${activeBuildingsCount} of ${totalBuildingsCount} buildings active`}>
                                {activeBuildingsCount}/{totalBuildingsCount}
                            </span>
                        </div>
                        <div className="text-xs text-white/70">
                            {upgradesRemaining ? `${upgradesRemaining} upgrades remaining` : 'All maxed'}
                        </div>
                    </div>
                </div>

                <button
                    onClick={onToggleCollapse}
                    className="bg-white/10 hover:bg-white/20 p-1.5 rounded transition-colors"
                >
                    <FontAwesomeIcon
                        icon={isCollapsed ? faPlus : faMinus}
                        className="text-white/70 hover:text-white"
                    />
                </button>
            </div>

            {/* Collapsed Summary */}
            {isCollapsed && (
                <div className="p-3 flex justify-between items-center">
                    <div className="text-sm text-white/80">
                        {buildings.length} {buildingName}{buildings.length > 1 ? 's' : ''}
                    </div>
                    {allMaxed ? (
                        <p className="text-green-400 font-semibold text-sm">All Fully Upgraded</p>
                    ) : (
                        <div className="text-sm flex items-center gap-2">
                            {totals.gold > 0 && (
                                <>
                                    <CocIcon iconName="gold" />
                                    <span className="text-yellow-400 font-semibold">{formatCost(totals.gold)}</span>
                                </>
                            )}
                            {totals.elixir > 0 && (
                                <>
                                    <CocIcon iconName="elixir" />
                                    <span className="text-pink-400 font-semibold">{formatCost(totals.elixir)}</span>
                                </>
                            )}

                            <CocIcon iconName="stopwatch" />
                            <span className="text-white/70 font-semibold">{formatTime(totals.time)}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Expanded Details */}
            {!isCollapsed && (
                <div className="p-3 divide-y divide-white/10">
                    {buildings.map((building, idx) => {
                        // Get cost type for this building
                        const buildingData = dataBuildings.find(b => b.name === building.wafi_name);
                        const buildingCostType = buildingData?.ct || 'gold';
                        return (
                            <div key={idx} className={`py-2 flex flex-col md:flex-row md:items-center gap-2`}>
                                <div className="flex items-center justify-between gap-2 flex-1">
                                    <BuildingImage
                                        src={buildingName === "Town Hall Weapon" ? `${urlAssets}/th/th-${thLevel}-${building.wafi_level === 0 ? 1 : building.wafi_level}.png` : getBuildingImageUrl(buildingName, building.wafi_level || 1)}
                                        alt={`${buildingName} Lv.${building.wafi_level}`}
                                    />


                                    <span className="text-sm text-white/80">
                                        {building.wafi_level}/{building.wafi_max_level_th}
                                    </span>


                                    <LevelControls building={building} onLevelChange={onLevelChange} />
                                </div>

                                {/* Upgrade costs */}
                                <div className="text-xs text-white/70 md:text-right flex-1">

                                    {building.wafi_level === building.wafi_max_level_th ? (
                                        <p className="text-green-400 font-semibold float-end">Fully Upgraded</p>
                                    ) : (
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1 justify-end">
                                                <span>Lv. {building.wafi_level === 0 ? 1 : building.wafi_level + 1}: </span>
                                                <CocIcon iconName={buildingCostType} />
                                                <span className="text-yellow-400 font-semibold">
                                                    {formatCost(getUpgradeCostAndTime(building.wafi_name, building.wafi_level, thLevel).cost)}
                                                </span>
                                                <span className="ml-1 text-white/50 font-semibold">
                                                    {formatTime(getUpgradeCostAndTime(building.wafi_name, building.wafi_level, thLevel).time)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1 justify-end">
                                                <span>
                                                    {building.wafi_level === 0 ? 'Lv. 1' : `Lv. ${building.wafi_level}`} → {building.wafi_max_level_th}:
                                                </span>
                                                <CocIcon iconName={buildingCostType} />
                                                <span className="text-yellow-400 font-semibold">
                                                    {formatCost(getCostAndTimeToMax(building.wafi_name,
                                                        building.wafi_level === 0 ? 1 : building.wafi_level,
                                                        building.wafi_max_level_th, thLevel).costToMax)}
                                                </span>
                                                <span className="ml-1 text-white/50 font-semibold">
                                                    {formatTime(getCostAndTimeToMax(building.wafi_name,
                                                        building.wafi_level === 0 ? 1 : building.wafi_level,
                                                        building.wafi_max_level_th, thLevel).timeToMax)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const BuildingsTab = ({ objectData, onUpdateLevel, base, tabTitle = "Buildings", icon = faBuilding, setBase }) => {
    const { id } = useParams();
    const [collapsedBuildings, setCollapsedBuildings] = useState({});

    // Toggle collapsed state for a building
    const toggleCollapse = (buildingName) => {
        setCollapsedBuildings(prev => ({
            ...prev,
            [buildingName]: !prev[buildingName]
        }));
    };

    const handleLevelChange = (building, change) => {
        // Calculate new level within valid range
        const newLevel = Math.max(0, Math.min(building.wafi_max_level_th, building.wafi_level + change));
        
        // Don't update if level didn't change
        if (newLevel === building.wafi_level) return;
        
        // Create the object ID to update
        const objectIdToUpdate = building.wafi_obj_id;
        // Handle Builder's Hut special case for builder count
        if (building.wafi_name === "Builder's Hut" && setBase && base) {
            // Calculate new builder count by counting all Builder's Huts that are placed (level > 0)
            const builderHuts = objectData["Builder's Hut"] || [];
            
            // Create an updated array of Builder's Huts with the current one's level changed
            const updatedBuilderHuts = builderHuts.map(hut => 
                hut._id === objectIdToUpdate 
                ? {...hut, wafi_level: newLevel} 
                : hut
            );
            
            // Count how many Builder's Huts are active (level > 0)
            const activeBuilderHuts = updatedBuilderHuts.filter(hut => hut.wafi_level > 0).length;
            console.log(activeBuilderHuts)
            
            // Update the base builder count (+1 for the initial builder everyone has)
            setBase({
                ...base,
                wafi_builderCount: activeBuilderHuts + change
            });
            console.log
        }
        
        // Call the provided update level function
        if (onUpdateLevel) {
            onUpdateLevel(objectIdToUpdate, newLevel);
        }
    };

    // Create building image URL

    // Count stats - updated for new nested structure
    const countMaxedBuildings = () => {
        if (!objectData) return 0;

        let maxed = 0;
        // Loop through each category (Defenses, Resources, etc.)
        Object.entries(objectData).forEach(([key, buildings]) => {
            buildings.forEach(building => {
                if (building.wafi_level === building.wafi_max_level_th) maxed++;
            });
        });
        return maxed;
    };

    const countPlacedBuildings = () => {
        if (!objectData) return 0;

        let placed = 0;
        Object.entries(objectData).forEach(([key, buildings]) => {
            buildings.forEach(building => {
                if (building.wafi_level > 0) placed++;
            });
        });
        return placed;
    };

    const countTotalBuildings = () => {
        if (!objectData) return 0;

        let total = 0;
        // Loop through each category
        Object.entries(objectData).forEach(([key, buildings]) => {
            total += buildings.length;
        });
        return total;
    };

    const totalBuildings = countTotalBuildings();
    const maxedBuildings = countMaxedBuildings();
    const placedBuildings = countPlacedBuildings();

    // Calculate total upgrade costs and time - updated for nested structure
    const calculateTotalUpgrades = useMemo(() => {
        if (!objectData) return { gold: 0, elixir: 0, time: 0 };

        let totalGold = 0;
        let totalElixir = 0;
        let totalTime = 0;

        // Loop through each category (Defenses, Resources, etc.)
        Object.entries(objectData).forEach(([categoryName, buildings]) => {
            // Loop through each building type in the category
            buildings.forEach((building) => {
                const buildingData = dataBuildings.find(b => b.name === building.wafi_name);

                // Handle regular building upgrades - Include level 0 buildings
                if (building.wafi_level < building.wafi_max_level_th) {
                    // For level 0 buildings, start from level 1
                    const startLevel = building.wafi_level === 0 ? 1 : building.wafi_level + 1;

                    // Calculate cost for each level
                    for (let level = startLevel; level <= building.wafi_max_level_th; level++) {
                        const levelData = building.wafi_lvls?.find(l => l.lv === level) ||
                            buildingData?.lvls.find(l => l.lv === level);

                        if (levelData) {
                            // Assign cost to appropriate resource type
                            if (building.wafi_cost_type === 'gold') {
                                totalGold += levelData.cost;
                            } else if (building.wafi_cost_type === 'elixir') {
                                totalElixir += levelData.cost;
                            }
                            totalTime += levelData.time;
                        }
                    }
                }
            });
        });

        return {
            gold: totalGold,
            elixir: totalElixir,
            time: totalTime
        };
    }, [objectData]);
    // Check if empty - updated for new structure
    const isEmpty = placedBuildings < 2;

    return (
        <div className="buildings-tab">
            {/* Header with title and progress */}
            <div className="flex lg:items-center justify-between flex-row mb-4">
                <h2 className="text-xl font-bold flex h-fit items-center gap-2">
                    <FontAwesomeIcon icon={icon} />
                    {tabTitle}
                </h2>

                <div className="flex flex-col lg:flex-row items-center gap-3">
                    {!isEmpty && (
                        <div className="flex flex-col flex-1 md:flex-none md:flex-row gap-2">
                            <div className="flex items-center">
                                <span className='w-fit'>Placed Buildings:</span>
                                <div className="ml-2 bg-gray-700 rounded-full h-1.5 w-24 overflow-hidden">
                                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(placedBuildings / totalBuildings) * 100}%` }}></div>
                                </div>
                                <span className="text-xs ml-2">{placedBuildings}/{totalBuildings}</span>
                            </div>
                            <div className="flex items-center">
                                Maxed Buildings:
                                <div className="ml-2 bg-gray-700 rounded-full h-1.5 w-24 overflow-hidden">
                                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(maxedBuildings / totalBuildings) * 100}%` }}></div>
                                </div>
                                <span className="text-xs ml-2">{maxedBuildings}/{totalBuildings}</span>
                            </div>
                        </div>
                    )}

                    <Link
                        to={`/base/${id}/edit${tabTitle ? `#${tabTitle.toLowerCase()}` : ''}`}
                        className="bg-blue-600 order-first self-end lg:order-last hover:bg-blue-700 text-white py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 text-sm transition-colors"
                    >
                        <FontAwesomeIcon icon={faEdit} />
                        <span>Edit All</span>
                    </Link>
                </div>
            </div>

            {isEmpty ? (
                <EmptyState id={id} tabTitle={tabTitle} />
            ) : (
                <div className="lg:grid lg:grid-cols-3 gap-4">
                    {/* Building Cards - Takes 2/3 of the space */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Iterate through building types in the category */}
                        {Object.entries(objectData).map(([buildingName, buildings], typeIdx) => {

                            return (
                                <BuildingCard
                                    key={typeIdx}
                                    buildingName={buildingName}
                                    thLevel={base.wafi_th_level}
                                    buildings={buildings}
                                    isCollapsed={collapsedBuildings[buildingName]}
                                    onToggleCollapse={() => toggleCollapse(buildingName)}
                                    onLevelChange={handleLevelChange}
                                />
                            );
                        })}
                    </div>

                    {/* Summary Panel - Takes 1/3 of the space */}
                    <div className="mt-4 lg:mt-0">
                        <SummaryPanel totals={calculateTotalUpgrades} builderCount={base?.wafi_builderCount || 2} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuildingsTab;
