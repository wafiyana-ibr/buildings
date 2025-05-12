import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCoins, faDroplet, faClock, faHammer,
    faChartBar, faBuilding, faShield, faBomb,
    faHome, faXmarksLines, faLayerGroup, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import dataBuildings from '../../dataBuildings';
import CocIcon from '@/components/CocIcon';
import { formatCost, formatTime } from '@/utils/formatUtils';


// Summary Card Component
const SummaryCard = ({ title, icon, children, className = "" }) => (
    <div className={`bg-black/40 rounded-lg border border-white/10 p-4 shadow-md ${className}`}>
        <h3 className="text-lg font-medium mb-3 text-white flex items-center gap-2">
            <FontAwesomeIcon icon={icon} />
            {title}
        </h3>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);

const ResourceCost = ({ type, amount, className = "" }) => (
    <div className={`flex justify-between items-center ${className}`}>
        <div className="flex items-center gap-2">
            <CocIcon iconName={type} />
            <span className="text-white/80">{type}</span>
        </div>
        <span className={`font-semibold ${type.toLowerCase() === 'gold' ? 'text-yellow-400' :
            type.toLowerCase() === 'elixir' ? 'text-pink-400' :
                'text-white/90'
            }`}>
            {formatCost(amount)}
        </span>
    </div>
);

// TimeDisplay Component
const TimeDisplay = ({ label, time, builders = null, className = "" }) => (
    <div className={`flex justify-between items-center ${className}`}>
        <div className="flex items-center gap-2">
            <CocIcon iconName="stopwatch" />
            <span className="text-white/80">{label}</span>
        </div>
        <span className="text-white/90 font-semibold">{formatTime(time)}</span>
    </div>
);


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

// Add a new component for wall costs
const WallsCard = ({ wallData }) => {
    // Calculate total cost to max all walls
    const wallCostData = useMemo(() => {
        if (!wallData || !Array.isArray(wallData)) return { cost: 0, remaining: 0, complete: 0 };

        let totalCost = 0;
        let totalWallsPlaced = 0;
        let totalComplete = 0;
        let totalRemaining = 0;
        let totalWallPieces = wallData[0]?.wafi_wall_count_max || 0;

        // 1. Calculate cost to upgrade existing walls to max
        wallData.forEach(instance => {
            const maxLevel = instance.wafi_max_level_th;
            if (instance.wafi_wall_count > 0) {
                totalWallsPlaced += instance.wafi_wall_count;

                if (instance.wafi_level === maxLevel) {
                    totalComplete += instance.wafi_wall_count;
                } else {
                    totalRemaining += instance.wafi_wall_count;
                    // Calculate cost to upgrade these walls to max level
                    const costToMax = getWallUpgradeCostRange(instance.wafi_level, maxLevel);
                    totalCost += costToMax * instance.wafi_wall_count;
                }
            }
        });

        // 2. Calculate cost for remaining walls that need to be built and upgraded
        const remainingWalls = Math.max(0, totalWallPieces - totalWallsPlaced);
        if (remainingWalls > 0) {
            totalRemaining += remainingWalls;
            const maxWallLevel = wallData[0]?.wafi_max_level_th || 1;
            // Cost to build and upgrade walls from level 1 to max
            const costFromLevel1 = getWallUpgradeCostRange(1, maxWallLevel);
            totalCost += costFromLevel1 * remainingWalls;
        }

        return {
            cost: totalCost,
            complete: totalComplete,
            remaining: totalRemaining,
            total: totalWallPieces,
            placed: totalWallsPlaced
        };
    }, [wallData]);

    // Skip rendering if there's no wall data
    if (!wallData || !Array.isArray(wallData) || wallData.length === 0) {
        return null;
    }

    return (
        <SummaryCard title="Walls" icon={faXmarksLines}>
            {wallCostData.remaining === 0 && wallCostData.placed === wallCostData.total ? (
                <div className="flex justify-between items-center py-2">
                    <span className="text-green-400 font-medium flex items-center gap-2">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        Your Walls are fully upgraded!
                    </span>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-white/80">Walls Placed</span>
                        <span className="font-medium text-white">
                            {wallCostData.placed} / {wallCostData.total}
                        </span>
                    </div>

                    <div className="flex justify-between items-center mb-2">
                        <span className="text-white/80">Complete (Max Level)</span>
                        <span className="font-medium text-green-400">
                            {wallCostData.complete} / {wallCostData.total}
                        </span>
                    </div>

                    <div className="flex justify-between items-center mb-2">
                        <span className="text-white/80">Need Upgrading</span>
                        <span className="font-medium text-yellow-400">
                            {wallCostData.remaining}
                        </span>
                    </div>

                    <div className="pt-2 border-t border-white/10">
                        <ResourceCost type="Gold" amount={wallCostData.cost} />
                        <div className="text-xs text-white/60 mt-1">
                            Wall upgrades use Gold and are instant (no builder time).
                        </div>
                    </div>
                </>
            )}
        </SummaryCard>
    );
};

// Create a new CategoryCard component for each building category
const CategoryCard = ({ title, icon, category, processedObjectData, builderCount }) => {
    // Calculate costs and time for the specific category
    const categoryData = useMemo(() => {
        if (!processedObjectData || !processedObjectData[category]) {
            return { time: 0, gold: 0, elixir: 0 };
        }

        let totalTime = 0;
        let totalGold = 0;
        let totalElixir = 0;

        // Process buildings in this category - adapated for new structure
        Object.entries(processedObjectData[category]).forEach(([buildingName, buildings]) => {
            const buildingData = dataBuildings.find(b => b.name === buildingName);

            buildings.forEach(building => {
                // Skip buildings already maxed
                if (building.wafi_level >= building.wafi_max_level_th) {
                    return;
                }

                // Calculate upgrade costs for each level, starting from level 1 if the building is level 0
                const startLevel = building.wafi_level === 0 ? 1 : building.wafi_level + 1;

                for (let level = startLevel; level <= building.wafi_max_level_th; level++) {
                    const levelData = building.wafi_lvls?.find(l => l.lv === level) ||
                        buildingData?.lvls.find(l => l.lv === level);
                    if (!levelData) continue;

                    totalTime += levelData.time;

                    // Add cost to appropriate resource type
                    if (building.wafi_cost_type === 'gold') {
                        totalGold += levelData.cost;
                    } else if (building.wafi_cost_type === 'elixir') {
                        totalElixir += levelData.cost;
                    }
                }
            });
        });

        return {
            time: totalTime,
            gold: totalGold,
            elixir: totalElixir,
        };
    }, [processedObjectData, category]);

    const isFullyUpgraded = categoryData.gold === 0 && categoryData.elixir === 0 && categoryData.time === 0;

    return (
        <SummaryCard title={title} icon={icon}>
            {isFullyUpgraded ? (
                <div className="flex justify-between items-center py-2">
                    <span className="text-green-400 font-medium flex items-center gap-2">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        Your {title} are fully upgraded!
                    </span>
                </div>
            ) : (
                <>
                    {categoryData.gold > 0 && (
                        <ResourceCost type="Gold" amount={categoryData.gold} />
                    )}
                    {categoryData.elixir > 0 && (
                        <ResourceCost type="Elixir" amount={categoryData.elixir} />
                    )}
                    {categoryData.time > 0 && (
                        <div className="pt-2 border-t border-white/10">
                            <TimeDisplay label="Total Time:" time={categoryData.time} />
                            <div className="flex justify-between items-center text-sm mt-2">
                                <div className="flex items-center gap-2">
                                    <CocIcon iconName="stopwatch" />
                                    <span className="text-white/60">With Current {builderCount} builders:</span>
                                </div>
                                <span className="text-white/90 font-semibold">
                                    {formatTime(Math.ceil(categoryData.time / builderCount))}
                                </span>
                            </div>
                            {builderCount < 5 && <div className="flex justify-between items-center text-sm mt-2">
                                <div className="flex items-center gap-2">
                                    <CocIcon iconName="stopwatch" />
                                    <span className="text-white/60">With 5 builders:</span>
                                </div>
                                <span className="text-white/90 font-semibold">
                                    {formatTime(Math.ceil(categoryData.time / 5))}
                                </span>
                            </div>}
                        </div>

                    )}
                </>
            )}
        </SummaryCard>
    );
};

// Total Summary Component - combines resources and time
const TotalSummaryCard = ({ totalResources, builderTimeData, builderCount }) => {
    const isBuildingsComplete = builderTimeData.time === 0 && builderTimeData.gold === 0 && builderTimeData.elixir === 0;
    const isEverythingComplete = totalResources.gold === 0 && totalResources.elixir === 0;

    return (
        <SummaryCard title="Grand Totals" icon={faLayerGroup} className="mb-4">
            {isEverythingComplete ? (
                <div className="flex justify-between items-center py-2">
                    <span className="text-green-400 font-medium flex items-center gap-2">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        Congratulations! Your base is fully upgraded!
                    </span>
                </div>
            ) : (
                <>
                    {totalResources.gold > 0 && (
                        <ResourceCost type="Gold" amount={totalResources.gold} className="mb-1" />
                    )}
                    {totalResources.elixir > 0 && (
                        <ResourceCost type="Elixir" amount={totalResources.elixir} className="mb-1" />
                    )}

                    {!isBuildingsComplete && (
                        <div className="pt-3 mt-1 border-t border-white/10">
                            <div className="mt-1 flex justify-between">
                                <div className='flex items-center gap-2'>
                                    <CocIcon iconName="stopwatch" />
                                    <span>With current {builderCount} builders:</span>
                                </div>
                                <span className="text-white/90 font-semibold">{formatTime(Math.ceil(builderTimeData.time / builderCount))}</span>
                            </div>
                            {builderCount < 5 && <div className="mt-1 flex justify-between">
                                <div className='flex items-center gap-2'>
                                    <CocIcon iconName="stopwatch" />
                                    <span>With 5 builders:</span>
                                </div>
                                <span className="text-white/90 font-semibold">{formatTime(Math.ceil(builderTimeData.time / 5))}</span>
                            </div>}
                        </div>
                    )}
                </>
            )}
        </SummaryCard>
    );
};

const ProgressTab = ({ processedObjectData, base }) => {
    // Calculate builder time (buildings that require builders) - updated for new structure
    const builderTimeData = useMemo(() => {
        if (!processedObjectData) return { time: 0, gold: 0, elixir: 0 };

        let totalTime = 0;
        let totalGold = 0;
        let totalElixir = 0;

        // Process all building categories
        Object.keys(processedObjectData).forEach(category => {
            // Skip Walls category since they don't use builder time
            if (category === "Walls") return;

            Object.entries(processedObjectData[category]).forEach(([buildingName, buildings]) => {
                const buildingData = dataBuildings.find(b => b.name === buildingName);

                buildings.forEach(building => {
                    // Skip buildings already maxed
                    if (building.wafi_level >= building.wafi_max_level_th) {
                        return;
                    }

                    // Calculate upgrade costs for each level, starting from level 1 if the building is level 0
                    const startLevel = building.wafi_level === 0 ? 1 : building.wafi_level + 1;

                    for (let level = startLevel; level <= building.wafi_max_level_th; level++) {
                        const levelData = building.wafi_lvls?.find(l => l.lv === level) ||
                            buildingData?.lvls.find(l => l.lv === level);
                        if (!levelData) continue;

                        totalTime += levelData.time;

                        // Add cost to appropriate resource type
                        if (building.wafi_cost_type === 'gold') {
                            totalGold += levelData.cost;
                        } else if (building.wafi_cost_type === 'elixir') {
                            totalElixir += levelData.cost;
                        }
                    }
                });
            });
        });

        return {
            time: totalTime,
            gold: totalGold,
            elixir: totalElixir,
        };
    }, [processedObjectData]);

    // Calculate total upgrade costs by resource type - include wall costs as gold only - updated for new structure
    const totalResources = useMemo(() => {
        if (!processedObjectData) return { gold: 0, elixir: 0 };

        // Calculate all wall costs as gold costs
        let wallGoldCost = 0;
        if (processedObjectData.Walls && processedObjectData.Walls["Wall"]) {
            const wallData = processedObjectData.Walls["Wall"];

            wallGoldCost = wallData.reduce((total, instance) => {
                const maxLevel = instance.wafi_max_level_th;
                if (instance.wafi_level === maxLevel) return total;

                return total + getWallUpgradeCostRange(instance.wafi_level, maxLevel) * instance.wafi_wall_count;
            }, 0);

            // Also add cost for walls that haven't been placed yet
            const totalWallsPlaced = wallData.reduce((sum, wall) => sum + (wall.wafi_wall_count || 0), 0);
            const totalWallPieces = wallData[0]?.wafi_wall_count_max || 0;
            const missingWalls = Math.max(0, totalWallPieces - totalWallsPlaced);

            if (missingWalls > 0) {
                const maxWallLevel = wallData[0]?.wafi_max_level_th || 1;
                const missingWallCost = getWallUpgradeCostRange(1, maxWallLevel) * missingWalls;
                wallGoldCost += missingWallCost;
            }
        }

        return {
            gold: builderTimeData.gold + wallGoldCost,
            elixir: builderTimeData.elixir,
        };
    }, [builderTimeData, processedObjectData]);

    // Get number of available builders (default to 2 if unknown)
    const builderCount = base?.wafi_builderCount || 2;

    return (
        <div className="progress-tab">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faChartBar} />
                Upgrade Progress Summary
            </h2>

            <div className="bg-black/30 p-4 rounded-lg mb-4 border border-white/20 shadow-md">
                <p className="text-white/90">
                    This summary shows all resources and time required to fully upgrade your base to the maximum levels for your current Town Hall.
                    Use this information to plan your upgrades efficiently and track your overall progress.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                {/* Display all sections at once - no tabs */}

                {/* Defense Category - Pass down builderCount */}
                <CategoryCard
                    title="Defenses"
                    icon={faShield}
                    category="Defenses"
                    processedObjectData={processedObjectData}
                    builderCount={builderCount}
                />

                {/* Other Categories - Pass down builderCount */}
                <CategoryCard
                    title="Traps"
                    icon={faBomb}
                    category="Traps"
                    processedObjectData={processedObjectData}
                    builderCount={builderCount}
                />

                <CategoryCard
                    title="Resources"
                    icon={faHome}
                    category="Resources"
                    processedObjectData={processedObjectData}
                    builderCount={builderCount}
                />

                <CategoryCard
                    title="Army Buildings"
                    icon={faBuilding}
                    category="Army"
                    processedObjectData={processedObjectData}
                    builderCount={builderCount}
                />

                {/* Walls Card - Updated for new structure */}
                {processedObjectData?.Walls?.Wall && (
                    <WallsCard wallData={processedObjectData.Walls.Wall} />
                )}

                {/* Grand Totals Card */}
                <TotalSummaryCard
                    totalResources={totalResources}
                    builderTimeData={builderTimeData}
                    builderCount={builderCount}
                />
            </div>
        </div>
    );
};

export default ProgressTab;