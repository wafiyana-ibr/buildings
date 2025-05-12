import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle, faCamera, faExclamationTriangle, faCheckCircle, faLink, faArrowRight, faBook, faQuestionCircle } from "@fortawesome/free-solid-svg-icons"

const GuideSection = () => {
    return (
        <section id="guides" className="relative mb-24 px-4">
            {/* Section Header */}
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 relative inline-block">
                    Usage Guide
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
                </h2>
                <p className="text-white/80 max-w-2xl mx-auto">
                    Learn how to use our tools effectively to get the most accurate analysis of your Clash of Clans progress
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* User Guide Card */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20 text-white transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/20">
                    <div className="flex items-center mb-6">
                        <div className="p-3 rounded-full bg-yellow-400/20 mr-4">
                            <FontAwesomeIcon icon={faBook} className="text-2xl text-yellow-400" />
                        </div>
                        <h3 className="text-xl font-bold">User Guide</h3>
                    </div>

                    <ol className="list-decimal list-inside space-y-4 ml-2">
                        <li>
                            <span className="font-bold text-yellow-400">Search Player:</span>
                            <p className="text-white/80 ml-6 mt-1">
                                Enter the player tag (e.g., #P2QJQYV89) in the search bar, then press Enter.
                            </p>
                        </li>
                        <li>
                            <span className="font-bold text-yellow-400">Add your base:</span>
                            <p className="text-white/80 ml-6 mt-1">
                                <span className="bg-yellow-400/20 px-2 py-0.5 rounded text-yellow-400 inline-flex items-center mr-1">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                                    Note
                                </span>
                                You must be logged in to add your base. If you're not logged in, 
                                you'll need to create an account or sign in first.
                            </p>
                        </li>
                        <li>
                            <span className="font-bold text-yellow-400">Use Custom Layout:</span>
                            <p className="text-white/80 ml-6 mt-1">
                                <span className="bg-yellow-400/20 px-2 py-0.5 rounded text-yellow-400 inline-flex items-center mr-1">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                                    Important
                                </span>
                                Click the "Use Base Layout" button to import a specific layout into your game.
                                Our system requires a particular layout for accurate analysis.
                            </p>
                        </li>
                        <li>
                            <span className="font-bold text-yellow-400">Take a Screenshot:</span>
                            <p className="text-white/80 ml-6 mt-1">
                                After applying the custom layout, take a screenshot while in Edit Layout mode.
                            </p>
                        </li>
                        <li>
                            <span className="font-bold text-yellow-400">Upload & Analyze:</span>
                            <p className="text-white/80 ml-6 mt-1">
                                Click the "Choose Base" button and upload your screenshot. Our system will analyze
                                it and provide estimated upgrade results.
                            </p>
                        </li>
                        <li>
                            <span className="font-bold text-yellow-400">Check Upgrade Progress:</span>
                            <p className="text-white/80 ml-6 mt-1">
                                Monitor the progress of your building and troop upgrades in the dedicated progress tracking section.
                            </p>
                        </li>
                        <li>
                            <span className="font-bold text-yellow-400">Estimate Upgrade Time & Resources:</span>
                            <p className="text-white/80 ml-6 mt-1">
                                Use the time estimation tool to calculate how long upgrades will take and the resources you'll need.
                            </p>
                        </li>
                    </ol>
                </div>

                {/* Screenshot Guide Card */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20 text-white transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/20">
                    <div className="flex items-center mb-6">
                        <div className="p-3 rounded-full bg-yellow-400/20 mr-4">
                            <FontAwesomeIcon icon={faCamera} className="text-2xl text-yellow-400" />
                        </div>
                        <h3 className="text-xl font-bold">Screenshot Guide</h3>
                    </div>

                    <div className="mb-6">
                        <div className="bg-yellow-400/20 p-4 rounded-lg mb-4 border border-yellow-400/30">
                            <div className="flex items-center mb-2">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-400 mr-2 text-xl" />
                                <span className="text-white font-bold">Attention!</span>
                            </div>
                            <p className="text-white/90">
                                For the best results, <strong>use the custom layout</strong> provided by this website.
                                The automatic detection process requires a layout that meets our standards.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white/5 p-4 rounded-lg border border-green-400/30">
                                <div className="flex items-center mb-2">
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-400 mr-2" />
                                    <span className="text-white font-medium">Correct Screenshot:</span>
                                </div>
                                <ul className="list-disc list-inside text-white/80 text-sm space-y-1.5 ml-2">
                                    <li>Using the layout from this website</li>
                                    <li>Screenshot taken in Edit Layout mode</li>
                                    <li>All buildings are clearly visible</li>
                                    <li>No menus or UI elements obstructing view</li>
                                </ul>
                            </div>
                            <div className="bg-white/5 p-4 rounded-lg border border-red-400/30">
                                <div className="flex items-center mb-2">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400 mr-2" />
                                    <span className="text-white font-medium">Incorrect Screenshot:</span>
                                </div>
                                <ul className="list-disc list-inside text-white/80 text-sm space-y-1.5 ml-2">
                                    <li>Using your own base layout</li>
                                    <li>Screenshot taken in Main Village mode</li>
                                    <li>Base is obstructed by game UI</li>
                                    <li>Screenshot is cropped or incomplete</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="border-2 border-green-400/30 rounded-lg overflow-hidden shadow-lg">
                            <div className="bg-green-400/20 px-3 py-2 text-sm font-medium text-white flex items-center">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-400 mr-2" />
                                Correct Screenshot Example
                            </div>
                            <div className="p-2 bg-black/20">
                                <img
                                    src="/example-ss-defenses-layout.jpeg"
                                    alt="Correct Screenshot Example"
                                    className="w-full rounded object-cover h-32"
                                />
                            </div>
                        </div>

                        <div className="border-2 border-red-400/30 rounded-lg overflow-hidden shadow-lg">
                            <div className="bg-red-400/20 px-3 py-2 text-sm font-medium text-white flex items-center">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400 mr-2" />
                                Incorrect Screenshot Example
                            </div>
                            <div className="p-2 bg-black/20">
                                <img
                                    src="/example-ss-wrong.png"
                                    alt="Incorrect Screenshot Example"
                                    className="w-full rounded object-cover h-32"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Help Button */}
            <div className="flex justify-center mt-10">
                <a 
                    href="/faq" 
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white transition-all duration-300"
                >
                    <FontAwesomeIcon icon={faQuestionCircle} className="text-yellow-400" />
                    <span>Need more help? Check our FAQ</span>
                    <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
                </a>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl"></div>
        </section>
    )
}

export default GuideSection;