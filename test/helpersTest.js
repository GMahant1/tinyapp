const { assert } = require('chai');

const { userExist } = require('../helpers.js');

const testUsers = {
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
};

describe('userExist', () => {
  it('should return a user with valid email', () => {
    const user = userExist("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return null with non-existant email', () => {
    const user = userExist('test@example.com', testUsers);
    assert.strictEqual(user, null);
  });
});
