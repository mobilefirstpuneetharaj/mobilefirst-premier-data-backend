const express = require('express');
const leagueController = require('../controllers/leagueController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes - user must be logged in
router.use(authController.protect);

router
  .route('/')
  .get(leagueController.getAllLeagues)
  .post(leagueController.createLeague);

router
  .route('/:id')
  .get(leagueController.getLeague)
  .patch(leagueController.updateLeague)
  .delete(leagueController.deleteLeague);

router.route('/stats').get(leagueController.getLeagueStats);

module.exports = router;