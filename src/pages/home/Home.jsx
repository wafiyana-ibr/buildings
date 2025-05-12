import React from "react";
import HeroSection from "./components/HeroSection";
import SearchSection from "./components/SearchSection";
import FeatureSection from "./components/FeatureSection";
import GuideSection from "./components/GuideSection";

const Home = () => {
    return (
        <div className="container mx-auto px-4 my-40 md:my-56">
            <HeroSection />
            <SearchSection />
            <FeatureSection />
            <GuideSection />
        </div>
    );
};

export default Home;