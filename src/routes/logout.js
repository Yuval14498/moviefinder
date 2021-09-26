const express = require("express");
const router = express.Router();
//Controllers
const { logout } = require('../controllers/logout')
router.route("/")
  .get(logout);

module.exports = router;
