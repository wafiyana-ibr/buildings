import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner, faCheck, faSave, faEye, faTrash, 
  faEyeSlash, faFilter, faExclamationTriangle, faWarning
} from "@fortawesome/free-solid-svg-icons";
import BuildingCards from "./BuildingCards";
import ConfidenceFilter from "./ConfidenceFilter";
import { getAvailableCountForBuilding } from "./buildingHelpers";

const ResultsSection = ({
  base,
  results,
  filteredResults,
  isSaving,
  error,
  saveSuccess,
  showPredictionDetails,
  predictionFilter,
  showPredictionImages,
  handleToggleImages,
  handleFilterChange,
  handleRemoveBuilding,
  handleRemoveLowConfidencePredictions,
  handleRemoveMediumConfidencePredictions,
  handleApplyAllPredictions,
  setShowPredictionDetails,
  handleUpdateBuildingDetails
}) => {
  // Stats about confidence levels
  const lowConfidence = filteredResults.filter(item => item.tm_confidence <= 0.45).length;
  const mediumConfidence = filteredResults.filter(item => item.tm_confidence > 0.45 && item.tm_confidence <= 0.70).length;
  const highConfidence = filteredResults.filter(item => item.tm_confidence > 0.70).length;
  
  // State for validation errors
  const [validationError, setValidationError] = useState(null);
  
  // Validate building counts before applying
  const validateAndApply = () => {
    setValidationError(null);
    
    // Count all building types
    const buildingCounts = {};
    filteredResults.forEach(item => {
      buildingCounts[item.building_name] = (buildingCounts[item.building_name] || 0) + 1;
    });
    
    // Check if any building exceeds max count for current TH
    const thLevel = base?.wafi_th_level;
    const overLimitBuildings = [];
    
    Object.entries(buildingCounts).forEach(([buildingName, count]) => {
      const maxCount = getAvailableCountForBuilding(buildingName, thLevel);
      if (count > maxCount) {
        overLimitBuildings.push({
          name: buildingName,
          count: count,
          max: maxCount
        });
      }
    });
    
    if (overLimitBuildings.length > 0) {
      // Format error message
      const errorItems = overLimitBuildings.map(b => 
        `${b.name}: ${b.count}/${b.max}`
      ).join(', ');
      
      setValidationError(
        `Cannot apply predictions. Some building types exceed the maximum count for TH${thLevel}: ${errorItems}`
      );
      return;
    }
    
    // If validation passes, proceed with applying predictions
    handleApplyAllPredictions();
  };
  
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border-2 border-white/20 overflow-hidden">
      <div className="bg-yellow-400 p-4">
        <h3 className="text-xl font-bold text-gray-900">Analysis Results</h3>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <div className="bg-white/10 p-4 rounded-lg mb-4">
            <h4 className="text-white font-semibold mb-2">Buildings Detected:</h4>
            <div className="flex flex-wrap gap-2 items-center">
              <p className="text-white/80">Total: {filteredResults.length}</p>
              {filteredResults.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-sm mt-1 sm:mt-0">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500/70"></div>
                    <span className="text-white/70">
                      Low: {lowConfidence}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500/70"></div>
                    <span className="text-white/70">
                      Medium: {mediumConfidence}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500/70"></div>
                    <span className="text-white/70">
                      High: {highConfidence}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Low/Medium confidence count alert */}
          {(lowConfidence > 0 || mediumConfidence > 0) && (
            <div className="bg-yellow-500/20 text-yellow-300 p-4 rounded-lg mb-4 flex items-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
              <div>
                <p className="font-semibold">Building detection needs review</p>
                <p className="text-sm mt-1">
                  {lowConfidence + mediumConfidence} buildings have low/medium confidence. 
                  Please review and edit building names and levels below.
                </p>
              </div>
            </div>
          )}
          
          {/* Validation error message */}
          {validationError && (
            <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-4 flex items-start">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 mt-0.5" />
              <div>
                <p className="font-semibold">Validation Error</p>
                <p className="text-sm mt-1">{validationError}</p>
                <p className="text-sm mt-2">
                  Please remove some buildings or change their types to stay within the limits for TH{base?.wafi_th_level}.
                </p>
              </div>
            </div>
          )}

          {/* Save button */}
          {filteredResults.length > 0 && (
            <button
              onClick={validateAndApply}
              disabled={isSaving}
              className={`text-black bg-yellow-400 p-3 w-full rounded-md font-semibold hover:bg-yellow-500 transition-all mb-4 flex items-center justify-center ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSaving ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  Apply All Predictions
                </>
              )}
            </button>
          )}

          {/* Success message */}
          {saveSuccess && (
            <div className="bg-green-500/20 text-green-400 p-4 rounded-lg mb-4 flex items-center">
              <FontAwesomeIcon icon={faCheck} className="mr-2" />
              <span>Predictions successfully saved to database!</span>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-4 flex items-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Improved responsive layout for filter controls */}
        <ConfidenceFilter 
          predictionFilter={predictionFilter}
          showPredictionImages={showPredictionImages}
          showPredictionDetails={showPredictionDetails}
          handleToggleImages={handleToggleImages}
          handleFilterChange={handleFilterChange}
          handleRemoveLowConfidencePredictions={handleRemoveLowConfidencePredictions}
          handleRemoveMediumConfidencePredictions={handleRemoveMediumConfidencePredictions}
          setShowPredictionDetails={setShowPredictionDetails}
        />

        <div className="bg-white/10 p-3 rounded-lg mb-4">
          <h4 className="font-semibold text-white mb-2">Confidence Levels:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500/70 mr-2"></div>
              <span className="text-white/80 text-xs">Low (&lt;45%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500/70 mr-2"></div>
              <span className="text-white/80 text-xs">Medium (&lt;70%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500/70 mr-2"></div>
              <span className="text-white/80 text-xs">High (&lt;100%)</span>
            </div>
          </div>
          <p className="text-xs text-white/70 mt-2">
            Note: These predictions are not 100% accurate and the process is still being optimized.
            Please review each building before saving.
          </p>
        </div>

        <BuildingCards 
          filteredResults={filteredResults}
          showPredictionImages={showPredictionImages}
          showPredictionDetails={showPredictionDetails}
          thLevel={base?.wafi_th_level}
          handleRemoveBuilding={handleRemoveBuilding}
          handleUpdateBuildingDetails={handleUpdateBuildingDetails}
        />
      </div>
    </div>
  );
};

export default ResultsSection;
