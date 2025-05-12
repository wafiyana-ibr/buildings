import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faFilter, faTrash, faSortAlphaDown } from "@fortawesome/free-solid-svg-icons";

const ConfidenceFilter = ({
  predictionFilter,
  showPredictionImages,
  showPredictionDetails,
  handleToggleImages,
  handleFilterChange,
  handleRemoveLowConfidencePredictions,
  handleRemoveMediumConfidencePredictions,
  setShowPredictionDetails
}) => {
  return (
    <div className="mb-6 bg-white/10 p-4 rounded-lg">
      <h3 className="text-white font-medium mb-4">Detected Buildings</h3>
      
      {/* Primary actions row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        <button
          onClick={handleToggleImages}
          className="bg-white/10 hover:bg-white/20 text-white/90 rounded-lg px-3 py-2 text-sm flex items-center justify-center gap-2 transition-colors"
          title={showPredictionImages ? "Hide Images" : "Show Images"}
        >
          <FontAwesomeIcon icon={showPredictionImages ? faEyeSlash : faEye} className="text-xs sm:text-sm" />
          <span>{showPredictionImages ? "Hide Images" : "Show Images"}</span>
        </button>
        
        <div className="relative w-full">
          <button
            className="bg-white/10 hover:bg-white/20 text-white/90 rounded-lg px-3 py-2 text-sm flex items-center justify-center gap-2 transition-colors w-full"
            onClick={() => {
              const menu = document.getElementById('filter-menu');
              menu.classList.toggle('hidden');
            }}
          >
            <FontAwesomeIcon icon={faFilter} className="text-xs sm:text-sm" />
            <span>
              {predictionFilter === "default" && "Filter: Lowest Confidence"}
              {predictionFilter === "highest" && "Filter: Highest Confidence"}
              {predictionFilter === "byname" && "Filter: By Building Name"}
            </span>
          </button>
          <div id="filter-menu" className="absolute left-0 right-0 sm:right-auto sm:w-48 mt-1 bg-gray-800 rounded-lg shadow-md z-10 hidden">
            <ul className="py-1">
              <li>
                <button 
                  onClick={() => {
                    handleFilterChange("default");
                    document.getElementById('filter-menu').classList.add('hidden');
                  }}
                  className="block px-4 py-2 text-sm text-white/90 hover:bg-white/10 w-full text-left"
                >
                  Lowest Confidence
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    handleFilterChange("highest");
                    document.getElementById('filter-menu').classList.add('hidden');
                  }}
                  className="block px-4 py-2 text-sm text-white/90 hover:bg-white/10 w-full text-left"
                >
                  Highest Confidence
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    handleFilterChange("byname");
                    document.getElementById('filter-menu').classList.add('hidden');
                  }}
                  className="px-4 py-2 text-sm text-white/90 hover:bg-white/10 w-full text-left flex items-center"
                >
                  <FontAwesomeIcon icon={faSortAlphaDown} className="mr-2" />
                  By Building Name
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Remove actions row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        <button
          onClick={handleRemoveLowConfidencePredictions}
          className="bg-red-600/70 hover:bg-red-700/70 text-white/90 rounded-lg px-3 py-2 text-sm flex items-center justify-center gap-2 transition-colors"
          title="Remove all low confidence predictions (<=45%)"
        >
          <FontAwesomeIcon icon={faTrash} className="text-xs sm:text-sm" />
          <span>Remove Low Confidence</span>
        </button>
        
        <button
          onClick={handleRemoveMediumConfidencePredictions}
          className="bg-red-600/70 hover:bg-red-700/70 text-white/90 rounded-lg px-3 py-2 text-sm flex items-center justify-center gap-2 transition-colors"
          title="Remove all medium and low confidence predictions (<=70%)"
        >
          <FontAwesomeIcon icon={faTrash} className="text-xs sm:text-sm" />
          <span>Remove Medium & Low</span>
        </button>
      </div>
      
      {/* Toggle for prediction details */}
      <div className="flex items-center justify-between">
        <span className="text-white/80 text-sm">Show Prediction Details</span>
        <button
          onClick={() => setShowPredictionDetails(!showPredictionDetails)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showPredictionDetails ? 'bg-yellow-400' : 'bg-gray-600'}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showPredictionDetails ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
      </div>
    </div>
  );
};

export default ConfidenceFilter;
