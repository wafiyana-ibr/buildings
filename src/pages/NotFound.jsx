import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faHome } from '@fortawesome/free-solid-svg-icons';

const NotFound = () => {
    return (
        <div className="mx-auto mt-42 p-8 bg text-center text-white">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-6xl mb-4 text-gray-300" />
            <h1 className="text-5xl font-bold mb-3">404</h1>
            <p className="text-xl mb-8">Page not found</p>
            <Link
                to="/"
                className="inline-flex items-center px-5 py-2 bg-yellow-400 text-black rounded-full hover:bg-yellow-500 hover:text-white/50 transition-colors duration-300 font-semibold"
            >
                <FontAwesomeIcon icon={faHome} className="mr-2" />
                Back to Home
            </Link>
        </div>
    );
};

export default NotFound;