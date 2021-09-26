const { User } = require("../models/users");
module.exports.renderRegistrationForm = (req, res) => {
    res.render("register.ejs");
  }
  module.exports.registerAccount = async (req, res) => {
    const { email, password, username } = req.body;
    const user = await new User({ email, username });
    await User.register(user, password);
    res.redirect("/movies");
  }