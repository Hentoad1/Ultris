var express = require('express');
var router = express.Router();
var path = require('path');

var database = require('../custom_modules/database.js');

let dir = path.resolve(__dirname + '/../../client/build');
router.get('*', async function(req, res, next) {
  getUUIDPromise().then(function(uuid){
    req.session.uuid = req.session.uuid ?? uuid;
    req.session.username = req.session.username ?? 'GUEST';
    req.session.save();
  });


  res.sendFile(dir + "/index.html");
});

function getUUIDPromise(){
  return new Promise(function(resolve){
    database.getUUID(function(uuid){
      resolve(uuid);
    });
  });
}

module.exports = router;
