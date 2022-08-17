var express = require('express');
var router = express.Router();
var path = require('path');

var database = require('../modules/database.js');

let dir = path.resolve(__dirname + '/../../client/build');
router.get('*', async function(req, res, next) {
  database.getUUID(function(err, uuid){
    if (err) return next (err);
    
    req.session.uuid = req.session.uuid ?? uuid;
    req.session.username = req.session.username ?? 'GUEST';
    req.session.save();
  });

  res.sendFile(dir + "/index.html");
});

module.exports = router;
