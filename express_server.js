const express = require("express");
const cookieSession = require('cookie-session')
const morgan = require('morgan'); // import morgan
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const { findEmail, generateRandomString, findPW, urlForUsers, getUserByEmail, findID  } = require("/.helpers");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

// Middleware
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
}));


// Database 
const urlDatabase = {
  b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
        
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "ZJ48lH"
        
    }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("pink-donkey-minotaur", 10)
  }
}

// Routes
app.get('/', (req, res) => {
  res.redirect('/urls');
});
// Register (GET / POST)
app.get('/register', (req, res) => {
  const templateVars = { urls: urlDatabase, user : users[req.session["user_id"]] };
  res.render('urls_registration', templateVars);
});

app.post('/register', (req, res) => {
  const newUserID = generateRandomString(14);
  const email = req.body.email;
  const userEmail = findEmail(users, email)
  const password = req.body.password;
  const user = {
    id: newUserID,
    email: email,
    password: bcrypt.hashSync(password, 10)
  };
  users[newUserID] = user;
  if (user.email === '' || user.password === '') {
    res.status(400).send("ERROR 400 INPUT FIELDS EMPTY")
  } else if (!userEmail) {
    req.session['user_id'] = 'user_id';
    res.redirect("/urls")
  } else if (userEmail === email) {
      res.status(400).send("ERROR 400 DUPLICATE EMAIL DETECTED")
  }
 });

// Login  (GET / POST)
app.get('/login', (req, res) => {
  const templateVars = { urls: urlDatabase, user : users[req.session["user_id"]] };
  res.render('urls_login', templateVars);
});
app.post('/login', (req, res) => {
  const checkEmail = req.body.email;
  const userEmail = findEmail(users, checkEmail)
  const checkPW = req.body.password;
  const userPW = findPW(users, checkPW)
  const userID = req.body.id;
  const id = findID(users, userID)
    if (!userEmail) {
      res.status(403).send("ERROR 403 - No account w/ this email!")
      return
    }
    if (userEmail === checkEmail) {
      if (bcrypt.hashSync(checkPW, userPW)) {
      console.log(checkPW, userPW)
        res.session('user_id', id);
        res.redirect('/urls');
    } else {
      res.status(403).send("ERROR 403 - Password does not match!")
     }
    }
   });

// URLS (GET / POST)
app.get('/urls', (req, res) => {
  const userID = req.session["user_id"]
  const user = users[userID]
  const templateVars = { urls: urlDatabase, user: users[req.session["user_id"]] };
    res.render('urls_index', templateVars);
  });
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString(6)
  const longURL = req.body.longURL;
  const userID = req.session["user_id"]
  urlDatabase[shortURL] = { longURL, userID }
  console.log("url database", urlDatabase)
  res.redirect(`/urls/${shortURL}`)
  });

// URLS/NEW (GET) 
app.get('/urls/new', (req, res) => {
  const templateVars = { urls: urlDatabase, user : users[req.session["user_id"]] };
  // res.render('urls_new', templateVars);
  if (!req.session.user_id) {
    res.redirect('/login')
  } else {
    res.render('urls_new', templateVars);
  };
});

// URLS/:id (POST)
app.post('/urls/:id', (req, res) => {
  if (urlDatabase[req.params.id].userID === req.session["user_id"]){
    let longURL = req.body.longURL;
    urlDatabase[req.params.id].longURL = longURL;
    res.redirect('/urls/');
  } else {
    console.log(urlDatabase[req.params.id].userID)
    console.log(req.session["user_id"])
    res.status(403).send("Must be logged in")
  }
})
// URLS/:shorturl (GET)
app.get('/urls/:shortURL', (req, res) => {
  const myShortURL = req.params.shortURL
  const myLongURL = urlDatabase[myShortURL].longURL
  const templateVars = { shortURL: myShortURL, longURL: myLongURL, user : users[req.session["user_id"]] };
  res.render('urls_show', templateVars);
});
// LOGOUT
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});
// DELETE 
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
res.redirect('/urls');
})
// :/U/:shortURL
app.get('/u/:shortURL', (req, res) => {
  const myShortURL = req.params.shortURL;
  const myLongURL = urlDatabase[myShortURL].longURL;
  res.redirect(myLongURL);
});
// JSON 
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});