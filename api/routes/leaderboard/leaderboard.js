var express = require('express');
var router = express.Router();

var {queryDB} = require('../../modules/database.js');

router.get('/', function(req, res, next) {
  
  let valid = ['blitz', 'sprint'].includes(req.body.type);
  if (!valid){
    return res.send({error: 'Invalid Request Type'});
  }

  //use index (type and index needs to be replaced)
  queryDB('SELECT 50 FROM type USE INDEX (index) order by score').then(function(result){

  });
  
  //use search term
  queryDB('SELECT 50 FROM type USE INDEX (index) WHERE username LIKE ? order by score').then(function(result){

  });
});

router.use(function(err, req, res, next){
  if (res.headersSent){
    return
  }

  res.redirect('../verify-failure');
});

module.exports = router;