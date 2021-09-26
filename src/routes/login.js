const express = require("express");
const router = express.Router();
const passport = require("passport");
//Controllers
const login = require('../controllers/login')

router
  .route("/")
  .get(login.renderForm)
  .post(passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
}), login.logInUser);

module.exports = router;
