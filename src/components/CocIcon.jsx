import React from 'react'
const ASSETS_URL = import.meta.env.VITE_ASSETS_URL
const CocIcon = ({ iconName, className }) => {
    if (iconName) iconName.toLowerCase().split(" ").join("-");
    return <img src={`${ASSETS_URL}/icon/${iconName}.png`} alt={iconName} className={`w-4 h-4 ${className}`} />;

};

export default CocIcon