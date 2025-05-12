const expressWafi = require('express');
const dbControllerWafi = require('../controllers/dbController');
const authenticateWafi = require('../middleware/auth'); // 🛡️ Import auth middleware
const routerWafi = expressWafi.Router();

// Auth (tanpa JWT)
routerWafi.post('/users/sign-up', dbControllerWafi.signUpUserWafi);
routerWafi.post('/users/sign-in', dbControllerWafi.signInUserWafi);
routerWafi.post('/users/logout', dbControllerWafi.logoutUserWafi);

// IMPORTANT: Put more specific routes first
routerWafi.get('/users/me', authenticateWafi, dbControllerWafi.getUserMeWafi); // 🛡️ JWT required

// User route (🔐 butuh token)
routerWafi.get('/users/:userId', authenticateWafi, dbControllerWafi.getUserWafi);

// Base routes (🔐 semua butuh token)
routerWafi.get('/bases/user/:userId', authenticateWafi, dbControllerWafi.getUserBasesWafi);
routerWafi.get('/bases/user/:userId/tag/:tag', authenticateWafi, dbControllerWafi.getUserBaseByTagWafi); // New route for
//  user bases by tag
routerWafi.post('/bases', authenticateWafi, dbControllerWafi.addBaseWafi);
routerWafi.put('/bases/:baseId', authenticateWafi, dbControllerWafi.updateBaseWafi); // Changed to authenticate middleware
routerWafi.get('/bases/:baseId', authenticateWafi, dbControllerWafi.getBaseWafi);
routerWafi.delete('/bases/:baseId/user/:userId', authenticateWafi, dbControllerWafi.deleteBaseWafi);
// Objects routes (🔐 semua butuh token)
routerWafi.get('/objects/:baseId', authenticateWafi, dbControllerWafi.getObjectWafi);
routerWafi.put('/objects/:objectId/level', authenticateWafi, dbControllerWafi.updateObjectLevelWafi);
routerWafi.post('/objects/scan/:baseId', authenticateWafi, dbControllerWafi.createOrUpdateObjectsWafi); // New route for scan results
routerWafi.delete('/objects/:objectId', authenticateWafi, dbControllerWafi.deleteObjectWafi);

routerWafi.post('/objects/init/:baseId', authenticateWafi, dbControllerWafi.initializeObjectsWafi); // New route for initializing objects

module.exports = routerWafi;
