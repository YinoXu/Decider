import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import "./db.mjs";
import session from "express-session";
import bodyParser from "body-parser";
import * as auth from "./auth.mjs";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import bcrypt from 'bcryptjs';
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sort = (minus, minVlaue, maxValue) => {
  const arr = Array(0);
  if(minus(minVlaue, maxValue) > 0){
      arr.push(maxValue);
      arr.push(minVlaue);
  }
  else{
      arr.push(minVlaue);
      arr.push(maxValue);
  }
  return arr;
};

export const minus = (v1, v2) => {
  return v1-v2;
};


export const calculateNum = (max, min) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

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
const User = mongoose.model("User");
const List = mongoose.model("List");

const loginMessages = {
  "PASSWORDS DO NOT MATCH": "Incorrect pass aword",
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

app.use(auth.authRequired(["/luckywheel", "/", "/random","/changepassword"]));

////////////////////
// ROUTE HANDLERS //
////////////////////
app.get("/", (req, res) => {
  List.find({})
    .sort("-createdAt")
    .exec((err, list) => {
      res.render("index", {
        user: req.session.user,
        home: true,
        List: list,
        show: true,
      });
    });
});

app.get("/List/add", (req, res) => {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    res.render("List-add", { show: true });
  }
});

app.get("/luckywheel", (req, res) => {
  List.find({})
    .sort("-createdAt")
    .exec((err, list) => {
      res.render("luckywheel", {
        user: req.session.user,
        home: true,
        List: list,
        show: false,
      });
    });
});

app.get("/random", (req, res) => {
  List.find({})
    .sort("-createdAt")
    .exec((err, list) => {
      res.render("random", {
        user: req.session.user,
        home: true,
        List: list,
        show: true,
      });
    });
});

app.post("/random", (req, res) => {
  let minValue = Number(req.body.lowerbond);
  let maxValue = Number(req.body.upperbond);
  const number = Number(req.body.number);

  const arr = sort(minus,minValue, maxValue);
  minValue = arr[0];
  maxValue = arr[1];

  // const result = [];

  const temp = new Array(number);
  for (let i = 0; i < number; i++){
    temp.push(0);
  }
  const result = temp.map(() => calculateNum(minValue,maxValue));


  // for (let i = 0; i < number; i++) {
  //   result.push(
  //     calculateNum(minValue,maxValue)
  //   );
  // }
  res.render("randomresult", { result: result, show: true });
});

app.post("/List/add", (req, res) => {
  // TODO: complete POST /article/add
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    const a = new List({
      user: req.body.user,
      name: req.body.name,
    });
    a.save((err) => {
      if (!err) {
        res.redirect("/luckywheel");
      } else {
        res.render("list-add", { message: "NOT SAVED SUCCESSFULLY" });
        console.log(err);
      }
    });
  }
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

app.get("/changepassword", (req, res) => {
  res.render("changepassword",{show: true});
});

app.post('/changepassword', function (req, res) {
  if (!req.session.user) {
    res.redirect("/login");
  }
  // unit test
  // else{
  //   const error = (message) => {
  //     console.log(message);
  //     res.render("changepassword", {
  //       message: message
  //     });
  //   };
  //   changepassword(req.body.newpassword);
  // }
  else if (req.body.newpassword.length < 8){
    console.log("USERNAME PASSWORD TOO SHORT");
    res.render("changepassword", {
      message: "USERNAME PASSWORD TOO SHORT"
    });
  }
  else{
    User.findOne({username: req.body.username}).exec((err, user) => {
      if (err) {
          res.send(err);
      }
      if(user === null){
        console.log("CANNOT FIND USER");
        res.render("changepassword", {
          message: "CANNOT FIND USER"
        });
      }
       else {
        bcrypt.compare(req.body.oldpassword, user.password, (err, passwordMatch) => {
          // regenerate session if passwordMatch is true
          if(err){
            console.log("PASSWORD FIND ERROR");
          }
          else if(!passwordMatch){
            console.log("PASSWORDS DO NOT MATCH");
          }
          else{
            bcrypt.hash(req.body.newpassword, 10, function(err, hashedNew) {
              if (err){
                console.log(err);
              }else{
                user.password = hashedNew;
                user.save(function(err2){
                  if(err2){
                    console.log("err2");
                    res.send(err2);
                  }
                });
                res.redirect("/");
              }
            });
          }
         });
      }
  });
  }
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

io.on("connection", (socket) => {
  socket.on("gettingData", () => {
    List.find({})
      .sort("-createdAt")
      .exec((err, list) => {
        socket.emit("sendData", list);
      });
  });

  socket.on("addItem", (data) => {
    const newItem = new List({
      user: data.username,
      name: data.value,
    });
    newItem.save((err) => {
      if (err) {
        console.log(err);
      }
    });
  });
});

// app.listen(process.env.PORT || 3000);
const port = process.env.envPORT;
const host = process.env.envHOST;
server.listen(port, host, () => {
  console.log(`Server is listening ${host}:${port}`);
});
