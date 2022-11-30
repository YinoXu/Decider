import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';


// assumes that User was registered in `./db.mjs`
const User = mongoose.model('User');

const startAuthenticatedSession = (req, user, cb) => {
  // TODO: implement startAuthenticatedSession
  // assuming that user is the user retrieved from the database
  req.session.regenerate((err) => {
    if (!err) {
      // set a property on req.session that represents the user
      req.session.user = user;
    } else {
    // log out error
      console.log(err);
    }
    // call callback with error
    cb(err);
  });
};

function endAuthenticatedSession(req, cb) {
  req.session.destroy((err) => { cb(err); });
}


const register = (username, email, password, errorCallback, successCallback) => {
  if (username.length < 8 || password.length < 8){
    console.log("USERNAME PASSWORD TOO SHORT");
    errorCallback({message: "USERNAME PASSWORD TOO SHORT"});
  }else{
    User.findOne({username: username}, (err, result) =>{
      if (err){
        console.log(err);
        errorCallback({message: err.toString()});
      }else if (result){
        console.log("USERNAME ALREADY EXISTS");
        errorCallback({message: "USERNAME ALREADY EXISTS"});
      }else{
          // you can use a default value of 10 for salt rounds 
          bcrypt.hash(password, 10, function(err, hash) {
            if (err){
              console.log(err);
              errorCallback({message: err.toString()});
            }else{
              const newUser = new User({
                username: username,
                password: hash,
                email: email
              });
              newUser.save(err => {
                if (err){
                  console.log(err);
                  errorCallback({message: "DOCUMENT SAVE ERROR"});
                }else{
                  successCallback(newUser);
                }
              });
            }
          });
      }
    });
  }
};

const login = (username, password, errorCallback, successCallback) => {
  // TODO: implement login
  User.findOne({username: username}, (err, user) => {
    if(err){
      console.log("USER FIND ERROR");
      errorCallback({message: "USER FIND ERROR"});
    }
    else if(!user) {
        // compare with form password!
        console.log("USER NOT FOUND");
        errorCallback({message: "USER NOT FOUND"});
    }
    else{
      bcrypt.compare(password, user.password, (err, passwordMatch) => {
        // regenerate session if passwordMatch is true
        if(err){
          console.log("PASSWORD FIND ERROR");
          errorCallback({message: "PASSWORD FIND ERROR"});
        }
        else if(!passwordMatch){
          console.log("PASSWORDS DO NOT MATCH");
          errorCallback({message: "PASSWORDS DO NOT MATCH"});
        }
        else{
          successCallback(user);
        }
       });
    }
   });
};

// creates middleware that redirects to login if path is included in authRequiredPaths
const authRequired = authRequiredPaths => {
  return (req, res, next) => {
    if(authRequiredPaths.includes(req.path)) {
      if(!req.session.user) {
        res.redirect('/login'); 
      } else {
        next(); 
      }
    } else {
      next(); 
    }
  };
};

export {
  startAuthenticatedSession,
  endAuthenticatedSession,
  register,
  login,
  authRequired
};
