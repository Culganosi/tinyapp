const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString(randomStrLength) {
  let result = '';
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < randomStrLength; i++) {
    result += chars.charAt(Math.floor(Math.random() *
      chars.length));
  }
  return result;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  const randomKey = generateRandomString(6)
  //console.log("random key", randomKey)
  urlDatabase[randomKey] = req.body.longURL
  console.log("url database", urlDatabase)
  res.redirect(`/urls/${randomKey}`)
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:shortURL", (req, res) => {
  const myShortUrl = req.params.shortURL
  const myLongUrl = urlDatabase[myShortUrl]
  const templateVars = { shortURL: myShortUrl, longURL: myLongUrl };
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  const myShortUrl = req.params.shortURL
  const myLongUrl = urlDatabase[myShortUrl]
  res.redirect(myLongUrl);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});