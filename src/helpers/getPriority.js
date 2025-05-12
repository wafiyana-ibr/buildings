const buildings = [
    // Vital Priority (6)
    { name: "Laboratory", priority: 6 },
    { name: "Clan Castle", priority: 6 },
    { name: "Army Camp", priority: 6 },
    { name: "Barracks", priority: 6 },
    { name: "Spell Factory", priority: 6 },
    { name: "Dark Spell Factory", priority: 6 },
    { name: "Dark Barracks", priority: 6 },
    { name: "Siege Workshop", priority: 6 },
    { name: "Pet House", priority: 6 },
    { name: "Blacksmith", priority: 6 },
    { name: "Hero Hall", priority: 6 },
    { name: "Workshop", priority: 6 },
  
    // Very High Priority (5)
    { name: "Eagle Artillery", priority: 5 },
    { name: "Inferno Tower", priority: 5 },
    { name: "Scattershot", priority: 5 },
    { name: "X-Bow", priority: 5 },
    { name: "Monolith", priority: 5 },
    { name: "Spell Tower", priority: 5 },
    { name: "Town Hall Weapon", priority: 5 },
  
    // High Priority (4)
    { name: "Air Defense", priority: 4 },
    { name: "Wizard Tower", priority: 4 },
    { name: "Bomb Tower", priority: 4 },
    { name: "Dark Elixir Storage", priority: 4 },
    { name: "Gold Storage", priority: 4 },
    { name: "Elixir Storage", priority: 4 },
  
    // Medium Priority (3)
    { name: "Mortar", priority: 3 },
    { name: "Hidden Tesla", priority: 3 },
    { name: "Air Sweeper", priority: 3 },
    { name: "Archer Tower", priority: 3 },
    { name: "Cannon", priority: 3 },
  
    // Low Priority (2)
    { name: "Tornado Trap", priority: 2 },
    { name: "Skeleton Trap", priority: 2 },
    { name: "Giant Bomb", priority: 2 },
    { name: "Seeking Air Mine", priority: 2 },
    { name: "Builder's Hut", priority: 2 },
  
    // Very Low Priority (1)
    { name: "Dark Elixir Drill", priority: 1 },
    { name: "Gold Mine", priority: 1 },
    { name: "Elixir Collector", priority: 1 },
    { name: "Air Bomb", priority: 1 },
    { name: "Bomb", priority: 1 },
    { name: "Spring Trap", priority: 1 },
  
    // Lowest Priority (0)
    { name: "Wall", priority: 0 }
]

// Function to get priority value for a building name
const getBuildingPriority = (buildingName) => {
  const buildingInfo = buildings.find(b => b.name === buildingName);
  return buildingInfo ? buildingInfo.priority : 0;
};

// Priority labels in English
const PRIORITY_LABELS = {
    6: { text: "Vital", color: "bg-red-600" },
    5: { text: "Very High", color: "bg-orange-500" },
    4: { text: "High", color: "bg-yellow-500" },
    3: { text: "Medium", color: "bg-green-500" },
    2: { text: "Low", color: "bg-blue-500" },
    1: { text: "Very Low", color: "bg-indigo-500" },
    0: { text: "Lowest", color: "bg-purple-500" }
};

export { buildings, getBuildingPriority, PRIORITY_LABELS };
export default buildings;
