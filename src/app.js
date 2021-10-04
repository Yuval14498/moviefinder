if ((process.env.NODE_ENV = "development")) {
  require("dotenv").config({ path: './.env' });
}

//Variables
const express = require("express");
const app = express();
const path = require('path');
const mongoose = require("mongoose");
const { User } = require("./models/users");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const MongoStore = require('connect-mongo');
const mongoSanitize = require('express-mongo-sanitize');
const dbUrl = process.env.DB_URL

//Routes
const movies = require("./routes/movies");
const registration = require("./routes/registration");
const login = require("./routes/login");
const logout = require("./routes/logout");
const users = require("./routes/users");
const actors = require("./routes/actors");
const helmet = require("helmet");

mongoose.connect(dbUrl || "mongodb://localhost:27017/movies-app", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Mongoose connected!");
});

const sessionConfig = {
  secret: process.env.SESSION_SECRET || "nonproductionsecret",
  store: MongoStore.create({ mongoUrl: dbUrl, mongoOptions: { useUnifiedTopology: true } }),
  resave: false,
  saveUninitialized: true,
  cookie: {
    name: "session",
    httpOnly: true,
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');

app.use(session(sessionConfig));
app.use(flash());
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(passport.initialize());
app.use(passport.session());
app.use(mongoSanitize());

const scriptSrcUrls = ["https://kit.fontawesome.com/", "https://cdn.jsdelivr.net"]
const styleSrcUrls = ["https://ka-f.fontawesome.com/", "https://fonts.googleapis.com/", "https://cdn.jsdelivr.net/", "https://cdnjs.cloudflare.com/"]

app.use(helmet())
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'unsafe-inline'", "'self'", ...styleSrcUrls],
      connectSrc: ["'self'", "https://ka-f.fontawesome.com/"],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://image.tmdb.org/",
        "https://images.unsplash.com/"]
    },
  })
);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Flash middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

//Routes middleware
app.use("/movies", movies);
app.use("/register", registration);
app.use("/login", login);
app.use("/logout", logout);
app.use("/users", users);
app.use("/actors", actors);

//404 for pages that don't exist
app.all("*", (req, res) => {
  res.status(404).render('404.ejs')
});

//Error handeling
app.use((err, req, res, next) => {
  const { statusCode = 500, message = 'Something went wrong' } = err
  res.status(statusCode).send(message)
});

//Express listener
app.listen(process.env.PORT || 3000, () => {
  console.log("LISTENING ON PORT 3000");
});
