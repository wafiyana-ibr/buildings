const expressWafi = require('express');
const cocControllerWafi = require('../controllers/cocController');

const routerWafi = expressWafi.Router();

// Define the specific route first to avoid conflicts
routerWafi.get('/clans/search', cocControllerWafi.getClansWafi);
// Add new route for clan members
routerWafi.get('/clans/:clanTag/members', cocControllerWafi.getClanMembersWafi);
routerWafi.get('/clans/:clanTag', cocControllerWafi.getClanWafi);
routerWafi.get('/players/:playerTag', cocControllerWafi.getPlayerWafi);
// Add more routes as needed

module.exports = routerWafi;
