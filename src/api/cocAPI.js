import axios from 'axios';

// Create an axios instance with default config
const cocApiClient = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Get player details by tag
export const getPlayer = async (tag, signal) => {
    try {
        const encodedTag = encodeURIComponent(tag);
        const url = `/api/coc/players/${encodedTag}`;
        const response = await cocApiClient.get(url, { signal });
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error(`API Error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
        } else if (error.request) {
            console.error('No response received from COC API');
        } else {
            console.error(`Request error: ${error.message}`);
        }
        throw error;
    }
};

// Get clan details by tag
export const getClan = async (tag, signal) => {
    try {
        const encodedTag = tag.startWith("#") ? encodeURIComponent(tag) : `#${encodeURIComponent(tag)}`;
        const url = `/api/coc/clans/${encodedTag}`;
        const response = await cocApiClient.get(url, { signal });
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error(`API Error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
        } else if (error.request) {
            console.error('No response received from COC API');
        } else {
            console.error(`Request error: ${error.message}`);
        }
        throw error;
    }
};

// Get clan members by clan tag
export const getClanMembers = async (tag, options = {}, signal) => {
    try {
        // Encode the tag properly
        const encodedTag = encodeURIComponent(tag.startsWith('#') ? tag : `#${tag}`);
        
        // Create query parameters
        const params = new URLSearchParams();
        if (options.limit) params.append('limit', options.limit);
        if (options.after) params.append('after', options.after);
        if (options.before) params.append('before', options.before);
        
        // Create URL with parameters
        const queryString = params.toString();
        const url = `/api/coc/clans/${encodedTag}/members${queryString ? `?${queryString}` : ''}`;
        
        // Make the request
        const response = await cocApiClient.get(url, { signal });
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error(`API Error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
        } else if (error.request) {
            console.error('No response received from COC API');
        } else {
            console.error(`Request error: ${error.message}`);
        }
        throw error;
    }
};

// Search clans with filtering options
export const getClans = async (searchOptions, signal) => {
    try {
        // Convert searchOptions to URL query parameters
        const params = new URLSearchParams();
        
        // Add each defined search option to the URL parameters
        Object.entries(searchOptions).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                // Handle arrays like labelIds specially
                if (Array.isArray(value)) {
                    params.append(key, value.join(','));
                } else {
                    params.append(key, value);
                }
            }
        });
        
        const url = `/api/coc/clans/search?${params.toString()}`;
        const response = await cocApiClient.get(url, { signal });
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error(`API Error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
        } else if (error.request) {
            console.error('No response received from COC API');
        } else {
            console.error(`Request error: ${error.message}`);
        }
        throw error;
    }
};

// Also include a default export if you want to maintain backward compatibility
const cocAPI = {
    getPlayer,
    getClan,
    getClans,
    getClanMembers,
};

export default cocAPI;