var express = require('express');
var router = express.Router();

var {queryDB} = require('../../modules/database.js');

router.get('/', function(req, res, next) {
  queryDB('SELECT * FROM verifytoken WHERE token = ?', req.query.token).then(function(result){
    if (result.length === 0){
      return next();
    }
    
    let uuid = result[0].uuid;

    queryDB('UPDATE account SET verified = ? WHERE uuid = ?', [1, uuid]).then(function(result){
      res.redirect('/verify-success');
    }).catch(next);
  }).catch(next);
});

router.use(function(err, req, res, next){
  if (res.headersSent){
    return
  }

  res.redirect('/play');
});

module.exports = router;