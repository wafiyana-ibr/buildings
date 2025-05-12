import dataBuildings from '@/pages/base/dataBuildings.js'; // Adjust the import path as necessary
export const formatCost = (cost) => {
    if (cost >= 1000000000) return `${(cost / 1000000000).toFixed(cost % 1000000000 === 0 ? 0 : 2)}B`
    if (cost >= 1000000) return `${(cost / 1000000).toFixed(cost % 1000000 === 0 ? 0 : 1)}M`;
    if (cost >= 1000) return `${(cost / 1000).toFixed(cost % 1000 === 0 ? 0 : 1)}K`;
    return cost.toString();
};

export const formatTime = (seconds) => {
    if (seconds === 0) return 'Instant';

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h`;
    if (minutes > 0) result += ` ${minutes}m`;

    return result.trim();
};

// Enhanced function to get upgrade costs and time for next level
export const getUpgradeCostAndTime = (buildingName, currentLevel, thLevel) => {
    const building = dataBuildings.find(b => b.name === buildingName);
    if (!building) return { cost: 0, time: 0, costType: 'gold' };
    const nextLevel = currentLevel + 1;
    let levelData = building.lvls.find(lvl => lvl.lv === nextLevel);
    const costType = building.ct || 'gold'; // Get cost type from building data
    if (buildingName === "Town Hall Weapon") {
        levelData = building.lvls.find(lvl => lvl.th === thLevel && lvl.lv === nextLevel);
    }
    return levelData ? { cost: levelData.cost, time: levelData.time, costType } : { cost: 0, time: 0, costType };
};
// Enhanced function to calculate costs to max level
export const getCostAndTimeToMax = (buildingName, currentLevel, maxLevel, thLevel) => {
    const building = dataBuildings.find(b => b.name === buildingName);
    if (!building) return { costToMax: 0, timeToMax: 0, costType: 'gold' };

    let costToMax = 0;
    let timeToMax = 0;
    const costType = building.ct || 'gold'; // Get cost type from building data

    for (let i = currentLevel + 1; i <= maxLevel; i++) {
        let levelData = building.lvls.find(lvl => lvl.lv === i);
        if (buildingName === "Town Hall Weapon") {
            levelData = building.lvls.find(lvl => lvl.th === thLevel && lvl.lv === i);
        }
        if (levelData) {
            costToMax += levelData.cost;
            timeToMax += levelData.time;
        }
    }

    return { costToMax, timeToMax, costType };
};