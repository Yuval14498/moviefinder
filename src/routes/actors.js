const express = require("express");
const router = express.Router();
//Catch errors in async functions
const catchAsync = require('../utillities/catchAsync')
//Controllers
const { renderActor } = require('../controllers/actors')
router
  .route("/:id")
  .get(catchAsync(renderActor));

module.exports = router;
