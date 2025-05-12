import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner, faExclamationTriangle, faInfoCircle,
  faHammer, faArrowLeft, faQuestionCircle, faSearch, faChessRook
} from "@fortawesome/free-solid-svg-icons";
import PredictionAPI from "@/api/predictionAPI";
import { objectAPI, baseAPI } from "@/api/dbAPI";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip } from "react-tooltip";

// Import new components
import ImageUploadSection from "./components/BaseScan/ImageUploadSection";
import ResultsSection from "./components/BaseScan/ResultsSection";
import Lightbox from "./components/BaseScan/Lightbox";
import { filterPredictionsByAvailableCount } from "./components/BaseScan/buildingHelpers";

const BaseScan = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const tag = id.startsWith('#') ? id : `#${id}`;
  const [defensesImage, setDefensesImage] = useState(null);
  const [defensesPreview, setDefensesPreview] = useState(null);
  const [resourcesImage, setResourcesImage] = useState(null);
  const [resourcesPreview, setResourcesPreview] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [base, setBase] = useState(null);

  const defensesInputRef = useRef(null);
  const resourcesInputRef = useRef(null);
  const { user } = useAuth();
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState('');
  const [isBaseExists, setIsBaseExists] = useState(true);
  const [showPredictionDetails, setShowPredictionDetails] = useState(false);
  const [predictionFilter, setPredictionFilter] = useState("default"); // Default is now "lowest confidence"
  const [showPredictionImages, setShowPredictionImages] = useState(true);

  useEffect(() => {
    const fetchBaseData = async () => {
      if (id) {
        try {
          const baseData = await baseAPI.getUserBaseByTag(user.id, tag);
          setBase(baseData);
          setIsBaseExists(true);
        } catch (error) {
          setIsBaseExists(false);
          console.error("Error fetching base data:", error);
          setError("Failed to fetch base data. Please try again.");
        }
      } else {
        setError("Base ID not found.");
      }
    };
    fetchBaseData();
  }, [user?.id, id]);

  const handleDefensesFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setDefensesImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDefensesPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    } else if (file) {
      setError("The selected file is not an image. Please select an image file.");
    }
  };

  const handleRemoveDefensesImage = () => {
    setDefensesImage(null);
    setDefensesPreview(null);
    if (defensesInputRef.current) {
      defensesInputRef.current.value = "";
    }
  };

  const handleResourcesFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setResourcesImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setResourcesPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    } else if (file) {
      setError("The selected file is not an image. Please select an image file.");
    }
  };

  const handleRemoveResourcesImage = () => {
    setResourcesImage(null);
    setResourcesPreview(null);
    if (resourcesInputRef.current) {
      resourcesInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!defensesImage && !resourcesImage) {
      setError("Please select at least one image (defenses or resources)");
      return;
    }

    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    if (defensesImage) formData.append('defensesImage', defensesImage);
    if (resourcesImage) formData.append('resourcesImage', resourcesImage);

    try {
      const response = await PredictionAPI.predict(formData);

      // Apply filtering based on available building counts
      const filteredResponse = filterPredictionsByAvailableCount(response, base.wafi_th_level);

      // Sort results to place low and medium confidence items at the top (initial sort)
      const sortedResponse = [...filteredResponse].sort((a, b) => {
        // Sort by confidence (lower first) - this makes the default "lowest confidence"
        return (a.tm_confidence || 0) - (b.tm_confidence || 0);
      });

      setResults(sortedResponse);
      setFilteredResults(sortedResponse);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred while processing images");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFilterChange = (filterType) => {
    setPredictionFilter(filterType);
    
    // Store current filtered items to a temporary array - this preserves our removals
    const currentFilteredIds = new Set(filteredResults.map(item => 
      `${item.building_name}-${item.tm_confidence}-${item.level}`));
    
    let sortedResults = [];
    
    if (filterType === "default") {
      // Sort by lowest confidence (this is now the default)
      sortedResults = [...results]
        .filter(item => currentFilteredIds.has(`${item.building_name}-${item.tm_confidence}-${item.level}`))
        .sort((a, b) => (a.tm_confidence || 0) - (b.tm_confidence || 0));
    } else if (filterType === "highest") {
      // Sort by highest confidence
      sortedResults = [...results]
        .filter(item => currentFilteredIds.has(`${item.building_name}-${item.tm_confidence}-${item.level}`))
        .sort((a, b) => (b.tm_confidence || 0) - (a.tm_confidence || 0));
    } else if (filterType === "byname") {
      // Sort alphabetically by building name
      sortedResults = [...results]
        .filter(item => currentFilteredIds.has(`${item.building_name}-${item.tm_confidence}-${item.level}`))
        .sort((a, b) => a.building_name.localeCompare(b.building_name));
    } else if (filterType === "nofilter") {
      // No sorting, just use the original order
      sortedResults = results
        .filter(item => currentFilteredIds.has(`${item.building_name}-${item.tm_confidence}-${item.level}`));
    }
    
    setFilteredResults(sortedResults);
  };

  const handleRemoveBuilding = (indexToRemove) => {
    setFilteredResults(filteredResults.filter((_, index) => index !== indexToRemove));
    
    // Also update the original results to permanently remove this item
    const itemToRemove = filteredResults[indexToRemove];
    const itemKey = `${itemToRemove.building_name}-${itemToRemove.tm_confidence}-${itemToRemove.level}`;
    
    setResults(results.filter(item => 
      `${item.building_name}-${item.tm_confidence}-${item.level}` !== itemKey
    ));
  };

  const handleRemoveLowConfidencePredictions = () => {
    // Save IDs of items to be removed
    const lowConfidenceIds = new Set(
      filteredResults
        .filter(item => item.tm_confidence <= 0.45)
        .map(item => `${item.building_name}-${item.tm_confidence}-${item.level}`)
    );
    
    // Filter both results arrays
    setFilteredResults(filteredResults.filter(item => item.tm_confidence > 0.45));
    setResults(results.filter(item => 
      !lowConfidenceIds.has(`${item.building_name}-${item.tm_confidence}-${item.level}`)
    ));
  };

  const handleRemoveMediumConfidencePredictions = () => {
    // Save IDs of items to be removed
    const mediumLowConfidenceIds = new Set(
      filteredResults
        .filter(item => item.tm_confidence <= 0.70)
        .map(item => `${item.building_name}-${item.tm_confidence}-${item.level}`)
    );
    
    // Filter both results arrays
    setFilteredResults(filteredResults.filter(item => item.tm_confidence > 0.70));
    setResults(results.filter(item => 
      !mediumLowConfidenceIds.has(`${item.building_name}-${item.tm_confidence}-${item.level}`)
    ));
  };

  const handleToggleImages = () => {
    setShowPredictionImages(!showPredictionImages);
  };

  const handleApplyAllPredictions = async () => {
    if (!base || !base.wafi_id) {
      setError("Base data not found. Please try scanning again.");
      return;
    }

    if (filteredResults.length === 0) {
      setError("No predictions to apply.");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const buildings = filteredResults.map(item => ({
        name: item.building_name,
        level: parseInt(item.level)
      }));

      // Call the new API endpoint for creating/updating objects from scan
      const response = await objectAPI.createOrUpdateObjects(base.wafi_id, buildings);
      setSaveSuccess(true);
    } catch (err) {
      console.error("Error applying predictions:", err);
      setError(err.response?.data?.error || "Failed to save predictions to database");
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        navigate(`/base/${id}`);
      }, 1000);
    }
  };

  const handleUpdateBuildingDetails = (index, updatedDetails) => {
    const updatedResults = [...filteredResults];
    updatedResults[index] = {
      ...updatedResults[index],
      ...updatedDetails
    };
    
    setFilteredResults(updatedResults);
    
    // Also update the matching building in the original results array
    const originalItem = filteredResults[index];
    const originalItemKey = `${originalItem.building_name}-${originalItem.tm_confidence}-${originalItem.level}`;
    
    const updatedOriginalResults = results.map(item => {
      const itemKey = `${item.building_name}-${item.tm_confidence}-${item.level}`;
      if (itemKey === originalItemKey) {
        return {
          ...item,
          ...updatedDetails
        };
      }
      return item;
    });
    
    setResults(updatedOriginalResults);
  };

  const openLightbox = (imageSrc) => {
    setLightboxImage(imageSrc);
    setIsLightboxOpen(true);
  };

  // Error state - base not found
  if (!isBaseExists) {
    return (
      <div className="my-28 p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/base")}
            className="flex items-center gap-2 text-white/70 hover:text-white"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Kembali</span>
          </button>
        </div>
        <div className="text-center py-10">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-400 text-4xl mb-4" />
          <h2 className="text-xl font-bold">Base tidak ditemukan</h2>
          <p className="text-white/70 mt-2">Base dengan tag {tag} tidak terdaftar di sistem.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl my-18 sm:my-22 mx-auto px-4 py-8 relative">
      {/* Decorative elements */}
      <div className="absolute -top-20 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-40 left-1/4 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl -z-10"></div>
      
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 relative inline-block">
            Update Base Progress
            <div className="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-yellow-400 to-transparent"></div>
          </h1>
          <p className="text-white/70">Upload screenshots to analyze and update your base progress</p>
        </div>
        
        <button
          onClick={() => navigate(`/base/${id}`)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors duration-300"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Back to Base</span>
        </button>
      </div>

      {/* Base Info Card */}
      {base && (
        <div className="mb-8 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-xl p-5 border border-white/20 text-white transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/20">
          <div className="flex items-center">
            <div className="flex items-center justify-center p-2 bg-white/10 rounded-lg border border-white/20 mr-4">
              <img
                src={`${import.meta.env.VITE_ASSETS_URL}/th/th-${base.wafi_th_level}.png`}
                alt={`Clash of clash TH-${base.wafi_th_level}`}
                className="w-12 h-12"
              />
            </div>
            <div>
              <h2 className="font-bold text-xl flex items-center gap-2">
                {base.wafi_name}
                <span className="text-sm bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full font-normal flex items-center">
                  <FontAwesomeIcon icon={faChessRook} className="mr-1" />
                  TH{base.wafi_th_level}
                </span>
              </h2>
              <p className="text-sm text-white/70">{base.wafi_tag}</p>
            </div>
          </div>
        </div>
      )}

      {/* Info Card Section */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-yellow-400" />
            How to Take Good Screenshots for Best Results
          </div>

          {/* Tombol info dengan tooltip untuk supported buildings */}
          <button
            data-tooltip-id="supported-buildings-tooltip"
            className="text-white/90 hover:text-white/100 transition-colors text-base flex items-center gap-2"
          >
            Supported Buildings
            <FontAwesomeIcon icon={faQuestionCircle} className="text-xl" />
          </button>

          {/* Tooltip untuk menampilkan daftar bangunan yang didukung */}
          <Tooltip id="supported-buildings-tooltip" className="z-50 w-80 opacity-100">
            <div className="text-left p-1">
              <h3 className="font-bold text-lg mb-2 text-yellow-400">Supported Buildings</h3>

              <div className="mb-2">
                <h4 className="font-semibold text-yellow-200">Supported:</h4>
                <p className="text-sm">All Defense and Resource Buildings TH 1 - TH 15</p>
              </div>
              <div>
                <h4 className="font-semibold text-red-300">Not Supported:</h4>
                <p className="text-sm">Walls, All Traps</p>
              </div>
            </div>
          </Tooltip>
        </h2>

        {/* Image Upload Section */}
        <ImageUploadSection 
          base={base}
          defensesImage={defensesImage}
          defensesPreview={defensesPreview}
          resourcesImage={resourcesImage}
          resourcesPreview={resourcesPreview}
          defensesInputRef={defensesInputRef}
          resourcesInputRef={resourcesInputRef}
          handleDefensesFileChange={handleDefensesFileChange}
          handleResourcesFileChange={handleResourcesFileChange}
          handleRemoveDefensesImage={handleRemoveDefensesImage}
          handleRemoveResourcesImage={handleRemoveResourcesImage}
          error={error}
          openLightbox={openLightbox}
        />

        <button
          onClick={handleSubmit}
          disabled={(!defensesImage && !resourcesImage) || isProcessing}
          className={`w-full mt-6 py-3.5 px-6 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            (!defensesImage && !resourcesImage) || isProcessing
              ? "bg-white/30 cursor-not-allowed text-white/70"
              : "bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-gray-900 shadow-md hover:shadow-yellow-400/20"
          }`}
        >
          {isProcessing ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
              Processing...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faSearch} className="mr-2" />
              Analyze Base
            </>
          )}
        </button>
      </div>

      {/* Results Section with improved styling */}
      <div className="results-section">
        {isProcessing ? (
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-8 border border-white/20 flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-yellow-400 animate-spin"></div>
              <FontAwesomeIcon
                icon={faSpinner}
                className="text-5xl text-yellow-400 absolute inset-0 flex items-center justify-center h-full"
              />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Analyzing Your Base
            </h3>
            <p className="text-white/80 text-center max-w-md">
              Please wait while our AI detects buildings and calculates upgrade times. This may take up to 1 minute.
            </p>
            <div className="mt-4 flex gap-2 flex-wrap justify-center">
              <div className="bg-white/10 border border-white/20 rounded-full px-3 py-1 text-sm">Detecting buildings</div>
              <div className="bg-white/10 border border-white/20 rounded-full px-3 py-1 text-sm">Processing levels</div>
              <div className="bg-white/10 border border-white/20 rounded-full px-3 py-1 text-sm">Calculating upgrades</div>
            </div>
          </div>
        ) : results ? (
          <ResultsSection 
            base={base}
            results={results}
            filteredResults={filteredResults}
            isSaving={isSaving}
            error={error}
            saveSuccess={saveSuccess}
            showPredictionDetails={showPredictionDetails}
            predictionFilter={predictionFilter}
            showPredictionImages={showPredictionImages}
            handleToggleImages={handleToggleImages}
            handleFilterChange={handleFilterChange}
            handleRemoveBuilding={handleRemoveBuilding}
            handleRemoveLowConfidencePredictions={handleRemoveLowConfidencePredictions}
            handleRemoveMediumConfidencePredictions={handleRemoveMediumConfidencePredictions}
            handleApplyAllPredictions={handleApplyAllPredictions}
            setShowPredictionDetails={setShowPredictionDetails}
            handleUpdateBuildingDetails={handleUpdateBuildingDetails}
          />
        ) : (
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-8 border border-white/20 flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
              <FontAwesomeIcon
                icon={faHammer}
                className="text-4xl text-yellow-400"
              />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Ready to Analyze Your Base
            </h3>
            <p className="text-white/80 text-center mb-5 max-w-lg">
              Upload screenshots of your village using our special layout to get detailed upgrade information
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <div className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-white/70 flex items-center">
                <FontAwesomeIcon icon={faInfoCircle} className="text-blue-400 mr-2" />
                Step 1: Upload both screenshots
              </div>
              <div className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-white/70 flex items-center">
                <FontAwesomeIcon icon={faInfoCircle} className="text-blue-400 mr-2" />
                Step 2: Click Analyze
              </div>
              <div className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-white/70 flex items-center">
                <FontAwesomeIcon icon={faInfoCircle} className="text-blue-400 mr-2" />
                Step 3: Review results
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox component */}
      <Lightbox 
        isOpen={isLightboxOpen} 
        imageSrc={lightboxImage}
        onClose={() => setIsLightboxOpen(false)}
      />
    </div>
  );
};

export default BaseScan;