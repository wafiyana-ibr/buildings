import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const LoadingState = ({ onNavigateBack }) => {
    return (
        <div className="my-20 p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white">
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
                <FontAwesomeIcon icon={faSpinner} spin className="text-white text-4xl mb-4" />
                <p>Memuat data base...</p>
            </div>
        </div>
    );
};

export default LoadingState;
