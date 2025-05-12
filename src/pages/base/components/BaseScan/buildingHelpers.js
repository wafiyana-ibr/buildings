import dataBuildings from '../../dataBuildings';

/**
 * Filter predictions based on available building counts for the Town Hall level
 */
export const filterPredictionsByAvailableCount = (predictions, thLevel) => {
  if (!predictions || !Array.isArray(predictions) || predictions.length === 0 || !thLevel) {
    return [];
  }

  // Count occurrences of each building type
  const buildingCounts = {};
  predictions.forEach(prediction => {
    const buildingName = prediction.building_name;
    if (!buildingCounts[buildingName]) {
      buildingCounts[buildingName] = [];
    }
    buildingCounts[buildingName].push(prediction);
  });

  // Filter predictions based on available counts
  const filteredPredictions = [];

  Object.entries(buildingCounts).forEach(([buildingName, buildingInstances]) => {
    // Find available count for this building type at current TH level
    const buildingData = dataBuildings.find(building => building.name === buildingName);

    if (buildingData) {
      // Get level info for current TH level
      const levelInfo = buildingData.lvls
        .sort((a, b) => b.lv - a.lv)
        .find(level => level.th <= thLevel);

      // Get the max available count (n) and max level (lv)
      const availableCount = levelInfo?.n || 0;
      const maxLevel = levelInfo?.lv || 0;

      // Adjust each instance level if it exceeds max level for this TH
      buildingInstances.forEach((instance) => {
        if (instance.level > maxLevel) {
          instance.level = maxLevel;
        }
      });

      // If predicted count exceeds available count, keep only the top 'availableCount' predictions
      if (buildingInstances.length > availableCount) {
        // Sort by detected level (higher first)
        const sortedInstances = buildingInstances.sort((a, b) => {
          return parseInt(b.level) - parseInt(a.level);
        });

        // Keep only the top 'availableCount' predictions
        filteredPredictions.push(...sortedInstances.slice(0, availableCount));
      } else {
        // If count is within limits, keep all predictions
        filteredPredictions.push(...buildingInstances);
      }
    } else {
      // If building not found in dataBuildings, keep all predictions
      filteredPredictions.push(...buildingInstances);
    }
  });

  return filteredPredictions;
};

/**
 * Get a list of available buildings for a specific TH level
 */
export const getAvailableBuildingsForTH = (thLevel) => {
  if (!thLevel) return [];
  
  return dataBuildings
    .filter(building => {
      // Check if building is available at this TH level
      const levelInfo = building.lvls
        .sort((a, b) => b.th - a.th)
        .find(level => level.th <= thLevel);
      
      return levelInfo && levelInfo.n > 0;
    })
    .map(building => ({
      name: building.name,
      maxLevel: getMaxLevelForBuilding(building.name, thLevel)
    }));
};

/**
 * Get the maximum level for a building at a specific TH level
 */
export const getMaxLevelForBuilding = (buildingName, thLevel) => {
  if (!buildingName || !thLevel) return 1;
  
  const building = dataBuildings.find(b => b.name === buildingName);
  if (!building) return 1;
  
  // Find the highest level available at the current TH level
  const levelInfo = building.lvls
    .sort((a, b) => b.lv - a.lv) // Sort by level descending
    .find(level => level.th <= thLevel);
  
  return levelInfo ? levelInfo.lv : 1;
};

/**
 * Get the available count of a building at a specific TH level
 */
export const getAvailableCountForBuilding = (buildingName, thLevel) => {
  if (!buildingName || !thLevel) return 0;
  
  const building = dataBuildings.find(b => b.name === buildingName);
  if (!building) return 0;
  
  // Find the building count available at the current TH level
  const levelInfo = building.lvls
    .sort((a, b) => b.th - a.th) // Sort by TH level descending
    .find(level => level.th <= thLevel);
  
  return levelInfo ? levelInfo.n : 0;
};

/**
 * Check if a building name exists in the dataset
 */
export const isBuildingNameValid = (buildingName) => {
  return dataBuildings.some(b => b.name === buildingName);
};

/**
 * Group buildings by confidence level
 */
export const groupBuildingsByConfidence = (buildings) => {
  if (!buildings || !Array.isArray(buildings)) return {};
  
  return {
    low: buildings.filter(b => b.tm_confidence <= 0.45),
    medium: buildings.filter(b => b.tm_confidence > 0.45 && b.tm_confidence <= 0.70),
    high: buildings.filter(b => b.tm_confidence > 0.70)
  };
};

/**
 * Get building categories (Defense, Resource, etc.) from dataBuildings
 */
export const getBuildingCategories = () => {
  const categories = new Set();
  dataBuildings.forEach(building => {
    if (building.category) {
      categories.add(building.category);
    }
  });
  return Array.from(categories);
};

/**
 * Get all buildings in a specific category
 */
export const getBuildingsByCategory = (category, thLevel) => {
  if (!category) return [];
  
  return dataBuildings
    .filter(building => {
      // Filter by category and availability at this TH level
      if (building.category !== category) return false;
      
      const levelInfo = building.lvls
        .sort((a, b) => b.th - a.th)
        .find(level => level.th <= thLevel);
      
      return levelInfo && levelInfo.n > 0;
    })
    .map(building => ({
      name: building.name,
      maxLevel: getMaxLevelForBuilding(building.name, thLevel),
      count: getAvailableCountForBuilding(building.name, thLevel)
    }));
};
