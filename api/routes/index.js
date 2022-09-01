var express = require('express');
var router = express.Router();
var path = require('path');

var database = require('../modules/database.js');

//GIVE ALL USERS GUEST SESSION IF NONE
router.use(function(req,res,next){
  console.log(req.session);
  if (req.session.data === undefined){
    console.log('overwriting req session');
    database.getUUID(function(err, uuid){
      if (err) return next (err);
      
      req.session.data = {
        username: 'GUEST',
        uuid: uuid
      }
      req.session.save();
      next();
    });
  }else{
    console.log('skipping');
    next();
  }
});

//ALL GET REQUESTS ARE GIVEN THE APP
const build = path.resolve(__dirname + '/../../client/build');
router.get('*', async function(req, res, next) {
  res.sendFile(build + "/index.html");
});

//SEND POST REQUESTS TO SECONDARY ROUTES
router.use('/account', require('./account/account'));



module.exports = router;
