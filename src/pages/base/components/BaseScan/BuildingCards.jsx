import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEdit, faCheck, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { getAvailableBuildingsForTH, getMaxLevelForBuilding, getAvailableCountForBuilding } from "./buildingHelpers";

const BuildingCards = ({
  filteredResults,
  showPredictionImages,
  showPredictionDetails,
  thLevel,
  handleRemoveBuilding,
  handleUpdateBuildingDetails
}) => {
  const [editableBuildings, setEditableBuildings] = useState({});
  const [availableBuildings, setAvailableBuildings] = useState([]);
  const [editMode, setEditMode] = useState({});
  const selectRefs = useRef({});
  const [buildingCounts, setBuildingCounts] = useState({});

  // Calculate available buildings and current counts
  useEffect(() => {
    if (thLevel) {
      setAvailableBuildings(getAvailableBuildingsForTH(thLevel));
      
      // Count existing buildings
      const counts = {};
      filteredResults.forEach(item => {
        counts[item.building_name] = (counts[item.building_name] || 0) + 1;
      });
      setBuildingCounts(counts);
    }
  }, [thLevel, filteredResults]);

  const handleStartEdit = (index) => {
    const building = filteredResults[index];
    setEditableBuildings({
      ...editableBuildings,
      [index]: {
        building_name: building.building_name,
        level: building.level
      }
    });
    setEditMode({
      ...editMode,
      [index]: true
    });
  };

  const handleCancelEdit = (index) => {
    setEditMode({
      ...editMode,
      [index]: false
    });
  };

  const handleSaveEdit = (index) => {
    const updated = editableBuildings[index];
    handleUpdateBuildingDetails(index, updated);
    setEditMode({
      ...editMode,
      [index]: false
    });
  };

  const handleBuildingNameChange = (index, newName) => {
    const currentName = filteredResults[index].building_name;
    
    // If trying to change to a different building type, check count limits
    if (newName !== currentName) {
      const currentCount = buildingCounts[newName] || 0;
      const maxCount = getAvailableCountForBuilding(newName, thLevel);
      
      // Warn the user if this would exceed max count, but still allow the change
      if (currentCount >= maxCount) {
        alert(`Warning: You already have ${currentCount} of ${newName} (max: ${maxCount}). This may cause issues when applying predictions if it exceeds the maximum allowed for TH${thLevel}.`);
      }
    }
    
    // Get the max level for the selected building
    const maxLevel = getMaxLevelForBuilding(newName, thLevel);
    const currentLevel = parseInt(editableBuildings[index]?.level || 1);
    
    // Adjust level if it exceeds the max for this building
    const adjustedLevel = Math.min(currentLevel, maxLevel);
    
    setEditableBuildings({
      ...editableBuildings,
      [index]: {
        ...editableBuildings[index],
        building_name: newName,
        level: adjustedLevel
      }
    });
  };

  const handleLevelChange = (index, newLevel) => {
    const buildingName = editableBuildings[index]?.building_name || filteredResults[index].building_name;
    const maxLevel = getMaxLevelForBuilding(buildingName, thLevel);
    
    // Ensure level doesn't exceed max
    const validLevel = Math.min(parseInt(newLevel), maxLevel);
    
    setEditableBuildings({
      ...editableBuildings,
      [index]: {
        ...editableBuildings[index],
        level: validLevel
      }
    });
  };

  // Function to get badge color based on confidence
  const getConfidenceBadgeColor = (confidence) => {
    if (confidence <= 0.45) return "bg-red-500/70";
    if (confidence <= 0.70) return "bg-yellow-500/70";
    return "bg-green-500/70";
  };

  // Function to generate level options based on building type and TH level
  const getLevelOptions = (buildingName) => {
    const maxLevel = getMaxLevelForBuilding(buildingName, thLevel);
    return Array.from({ length: maxLevel }, (_, i) => i + 1);
  };

  if (!filteredResults || filteredResults.length === 0) {
    return (
      <div className="text-center text-white/70 py-6">
        No prediction results to display
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
      {filteredResults.map((item, index) => {
        const isLowConfidence = item.tm_confidence <= 0.45;
        const isMediumConfidence = item.tm_confidence > 0.45 && item.tm_confidence <= 0.70;
        const needsReview = isLowConfidence || isMediumConfidence;
        const isEditing = editMode[index];
        const buildingData = editableBuildings[index] || item;
        
        // Determine border and background styles based on confidence level
        let cardStyle = 'bg-white/15';
        if (isLowConfidence) {
          cardStyle = 'bg-white/20 border-2 border-red-500/50';
        } else if (isMediumConfidence) {
          cardStyle = 'bg-white/20 border-2 border-yellow-500/50';
        }
        
        return (
          <div
            key={index}
            className={`${cardStyle} rounded-lg overflow-hidden transition-all`}
          >
            <div className="relative">
              {item.image && showPredictionImages && (
                <div className="aspect-square w-full overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.building_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="absolute top-1 right-1 flex space-x-2">
                {!isEditing && (
                  <>
                    <button
                      onClick={() => handleRemoveBuilding(index)}
                      className="bg-red-500 text-white text-xs w-5 h-5 sm:w-6 sm:h-6 rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                      title="Remove this prediction"
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-xs" />
                    </button>
                    
                    {/* Add edit button that's more prominent for low/medium confidence */}
                    {needsReview && (
                      <button
                        onClick={() => handleStartEdit(index)}
                        className={`${isLowConfidence ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white text-xs w-5 h-5 sm:w-6 sm:h-6 rounded-full transition-colors flex items-center justify-center`}
                        title="Edit this prediction"
                      >
                        <FontAwesomeIcon icon={faEdit} className="text-xs" />
                      </button>
                    )}
                  </>
                )}
              </div>
              
              {/* Confidence indicator at top left */}
              {showPredictionDetails && item.tm_confidence && (
                <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-xs text-white ${getConfidenceBadgeColor(item.tm_confidence)}`}>
                  {Math.round(item.tm_confidence * 100)}%
                </div>
              )}
            </div>
            
            <div className="p-2">
              {isEditing ? (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-white/80 block mb-1">Type:</label>
                    <select
                      value={buildingData.building_name}
                      onChange={(e) => handleBuildingNameChange(index, e.target.value)}
                      className="w-full bg-gray-800 text-white text-xs rounded p-1 border border-gray-700"
                      ref={el => selectRefs.current[`name-${index}`] = el}
                    >
                      {availableBuildings.map((building) => {
                        // Get the current count for this building type
                        const currentCount = buildingCounts[building.name] || 0;
                        const maxCount = getAvailableCountForBuilding(building.name, thLevel);
                        const isCurrentBuilding = buildingData.building_name === building.name;
                        
                        // Set different status and styles based on count
                        let status = '';
                        let textColorClass = '';
                        
                        if (currentCount > maxCount) {
                          // Over limit
                          status = ' - OVER LIMIT';
                          textColorClass = 'text-red-400';
                        } else if (currentCount === maxCount && !isCurrentBuilding) {
                          // Max reached
                          status = ' - MAX REACHED';
                          textColorClass = 'text-orange-400';
                        } else if (currentCount === maxCount && isCurrentBuilding) {
                          // Current building is at max (but that's OK)
                          status = ' - MAX';
                          textColorClass = 'text-green-400';
                        } else {
                          // Normal
                          textColorClass = '';
                        }
                        
                        return (
                          <option 
                            key={building.name} 
                            value={building.name}
                            className={textColorClass}
                            style={{color: textColorClass ? textColorClass.replace('text-', '') : ''}}
                          >
                            {building.name} ({currentCount}/{maxCount})
                            {status}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-white/80 block mb-1">Level:</label>
                    <select
                      value={buildingData.level}
                      onChange={(e) => handleLevelChange(index, e.target.value)}
                      className="w-full bg-gray-800 text-white text-xs rounded p-1 border border-gray-700"
                    >
                      {getLevelOptions(buildingData.building_name).map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex space-x-2 pt-1">
                    <button
                      onClick={() => handleSaveEdit(index)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-0.5 px-1 rounded"
                      title="Save"
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                    
                    <button
                      onClick={() => handleCancelEdit(index)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-xs py-0.5 px-1 rounded"
                      title="Cancel"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 
                    className={`text-xs sm:text-sm text-white mb-1 truncate ${needsReview ? 'font-semibold' : ''}`} 
                    title={buildingData.building_name}
                    onClick={() => needsReview && handleStartEdit(index)}
                  >
                    {buildingData.building_name}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <span 
                      className={`text-white/90 px-2 py-1 rounded font-semibold text-sm ${
                        isLowConfidence ? 'bg-red-500/50 cursor-pointer' :
                        isMediumConfidence ? 'bg-yellow-500/50 cursor-pointer' :
                        getConfidenceBadgeColor(item.tm_confidence)
                      }`}
                      onClick={() => needsReview && handleStartEdit(index)}
                    >
                      Level: {buildingData.level}
                    </span>
                    
                    {/* Edit button for high confidence items */}
                    {!needsReview && (
                      <button
                        onClick={() => handleStartEdit(index)}
                        className="text-white/70 hover:text-white"
                        title="Edit this prediction"
                      >
                        <FontAwesomeIcon icon={faEdit} className="text-xs" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BuildingCards;
