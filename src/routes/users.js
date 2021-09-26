const express = require("express");
const router = express.Router();
//Catch errors in async functions
const catchAsync = require('../utillities/catchAsync')
//Middleware
const { isLoggedIn } = require("../middleware/isLoggedIn");
const { isAuthorized } = require("../middleware/isAuthorized");
//Controllers
const users = require('../controllers/users')
router
  .route("/:username")
  .get(isLoggedIn, isAuthorized, catchAsync(users.renderWatchlist))
  .post(isLoggedIn, isAuthorized, catchAsync(users.addToWatchlist))
  .delete(isLoggedIn, isAuthorized, catchAsync(users.deleteFromWatchlist));

module.exports = router;
