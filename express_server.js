const express = require("express");
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

function generateRandomString(randomStrLength) {
  let result = '';
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < randomStrLength; i++) {
    result += chars.charAt(Math.floor(Math.random() *
      chars.length));
  }
  return result;
}

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  let username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, username : req.cookies["username"] };
  res.render('urls_index', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = { urls: urlDatabase, username : req.cookies["username"] };
  res.render('urls_registration', templateVars);
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
  const templateVars = { urls: urlDatabase, username : req.cookies["username"] };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const myShortURL = req.params.shortURL
  const myLongURL = urlDatabase[myShortURL]
  const templateVars = { shortURL: myShortURL, longURL: myLongURL, username : req.cookies["username"] };
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