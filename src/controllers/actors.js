const axios = require("axios");
const tmdbKey = process.env.TMDB_KEY;

module.exports.renderActor = async (req, res) => {
    const { id } = req.params;
    const actor = await axios.get(
        `https://api.themoviedb.org/3/person/${id}?api_key=${tmdbKey}&language=en-US`
    );
    const actorCredits = await axios.get(
        `https://api.themoviedb.org/3/person/${id}/movie_credits?api_key=${tmdbKey}&language=en-US`
    );
    const knownForTitles = []
    for (let i = 0; i < 5; i++) {
        knownForTitles.push(actorCredits.data.cast[i])
    }
    res.render("actor.ejs", { actor, knownForTitles });
}