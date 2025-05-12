import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const ErrorState = ({ error, onNavigateBack }) => {
    return (
        <div className="p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white">
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={onNavigateBack}
                    className="flex items-center gap-2 text-white/70 hover:text-white"
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    <span>Kembali</span>
                </button>
            </div>
            <div className="text-center py-10">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-400 text-4xl mb-4" />
                <h2 className="text-xl font-bold">Error</h2>
                <p className="text-white/70 mt-2">{error}</p>
            </div>
        </div>
    );
};

export default ErrorState;
