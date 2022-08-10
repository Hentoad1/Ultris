var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
  let loggedIn = req.session.username !== undefined;
  let username = loggedIn ? req.session.username : 'GUEST';

  let output = {
    loggedIn,
    username
  };

  res.send(output);
});

module.exports = router;