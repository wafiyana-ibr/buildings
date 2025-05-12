import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faArrowRight } from '@fortawesome/free-solid-svg-icons'

const HeroSection = () => {
    return (
        <section id="hero" className="relative text-center mb-20 md:mb-28 px-4 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-20 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl"></div>
            
            {/* Main content */}
            <div className="relative z-10 max-w-5xl mx-auto">
                
                {/* Main heading with gradient and shadow effect */}
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-8 leading-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-yellow-100 to-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                        Check Your Clash of Clash Buildings Progress
                    </span>
                </h1>
                
                {/* Enhanced description with better spacing and typography */}
                <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
                    Monitor your development, analyze statistics, and optimize your game strategy 
                    with our advanced tracking tools.
                </p>
                
                {/* Call to action buttons */}
                <div className="flex flex-wrap justify-center gap-4">
                    <a href="#search" className="px-8 py-4 rounded-lg bg-yellow-500 text-white font-bold text-lg hover:shadow-lg hover:shadow-yellow-500 hover:bg-yellow-400 transition-all duration-300 flex items-center gap-2">
                        Search Player
                        <FontAwesomeIcon icon={faSearch} />
                    </a>
                    <a href="#guides" className="px-8 py-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-lg hover:bg-white/20 transition-all duration-300 flex items-center gap-2">
                        View Guide
                        <FontAwesomeIcon icon={faArrowRight} />
                    </a>
                </div>
            </div>
        </section>
    )
}

export default HeroSection;