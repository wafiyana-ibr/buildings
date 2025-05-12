import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const LoadingState = ({ message = "Loading data..." }) => (
  <div className="p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white">
    <div className="text-center py-10">
      <FontAwesomeIcon icon={faSpinner} spin className="text-white text-4xl mb-4" />
      <p>{message}</p>
    </div>
  </div>
);

export default LoadingState;
