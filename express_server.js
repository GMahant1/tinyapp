const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { userExist, userLoggedIn, urlsForUser, hashPassword, users, urlDatabase, generateRandomString } = require("./helpers");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.get("/", (req, res) => {
  if (userLoggedIn(req)) {
    return res.redirect("/urls");
  }
  res.redirect("/login");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/users.json", (req, res) => {
  res.json(users);
});


app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const allowedUrls = urlsForUser(userID);
  const user = users[userID];
  const templateVars = { urls: allowedUrls, user };
  if (userLoggedIn(req)) {
    if (urlsForUser(userID) === null) {
      return res.render("urls_index", templateVars);
    } 
    return res.render("urls_index", templateVars);
  }
  res.status(403).send("Please log in to view shortened URLS!");
});


app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user };
  if (userLoggedIn(req)) {
    return res.render("urls_new", templateVars);
  }
  res.redirect("/login");
});


app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const id = req.params.id;
  if (!userLoggedIn(req)) {
    return res.status(403).send("Please log in to view shortened URLS!");
  };
  if (urlsForUser(userID) === null) {
    return res.status(403).send("This does not belong to you!");
  } else {
    const templateVars = { id, longURL: urlDatabase[id].longURL, user };
    return res.render("urls_show", templateVars);
  }
});


app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user };
  //check if user is logged in, show /urls otherwise ask to register with "user_registration"
  if (userLoggedIn(req)) {
    return res.redirect("/urls");
  }
  res.render("user_registration", templateVars);
});


app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    res.redirect(urlDatabase[req.params.id].longURL);
  } else {
    res.status(403).send("Please use Tiny App to shorten a URL first!");
  }
});


app.get("/login", (req, res) => {
  //varaible set to cookie object containg key(name of cookie) and value (id)
  const userID = req.session.user_id;
  //pass variable (cookie name) into users object to access user information
  const user = users[userID];
  //pass user object to display email when logged in 
  const templateVars = { user };
  //check if user logged in, show /urls otherwise send to /login
  if (userLoggedIn(req)) {
    return res.redirect("/urls");
  }
  res.render("user_login", templateVars);
});


app.post("/urls", (req, res) => {
  if (userLoggedIn(req)) {
    const id = generateRandomString();
    const newURL = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    urlDatabase[id] = newURL;
    return res.redirect(`/urls/${id}`);
  }
  res.status(403).send("Please log in to shorten the URl!");
});


app.post("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(403).send("Please use Tiny App to shorten a URL first!");
  }
  if (!userLoggedIn(req)) {
    return res.status(403).send("Please log in to delete shortened URLS!");
  };
  if (urlsForUser(userID) === null) {
    return res.status(403).send("This does not belong to you!");
  } else {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
});


app.post("/urls/:id/edit", (req, res) => {
  const userID = req.session.user_id;
  if (!urlDatabase[req.params.id]) {
    return res.status(403).send("Please use Tiny App to shorten a URL first!");
  }
  if (!userLoggedIn(req)) {
    return res.status(403).send("Please log in to edit shortened URLS!");
  };
  if (urlsForUser(userID) === null) {
    return res.status(403).send("This does not belong to you!");
  } else {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    return res.redirect("/urls");
  }
});


app.post("/login", (req, res) => {
  const hashedPassword = hashPassword(req.body.password);
  let userInfo = userExist(req.body.email, users);
  if (userInfo === null) {
    return res.status(403).send("Please register an account!");;
  }
  if (!bcrypt.compareSync(userInfo.password, hashedPassword)) {
    return res.status(403).send("Incorrect email or password!");;
  } else {
    req.session.user_id = userInfo.id;
    return res.redirect("/urls");
  }
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});


app.post("/register", (req, res) => {
  const hashedPassword = hashPassword(req.body.password);
  if (req.body.email === "" || req.body.password === "") {
    return res.status(403).send("Please fill in the required information to register!");
  } if (userExist(req.body.email, users) !== null) {
    return res.sendStatus(404);
  } else {
    const id = generateRandomString();
    users[id] = { id, email: req.body.email, password: hashedPassword };
    req.session.user_id = id;
    return res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});