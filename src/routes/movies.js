const express = require("express");
const router = express.Router();
//Catch errors in async functions
const catchAsync = require('../utillities/catchAsync')
//Controllers
const movies = require('../controllers/movies')

router
.route("/")
.get(catchAsync(movies.renderMovies));

router
.route('/:id')
.get(catchAsync(movies.renderShowPage));

module.exports = router;
