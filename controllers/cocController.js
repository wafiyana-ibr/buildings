const { cocClientWafi } = require('../coc-api/cocClient');

// Get clan details
exports.getClanWafi = async (reqWafi, resWafi) => {
    try {
        // Use reqWafi.params.clanTag to match the route definition
        const { clanTag } = reqWafi.params; 
        const clanWafi = await cocClientWafi.getClan(clanTag);
        resWafi.json(clanWafi);
    } catch (errorWafi) {
        console.error('Error fetching clan data:', errorWafi);
        resWafi.status(500).json({ error: 'Failed to fetch clan data' });
    }
};

// Get player details
exports.getPlayerWafi = async (reqWafi, resWafi) => {
    try {
        // Use reqWafi.params.playerTag to match the route definition
        const { playerTag } = reqWafi.params; 
        const playerWafi = await cocClientWafi.getPlayer(playerTag)
        resWafi.json(playerWafi);
    } catch (errorWafi) {
        console.error('Error fetching player data:', errorWafi);
        // Send a more specific error message if possible
        const statusCode = errorWafi.status || 500;
        const message = errorWafi.message || 'Failed to fetch player data';
        resWafi.status(statusCode).json({ error: message });
    }
};

// Search clans with advanced filtering options
exports.getClansWafi = async (reqWafi, resWafi) => {
    try {
        // Extract all search parameters from query string
        const {
            name,
            minMembers,
            maxMembers,
            minClanPoints,
            minClanLevel,
            warFrequency,
            locationId,
            labelIds,
            limit,
            after,
            before
        } = reqWafi.query;
        
        // Build search options object with only defined parameters
        const searchOptions = {};
        
        if (name) searchOptions.name = name;
        if (minMembers) searchOptions.minMembers = parseInt(minMembers);
        if (maxMembers) searchOptions.maxMembers = parseInt(maxMembers);
        if (minClanPoints) searchOptions.minClanPoints = parseInt(minClanPoints);
        if (minClanLevel) searchOptions.minClanLevel = parseInt(minClanLevel);
        if (warFrequency) searchOptions.warFrequency = warFrequency;
        if (locationId) searchOptions.locationId = parseInt(locationId);
        if (labelIds) searchOptions.labelIds = labelIds.split(',');
        if (limit) searchOptions.limit = parseInt(limit);
        if (after) searchOptions.after = after;
        if (before) searchOptions.before = before;
        // Call COC API with search options
        const clans = await cocClientWafi.getClans(searchOptions);
        console.log('Clans data:', clans[0].labels);//
        resWafi.json(clans);
    } catch (errorWafi) {
        console.error('Error searching clans:', errorWafi);
        const statusCode = errorWafi.status || 500;
        const message = errorWafi.message || 'Failed to search clans';
        resWafi.status(statusCode).json({ error: message });
    }
};

// Get clan members
exports.getClanMembersWafi = async (reqWafi, resWafi) => {
    try {
        // Get clan tag from URL params
        const { clanTag } = reqWafi.params;
        
        // Get query parameters for options
        const { limit, after, before } = reqWafi.query;
        
        // Build options object
        const options = {};
        if (limit) options.limit = parseInt(limit);
        if (after) options.after = after;
        if (before) options.before = before;
        
        // Call COC API to get clan members
        const members = await cocClientWafi.getClanMembers(clanTag, options);
        console.log('Clan members data:', members);
        
        // Send response
        resWafi.json(members);
    } catch (errorWafi) {
        console.error('Error fetching clan members:', errorWafi);
        const statusCode = errorWafi.status || 500;
        const message = errorWafi.message || 'Failed to fetch clan members';
        resWafi.status(statusCode).json({ error: message });
    }
};

// Add more controller functions as needed
