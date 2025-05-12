import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const Lightbox = ({ isOpen, imageSrc, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" 
      onClick={onClose}
    >
      <div 
        className="max-w-[90%] max-h-[90%] relative" 
        onClick={e => e.stopPropagation()}
      >
        <img
          src={imageSrc}
          alt="Expanded preview"
          className="max-w-full max-h-[90vh] object-contain"
        />
        <button
          className="absolute top-2 right-2 bg-white/20 hover:bg-white/40 rounded-full p-2 text-white"
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
};

export default Lightbox;
