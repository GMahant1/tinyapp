const bcrypt = require("bcryptjs");
const crypto = require("crypto");

//random unique id
function generateRandomString() {
  let id = crypto.randomBytes(3).toString("hex");
  return id;
};

//loop through users object, check if email provided equals one that exsists
const userExist = function(email, users) {
  for (let u in users) {
    if (users[u].email === email) {
      return users[u];
    }
  }
  return null;
};

//check if cookie created (only happens when logged in) and check if user_id key has any value
const userLoggedIn = function(req) {
  if (req.session) {
    if (req.session.user_id) {
      return true;
    }
  }
  return false;
};

//function to filter and only returns urls created by the logged in user
const urlsForUser = function(id) {
  let allowedUrls = {};
  for (let link in urlDatabase) {
    if (urlDatabase[link].userID === id) {
      allowedUrls[link] = urlDatabase[link];
    }
  }
  if (Object.keys(allowedUrls).length === 0) {
    return null;
  }
  return allowedUrls;
};

//function to hash password
const hashPassword = function(password) {
  return bcrypt.hashSync(password, 10);
};

//user database
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//urls database
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID",
  },
};

module.exports = { userExist, userLoggedIn, urlsForUser, hashPassword, users, urlDatabase, generateRandomString };