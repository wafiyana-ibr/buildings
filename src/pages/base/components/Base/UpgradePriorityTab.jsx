import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faInfoCircle, faThLarge, faBalanceScale,
    faRocket, faExclamationTriangle, faArrowRight,
    faCheckCircle, faEye, faEyeSlash
} from "@fortawesome/free-solid-svg-icons";
import { buildings, getBuildingPriority, PRIORITY_LABELS } from "@/helpers/getPriority";
import { calculatePrematureLevel } from "@/utils/calculatePrematureLevel";
import dataBuildings from "@/pages/base/dataBuildings";
import CocIcon from "@/components/CocIcon";
import { formatCost, formatTime, getUpgradeCostAndTime, getCostAndTimeToMax } from "@/utils/formatUtils";

// Building Image component
const BuildingImage = ({ src, alt, size = "w-8 h-8" }) => {
    return (
        <img
            src={src}
            alt={alt}
            className={`${size} object-contain`}
            onError={(e) => {
                e.target.onerror = null;
            }}
        />
    );
};

// Empty State component
const EmptyState = () => (
    <div className="bg-white/5 rounded-lg border border-white/10 p-6 mb-2 w-full text-center">
        <div className="flex flex-col items-center justify-center gap-4">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 text-4xl mt-10 mb-2" />
            <h3 className="text-xl font-semibold text-white">No upgradeable buildings found</h3>
            <p className="text-white/70 mb-4">All your buildings seem to be at max level for your TH!</p>
        </div>
    </div>
);

// PriorityGroup component - displays a group of buildings with the same priority
const PriorityGroup = ({
    priorityLevel,
    buildings,
    thLevel,
    activeMode,
    isLast = false
}) => {
    // Skip if no buildings to display in this priority group
    if (!buildings.length) return null;

    const { text, color } = PRIORITY_LABELS[priorityLevel];

    // First, filter the instances that need upgrades for each building
    const buildingsWithUpgrades = buildings.filter(building => {
        if (building.name === "Wall") return false;
        
        return building.instances.some(instance => {
            const targetLevel = activeMode === "max"
                ? instance.wafi_max_level_th
                : Math.min(
                    instance.wafi_max_level_th,
                    calculatePrematureLevel(building.name, instance.wafi_max_level_th)
                );
            return instance.wafi_level < targetLevel;
        });
    });

    // If no buildings need upgrades after filtering, don't render this group
    if (buildingsWithUpgrades.length === 0) return null;

    // Group buildings by building type (name)
    const buildingGroups = {};
    buildingsWithUpgrades.forEach(building => {
        if (!buildingGroups[building.name]) {
            buildingGroups[building.name] = [];
        }
        buildingGroups[building.name].push(building);
    });

    // Convert to array for rendering
    const groupedBuildings = Object.entries(buildingGroups);

    // Determine grid columns based on number of building types
    let gridCols;
    switch (groupedBuildings.length) {
        case 1:
            gridCols = "grid-cols-1";
            break;
        case 2:
            gridCols = "grid-cols-1 sm:grid-cols-2";
            break;
        case 3:
            gridCols = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
            break;
        case 4:
            gridCols = "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4";
            break;
        default:
            gridCols = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
    }

    return (
        <div className="w-full mb-4 bg-white/5 rounded-lg p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <h3 className={`${color} text-white text-sm px-2 py-0.5 rounded-full`}>
                    {text} Priority
                </h3>
                <span className="text-white/60 text-xs">
                    ({groupedBuildings.length} building type{groupedBuildings.length !== 1 ? 's' : ''})
                </span>
            </div>

            <div className={`grid ${gridCols} gap-3`}>
                {groupedBuildings.map(([buildingName, buildings]) => (
                    <BuildingTypeCard
                        key={buildingName}
                        buildingName={buildingName}
                        buildings={buildings}
                        thLevel={thLevel}
                        activeMode={activeMode}
                        priority={priorityLevel}
                    />
                ))}
            </div>
        </div>
    );
};

// New component to display a group of buildings of the same type
const BuildingTypeCard = ({ buildingName, buildings, thLevel, activeMode, priority }) => {
    const urlAssets = import.meta.env.VITE_ASSETS_URL || 'http://localhost:3000/assets';
    
    // Get building image URL
    const getBuildingImageUrl = (buildingName, level) => {
        const normalizedName = buildingName
            .toLowerCase()
            .replace(/[']/g, '')
            .replace(/\s+/g, '-');

        const displayLevel = level > 0 ? level : 1;
        return `${urlAssets}/${normalizedName}/${normalizedName}-${displayLevel}.png`;
    };

    // Get cost type for this building
    const buildingData = dataBuildings.find(b => b.name === buildingName);
    const costType = buildings[0].instances[0]?.wafi_cost_type || buildingData?.ct || "gold";

    // Filter instances that need upgrades across all buildings of this type
    const allInstances = [];
    buildings.forEach(building => {
        building.instances.forEach(instance => {
            const targetLevel = activeMode === "max"
                ? instance.wafi_max_level_th
                : Math.min(
                    instance.wafi_max_level_th,
                    calculatePrematureLevel(buildingName, instance.wafi_max_level_th)
                );
            
            if (instance.wafi_level < targetLevel) {
                allInstances.push(instance);
            }
        });
    });

    // If no instances need upgrading after filter, don't render
    if (allInstances.length === 0) return null;

    // Calculate total upgrade costs
    const totalCosts = {
        gold: 0,
        elixir: 0,
        darkElixir: 0,
        time: 0
    };

    allInstances.forEach(instance => {
        const targetLevel = activeMode === "max"
            ? instance.wafi_max_level_th
            : Math.min(
                instance.wafi_max_level_th,
                calculatePrematureLevel(buildingName, instance.wafi_max_level_th)
            );

        // Calculate costs from current to target
        const { costToMax, timeToMax } = getCostAndTimeToMax(
            buildingName,
            instance.wafi_level === 0 ? 1 : instance.wafi_level,
            targetLevel,
            thLevel
        );

        // Add to appropriate resource type
        if (costType === "gold") {
            totalCosts.gold += costToMax;
        } else if (costType === "elixir") {
            totalCosts.elixir += costToMax;
        } else if (costType === "dark elixir") {
            totalCosts.darkElixir += costToMax;
        }

        totalCosts.time += timeToMax;
    });

    // Get max level for display
    const maxLevel = allInstances[0]?.wafi_max_level_th || 1;

    // Get image source based on name
    let buildingImageSrc = getBuildingImageUrl(buildingName, maxLevel);
    if (buildingName === "Town Hall Weapon") {
        buildingImageSrc = `${urlAssets}/th/th-${thLevel}-${maxLevel}.png`;
    }

    // Get priority styles for border color
    const priorityColors = {
        6: "bg-red-900/50 border-red-600/30 hover:bg-red-800/60", // Highest priority
        5: "bg-orange-900/50 border-orange-600/30 hover:bg-orange-800/60",
        4: "bg-yellow-900/50 border-yellow-600/30 hover:bg-yellow-800/60",
        3: "bg-green-900/50 border-green-600/30 hover:bg-green-800/60",
        2: "bg-blue-900/50 border-blue-600/30 hover:bg-blue-800/60",
        1: "bg-indigo-900/50 border-indigo-600/30 hover:bg-indigo-800/60",
        0: "bg-purple-900/50 border-purple-600/30 hover:bg-purple-800/60" // Lowest priority
    };

    const priorityColor = priorityColors[priority] || "bg-black/20 border-white/5";

    return (
        <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden h-full flex flex-col">
            {/* Building Header */}
            <div className="bg-white/10 p-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center">
                        <img
                            src={buildingImageSrc}
                            alt={buildingName}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => { e.target.onerror = null; }}
                        />
                    </div>
                    <div>
                        <h4 className="font-medium text-white text-sm">
                            {buildingName}
                        </h4>
                        <div className="text-xs text-white/70">
                            {allInstances.length} need{allInstances.length === 1 ? 's' : ''} upgrade
                        </div>
                    </div>
                </div>
                <CocIcon iconName={costType} size="md" />
            </div>

            {/* Resource Summary */}
            <div className="p-2 bg-black/20">
                <div className="grid grid-cols-2 gap-1 text-xs">
                    {totalCosts.gold > 0 && (
                        <div className="flex justify-between items-center col-span-2">
                            <div className="flex items-center gap-1">
                                <CocIcon iconName="gold" />
                                <span className="text-white/80">Gold</span>
                            </div>
                            <span className="text-yellow-400 font-semibold">{formatCost(totalCosts.gold)}</span>
                        </div>
                    )}

                    {totalCosts.elixir > 0 && (
                        <div className="flex justify-between items-center col-span-2">
                            <div className="flex items-center gap-1">
                                <CocIcon iconName="elixir" />
                                <span className="text-white/80">Elixir</span>
                            </div>
                            <span className="text-pink-400 font-semibold">{formatCost(totalCosts.elixir)}</span>
                        </div>
                    )}

                    {totalCosts.darkElixir > 0 && (
                        <div className="flex justify-between items-center col-span-2">
                            <div className="flex items-center gap-1">
                                <CocIcon iconName="dark-elixir" />
                                <span className="text-white/80">Dark Elixir</span>
                            </div>
                            <span className="text-purple-400 font-semibold">{formatCost(totalCosts.darkElixir)}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center col-span-2 pt-1 border-t border-white/10 mt-1">
                        <div className="flex items-center gap-1">
                            <CocIcon iconName="stopwatch" />
                            <span className="text-white/80">Time</span>
                        </div>
                        <span className="text-blue-400 font-semibold">{formatTime(totalCosts.time)}</span>
                    </div>
                </div>
            </div>

            {/* Building Instances */}
            <div className="p-2 flex-grow">
                <div className="flex flex-wrap gap-1">
                    {allInstances.map((instance, idx) => {
                        // Calculate target level based on mode
                        const targetLevel = activeMode === "max"
                            ? instance.wafi_max_level_th
                            : Math.min(
                                instance.wafi_max_level_th,
                                calculatePrematureLevel(buildingName, instance.wafi_max_level_th)
                            );

                        return (
                            <div
                                key={idx}
                                className={`rounded p-1 flex-1 min-w-[80px] text-center border transition-colors ${priorityColor}`}
                            >
                                <div className="flex flex-col items-center">
                                    {/* Show current level image */}
                                    {buildingName === "Town Hall Weapon" ? (
                                        <img
                                            src={`${urlAssets}/th/th-${thLevel}-${instance.wafi_level === 0 ? 1 : instance.wafi_level}.png`}
                                            alt={`${buildingName} Level ${instance.wafi_level}`}
                                            className="w-6 h-6 object-contain"
                                        />
                                    ) : (
                                        <img
                                            src={getBuildingImageUrl(buildingName, instance.wafi_level || 1)}
                                            alt={`${buildingName} Level ${instance.wafi_level}`}
                                            className="w-6 h-6 object-contain"
                                        />
                                    )}

                                    <div className="text-xs text-white/80 flex items-center justify-center gap-1 mt-1">
                                        <span>{instance.wafi_level}</span>
                                        <FontAwesomeIcon icon={faArrowRight} className="text-yellow-400 text-xs" />
                                        <span className="text-green-400">{targetLevel}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// Summary panel component
const SummaryPanel = ({
    upgradableBuildings,
    activeMode,
    thLevel,
    builderCount = 5
}) => {
    // Calculate total upgrade costs by individual priority level
    const totalCostsByPriority = useMemo(() => {
        // Initialize structure for costs by priority (0-6) and total
        const priorityCosts = {
            6: { gold: 0, elixir: 0, darkElixir: 0, time: 0 },
            5: { gold: 0, elixir: 0, darkElixir: 0, time: 0 },
            4: { gold: 0, elixir: 0, darkElixir: 0, time: 0 },
            3: { gold: 0, elixir: 0, darkElixir: 0, time: 0 },
            2: { gold: 0, elixir: 0, darkElixir: 0, time: 0 },
            1: { gold: 0, elixir: 0, darkElixir: 0, time: 0 },
            0: { gold: 0, elixir: 0, darkElixir: 0, time: 0 },
            total: { gold: 0, elixir: 0, darkElixir: 0, time: 0 }
        };

        // Loop through all buildings and calculate costs
        upgradableBuildings.forEach(building => {
            // Skip Wall buildings
            if (building.name === "Wall") return;

            const costType = building.instances[0]?.wafi_cost_type || "gold";
            const priority = building.priority;

            building.instances.forEach(instance => {
                // Get target level based on mode
                const targetLevel = activeMode === "max"
                    ? instance.wafi_max_level_th
                    : Math.min(
                        instance.wafi_max_level_th,
                        calculatePrematureLevel(building.name, instance.wafi_max_level_th)
                    );

                // Skip if already at or above target level
                if (instance.wafi_level >= targetLevel) return;

                // Calculate costs
                const { costToMax, timeToMax } = getCostAndTimeToMax(
                    building.name,
                    instance.wafi_level === 0 ? 1 : instance.wafi_level,
                    targetLevel,
                    thLevel
                );

                // Add to appropriate resource type and priority level
                if (costType === "gold") {
                    priorityCosts[priority].gold += costToMax;
                    priorityCosts.total.gold += costToMax;
                } else if (costType === "elixir") {
                    priorityCosts[priority].elixir += costToMax;
                    priorityCosts.total.elixir += costToMax;
                } else if (costType === "dark elixir") {
                    priorityCosts[priority].darkElixir += costToMax;
                    priorityCosts.total.darkElixir += costToMax;
                }

                priorityCosts[priority].time += timeToMax;
                priorityCosts.total.time += timeToMax;
            });
        });

        return priorityCosts;
    }, [upgradableBuildings, activeMode, thLevel]);

    // Priority labels and colors
    const priorityStyles = {
        6: { label: "Vital", bg: "bg-red-900/30", border: "border-red-700/30", text: "text-red-400" },
        5: { label: "Very High", bg: "bg-orange-900/30", border: "border-orange-700/30", text: "text-orange-400" },
        4: { label: "High", bg: "bg-yellow-900/30", border: "border-yellow-700/30", text: "text-yellow-400" },
        3: { label: "Medium", bg: "bg-green-900/30", border: "border-green-700/30", text: "text-green-400" },
        2: { label: "Low", bg: "bg-blue-900/30", border: "border-blue-700/30", text: "text-blue-400" },
        1: { label: "Very Low", bg: "bg-indigo-900/30", border: "border-indigo-700/30", text: "text-indigo-400" },
        0: { label: "Lowest", bg: "bg-purple-900/30", border: "border-purple-700/30", text: "text-purple-400" },
        total: { label: "Total", bg: "bg-gray-900/30", border: "border-gray-700/30", text: "text-white" }
    };

    // Check if there are any costs
    const hasCosts = totalCostsByPriority.total.gold > 0 ||
        totalCostsByPriority.total.elixir > 0 ||
        totalCostsByPriority.total.darkElixir > 0;

    // Render a single resource row
    const ResourceRow = ({ icon, label, amount, colorClass }) => {
        if (!amount) return null;
        return (
            <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1.5">
                    <CocIcon iconName={icon} size="sm" />
                    <span className="text-white/80">{label}</span>
                </div>
                <span className={`font-semibold ${colorClass}`}>{formatCost(amount)}</span>
            </div>
        );
    };

    // Render a priority section
    const PrioritySection = ({ priority, costs, styles, showDivider = true }) => {
        if (costs.gold === 0 && costs.elixir === 0 && costs.darkElixir === 0) return null;

        return (
            <div className={`p-3 rounded-lg ${styles.bg} border ${styles.border} mb-3`}>
                <h4 className={`text-sm font-medium mb-2 ${styles.text}`}>
                    {styles.label} {priority !== 'total' ? 'Priority' : ''}
                </h4>
                <div className="space-y-1.5">
                    <ResourceRow icon="gold" label="Gold" amount={costs.gold} colorClass="text-yellow-400" />
                    <ResourceRow icon="elixir" label="Elixir" amount={costs.elixir} colorClass="text-pink-400" />
                    <ResourceRow icon="dark-elixir" label="Dark Elixir" amount={costs.darkElixir} colorClass="text-purple-400" />

                    {showDivider && (costs.gold > 0 || costs.elixir > 0 || costs.darkElixir > 0) && (
                        <div className="border-t border-white/10 pt-1.5 mt-1.5">
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-1.5">
                                    <CocIcon iconName="stopwatch" size="sm" />
                                    <span className="text-white/80">Time</span>
                                </div>
                                <span className="font-semibold text-blue-400">{formatTime(costs.time)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Create responsive column class based on how many priority sections have data
    const activePriorities = [0, 1, 2, 3, 4, 5, 6].filter(priority => {
        const costs = totalCostsByPriority[priority];
        return costs.gold > 0 || costs.elixir > 0 || costs.darkElixir > 0;
    });

    // Determine grid columns based on number of active sections
    let gridColumns = "grid-cols-1";
    if (activePriorities.length > 1) {
        gridColumns = "grid-cols-1 md:grid-cols-2";
    }
    if (activePriorities.length > 3) {
        gridColumns = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }

    return (
        <div className="bg-black/20 shadow-md rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium mb-3 text-white">Resources by Priority</h3>

            {!hasCosts ? (
                <div className="flex justify-between items-center py-2">
                    <span className="text-green-400 font-semibold flex items-center gap-2">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        All buildings are fully upgraded!
                    </span>
                </div>
            ) : (
                <div className="space-y-1">
                    {/* Priority sections */}
                    <div className={`grid ${gridColumns} gap-3 mb-3`}>
                        {[6, 5, 4, 3, 2, 1, 0].map(priority => (
                            <PrioritySection
                                key={priority}
                                priority={priority}
                                costs={totalCostsByPriority[priority]}
                                styles={priorityStyles[priority]}
                                showDivider={true}
                            />
                        ))}
                    </div>

                    {/* Total Resources */}
                    <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                        <h4 className="text-sm font-semibold mb-2 text-white">Total Resources</h4>
                        <div className="space-y-1.5">
                            <ResourceRow icon="gold" label="Gold" amount={totalCostsByPriority.total.gold} colorClass="text-yellow-400" />
                            <ResourceRow icon="elixir" label="Elixir" amount={totalCostsByPriority.total.elixir} colorClass="text-pink-400" />
                            <ResourceRow icon="dark-elixir" label="Dark Elixir" amount={totalCostsByPriority.total.darkElixir} colorClass="text-purple-400" />

                            <div className="border-t border-white/10 pt-1.5 mt-1.5">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <CocIcon iconName="stopwatch" size="sm" />
                                        <span className="text-white/80">Total Time</span>
                                    </div>
                                    <span className="font-semibold text-blue-400">{formatTime(totalCostsByPriority.total.time)}</span>
                                </div>

                                {/* Estimated time with builders */}
                                <div className="flex justify-between items-center text-sm mt-1">
                                    <div className="flex items-center gap-1.5">
                                        <CocIcon iconName="stopwatch" size="sm" />
                                        <span className="text-white/60">With {builderCount} Builders</span>
                                    </div>
                                    <span className="text-white/90 font-semibold">{formatTime(Math.ceil(totalCostsByPriority.total.time / builderCount))}</span>
                                </div>
                                {builderCount < 5 && (
                                    <div className="flex justify-between items-center text-sm mt-1">
                                        <div className="flex items-center gap-1.5">
                                            <CocIcon iconName="stopwatch" size="sm" />
                                            <span className="text-white/60">With 5 Builders</span>
                                        </div>
                                        <span className="text-white/90 font-semibold">{formatTime(Math.ceil(totalCostsByPriority.total.time / 5))}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const UpgradePriorityTab = ({ base, processedObjectData }) => {
    const [activeMode, setActiveMode] = useState("max"); // "max" or "premature"
    const [upgradableBuildings, setUpgradableBuildings] = useState([]);
    const [buildingsByPriority, setBuildingsByPriority] = useState({});
    const [visiblePriorities, setVisiblePriorities] = useState([6, 5, 4, 3, 2, 1, 0]);

    const thLevel = base?.wafi_th_level || 1;

    // Process all buildings from processedObjectData
    useEffect(() => {
        if (!processedObjectData) return;

        const buildingsToUpgrade = [];

        // For each category (Defenses, Resources, etc.)
        Object.entries(processedObjectData).forEach(([category, buildingTypes]) => {
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

        setUpgradableBuildings(buildingsToUpgrade);
    }, [processedObjectData]);

    // Group buildings by priority
    useEffect(() => {
        if (!upgradableBuildings.length) return;

        // Create an object where keys are priority levels and values are arrays of buildings
        const grouped = upgradableBuildings.reduce((acc, building) => {
            // Skip Wall buildings
            if (building.name === "Wall") return acc;

            const priority = building.priority;
            if (!acc[priority]) acc[priority] = [];
            acc[priority].push(building);
            return acc;
        }, {});

        setBuildingsByPriority(grouped);
    }, [upgradableBuildings]);

    // Toggle visibility of a priority level
    const togglePriority = (priority) => {
        if (visiblePriorities.includes(priority)) {
            setVisiblePriorities(visiblePriorities.filter(p => p !== priority));
        } else {
            setVisiblePriorities([...visiblePriorities, priority].sort((a, b) => b - a));
        }
    };

    // Check if there are any upgradeable buildings in the current mode
    const hasUpgradeableBuildings = useMemo(() => {
        if (!upgradableBuildings.length) return false;

        return upgradableBuildings.some(building => {
            // Skip Wall buildings
            if (building.name === "Wall") return false;

            return building.instances.some(instance => {
                const targetLevel = activeMode === "max"
                    ? instance.wafi_max_level_th
                    : Math.min(
                        instance.wafi_max_level_th,
                        calculatePrematureLevel(building.name, instance.wafi_max_level_th)
                    );
                return instance.wafi_level < targetLevel;
            });
        });
    }, [upgradableBuildings, activeMode]);

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg shadow-lg">
            {/* Mode Tabs */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex h-fit items-center gap-2">
                    <FontAwesomeIcon icon={faRocket} />
                    Upgrade Priority Guide
                </h2>

                <div className="flex space-x-2">
                    <button
                        onClick={() => setActiveMode("max")}
                        className={`px-3 py-1.5 rounded-md flex items-center gap-2 ${activeMode === "max"
                            ? "bg-yellow-400 text-gray-900 font-medium"
                            : "bg-white/10 text-white/70 hover:bg-white/20"
                            }`}
                    >
                        <FontAwesomeIcon icon={faThLarge} />
                        <span>Max Mode</span>
                    </button>

                    <button
                        onClick={() => setActiveMode("premature")}
                        className={`px-3 py-1.5 rounded-md flex items-center gap-2 ${activeMode === "premature"
                            ? "bg-yellow-400 text-gray-900 font-medium"
                            : "bg-white/10 text-white/70 hover:bg-white/20"
                            }`}
                    >
                        <FontAwesomeIcon icon={faBalanceScale} />
                        <span>Premature Mode</span>
                    </button>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-900/30 border border-blue-400/30 rounded-lg p-3 mb-4 text-sm text-blue-100">
                <div className="flex items-start">
                    <FontAwesomeIcon icon={faInfoCircle} className="mt-1 mr-2 text-blue-300" />
                    <div>
                        <p className="font-medium">About {activeMode === "max" ? "Max Mode" : "Premature Mode"}:</p>
                        <p className="mt-1">
                            {activeMode === "max"
                                ? "Shows upgrade recommendations with maximum levels for each building at your current TH level."
                                : "Shows upgrade recommendations with level targets based on building priority. Higher priority buildings have higher target levels."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Summary Panel - Full Width */}

            {/* Priority Filter Buttons */}
            <div className="mb-4">
                <h3 className="text-white text-sm font-medium mb-2">Filter by Priority:</h3>
                <div className="flex flex-wrap gap-2">
                    {[6, 5, 4, 3, 2, 1, 0].map((priority) => {
                        const { text, color } = PRIORITY_LABELS[priority];
                        const isActive = visiblePriorities.includes(priority);

                        return (
                            <button
                                key={priority}
                                onClick={() => togglePriority(priority)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${isActive
                                    ? `${color} text-white`
                                    : 'bg-white/10 text-white/50 hover:bg-white/15'
                                    }`}
                            >
                                <FontAwesomeIcon icon={isActive ? faEye : faEyeSlash} className="text-xs" />
                                <span>{text}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content - Buildings by Priority - improved layout */}
            <div className="space-y-4">
                {hasUpgradeableBuildings ? (
                    // Only render visible priority groups in descending order
                    visiblePriorities.map((priority, index) => (
                        <PriorityGroup
                            key={priority}
                            priorityLevel={priority}
                            buildings={buildingsByPriority[priority] || []}
                            thLevel={thLevel}
                            activeMode={activeMode}
                            isLast={index === visiblePriorities.length - 1}
                        />
                    ))
                ) : (
                    <EmptyState />
                )}
            </div>
            <SummaryPanel
                upgradableBuildings={upgradableBuildings}
                activeMode={activeMode}
                thLevel={thLevel}
                builderCount={base?.wafi_builderCount || 2}
            />

        </div>
    );
};

export default UpgradePriorityTab;
