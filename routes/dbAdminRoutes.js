const express = require('express');
const router = express.Router();
const dbAdminController = require('../controllers/dbAdminController');
const authenticateWafi = require('../middleware/auth');
const  checkAdminRoleWafi = require('../middleware/admin');

// Apply authentication and admin role check middleware to all routes

// Dashboard stats
router.get('/dashboard', authenticateWafi, checkAdminRoleWafi, dbAdminController.getDashboardStatsWafi);

// Users routes
router.get('/users', dbAdminController.getUsersWafi);
router.get('/users/:id', dbAdminController.getUserByIdWafi);
router.post('/users', dbAdminController.createUserWafi);
router.put('/users/:id', dbAdminController.updateUserWafi);
router.delete('/users/:id', dbAdminController.deleteUserWafi);

// Bases routes
router.get('/bases', dbAdminController.getBasesWafi);
router.get('/bases/:id', dbAdminController.getBaseByIdWafi);
router.post('/bases', dbAdminController.createBaseWafi);
router.put('/bases/:id', dbAdminController.updateBaseWafi);
router.delete('/bases/:id', dbAdminController.deleteBaseWafi);

// Categories routes
router.get('/categories', authenticateWafi, checkAdminRoleWafi, dbAdminController.getCategoriesWafi);
router.get('/categories/:id', authenticateWafi, checkAdminRoleWafi, dbAdminController.getCategoryByIdWafi);
router.post('/categories', authenticateWafi,checkAdminRoleWafi, dbAdminController.createCategoryWafi);
router.put('/categories/:id', authenticateWafi,checkAdminRoleWafi, dbAdminController.updateCategoryWafi);
router.delete('/categories/:id', authenticateWafi, checkAdminRoleWafi, dbAdminController.deleteCategoryWafi);

// Types routes
router.get('/types', dbAdminController.getTypesWafi);
router.get('/types/:id', dbAdminController.getTypeByIdWafi);
router.post('/types', dbAdminController.createTypeWafi);
router.put('/types/:id', dbAdminController.updateTypeWafi);
router.delete('/types/:id', dbAdminController.deleteTypeWafi);

// // Objects routes
// router.get('/objects', dbAdminController.getObjectsWafi);
// router.get('/objects/:id', dbAdminController.getObjectByIdWafi);
// router.post('/objects', dbAdminController.createObjectWafi);
// router.put('/objects/:id', dbAdminController.updateObjectWafi);
// router.delete('/objects/:id', dbAdminController.deleteObjectWafi);

module.exports = router;
