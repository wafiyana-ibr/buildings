import React from 'react';
import SearchPlayer from './SearchPlayer';

const SearchSection = () => {
  return (
    <section id="search" className="relative mb-24 px-4">
      {/* Section Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 relative inline-block">
          Search Player or Clan
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
        </h2>
        <p className="text-white/80 max-w-2xl mx-auto">
          Enter a player tag or clan name to view details and track progress. You can add bases to your collection after signing in.
        </p>
      </div>
      
      {/* Search Component */}
      <SearchPlayer />
      
      {/* Decorative Elements */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl"></div>
    </section>
  );
};

export default SearchSection;
