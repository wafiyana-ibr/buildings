import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '@/hooks/useTheme';

const ThemeToggle = ({ className = "" }) => {
    const { theme, toggleTheme } = useTheme();
    
    return (
        <button 
            onClick={toggleTheme} 
            className={`group relative w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-white/10 hover:border-white/30 transition-all duration-300 ${className}`}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {/* Icon container with fixed dimensions */}
            <div className="relative flex items-center justify-center w-6 h-6">
                <FontAwesomeIcon 
                    icon={theme === 'light' ? faMoon : faSun} 
                    className="text-yellow-400 text-lg transform transition-transform duration-300 group-hover:scale-110 group-active:scale-95" 
                    style={{ filter: 'drop-shadow(0 0 2px rgba(250, 204, 21, 0.5))' }}
                />
                
                {/* Background glow effect */}
                <div 
                    className={`absolute inset-0 rounded-full ${
                        theme === 'light' 
                            ? 'bg-indigo-400/20 opacity-0' 
                            : 'bg-yellow-400/20 opacity-30'
                        } group-hover:opacity-60 transition-all duration-300`}
                    style={{ filter: 'blur(4px)' }}
                ></div>
            </div>
            
            {/* Tooltip */}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-gray-900/90 text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
                {theme === 'light' ? 'Dark mode' : 'Light mode'}
            </span>
        </button>
    );
};

export default ThemeToggle;