import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Reusable TabNavigation component
 * Used in both Base.jsx and BaseEdit.jsx
 */
const TabNavigation = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  thLevel = 1,
  showLabels = true,
  className = "",
  itemClassName = "" 
}) => {
  // Filter tabs based on TH level requirements
  const availableTabs = Object.entries(tabs)
    .filter(([, tabInfo]) => !tabInfo.minTH || thLevel >= tabInfo.minTH)
    .map(([tabName, tabInfo]) => ({ name: tabName, ...tabInfo }));

  return (
    <div className={`mb-6 ${className}`}>
      {showLabels && (
        <div className="text-sm font-medium text-white/70 mb-2">
          Building Categories
        </div>
      )}
      <div className="flex flex-wrap gap-2 mb-4">
        {availableTabs.map(tab => (
          <button
            key={tab.name}
            onClick={() => onTabChange(tab.name)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-all ${
              activeTab === tab.name
                ? "bg-yellow-400 text-gray-900 font-medium"
                : "bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
            } ${itemClassName}`}
            data-tooltip-id={tab.tooltip ? "tab-tooltip" : undefined}
            data-tooltip-content={tab.tooltip}
          >
            {tab.icon && <FontAwesomeIcon icon={tab.icon} />}
            {showLabels && <span>{tab.name}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;
