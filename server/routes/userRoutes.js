const express = require('express');
const { 
  setupUserDetails, 
  getDashboardData, 
  recordTiffin, 
  skipTiffin,
  saveSubscription,
  getUserSettings,
  updateUserSettings,
  deleteUserAccount,
  getHistoryData,
  getPendingMeals
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect); // Apply protection to all routes in this file

router.post('/setup', setupUserDetails);
router.get('/dashboard', getDashboardData);
router.post('/record-tiffin', recordTiffin);
router.post('/skip-tiffin', skipTiffin);
router.post('/subscribe', saveSubscription);
router.get('/settings', getUserSettings);
router.put('/settings', updateUserSettings);
router.delete('/delete', deleteUserAccount);
router.get('/history', getHistoryData);
router.get('/pending-meals', getPendingMeals);
module.exports = router;