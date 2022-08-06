var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
  console.log(req.session.userid);
  let loggedIn = req.session.userid !== undefined;
  let username = loggedIn ? req.session.userid : 'GUEST';

  let output = {
    loggedIn,
    username
  };

  res.send(output);
});

module.exports = router;