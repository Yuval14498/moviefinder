const axios = require("axios");
const tmdbKey = process.env.TMDB_KEY;

//BASE URL FOR IMAGES = http://image.tmdb.org/t/p/<size>/file_path
//BASE URL = https://api.themoviedb.org/3/
//BASE API = https://api.themoviedb.org/3/movie/popular?api_key=<<api_key>>&language=en-US&page=1

module.exports.renderMovies = async (req, res) => {
    let baseUrl = "/movies?";
    let { page } = req.query;
    if (!page || parseInt(page) === 0) {
      page = 1;
    }
    const { q } = req.query;
    let { find } = req.query;
    let title = "Popular";
    if (find) {
      baseUrl = `/movies?find=${find}&`;
      title = find.charAt(0).toUpperCase() + find.substring(1);
      if (title === "Top_rated") {
        title = title.replace("_", " ");
        title = title.replace("r", "R");
      }
    }
    let movies = await axios.get(
      `https://api.themoviedb.org/3/movie/${
        find ?? "popular"
      }?api_key=${tmdbKey}&language=en-US&page=${page}&region=US`
    );
    if (q) {
      baseUrl = `/movies?q=${q}&`;
      movies = await axios.get(
        `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${q}&page=${page}`
      );
    }
    const totalPages = movies.data.total_pages;
    res.render("index.ejs", { movies, title, baseUrl, page, find, totalPages });
  }

  module.exports.renderShowPage = async (req, res) => {
    const { id } = req.params;
    const movie = await axios.get(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${tmdbKey}&language=en-US`
    );
    const trailer = await axios.get(
      `http://api.themoviedb.org/3/movie/${id}/videos?api_key=${tmdbKey}`
    );
    const cast = await axios.get(
      `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${tmdbKey}&language=en-US`
    );
    const genres = movie.data.genres.map((m) => m.name);
    res.render("show.ejs", { movie, genres, trailer, cast });
  }