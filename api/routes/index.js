var express = require('express');
var router = express.Router();
var path = require('path');

var {genUUID} = require('../modules/database.js');

//INITALIZE SESSION IF NONE IS THERE
router.use(function(req,res,next){
  if (req.session.initalized){
    next();
  }

  genUUID().then(function(uuid){
    req.session.initalized = true;
    req.session.user = {
      username: 'GUEST',
      guest: true,
      uuid: uuid,
      verified: false
    }
    req.session.secure = {
      value:false,
      expiration:null
    };
    req.session.token = {
      value:null,
      expiration:null
    }

    next();
  }).catch(next);
});

//ALL GET REQUESTS ARE GIVEN THE APP
const build = path.resolve(__dirname + '/../../client/build');
router.get('*', async function(req, res, next) {
  res.sendFile(build + "/index.html");
});

//SEND POST REQUESTS TO SECONDARY ROUTES
router.use('/user', require('./user/user'));
router.use('/account', require('./account/account'));



module.exports = router;
