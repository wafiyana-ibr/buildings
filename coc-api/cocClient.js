const { Client: ClientWafi } = require('clashofclans.js');
require('dotenv').config();

// Create singleton client
const cocClientWafi = new ClientWafi({
    cache: true, // enable caching
    retryLimit: 1,
});
// Initialize the client
const initClientWafi = async () => {
    try {
        console.log('Initializing COC API client...');
        (async function () {
            // This method should be called once when application starts.
            await cocClientWafi.login({ email: process.env.COC_API_EMAIL_WAFI, password: process.env.COC_API_PASSWORD_WAFI, keyName: process.env.COC_API_KEY_NAME_WAFI });
        })();
        console.log('COC API client initialized successfully');
        return true;
    } catch (errorWafi) {
        console.error('Failed to initialize COC API client:', errorWafi);
        return false;
    }
};

module.exports = {
    cocClientWafi,
    initClientWafi
};
