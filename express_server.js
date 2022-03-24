const express = require("express");
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

// Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// Database 
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// Function to Generate randomString
function generateRandomString(randomStrLength) {
  let result = '';
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < randomStrLength; i++) {
    result += chars.charAt(Math.floor(Math.random() *
      chars.length));
  }
  return result;
}

const findID = function(users, id) {
  for (let user in users) {
    if (users[user].id === id) {
      return id;
    }
  }
  return false;
};
const findEmail = function(users, email) {
  for (let user in users) {
    if (users[user].email === email) {
      return email;
    }
  }
  return false;
};
const findPW = function(users, password) {
  for (let user in users) {
    if (users[user].password === password) {
      return password;
    }
  }
  return false;
};
// Routes

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const newUserID = generateRandomString(14);
  const email = req.body.email;
  const userEmail = findEmail(users, email)
  const password = req.body.password;
  const user = {
    id: newUserID,
    email: email,
    password: password
  };
  users[newUserID] = user;
  if (user.email === '' || user.password === '') {
    res.status(400).send("ERROR INPUT FIELDS EMPTY")
  } else if (!userEmail) {
    res.cookie('user_id', newUserID)
    res.redirect("/urls")
  } else {
      res.status(400).send("ERROR 400 DUPLICATE EMAIL DETECTED")
  }
 });

app.post('/login', (req, res) => {
  const checkEmail = req.body.email;
  const userEmail = findEmail(users, checkEmail)
  const checkPW = req.body.password;
  const userPW = findPW(users, checkPW)
  const userID = req.body.id;
  const id = findID(users, userID)
    if (!userEmail) {
      res.status(403).send("403 Error - No account w/ this email!")
      return
    }
    if (userEmail === checkEmail && userPW === checkPW) {
      console.log(id)
        res.cookie('user_id', id);
        res.redirect('/urls');
    } else {
      res.status(403).send("403 Error - PW DOESN'T MATCH!")
     }
   });
  

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const userID = req.cookies["user_id"]
  const user = users[userID]
  const templateVars = { urls: urlDatabase, user };
  res.render('urls_index', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = { urls: urlDatabase, user : req.cookies["user_id"] };
  res.render('urls_registration', templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = { urls: urlDatabase, user : req.cookies["user_id"] };
  res.render('urls_login', templateVars);
});

app.post('/urls', (req, res) => {
  const randomKey = generateRandomString(6)
  urlDatabase[randomKey] = req.body.longURL
  console.log("url database", urlDatabase)
  res.redirect(`/urls/${randomKey}`)
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
res.redirect('/urls');
})

app.get('/urls/new', (req, res) => {
  const templateVars = { urls: urlDatabase, user : req.cookies["user_id"] };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const myShortURL = req.params.shortURL
  const myLongURL = urlDatabase[myShortURL]
  const templateVars = { shortURL: myShortURL, longURL: myLongURL, user : req.cookies["user_id"] };
  res.render('urls_show', templateVars);
});
app.get('/u/:shortURL', (req, res) => {
  const myShortURL = req.params.shortURL
  const myLongURL = urlDatabase[myShortURL]
  res.redirect(myLongURL);
});

app.post('/urls/:shortURL', (req, res) => {
  const myShortURL = req.params.shortURL
  const myLongURL = req.body.longURL
  urlDatabase[myShortURL] = myLongURL;
  res.redirect(`/urls/${myShortURL}`);
})

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});