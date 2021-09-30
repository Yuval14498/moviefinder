const express = require("express");
const router = express.Router();
//Catch errors in async functions
const catchAsync = require('../utillities/catchAsync')
//Controllers
const registration = require('../controllers/registration')

router
  .route("/")
  .get(registration.renderRegistrationForm)
  .post(catchAsync(registration.registerAccount));

module.exports = router;
