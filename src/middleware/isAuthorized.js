module.exports.isAuthorized = (req, res, next) => {
    const { username } = req.params;
    if (username !== req.user.username) {
      req.flash("error", "You are not authorized to visit that page.");
      res.redirect("/movies");
    } else {
      next();
    }
  };