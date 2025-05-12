import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faInstagram, faTwitter, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faShieldHalved, faBook, faCircleInfo, faCode, faLink } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
    return (
        <footer id="footer" className="relative z-10 bg-gradient-to-b from-transparent to-black/30 border-t border-white/10 pt-10 pb-6 mt-10">
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -z-10"></div>
            
            <div className="container mx-auto px-4">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand Column */}
                    <div className="text-white col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <FontAwesomeIcon icon={faShieldHalved} className="text-2xl text-yellow-400" />
                            <span className="text-xl font-bold">Clash Buildings</span>
                        </div>
                        <p className="text-sm text-white/70 mb-4">
                            An unofficial tool designed to assist Clash of Clans players in tracking and optimizing their game progress through AI-powered building detection.
                        </p>
                        <div className="flex space-x-4 text-xl">
                            <a href="https://x.com/ClashofClans" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-yellow-400 transition-colors" title="Twitter">
                                <FontAwesomeIcon icon={faTwitter} />
                            </a>
                            <a href="https://www.instagram.com/clashofclans/" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-yellow-400 transition-colors" title="Instagram">
                                <FontAwesomeIcon icon={faInstagram} />
                            </a>
                            <a href="https://discord.com/invite/clashofclans" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-yellow-400 transition-colors" title="Discord">
                                <FontAwesomeIcon icon={faDiscord} />
                            </a>
                            <a href="https://github.com/aquaa11" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-yellow-400 transition-colors" title="GitHub">
                                <FontAwesomeIcon icon={faGithub} />
                            </a>
                        </div>
                    </div>
                    
                    {/* Quick Links */}
                    <div className="text-white">
                        <h4 className="font-bold mb-4 text-base relative inline-block">
                            Quick Links
                            <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-yellow-400/70"></div>
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/" className="text-white/70 hover:text-yellow-400 transition-colors inline-flex items-center">
                                    <FontAwesomeIcon icon={faLink} className="mr-2 w-3 h-3" /> Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/base" className="text-white/70 hover:text-yellow-400 transition-colors inline-flex items-center">
                                    <FontAwesomeIcon icon={faLink} className="mr-2 w-3 h-3" /> My Bases
                                </Link>
                            </li>
                            <li>
                                <a href="#guides" className="text-white/70 hover:text-yellow-400 transition-colors inline-flex items-center">
                                    <FontAwesomeIcon icon={faLink} className="mr-2 w-3 h-3" /> Usage Guide
                                </a>
                            </li>
                            <li>
                                <a href="#features" className="text-white/70 hover:text-yellow-400 transition-colors inline-flex items-center">
                                    <FontAwesomeIcon icon={faLink} className="mr-2 w-3 h-3" /> Features
                                </a>
                            </li>
                        </ul>
                    </div>
                    
                    {/* Resources */}
                    <div className="text-white">
                        <h4 className="font-bold mb-4 text-base relative inline-block">
                            Resources
                            <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-yellow-400/70"></div>
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="https://developer.clashofclans.com/" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-yellow-400 transition-colors inline-flex items-center">
                                    <FontAwesomeIcon icon={faCode} className="mr-2 w-3 h-3" /> CoC API Documentation
                                </a>
                            </li>
                            <li>
                                <a href="https://clashofclans.fandom.com/" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-yellow-400 transition-colors inline-flex items-center">
                                    <FontAwesomeIcon icon={faBook} className="mr-2 w-3 h-3" /> Clash Wiki
                                </a>
                            </li>
                            <li>
                                <a href="/faq" className="text-white/70 hover:text-yellow-400 transition-colors inline-flex items-center">
                                    <FontAwesomeIcon icon={faCircleInfo} className="mr-2 w-3 h-3" /> FAQ
                                </a>
                            </li>
                            <li>
                                <a href="/privacy-policy" className="text-white/70 hover:text-yellow-400 transition-colors inline-flex items-center">
                                    <FontAwesomeIcon icon={faLink} className="mr-2 w-3 h-3" /> Privacy Policy
                                </a>
                            </li>
                        </ul>
                    </div>
                    
                    {/* Contact */}
                    <div className="text-white">
                        <h4 className="font-bold mb-4 text-base relative inline-block">
                            Contact Us
                            <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-yellow-400/70"></div>
                        </h4>
                        <p className="text-sm text-white/70 mb-3">
                            Have questions or feedback? We'd love to hear from you.
                        </p>
                        <a href="mailto:support@clashbuildings.com" className="text-white/70 hover:text-yellow-400 transition-colors inline-flex items-center text-sm mb-4">
                            <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                            support@clashbuildings.com
                        </a>
                        
                        <p className="text-xs text-white/50 mt-2">
                            Response time: typically within 24 hours
                        </p>
                    </div>
                </div>
                
                {/* Divider Line */}
                <div className="border-t border-white/10 my-6"></div>
                
                {/* Copyright Info */}
                <div className="flex flex-col md:flex-row justify-between items-center text-white/60 text-xs">
                    <p>© 2025 Clash Buildings. This site is not affiliated with, endorsed, sponsored, or specifically approved by Supercell.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;