var express = require('express');
var router = express.Router();

router.use(function(req, res, next){
  if (req.session.user.lastLogged < (Date.now() - 1000 * 10/*60 * 60 * 24*/)){
    return res.send({redirect:{path:'/account/secure/relog'}});
  }
  next();
});

module.exports = router;
