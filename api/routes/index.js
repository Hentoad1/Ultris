var express = require('express');
var router = express.Router();
var path = require('path');


let dir = path.resolve(__dirname + '/../../client/build');
router.get('*', function(req, res, next) {
  res.sendFile(dir + "/index.html");
});

module.exports = router;
