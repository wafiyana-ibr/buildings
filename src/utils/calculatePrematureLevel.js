import { getBuildingPriority } from "@/helpers/getPriority";

/**
 * Calculates the recommended level for a building in premature mode
 * Higher priority buildings will have higher percentage of their max level recommended
 * 
 * @param {string} buildingName - The name of the building
 * @param {number} maxLevel - The maximum level available for the TH level
 * @returns {number} - The recommended level based on priority percentage
 */
export const calculatePrematureLevel = (buildingName, maxLevel) => {
  // Get building priority (0-6 scale)
  const priority = getBuildingPriority(buildingName);
  
  // Calculate percentage based on priority (higher priority = higher percentage)
  // Priority 0 = 40%, Priority 6 = 100%
  const basePercentage = 0.4; // Minimum 40% for lowest priority
  const percentageIncrement = (1 - basePercentage) / 6; // Each priority level adds this much percentage
  
  const percentage = basePercentage + (priority * percentageIncrement);
  
  // Calculate recommended level (min level is 1)
  const recommendedLevel = Math.max(1, Math.ceil(maxLevel * percentage));
  
  return recommendedLevel;
};

export default calculatePrematureLevel;
