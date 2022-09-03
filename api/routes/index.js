var express = require('express');
var router = express.Router();
var path = require('path');

var database = require('./modules/database.js');

//INITALIZE SESSION IF NONE IS THERE
router.use(function(req,res,next){
  if (req.session.initalized === undefined){
    req.session.initalized = true;
    
    database.getUUID(function(err, uuid){
      if (err) return next (err);
      
      req.session.user = {
        username: 'GUEST',
        uuid: uuid
      }
      next();
    });
  }else{
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
