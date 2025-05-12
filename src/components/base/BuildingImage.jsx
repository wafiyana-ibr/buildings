import React from 'react';

const BuildingImage = ({ src, alt, size = "w-8 h-8" }) => (
  <img
    src={src}
    alt={alt}
    className={`${size} object-contain`}
    onError={(e) => { e.target.onerror = null; }}
  />
);

export default BuildingImage;
