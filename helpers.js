const getUserByEmail = function(email, database) {
  for (let el in database) {
    if (database[el].email === email) {
      return database[el];
    }
  }
  return undefined;
};

const findUserEmail = function(email, database) {
  for (let el in database) {
    if (email === database[el].email) {
      return email;
    }
  }
  return undefined;
};

// Function to Generate randomString
const generateRandomString = function(randomStrLength) {
  let result = '';
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < randomStrLength; i++) {
    result += chars.charAt(Math.floor(Math.random() *
      chars.length));
  }
  return result;
};

const findUserID = function(email, database) {
  for (let el in database) {
    if (email === database[el].email) {
      return database[el].id;
    }
  }
  return undefined;
};

const findUserPW = function(email, database) {
  for (let el in database) {
    if (email === database[el].email) {
      return database[el].password;
    }
  }
  return undefined;
};

const urlForUsers = function(id, database) {
  const userLinks = {};
  for (let url in database) {
    if (id === database[url].userID) {
      userLinks[url] = database[url];
    }
  }
  return userLinks;
};

module.exports = { findUserEmail, generateRandomString, findUserPW, urlForUsers, getUserByEmail, findUserID  };