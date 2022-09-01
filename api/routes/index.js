var express = require('express');
var router = express.Router();
var path = require('path');

//ALL GET REQUESTS ARE GIVEN THE APP
const build = path.resolve(__dirname + '/../../client/build');
router.get('*', async function(req, res, next) {
  res.sendFile(build + "/index.html");
});

//SEND POST REQUESTS TO SECONDARY ROUTES
router.use('/account', require('./account/account'));



module.exports = router;
