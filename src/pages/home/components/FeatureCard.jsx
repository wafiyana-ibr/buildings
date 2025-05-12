import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const FeatureCard = ({ icon, title, description }) => {
    return (
        <div className="feature-card group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/20 hover:-translate-y-1">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/10 via-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Content */}
            <div className="p-8 relative z-10 h-full flex flex-col">
                <div className="text-yellow-400 text-5xl mb-6 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                    <div className="p-4 rounded-full bg-white/5 border border-white/10 shadow-lg">
                        <FontAwesomeIcon icon={icon} />
                    </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 text-center group-hover:text-yellow-400 transition-colors duration-300">{title}</h3>
                
                <p className="text-white/80 text-center">{description}</p>
                
                {/* Animated corner accent */}
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-yellow-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-tl-3xl"></div>
            </div>
        </div>
    );
};

export default FeatureCard;