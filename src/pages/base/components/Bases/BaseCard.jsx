import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faArrowRight, faCalendarAlt, faTag, faChessRook } from "@fortawesome/free-solid-svg-icons";
import getTownhallIcon from "../../../../helpers/getTownhallIcon";

const BaseCard = ({ base, onDelete }) => {
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const handleSelectBase = () => {
        navigate(`/base/${base.wafi_tag.replace('#', '')}`);
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        
        // Use a more direct import approach to avoid optimization issues
        import('sweetalert2').then((Swal) => {
            const SweetAlert = Swal.default;
            
            SweetAlert.fire({
                title: 'Are you sure?',
                html: `You are about to delete base <b>${base.wafi_name}</b> (${base.wafi_tag}).<br>This action cannot be undone!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!',
                background: '#2a2a2a',
                color: '#fff',
                iconColor: '#f0ad4e',
            }).then((result) => {
                if (result.isConfirmed) {
                    onDelete(base.wafi_id);
                    
                    SweetAlert.fire({
                        title: 'Deleted!',
                        text: `Base ${base.wafi_name} has been deleted.`,
                        icon: 'success',
                        background: '#2a2a2a',
                        color: '#fff',
                        iconColor: '#5cb85c',
                        confirmButtonColor: '#3085d6',
                    });
                }
            });
        }).catch(error => {
            console.error("Failed to load SweetAlert:", error);
            // Fallback simple confirmation
            if (window.confirm(`Are you sure you want to delete ${base.wafi_name}?`)) {
                onDelete(base.wafi_id);
            }
        });
    };

    // Select background color based on TH level
    const getBgGradient = (thLevel) => {
        const level = parseInt(thLevel);
        if (level >= 12) return "from-purple-500/20 to-indigo-500/10"; // Higher TH levels
        if (level >= 9) return "from-blue-500/20 to-cyan-500/10"; // Mid-high TH levels
        if (level >= 6) return "from-amber-500/20 to-orange-500/10"; // Mid TH levels
        return "from-green-500/20 to-emerald-500/10"; // Lower TH levels
    };

    return (
        <div
            className={`group bg-gradient-to-br ${getBgGradient(base.wafi_th_level)} backdrop-blur-md rounded-xl p-6 border border-white/20 text-white relative transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/20 hover:-translate-y-1 cursor-pointer overflow-hidden`}
            onClick={handleSelectBase}
        >
            {/* Background design element */}
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Town Hall Badge */}
            <div className="absolute top-5 right-5 bg-white/10 backdrop-blur-lg rounded-full p-1 border border-white/30 shadow-lg">
                <img
                    src={getTownhallIcon(base.wafi_th_level)}
                    alt={`Townhall ${base.wafi_th_level} Clash Of Clans`}
                    className="w-10 h-10 transition-transform duration-300 group-hover:scale-110"
                />
            </div>
            
            {/* Content */}
            <div className="flex flex-col h-full">
                {/* Title section */}
                <div className="mb-4">
                    <h2 className="text-xl font-bold mb-1 pr-12 group-hover:text-yellow-400 transition-colors duration-300">{base.wafi_name}</h2>
                    <div className="flex items-center text-white/70 text-sm">
                        <FontAwesomeIcon icon={faTag} className="mr-1.5 text-white/50" />
                        <span>{base.wafi_tag}</span>
                    </div>
                </div>
                
                {/* Details section */}
                <div className="space-y-2 mb-6">
                    <div className="flex items-center">
                        <FontAwesomeIcon icon={faChessRook} className="mr-2 text-yellow-400 w-4" />
                        <span className="text-white/70">Town Hall:</span>
                        <span className="ml-1.5 font-semibold text-white">
                            Level {base.wafi_th_level}
                        </span>
                    </div>
                    
                    <div className="flex items-center text-xs text-white/50">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 w-3" />
                        <span>Added: {base.wafi_created_at ? formatDate(base.wafi_created_at) : 'Unknown'}</span>
                    </div>
                </div>
                
                {/* Action buttons */}
                <div className="mt-auto flex justify-between items-center">
                    <button
                        onClick={handleDeleteClick}
                        className="text-white/50 hover:text-red-400 transition-colors p-2"
                        title="Delete base"
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                    
                    <button
                        onClick={handleSelectBase}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 py-2 px-4 rounded-lg transition-all duration-300 group-hover:bg-yellow-500 group-hover:text-white group-hover:border-yellow-600"
                    >
                        <span>View Base</span>
                        <FontAwesomeIcon 
                            icon={faArrowRight} 
                            className="transition-transform duration-300 group-hover:translate-x-1" 
                        />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BaseCard;
