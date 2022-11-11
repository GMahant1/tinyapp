const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { url } = require("inspector");
function generateRandomString() {
  let id = crypto.randomBytes(3).toString("hex");
  return id;
};


app.set("view engine", "ejs");

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

//loop through users object, check if email provided equals one that exsists
const userExist = function(email) {
  for (let u in users) {
    //console.log(u);
    if (users[u].email === email) {
      return users[u];
    }
  }
  return null;
};

//check if cookie created (only happens when logged in) and check if user_id key has any value
const userLoggedIn = function(req) {
  //console.log(req.cookies);
  if (req.cookies) {
    if (req.cookies.user_id) {
      return true;
    }
  }
  return false;
};

//function to filter and only returns urls created by the logged in user
const urlsForUser = function(id) {
  for (let link in urlDatabase) {
    if (urlDatabase[link].userID === id) {
      return urlDatabase[link];
    }
  }
  return null;
};

//function to hash password
const hashPassword = function(password) {
  return bcrypt.hashSync(password, 10);
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//checked
app.get("/", (req, res) => {
  res.send("Hello, Welcome to the Home Page!");
});

//checked
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//checked
app.get("/users.json", (req, res) => {
  res.json(users);
});

//checked
app.get("/urls", (req, res) => {
  const cookieValue = req.cookies["user_id"];
  const user = users[cookieValue];
  const templateVars = { urls: urlDatabase, user };
  if (userLoggedIn(req)) {
    if (urlsForUser(cookieValue) === null) {
      //once this status shows, i cannot go to /login to change accounts. have to delete cookie and restart server
      return res.status(403).send("You have not used Tiny App to create anything yet!");;
    } else {
      return res.render("urls_index", templateVars);
    }
  }
  res.status(403).send("Please log in to view shortened URLS!");
});

//checked
app.get("/urls/new", (req, res) => {
  const cookieValue = req.cookies["user_id"];
  const user = users[cookieValue];
  const templateVars = { user };
  if (userLoggedIn(req)) {
    return res.render("urls_new", templateVars);
  }
  res.redirect("/login");
});

//checked
app.get("/urls/:id", (req, res) => {
  const cookieValue = req.cookies["user_id"];
  const user = users[cookieValue];
  const id = req.params.id;
  const templateVars = { id, longURL: urlDatabase[id].longURL, user };
  //console.log(req.params);
  if (!userLoggedIn(req)) {
    return res.status(403).send("Please log in to view shortened URLS!");
  };
  if (urlsForUser(cookieValue) === null) {
    return res.status(403).send("This does not belong to you!");
  } else {
    return res.render("urls_show", templateVars);
  }
});

//checked
app.get("/register", (req, res) => {
  const cookieValue = req.cookies["user_id"];
  const user = users[cookieValue];
  const templateVars = { user };
  //check if user is logged in, show /urls otherwise ask to register with "user_registration"
  if (userLoggedIn(req)) {
    return res.redirect("/urls");
  }
  res.render("user_registration", templateVars);
});

//checked (console prints an error when i input an id that does not exist)
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(403).send("Please use Tiny App to shorten a URL first!");
  }
  res.redirect(urlDatabase[req.params.id].longURL);
});

//checked
app.get("/login", (req, res) => {
  //varaible set to cookie object containg key(name of cookie) and value (id)
  const cookieValue = req.cookies["user_id"];
  //pass variable (cookie name) into users object to access user information
  const user = users[cookieValue];
  //pass user object to display email when logged in 
  const templateVars = { user };
  //check if user logged in, show /urls otherwise send to /login
  if (userLoggedIn(req)) {
    return res.redirect("/urls");
  }
  res.render("user_login", templateVars);
});

//checked using urls.json after creation
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  if (userLoggedIn(req)) {
    const id = generateRandomString();
    const newURL = {
      longURL: req.body.longURL,
      userID: req.cookies.user_id
    };
    urlDatabase[id] = newURL;
    return res.redirect(`/urls/${id}`);
  }
  res.status(403).send("Please log in to shorten the URl!");
});

//checked using urls.json after deleting
app.post("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(403).send("Please use Tiny App to shorten a URL first!");
  }
  if (!userLoggedIn(req)) {
    return res.status(403).send("Please log in to delete shortened URLS!");
  };
  if (urlsForUser(cookieValue) === null) {
    return res.status(403).send("This does not belong to you!");
  } else {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
});

//checked with urls.json before and after edit 
app.post("/urls/:id/edit", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(403).send("Please use Tiny App to shorten a URL first!");
  }
  if (!userLoggedIn(req)) {
    return res.status(403).send("Please log in to edit shortened URLS!");
  };
  if (urlsForUser(cookieValue) === null) {
    return res.status(403).send("This does not belong to you!");
  } else {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    return res.redirect("/urls");
  }
});

//checked
app.post("/login", (req, res) => {
  const hashedPassword = hashPassword(req.body.password);
  let userInfo = userExist(req.body.email);
  if (userInfo === null) {
    res.sendStatus(403);
  }
  if (!bcrypt.compareSync(userInfo.password, hashedPassword)) {
    res.sendStatus(403);
  } else {
    res.cookie("user_id", userInfo.id);
    res.redirect("/urls");
  }
});

//checked
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

//checked
app.post("/register", (req, res) => {
  //console.log(req.body);
  const hashedPassword = hashPassword(req.body.password);
  if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(404);
  } if (userExist(req.body.email) !== null) {
    res.sendStatus(404);
  } else {
    const id = generateRandomString();
    users[id] = { id, email: req.body.email, password: hashedPassword };
    res.cookie("user_id", id);
    //console.log(users);
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});