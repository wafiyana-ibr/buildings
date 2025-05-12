import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ProgressBar = ({ label, percentage, icon, className = "" }) => (
  <div className={className}>
    <div className="flex justify-between items-center text-xs mb-1">
      <span className="flex items-center gap-1.5">
        {icon && <FontAwesomeIcon icon={icon} className="w-3 h-3 text-white/60" />}
        {label}
      </span>
      <span>{percentage}%</span>
    </div>
    <div className="h-1.5 bg-gray-700 rounded-full w-full overflow-hidden">
      <div
        className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  </div>
);

export default ProgressBar;
