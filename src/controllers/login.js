module.exports.renderForm = (req, res) => {
    res.render("login.ejs");
};
module.exports.logInUser = (req, res) => {
    req.flash("success", `Welcome back, ${req.user.username} !`);
    res.redirect("/movies");
}