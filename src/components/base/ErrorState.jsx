import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const ErrorState = ({ error, message = "An error occurred" }) => (
  <div className="p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white">
    <div className="text-center py-10">
      <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-400 text-4xl mb-4" />
      <h2 className="text-xl font-bold">{message}</h2>
      <p className="text-white/70 mt-2">{error}</p>
    </div>
  </div>
);

export default ErrorState;
