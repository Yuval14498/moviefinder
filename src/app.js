if ((process.env.NODE_ENV = "development")) {
  require("dotenv").config({ path: '../.env' });
}

//Variables
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { User } = require("./models/users");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const MongoStore = require('connect-mongo');

//Routes
const movies = require("./routes/movies");
const registration = require("./routes/registration");
const login = require("./routes/login");
const logout = require("./routes/logout");
const users = require("./routes/users");
const actors = require("./routes/actors");

mongoose.connect("mongodb://localhost:27017/movies-app", {
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
  secret: "nonproductionsecret",
  store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/movies-app', mongoOptions: { useUnifiedTopology: true }}),
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(passport.initialize());
app.use(passport.session());

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
app.listen(3000, () => {
  console.log("LISTENING ON PORT 3000");
});
