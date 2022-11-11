//loop through users object, check if email provided equals one that exsists
const userExist = function(email, users) {
  for (let u in users) {
    if (users[u].email === email) {
      return users[u];
    }
  }
  return null;
};

module.exports = { userExist };