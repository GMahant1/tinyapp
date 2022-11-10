const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const { url } = require("inspector");
function generateRandomString() {
  let id = crypto.randomBytes(3).toString("hex");
  return id;
};


app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

//user look up function
const userExist = function(email) {
  for (let u in users) {
    //console.log(u);
    if (users[u].email === email) {
      return users[u];
    }
  }
  return null;
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello, Welcome to the Home Page!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user };
  res.render("user_registration", templateVars);
})

app.get("/u/:id", (req, res) => {
  res.redirect(urlDatabase[req.params.id]);
});

app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user };
  res.render("user_login", templateVars);
})

app.post("/urls", (req, res) => {
  //console.log(req.body); // Log the POST request body to the console
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  //console.log(urlDatabase);
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  console.log(req.body);
  console.log(req.params.id)
  //console.log("This is an edit");
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  console.log(req.body);
  let userInfo = userExist(req.body.email);
  if (userInfo === null) {
    res.sendStatus(403);
  }
  if (userInfo.password !== req.body.password) {
    res.sendStatus(403);
  } else {
    res.cookie("user_id", userInfo.id);
    res.redirect("/urls");
  }
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
})

app.post("/register", (req, res) => {
  console.log(req.body);
  if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(404);
  } if (userExist(req.body.email) !== null) {
    res.sendStatus(404);
  } else {
    const id = generateRandomString();
    users[id] = {id, email: req.body.email, password: req.body.password } ; 
    res.cookie("user_id", id);
    console.log(users);
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});