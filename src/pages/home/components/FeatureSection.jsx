import React from "react";
import {
    faChartSimple,
    faTowerObservation,
    faHourglass,
} from "@fortawesome/free-solid-svg-icons";
import FeatureCard from "./FeatureCard";

const FeatureSection = () => {
    const features = [
        {
            icon: faChartSimple,
            title: "Check Statistics",
            description: "Analyze your defenses, traps, and resources with detailed visualizations and reports.",
        },
        {
            icon: faTowerObservation,
            title: "Track Progress",
            description: "Monitor your upgrade journey with intuitive progress tracking for all village buildings and troops.",
        },
        {
            icon: faHourglass,
            title: "Estimate Time & Resources", 
            description: "Plan ahead with accurate calculations of upgrade times and resource requirements for your base.",
        },
    ];

    return (
        <section id="features" className="relative mb-24 px-4">
            {/* Section Header */}
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 relative inline-block">
                    Key Features
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
                </h2>
                <p className="text-white/80 max-w-2xl mx-auto">
                    Optimize your Clash of Clans experience with our powerful tools designed to help you progress faster
                </p>
            </div>
            
            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {features.map((feature, index) => (
                    <FeatureCard
                        key={index}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                    />
                ))}
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl"></div>
        </section>
    );
};
export default FeatureSection;