import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudUploadAlt, faCamera, faLink, faShield, faHome, 
  faTimes, faEdit, faExclamationTriangle, faInfoCircle, faCheckCircle, faImage
} from "@fortawesome/free-solid-svg-icons";
import getLinkLayoutBase from "@/utils/getLinkLayoutBase";

const ImageUploadSection = ({
  base,
  defensesImage,
  defensesPreview,
  resourcesImage,
  resourcesPreview,
  defensesInputRef,
  resourcesInputRef,
  handleDefensesFileChange,
  handleResourcesFileChange,
  handleRemoveDefensesImage,
  handleRemoveResourcesImage,
  error,
  openLightbox
}) => {
  return (
    <div>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column - Instructions */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10 h-fit">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-gradient-to-r from-yellow-400/30 to-amber-400/30 mr-3">
              <FontAwesomeIcon icon={faInfoCircle} className="text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Screenshot Guide</h3>
          </div>

          <ol className="list-decimal list-inside space-y-3 text-white/80 mb-5">
            <li className="p-2 rounded bg-white/5 border-l-2 border-yellow-400/50">
              <span className="font-medium text-white">Use our special layout</span>
              <p className="text-sm ml-5 mt-1">Click the button below to view and copy the layout</p>
            </li>
            <li className="p-2 rounded bg-white/5">
              <span className="font-medium text-white">Switch to edit mode in Clash of Clans</span>
              <p className="text-sm ml-5 mt-1">Use the war base editor for best results</p>
            </li>
            <li className="p-2 rounded bg-white/5">
              <span className="font-medium text-white">Take two separate screenshots:</span>
              <ul className="list-none ml-5 mt-1 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="bg-blue-400/20 text-blue-400 p-1 rounded">1</span>
                  <span><span className="text-yellow-300">Defense screenshot:</span> Top area with defensive buildings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-green-400/20 text-green-400 p-1 rounded">2</span>
                  <span><span className="text-yellow-300">Resource screenshot:</span> Bottom area with resource buildings</span>
                </li>
              </ul>
            </li>
            <li className="p-2 rounded bg-white/5">
              <span className="font-medium text-white">Ensure clear visibility</span>
              <p className="text-sm ml-5 mt-1">No shadows or UI elements covering buildings</p>
            </li>
          </ol>

          <div className="bg-yellow-400/10 p-4 rounded-lg mb-4 border border-yellow-400/30 flex items-start">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-400 mr-3 mt-1" />
            <div>
              <p className="text-yellow-300 font-medium">Important!</p>
              <p className="text-white/90 text-sm">Using our special layout is required for accurate AI detection.</p>
            </div>
          </div>

          {base && (
            <a
              target="_blank"
              href={getLinkLayoutBase(base.wafi_th_level)}
              className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-gray-900 py-3 px-5 rounded-lg font-medium inline-flex items-center shadow-md hover:shadow-yellow-400/30 transition-all duration-300 w-full justify-center"
              rel="noreferrer"
            >
              <FontAwesomeIcon icon={faLink} className="mr-2" />
              Use Special Layout for TH{base.wafi_th_level}
            </a>
          )}
        </div>

        {/* Right Column - Examples and Manual Option */}
        <div className="flex flex-col gap-5">
          {/* Example Screenshots */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-full bg-gradient-to-r from-blue-400/30 to-indigo-400/30 mr-3">
                <FontAwesomeIcon icon={faCamera} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Example Screenshots</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative group overflow-hidden rounded-lg border border-blue-400/30 bg-white/5">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/0 to-blue-500/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                  <p className="text-white font-medium text-sm px-2">Defense Side</p>
                </div>
                <img
                  src="/example-ss-defenses-layout.jpeg"
                  alt="Defense Screenshot Example"
                  className="rounded w-full h-36 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                  onClick={() => openLightbox("/example-ss-defenses-layout.jpeg")}
                />
              </div>
              
              <div className="relative group overflow-hidden rounded-lg border border-green-400/30 bg-white/5">
                <div className="absolute inset-0 bg-gradient-to-b from-green-500/0 to-green-500/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                  <p className="text-white font-medium text-sm px-2">Resource Side</p>
                </div>
                <img
                  src="/example-ss-resources-layout.jpeg"
                  alt="Resources Screenshot Example"
                  className="rounded w-full h-36 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                  onClick={() => openLightbox("/example-ss-resources-layout.jpeg")}
                />
              </div>
            </div>
            
            <div className="mt-3 text-center">
              <p className="text-white/60 text-sm">Click on images to enlarge</p>
            </div>
          </div>

          {/* Manual Option Card */}
          <div className="bg-gradient-to-r from-blue-400/10 to-indigo-400/10 backdrop-blur-md rounded-xl p-5 border border-blue-400/20 flex flex-col">
            <div className="flex items-center mb-3">
              <div className="p-2 rounded-full bg-white/10 mr-3">
                <FontAwesomeIcon icon={faEdit} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Prefer Manual Editing?</h3>
            </div>
            
            <p className="text-white/80 mb-4">
              If you prefer to enter your building levels manually instead of using the AI scan feature:
            </p>
            
            <Link
              to={`/base/${base?.wafi_tag?.replace('#', '')}/edit`}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium inline-flex items-center justify-center transition-colors duration-300"
            >
              <FontAwesomeIcon icon={faEdit} className="mr-2" />
              Edit Base Manually
            </Link>
          </div>
        </div>
      </div>

      {/* Upload Section - Modernized with better visual cues */}
      <div className="mt-10">
        <div className="flex items-center mb-5">
          <div className="p-2 rounded-full bg-white/10 mr-3">
            <FontAwesomeIcon icon={faCloudUploadAlt} className="text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Upload Your Screenshots</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Defense Upload */}
          <div className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 backdrop-blur-md rounded-xl border border-blue-400/20 overflow-hidden">
            <div className="bg-blue-500/20 px-4 py-2 border-b border-blue-400/20 flex items-center">
              <FontAwesomeIcon icon={faShield} className="text-blue-400 mr-2" />
              <h3 className="font-medium text-white">Defense Buildings Side</h3>
            </div>
            
            <div className={`p-5 flex flex-col items-center justify-center ${defensesImage ? 'min-h-48' : 'min-h-64'}`}>
              {defensesPreview ? (
                <div className="relative w-full">
                  <div className="absolute top-2 left-2 bg-blue-500/80 text-white text-xs py-1 px-2 rounded-md flex items-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                    Defense Image
                  </div>
                  <img
                    src={defensesPreview}
                    alt="Defense Buildings Preview"
                    className="max-h-[200px] mx-auto rounded-lg mb-4 border-2 border-blue-400/30"
                  />
                  <button
                    onClick={handleRemoveDefensesImage}
                    className="absolute top-2 right-2 bg-red-500/80 text-white w-7 h-7 rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                    title="Remove image"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                    <FontAwesomeIcon
                      icon={faImage}
                      className="text-3xl text-blue-400/70"
                    />
                  </div>
                  <p className="text-white/80 mb-2">
                    Upload a screenshot of your defense buildings
                  </p>
                  <p className="text-white/50 text-sm mb-4">
                    Recommended: Top part of your base
                  </p>
                </div>
              )}

              <input
                type="file"
                id="defensesInput"
                onChange={handleDefensesFileChange}
                className="hidden"
                accept="image/*"
                ref={defensesInputRef}
              />

              <button
                onClick={() => defensesInputRef.current.click()}
                className={`${defensesPreview 
                  ? "bg-white/10 text-white hover:bg-white/20" 
                  : "bg-blue-600 text-white hover:bg-blue-700"} 
                  py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center`}
              >
                <FontAwesomeIcon icon={faCamera} className="mr-2" />
                {defensesPreview ? "Change Image" : "Select Defense Image"}
              </button>
            </div>
          </div>

          {/* Resources Upload */}
          <div className="bg-gradient-to-br from-green-500/5 to-green-500/10 backdrop-blur-md rounded-xl border border-green-400/20 overflow-hidden">
            <div className="bg-green-500/20 px-4 py-2 border-b border-green-400/20 flex items-center">
              <FontAwesomeIcon icon={faHome} className="text-green-400 mr-2" />
              <h3 className="font-medium text-white">Resource Buildings Side</h3>
            </div>
            
            <div className={`p-5 flex flex-col items-center justify-center ${resourcesImage ? 'min-h-48' : 'min-h-64'}`}>
              {resourcesPreview ? (
                <div className="relative w-full">
                  <div className="absolute top-2 left-2 bg-green-500/80 text-white text-xs py-1 px-2 rounded-md flex items-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                    Resource Image
                  </div>
                  <img
                    src={resourcesPreview}
                    alt="Resource Buildings Preview"
                    className="max-h-[200px] mx-auto rounded-lg mb-4 border-2 border-green-400/30"
                  />
                  <button
                    onClick={handleRemoveResourcesImage}
                    className="absolute top-2 right-2 bg-red-500/80 text-white w-7 h-7 rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                    title="Remove image"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                    <FontAwesomeIcon
                      icon={faImage}
                      className="text-3xl text-green-400/70"
                    />
                  </div>
                  <p className="text-white/80 mb-2">
                    Upload a screenshot of your resource buildings
                  </p>
                  <p className="text-white/50 text-sm mb-4">
                    Recommended: Bottom part of your base
                  </p>
                </div>
              )}

              <input
                type="file"
                id="resourcesInput"
                onChange={handleResourcesFileChange}
                className="hidden"
                accept="image/*"
                ref={resourcesInputRef}
              />

              <button
                onClick={() => resourcesInputRef.current.click()}
                className={`${resourcesPreview 
                  ? "bg-white/10 text-white hover:bg-white/20" 
                  : "bg-green-600 text-white hover:bg-green-700"} 
                  py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center`}
              >
                <FontAwesomeIcon icon={faCamera} className="mr-2" />
                {resourcesPreview ? "Change Image" : "Select Resource Image"}
              </button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mt-6 flex items-center border border-red-500/30">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="mr-2 text-xl"
            />
            <span>{error}</span>
          </div>
        )}

        {/* Upload Status Indicator */}
        <div className="mt-6 flex justify-center">
          <div className="bg-white/5 rounded-full px-5 py-2 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${defensesImage ? 'bg-blue-400' : 'bg-white/20'}`}></div>
              <span className={`text-sm ${defensesImage ? 'text-white' : 'text-white/50'}`}>Defense Image</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${resourcesImage ? 'bg-green-400' : 'bg-white/20'}`}></div>
              <span className={`text-sm ${resourcesImage ? 'text-white' : 'text-white/50'}`}>Resource Image</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadSection;
