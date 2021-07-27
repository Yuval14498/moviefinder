if (process.env.NODE_ENV = "development") {
    require('dotenv').config()
}
const express = require('express')
const app = express()
const axios = require('axios')
const tmdbKey = process.env.TMDB_KEY
const mongoose = require('mongoose');
const { User } = require('./models/users');
const session = require('express-session')
const flash = require('connect-flash');
const passport = require('passport')
const LocalStrategy = require('passport-local')
const methodOverride = require('method-override')

mongoose.connect('mongodb://localhost:27017/movies-app', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Mongoose connected!')
});

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: Date.now() + 1000 * 60 * 60 * 24 * 7,
    },
};


app.use(session(sessionConfig))
app.use(flash());
app.use(express.static(__dirname + '/public')); //serve static files
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))


app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    res.locals.currentUser = req.user
    next()
})

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in to do this action')
        return res.redirect('/login')
    }
    next()
}

const isAuthorized = (req, res, next) => {
    const { username } = req.params
    if (username !== req.user.username) {
        req.flash('error', 'You are not authorized to visit that page.')
        res.redirect('/movies')
    }
    else {
        next()
    }
}

//BASE URL FOR IMAGES = http://image.tmdb.org/t/p/<size>/file_path
//BASE URL = https://api.themoviedb.org/3/
//BASE API = https://api.themoviedb.org/3/movie/popular?api_key=<<api_key>>&language=en-US&page=1


app.get('/movies', async (req, res) => {
    let baseUrl = '/movies?'
    let { page } = req.query
    if (!page || parseInt(page) === 0) {
        page = 1;
    }
    const { q } = req.query
    let { find } = req.query
    let title = 'Popular'
    if (find) {
        baseUrl = `/movies?find=${find}&`
        title = find.charAt(0).toUpperCase() + find.substring(1);
        if (title === 'Top_rated') {
            title = title.replace('_', ' ')
            title = title.replace('r', 'R')
        }
    }
    let movies = await axios.get(`https://api.themoviedb.org/3/movie/${find || 'popular'}?api_key=${tmdbKey}&language=en-US&page=${page}&region=US`)
    if (q) {
        baseUrl = `/movies?q=${q}&`
        movies = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${q}&page=${page}`)
    }
    res.render('index.ejs', { movies, title, baseUrl, page, find })
})

app.get('/movies/:id', async (req, res) => {
    const { id } = req.params
    const movie = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${tmdbKey}&language=en-US`)
    const trailer = await axios.get(`http://api.themoviedb.org/3/movie/${id}/videos?api_key=${tmdbKey}`)
    const cast = await axios.get(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${tmdbKey}&language=en-US`)
    const genres = movie.data.genres.map((m) => m.name)
    res.render('show.ejs', { movie, genres, trailer, cast })
})

app.get('/register', (req, res) => {
    res.render('register.ejs')
})
app.post('/register', async (req, res) => {
    const { email, password, username } = req.body
    const user = await new User({ email, username })
    const registeredUser = await User.register(user, password)
    res.redirect('/movies')
})


app.get('/login', (req, res) => {
    res.render('login.ejs')
})
app.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), async (req, res) => {
    req.flash('success', `Welcome back, ${req.user.username} !`)
    res.redirect('/movies')
})

app.get('/logout', (req, res) => {
    req.logOut()
    req.flash('success', 'Successfully logged out.')
    res.redirect('/movies')
})

app.get('/user/:username', isLoggedIn, isAuthorized, async (req, res) => {
    const { username } = req.params
    const foundUser = await User.findOne({ username })
    const movies = []
    for (let id of foundUser.watchlist) {
        let movie = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${tmdbKey}&language=en-US`)
        movies.push(movie.data)
    }
    res.render('userdashboard.ejs', { movies, foundUser })
})




app.post('/user/:username', async (req, res) => {
    const { username } = req.params
    const { movieid } = req.body
    const movie = await axios.get(`https://api.themoviedb.org/3/movie/${movieid}?api_key=${tmdbKey}&language=en-US`)
    const foundUser = await User.findOne({ username })
    await foundUser.watchlist.push(movie.data.id)
    await foundUser.save()
    req.flash('success', 'Successfully added movie to your watchlist')
    res.redirect(`/user/${req.user.username}`)
})

app.delete('/user/:username', async (req, res) => {
    const { username } = req.params
    const { movieid } = req.body
    await User.findOneAndUpdate(username, { $pull: { watchlist: movieid } });
    req.flash('success', 'Successfully removed movie from your list !')
    res.redirect(`/user/${username}`)
})

app.get('/actor/:id', async (req, res) => {
    const { id } = req.params
    const actor = await axios.get(`https://api.themoviedb.org/3/person/${id}?api_key=${tmdbKey}&language=en-US`)
    /* console.log(actorData.data) */
    res.render('actor.ejs', { actor })
})

app.get('*', (req, res) => {
    res.render('notfound.ejs')
})

app.listen(3000, () => {
    console.log('LISTENING ON PORT 3000')
})