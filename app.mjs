import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import "./db.mjs";
import session from "express-session";
import bodyParser from "body-parser";
import * as auth from "./auth.mjs";
import mongoose from "mongoose";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// enable sessions
const sessionOptions = {
  secret: "secret cookie thang (store this elsewhere!)",
  resave: true,
  saveUninitialized: true,
};
app.use(session(sessionOptions));

// app.mjs
const directory = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(directory, "views")));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// body parser setup
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files
app.use(express.static(path.join(__dirname, "public")));

// app.get('/', (req, res) => {
//   res.render('index');
// });

//////////////
const List = mongoose.model("List");

const loginMessages = {
  "PASSWORDS DO NOT MATCH": "Incorrect password",
  "USER NOT FOUND": "User doesn't exist",
};
const registrationMessages = {
  "USERNAME ALREADY EXISTS": "Username already exists",
  "USERNAME PASSWORD TOO SHORT": "Username or password is too short",
};

///////////////////////
// CUSTOM MIDDLEWARE //
///////////////////////

// require authenticated user for /article/add path
app.use(auth.authRequired(["/article/add"]));

// make {{user}} variable available for all paths
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// logging
app.use((req, res, next) => {
  console.log(req.method, req.path, req.body);
  next();
});

////////////////////
// ROUTE HANDLERS //
////////////////////
app.get("/", (req, res) => {
  List.find({})
    .sort("-createdAt")
    .exec((err, list) => {
      res.render("index", { user: req.session.user, home: true, List: list });
    });
});

app.get("/List/add", (req, res) => {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    res.render("List-add");
  }
});

app.get("/luckywheel", (req, res) => {
  List.find({}).sort('-createdAt').exec((err, list) => {
    res.render('luckywheel', {user: req.session.user, home: true, List: list});
  });
});

app.get("/random", (req, res) => {
  List.find({}).sort('-createdAt').exec((err, list) => {
    res.render('random', {user: req.session.user, home: true, List: list});
  });
});

app.post("/random", (req, res) => {
  let minValue = Number(req.body.upperbond);
  let maxValue = Number(req.body.lowerbond);
  const number = Number(req.body.number);
  if (minValue > maxValue) {
      minValue = maxValue;
      maxValue = minValue;
  }
  const result= [];
  for(let i = 0; i < number; i++){
   result.push(Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue);
  }
  res.render("randomresult", {result: result});
});

app.post("/List/add", (req, res) => {
  // TODO: complete POST /article/add
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    const a = new List({
      name: req.body.name,
      title: req.body.title,
      creatAt: req.body.creatAt,
      description: req.body.description,
    });
    a.save((err) => {
      if (!err) {
        res.redirect("/luckywheel");
      } else {
        res.render("article-add", { message: "NOT SAVED SUCCESSFULLY" });
        console.log(err);
      }
    });
  }
});

app.get("/article/:slug", (req, res) => {
  // TODO: complete GET /article/slug
  List.findOne({ slug: req.params.slug })
    .populate("user")
    .exec((err, a) => {
      if (!err) {
        res.render("article-detail", { article: a });
      } else {
        console.log("SLUG USE ERROR");
        res.render("error", { message: "SLUG ERROR" });
      }
    });
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  // setup callbacks for register success and error
  function success(newUser) {
    auth.startAuthenticatedSession(req, newUser, (err) => {
      if (!err) {
        res.redirect("/");
      } else {
        res.render("error", { message: "err authing???" });
      }
    });
  }

  function error(err) {
    res.render("register", {
      message: registrationMessages[err.message] ?? "Registration error",
    });
  }

  // attempt to register new user
  auth.register(
    req.body.username,
    req.body.email,
    req.body.password,
    error,
    success
  );
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  // setup callbacks for login success and error
  function success(user) {
    auth.startAuthenticatedSession(req, user, (err) => {
      if (!err) {
        res.redirect("/");
      } else {
        res.render("error", { message: "error starting auth sess: " + err });
      }
    });
  }

  function error(err) {
    res.render("login", {
      message: loginMessages[err.message] || "Login unsuccessful",
    });
  }

  // attempt to login
  auth.login(req.body.username, req.body.password, error, success);
});

app.listen(process.env.PORT || 3000);
