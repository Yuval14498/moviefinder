module.exports.logout = (req, res) => {
    req.logOut();
    req.flash("success", "Successfully logged out.");
    res.redirect("/movies");
  }