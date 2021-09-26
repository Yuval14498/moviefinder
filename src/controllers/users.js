const { User } = require("../models/users");
const axios = require("axios");
const tmdbKey = process.env.TMDB_KEY;

module.exports.renderWatchlist = async (req, res, next) => {
    const { username } = req.params;
    const foundUser = await User.findOne({ username });
    const movies = [];
    for (let id of foundUser.watchlist) {
        let movie = await axios.get(
            `https://api.themoviedb.org/3/movie/${id}?api_key=${tmdbKey}&language=en-US`
        );
        movies.push(movie.data);
    }
    res.render("watchlist.ejs", { movies, foundUser });
}

module.exports.addToWatchlist = async (req, res) => {
    const { username } = req.params;
    const { movieid } = req.body;
    const movie = await axios.get(
        `https://api.themoviedb.org/3/movie/${movieid}?api_key=${tmdbKey}&language=en-US`
    );
    const foundUser = await User.findOne({ username });
    if (!foundUser.watchlist.includes(movieid)) {
        await foundUser.watchlist.push(movie.data.id);
        await foundUser.save();
        req.flash("success", "Successfully added movie to your watchlist");
        res.redirect(`/users/${req.user.username}`);
    } else {
        req.flash("error", "This movie is already in your watchlist.");
        res.redirect(`/movies/${movieid}`);
    }
}
module.exports.deleteFromWatchlist = async (req, res) => {
    const { username } = req.params;
    const { movieid } = req.body;
    await User.findOneAndUpdate(
        { username },
        { $pull: { watchlist: movieid } }
    );
    req.flash("success", "Successfully removed movie from your watchlist !");
    res.redirect(`/users/${username}`);
}