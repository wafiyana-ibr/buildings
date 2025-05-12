import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCalculator, faArrowRight, 
  faChevronDown, faChevronUp, faInfoCircle,
  faCheckCircle, faFilter, faClock, faStar 
} from "@fortawesome/free-solid-svg-icons";
import { PRIORITY_LABELS, getBuildingPriority } from "@/helpers/getPriority";
import { calculatePrematureLevel } from "@/utils/calculatePrematureLevel";
import { formatCost, formatTime, getUpgradeCostAndTime, getCostAndTimeToMax } from "@/utils/formatUtils";
import CocIcon from "@/components/CocIcon";

const ResourcePlanner = ({ upgradableBuildings, activeMode, thLevel }) => {
  // Input display values (what user sees in the input fields)
  const [goldAmount, setGoldAmount] = useState("");
  const [elixirAmount, setElixirAmount] = useState("");
  const [darkElixirAmount, setDarkElixirAmount] = useState("");
  
  // Calculation values (only updated when Calculate button is clicked)
  const [calculatedGold, setCalculatedGold] = useState(0);
  const [calculatedElixir, setCalculatedElixir] = useState(0);
  const [calculatedDarkElixir, setCalculatedDarkElixir] = useState(0);
  
  const [plannerResults, setPlannerResults] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // Get all building categories
  const allCategories = useMemo(() => {
    if (!upgradableBuildings || upgradableBuildings.length === 0) return [];
    
    const categories = new Set();
    upgradableBuildings.forEach(building => {
      if (building.category) categories.add(building.category);
    });
    
    return Array.from(categories);
  }, [upgradableBuildings]);
  
  // Convert input string to number (removing commas)
  const parseResource = (value) => {
    if (!value) return 0;
    return parseInt(value.replace(/,/g, ''), 10) || 0;
  };
  
  // Format number with commas
  const formatWithCommas = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Handle input changes with formatting
  const     handleInputChange = (setter) => (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    setter(formatWithCommas(rawValue));
    // Removed any automatic calculation here
  };
  
  // Toggle a category's expanded state
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  // Reset the filters
  const resetFilters = () => {
    setPriorityFilter(null);
    setCategoryFilter(null);
  };
  
  // Group upgrades by category and consolidate levels
  const consolidateUpgrades = (upgrades) => {
    // First, group by building name
    const buildingGroups = {};
    
    upgrades.forEach(upgrade => {
      const key = `${upgrade.name}_${upgrade.buildingCategory}`;
      
      if (!buildingGroups[key]) {
        buildingGroups[key] = {
          name: upgrade.name,
          priority: upgrade.priority,
          category: upgrade.buildingCategory,
          costType: upgrade.costType,
          levels: [],
          totalCost: 0,
          totalTime: 0
        };
      }
      
      // Check if we can extend an existing level range
      let merged = false;
      for (let i = 0; i < buildingGroups[key].levels.length; i++) {
        const level = buildingGroups[key].levels[i];
        
        if (level.to === upgrade.fromLevel) {
          // We can extend this range
          level.to = upgrade.toLevel;
          level.cost += upgrade.cost;
          level.time += upgrade.time;
          merged = true;
          break;
        } else if (level.from === upgrade.toLevel) {
          // We can extend this range backward
          level.from = upgrade.fromLevel;
          level.cost += upgrade.cost;
          level.time += upgrade.time;
          merged = true;
          break;
        }
      }
      
      // If not merged, add as new level range
      if (!merged) {
        buildingGroups[key].levels.push({
          from: upgrade.fromLevel,
          to: upgrade.toLevel,
          cost: upgrade.cost,
          time: upgrade.time
        });
      }
      
      // Add to total cost and time
      buildingGroups[key].totalCost += upgrade.cost;
      buildingGroups[key].totalTime += upgrade.time;
    });
    
    // Convert to array and group by category
    const categoryGroups = {};
    
    Object.values(buildingGroups).forEach(building => {
      if (!categoryGroups[building.category]) {
        categoryGroups[building.category] = [];
      }
      
      // Sort levels by from level
      building.levels.sort((a, b) => a.from - b.from);
      
      // Further consolidate levels if they are consecutive
      const consolidatedLevels = [];
      let currentLevel = null;
      
      building.levels.forEach(level => {
        if (!currentLevel) {
          currentLevel = { ...level };
        } else if (currentLevel.to === level.from) {
          // Extend the current level
          currentLevel.to = level.to;
          currentLevel.cost += level.cost;
          currentLevel.time += level.time;
        } else {
          // Start a new level
          consolidatedLevels.push(currentLevel);
          currentLevel = { ...level };
        }
      });
      
      if (currentLevel) {
        consolidatedLevels.push(currentLevel);
      }
      
      building.levels = consolidatedLevels;
      categoryGroups[building.category].push(building);
    });
    
    // Sort buildings within each category by priority (highest first)
    Object.keys(categoryGroups).forEach(category => {
      categoryGroups[category].sort((a, b) => b.priority - a.priority);
    });
    
    return categoryGroups;
  };
  
  // Calculate upgrades that can be done with available resources
  const calculateUpgrades = () => {
    // Parse the input values and store them in calculation variables
    const goldBudget = parseResource(goldAmount);
    const elixirBudget = parseResource(elixirAmount);
    const darkElixirBudget = parseResource(darkElixirAmount);
    
    // Update the calculation values (these are used for displaying "used of total")
    setCalculatedGold(goldBudget);
    setCalculatedElixir(elixirBudget);
    setCalculatedDarkElixir(darkElixirBudget);
    
    if (goldBudget === 0 && elixirBudget === 0 && darkElixirBudget === 0) {
      return;
    }
    
    // Create a list of all possible upgrades
    const allPossibleUpgrades = [];
    
    upgradableBuildings.forEach(building => {
      if (building.name === "Wall") return; // Skip walls
      
      const costType = building.instances[0]?.wafi_cost_type || "gold";
      
      building.instances.forEach(instance => {
        const targetLevel = activeMode === "max" 
          ? instance.wafi_max_level_th 
          : Math.min(
              instance.wafi_max_level_th, 
              calculatePrematureLevel(building.name, instance.wafi_max_level_th)
            );
        
        // Skip if already at or above target level
        if (instance.wafi_level >= targetLevel) return;
        
        // For each level that can be upgraded
        let currentLevel = instance.wafi_level === 0 ? 1 : instance.wafi_level;
        
        while (currentLevel < targetLevel) {
          const nextLevel = currentLevel + 1;
          
          // Get cost for this single level upgrade
          const { cost, time } = getUpgradeCostAndTime(
            building.name,
            currentLevel,
            nextLevel,
            thLevel
          );
          
          if (cost > 0) {
            allPossibleUpgrades.push({
              name: building.name,
              priority: building.priority,
              fromLevel: currentLevel,
              toLevel: nextLevel,
              cost: cost,
              time: time,
              costType: costType,
              buildingCategory: building.category
            });
          }
          
          currentLevel++;
        }
      });
    });
    
    // Sort by priority (highest first) and then by cost (lowest first)
    allPossibleUpgrades.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return a.cost - b.cost; // Lower cost first for same priority
    });
    
    // Select upgrades that fit within budget
    const selectedUpgrades = {
      gold: [],
      elixir: [],
      darkElixir: [],
      remainingGold: goldBudget,
      remainingElixir: elixirBudget,
      remainingDarkElixir: darkElixirBudget,
      totalTime: 0,
      upgradesByCategory: {}
    };
    
    // First pass: allocate resources based on priority
    allPossibleUpgrades.forEach(upgrade => {
      if (upgrade.costType === "gold" && selectedUpgrades.remainingGold >= upgrade.cost) {
        selectedUpgrades.gold.push(upgrade);
        selectedUpgrades.remainingGold -= upgrade.cost;
        selectedUpgrades.totalTime += upgrade.time;
      } else if (upgrade.costType === "elixir" && selectedUpgrades.remainingElixir >= upgrade.cost) {
        selectedUpgrades.elixir.push(upgrade);
        selectedUpgrades.remainingElixir -= upgrade.cost;
        selectedUpgrades.totalTime += upgrade.time;
      } else if (upgrade.costType === "dark elixir" && selectedUpgrades.remainingDarkElixir >= upgrade.cost) {
        selectedUpgrades.darkElixir.push(upgrade);
        selectedUpgrades.remainingDarkElixir -= upgrade.cost;
        selectedUpgrades.totalTime += upgrade.time;
      }
    });
    
    // Initialize categories
    const allUpgrades = [...selectedUpgrades.gold, ...selectedUpgrades.elixir, ...selectedUpgrades.darkElixir];
    
    // Group and consolidate upgrades
    selectedUpgrades.goldByCategory = consolidateUpgrades(selectedUpgrades.gold);
    selectedUpgrades.elixirByCategory = consolidateUpgrades(selectedUpgrades.elixir);
    selectedUpgrades.darkElixirByCategory = consolidateUpgrades(selectedUpgrades.darkElixir);
    
    // Initialize expanded categories state
    const expanded = {};
    [...Object.keys(selectedUpgrades.goldByCategory), 
     ...Object.keys(selectedUpgrades.elixirByCategory),
     ...Object.keys(selectedUpgrades.darkElixirByCategory)].forEach(cat => {
      expanded[cat] = true; // Default to expanded
    });
    
    setExpandedCategories(expanded);
    setPlannerResults(selectedUpgrades);
  };
  
  // Render resource header with icon
  const ResourceHeader = ({ iconName, color, resourceType, amount, used, remaining }) => (
    <div className="mb-3 bg-black/30 rounded-lg p-3 border-l-4 border-l-yellow-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CocIcon iconName={iconName} size="md" />
          <span className={`font-medium text-${color}-400`}>{resourceType} Upgrades</span>
        </div>
        <div className="text-sm text-white/60">
          {/* Use the calculated values here, not direct parsing from input */}
          <span className={`text-${color}-400 font-medium`}>{formatCost(used)}</span> of {formatCost(amount)} used
        </div>
      </div>
      {remaining > 0 && (
        <div className="mt-1 text-xs text-white/50 flex justify-between">
          <span>Remaining</span>
          <span className="text-white/90">{formatCost(remaining)}</span>
        </div>
      )}
    </div>
  );
  
  // Render a building with consolidated levels
  const BuildingItem = ({ building }) => {
    const { text, color } = PRIORITY_LABELS[building.priority];
    const isGold = building.costType === "gold";
    const isElixir = building.costType === "elixir";
    const isDarkElixir = building.costType === "dark elixir";
    
    const resColor = isGold ? "yellow" : isElixir ? "pink" : "purple";
    const urlAssets = import.meta.env.VITE_ASSETS_URL || 'http://localhost:3000/assets';
    
    // Get building image URL
    const getBuildingImageUrl = (buildingName, level) => {
      const normalizedName = buildingName
        .toLowerCase()
        .replace(/[']/g, '')
        .replace(/\s+/g, '-');
  
      return `${urlAssets}/${normalizedName}/${normalizedName}-${level}.png`;
    };
    
    return (
      <div className="mb-2 p-2 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex-shrink-0">
            <img 
              src={getBuildingImageUrl(building.name, building.levels[0]?.from || 1)} 
              alt={building.name}
              className="w-full h-full object-contain"
              onError={(e) => { e.target.onerror = null; }}
            />
          </div>
          
          <div className="flex-grow">
            <div className="flex justify-between items-center">
              <h4 className="text-white font-medium text-sm flex items-center gap-2">
                {building.name}
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${color}`}>
                  {text}
                </span>
              </h4>
              <div className={`text-${resColor}-400 font-medium text-sm flex items-center gap-1`}>
                <CocIcon iconName={building.costType} size="sm" />
                {formatCost(building.totalCost)}
              </div>
            </div>
            
            <div className="mt-1 space-y-2">
              {building.levels.map((level, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-white/70">
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-6 flex-shrink-0">
                        <img 
                          src={getBuildingImageUrl(building.name, level.from)} 
                          alt={`${building.name} Level ${level.from}`}
                          className="w-full h-full object-contain"
                          onError={(e) => { e.target.onerror = null; }}
                        />
                      </div>
                      <span className="text-xs whitespace-nowrap">Lvl {level.from}</span>
                    </div>
                    
                    <FontAwesomeIcon icon={faArrowRight} className="text-yellow-400 text-xs" />
                    
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-6 flex-shrink-0">
                        <img 
                          src={getBuildingImageUrl(building.name, level.to)} 
                          alt={`${building.name} Level ${level.to}`}
                          className="w-full h-full object-contain"
                          onError={(e) => { e.target.onerror = null; }}
                        />
                      </div>
                      <span className="text-xs text-green-400 whitespace-nowrap">Lvl {level.to}</span>
                    </div>
                  </div>
                  <div className="text-blue-400 text-xs">{formatTime(level.time)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render category group
  const CategoryGroup = ({ title, buildings, isExpanded, onToggle }) => {
    if (!buildings || buildings.length === 0) return null;
    
    return (
      <div className="mb-3">
        <button 
          onClick={onToggle}
          className="w-full flex items-center justify-between p-2 bg-white/10 hover:bg-white/15 rounded-lg mb-2 transition-colors"
        >
          <span className="text-white/90 font-medium text-sm">{title}</span>
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-xs">{buildings.length} buildings</span>
            <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} className="text-white/60" />
          </div>
        </button>
        
        {isExpanded && (
          <div className="space-y-1">
            {buildings.map((building, idx) => (
              <BuildingItem key={idx} building={building} />
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Filtered results based on priority and category
  const filteredResults = useMemo(() => {
    if (!plannerResults) return null;
    
    // Make a shallow copy
    const filtered = { ...plannerResults };
    
    if (priorityFilter !== null || categoryFilter !== null) {
      // Filter gold upgrades
      if (filtered.goldByCategory) {
        const filteredGoldByCategory = {};
        Object.entries(filtered.goldByCategory).forEach(([category, buildings]) => {
          if (categoryFilter !== null && category !== categoryFilter) return;
          
          const filteredBuildings = priorityFilter !== null
            ? buildings.filter(b => b.priority === priorityFilter)
            : buildings;
            
          if (filteredBuildings.length > 0) {
            filteredGoldByCategory[category] = filteredBuildings;
          }
        });
        filtered.goldByCategory = filteredGoldByCategory;
      }
      
      // Filter elixir upgrades
      if (filtered.elixirByCategory) {
        const filteredElixirByCategory = {};
        Object.entries(filtered.elixirByCategory).forEach(([category, buildings]) => {
          if (categoryFilter !== null && category !== categoryFilter) return;
          
          const filteredBuildings = priorityFilter !== null
            ? buildings.filter(b => b.priority === priorityFilter)
            : buildings;
            
          if (filteredBuildings.length > 0) {
            filteredElixirByCategory[category] = filteredBuildings;
          }
        });
        filtered.elixirByCategory = filteredElixirByCategory;
      }
      
      // Filter dark elixir upgrades
      if (filtered.darkElixirByCategory) {
        const filteredDarkElixirByCategory = {};
        Object.entries(filtered.darkElixirByCategory).forEach(([category, buildings]) => {
          if (categoryFilter !== null && category !== categoryFilter) return;
          
          const filteredBuildings = priorityFilter !== null
            ? buildings.filter(b => b.priority === priorityFilter)
            : buildings;
            
          if (filteredBuildings.length > 0) {
            filteredDarkElixirByCategory[category] = filteredBuildings;
          }
        });
        filtered.darkElixirByCategory = filteredDarkElixirByCategory;
      }
    }
    
    return filtered;
  }, [plannerResults, priorityFilter, categoryFilter]);
  
  // Count total buildings in filtered results
  const totalBuildingsCount = useMemo(() => {
    if (!filteredResults) return 0;
    
    let count = 0;
    
    // Count gold buildings
    if (filteredResults.goldByCategory) {
      Object.values(filteredResults.goldByCategory).forEach(buildings => {
        count += buildings.length;
      });
    }
    
    // Count elixir buildings
    if (filteredResults.elixirByCategory) {
      Object.values(filteredResults.elixirByCategory).forEach(buildings => {
        count += buildings.length;
      });
    }
    
    // Count dark elixir buildings
    if (filteredResults.darkElixirByCategory) {
      Object.values(filteredResults.darkElixirByCategory).forEach(buildings => {
        count += buildings.length;
      });
    }
    
    return count;
  }, [filteredResults]);
  
  return (
    <div className="bg-black/20 shadow-md rounded-lg p-4 mb-6 border border-white/10">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium text-white flex items-center gap-2">
          <FontAwesomeIcon icon={faCalculator} className="text-yellow-400" />
          Resource Planner
        </h3>
      </div>
      
      <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-3 mb-4">
        <div className="flex items-start">
          <FontAwesomeIcon icon={faInfoCircle} className="text-blue-400 mt-1 mr-2" />
          <p className="text-white/70 text-sm">
            Enter the resources you have available, and we'll calculate the most efficient upgrade path based on building priorities.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="text-white/80 text-sm block mb-1">Gold</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CocIcon iconName="gold" size="sm" />
            </div>
            <input
              type="text"
              value={goldAmount}
              onChange={handleInputChange(setGoldAmount)}
              placeholder="Available gold"
              className="w-full bg-black/30 border border-yellow-500/30 rounded-md py-2 pl-10 pr-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label className="text-white/80 text-sm block mb-1">Elixir</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CocIcon iconName="elixir" size="sm" />
            </div>
            <input
              type="text"
              value={elixirAmount}
              onChange={handleInputChange(setElixirAmount)}
              placeholder="Available elixir"
              className="w-full bg-black/30 border border-pink-500/30 rounded-md py-2 pl-10 pr-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label className="text-white/80 text-sm block mb-1">Dark Elixir</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CocIcon iconName="dark-elixir" size="sm" />
            </div>
            <input
              type="text"
              value={darkElixirAmount}
              onChange={handleInputChange(setDarkElixirAmount)}
              placeholder="Available dark elixir"
              className="w-full bg-black/30 border border-purple-500/30 rounded-md py-2 pl-10 pr-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      
      <button
        onClick={calculateUpgrades} // Only calculate when button is clicked
        className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-medium py-2 rounded-md mb-4 transition-all shadow-md"
      >
        Calculate Optimal Upgrades
      </button>
      
      {plannerResults && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4 bg-black/30 p-3 rounded-lg border border-white/10">
            <div className="w-full flex justify-between items-center mb-2">
              <h4 className="text-white font-medium text-sm flex items-center gap-2">
                <FontAwesomeIcon icon={faFilter} className="text-yellow-400" />
                Filter Results
              </h4>
              <button 
                onClick={resetFilters}
                className="text-white/60 hover:text-white/90 text-xs underline transition-colors"
              >
                Reset Filters
              </button>
            </div>
            
            <div className="w-full flex flex-wrap gap-2">
              {/* Priority filter buttons */}
              <div className="flex flex-wrap gap-1 mr-3">
                {[6, 5, 4, 3, 2, 1, 0].map(priority => {
                  const { text, color } = PRIORITY_LABELS[priority];
                  const isActive = priorityFilter === priority;
                  
                  return (
                    <button
                      key={priority}
                      onClick={() => setPriorityFilter(isActive ? null : priority)}
                      className={`text-xs px-2 py-1 rounded-md transition-colors ${
                        isActive ? `${color} text-white` : 'bg-white/10 text-white/60 hover:bg-white/15'
                      }`}
                    >
                      {text}
                    </button>
                  );
                })}
              </div>
              
              {/* Category filter buttons */}
              <div className="flex flex-wrap gap-1">
                {allCategories.map(category => {
                  const isActive = categoryFilter === category;
                  
                  return (
                    <button
                      key={category}
                      onClick={() => setCategoryFilter(isActive ? null : category)}
                      className={`text-xs px-2 py-1 rounded-md transition-colors ${
                        isActive ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/15'
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="space-y-4 mt-2">
            <div className="flex justify-between text-white/80 text-sm border-b border-white/10 pb-2">
              <span>Recommended upgrades based on your resources</span>
              <span className="font-medium text-yellow-400">{totalBuildingsCount} buildings</span>
            </div>
            
            {/* Conditional grid layout based on available results */}
            <div className={`grid ${
              Object.keys(filteredResults.goldByCategory || {}).length > 0 && 
              Object.keys(filteredResults.elixirByCategory || {}).length > 0 
                ? 'grid-cols-1 md:grid-cols-2' 
                : 'grid-cols-1'
            } gap-4`}>
              {/* Gold upgrades */}
              {Object.keys(filteredResults.goldByCategory || {}).length > 0 && (
                <div>
                  <ResourceHeader 
                    iconName="gold" 
                    color="yellow" 
                    resourceType="Gold" 
                    amount={calculatedGold}  // Use calculated value, not input
                    used={calculatedGold - filteredResults.remainingGold}
                    remaining={filteredResults.remainingGold}
                  />
                  
                  {Object.entries(filteredResults.goldByCategory).map(([category, buildings]) => (
                    <CategoryGroup 
                      key={category}
                      title={category}
                      buildings={buildings}
                      isExpanded={expandedCategories[category]}
                      onToggle={() => toggleCategory(category)}
                    />
                  ))}
                </div>
              )}
              
              {/* Elixir upgrades */}
              {Object.keys(filteredResults.elixirByCategory || {}).length > 0 && (
                <div>
                  <ResourceHeader 
                    iconName="elixir" 
                    color="pink" 
                    resourceType="Elixir" 
                    amount={calculatedElixir}  // Use calculated value, not input
                    used={calculatedElixir - filteredResults.remainingElixir}
                    remaining={filteredResults.remainingElixir}
                  />
                  
                  {Object.entries(filteredResults.elixirByCategory).map(([category, buildings]) => (
                    <CategoryGroup 
                      key={category}
                      title={category}
                      buildings={buildings}
                      isExpanded={expandedCategories[category]}
                      onToggle={() => toggleCategory(category)}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Dark Elixir - Full width if available */}
            {Object.keys(filteredResults.darkElixirByCategory || {}).length > 0 && (
              <div className="mt-4">
                <ResourceHeader 
                  iconName="dark-elixir" 
                  color="purple" 
                  resourceType="Dark Elixir" 
                  amount={calculatedDarkElixir}  // Use calculated value, not input
                  used={calculatedDarkElixir - filteredResults.remainingDarkElixir}
                  remaining={filteredResults.remainingDarkElixir}
                />
                
                {Object.entries(filteredResults.darkElixirByCategory).map(([category, buildings]) => (
                  <CategoryGroup 
                    key={category}
                    title={category}
                    buildings={buildings}
                    isExpanded={expandedCategories[category]}
                    onToggle={() => toggleCategory(category)}
                  />
                ))}
              </div>
            )}
            
            <div className="border-t border-white/10 pt-3 mt-2">
              <div className="p-3 bg-indigo-900/20 border border-indigo-500/30 rounded-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faClock} className="text-blue-400 text-lg" />
                    <div>
                      <div className="text-white/80 text-sm">Total Upgrade Time</div>
                      <div className="text-blue-400 font-medium">{formatTime(filteredResults.totalTime)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-yellow-400 text-sm">
                      <CocIcon iconName="gold" size="sm" />
                      <span>{formatCost(filteredResults.remainingGold)} left</span>
                    </div>
                    <div className="flex items-center gap-1 text-pink-400 text-sm">
                      <CocIcon iconName="elixir" size="sm" />
                      <span>{formatCost(filteredResults.remainingElixir)} left</span>
                    </div>
                    {parseResource(darkElixirAmount) > 0 && (
                      <div className="flex items-center gap-1 text-purple-400 text-sm">
                        <CocIcon iconName="dark-elixir" size="sm" />
                        <span>{formatCost(filteredResults.remainingDarkElixir)} left</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ResourcePlanner;
