// express
const express = require("express");
const app = express();
const PORT = 8080;

// EJS templating
app.set("view engine", "ejs");

// cookie session parser
const cookieSession = require('cookie-session');

// morgan middleware
const morgan = require('morgan'); // import morgan
const bodyParser = require("body-parser");

// bcrypt password hashing
const bcrypt = require('bcryptjs');

// helpers
const { findUserEmail, generateRandomString, findUserPW, urlForUsers, findUserID } = require("./helpers");

// use.middleware
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
}));


// URL Database
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


// User Database
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
};


// Routes
// Register (GET / POST)
app.get('/', (req, res) => {
    if (req.session["user_id"]) {
        res.redirect('/urls/');
    } else {
        res.redirect('/login');
    }

});


app.get('/register', (req, res) => {
    const templateVars = { urls: urlDatabase, user: users[req.session["user_id"]] };
    if (req.session["user_id"]) {
        res.redirect('/urls');
    } else {
        res.render('urls_registration', templateVars);
    }
});


app.post('/register', (req, res) => {
    console.log(users);
    const newUserID = generateRandomString(14);
    const email = req.body.email;
    const userEmail = findUserEmail(email, users);
    const password = req.body.password;
    const user = {
        id: newUserID,
        email: email,
        password: bcrypt.hashSync(password, 10)
    };
    if (user.email === '' || user.password === '') {
        res.status(400).send("Error 400! No input detected, please try again");
    } else if (!userEmail) {
        users[newUserID] = user;
        req.session['user_id'] = newUserID;
        res.redirect('/urls');
    } else if (userEmail === email) {
        res.status(400).send("Error 400! Duplicate Email Address detected");
    }
});


// Login  (GET / POST)
app.get('/login', (req, res) => {
    const templateVars = { urls: urlDatabase, user: users[req.session["user_id"]] };
    if (req.session["user_id"]) {
        res.redirect('/urls');
    } else {
        res.render('urls_login', templateVars);
    }
});
app.post('/login', (req, res) => {
    const checkEmail = req.body.email;
    const userEmail = findUserEmail(checkEmail, users);
    const password = req.body.password;
    const userPW = findUserPW(checkEmail, users);
    if (userEmail === checkEmail) {
        if (bcrypt.compareSync(password, userPW)) {
            const id = findUserID(checkEmail, users);
            req.session['user_id'] = id;
            res.redirect('/urls');
        } else {
            res.status(403).send("ERROR 403 - Password does not match!");
        }
    } else {
        res.status(403).send("ERROR 403 - Make sure to register in order to login");
    }
});


// URLS (GET / POST)
app.get('/urls', (req, res) => {
    const templateVars = {
        urls: urlForUsers(req.session["user_id"], urlDatabase),
        user: users[req.session["user_id"]]
    };
    if (!req.session["user_id"]) {
        res.status(403).send("Error 403 - You must be logged in order to access this URL");
    } else {
        res.render('urls_index', templateVars);
    }
});


app.post('/urls', (req, res) => {
    const shortURL = generateRandomString(6);
    const longURL = req.body.longURL;
    const userID = req.session["user_id"];
    urlDatabase[shortURL] = { longURL, userID };
    res.redirect(`/urls/${shortURL}`);
});


// URLS/NEW (GET)
app.get('/urls/new', (req, res) => {
    const templateVars = {
        user: users[req.session["user_id"]]
    };
    if (!req.session["user_id"]) {
        res.redirect('/login');
    } else {
        res.render('urls_new', templateVars);
    }
});


// URLS/:id (POST)
app.post('/urls/:id', (req, res) => {
    if (urlDatabase[req.params.id].userID === req.session["user_id"]) {
        let longURL = req.body.longURL;
        urlDatabase[req.params.id].longURL = longURL;
        res.redirect('/urls/');
    } else {
        res.status(403).send("Error 403 - You must be logged in order to access this URL");
    }
});


// URLS/:shorturl (GET)
app.get('/urls/:shortURL', (req, res) => {
    if (!req.session["user_id"]) {
        res.status(400).send("Error 400 - Access Prohibited");
    } else if (!urlDatabase[req.params.shortURL]) {
        res.status(404).send("Error 404 - Page does not exist!");
    } else if (urlDatabase[req.params.shortURL].userID === req.session["user_id"]) {
        const myShortURL = req.params.shortURL;
        const templateVars = { shortURL: myShortURL, longURL: urlDatabase[myShortURL].longURL, user: users[req.session["user_id"]] };
        res.render('urls_show', templateVars);
    } else if (urlDatabase[req.params.shortURL].userID !== req.session["user_id"]) {
        res.status(403).send("Error 403 - URL generated by another User");
    } else {
        res.status(400).send("Error 400 - Error ");
    }
});


// LOGOUT
app.post('/logout', (req, res) => {
    req.session["user_id"] = null;
    res.redirect('/login');
});


// DELETE
app.post('/urls/:shortURL/delete', (req, res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
});


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


// Listening
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});