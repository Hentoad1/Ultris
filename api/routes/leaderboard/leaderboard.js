var express = require('express');
var router = express.Router();

var {queryDB} = require('../../modules/database.js');

router.post('/', function(req, res, next) {
  
  let valid = ['blitz', 'sprint'].includes(req.body.type);
  if (!valid){
    return res.send({error: 'Invalid Request Type'});
  }

  let page = new Number(req.body.page); //make sure index is a number, stop sql injection

  if (isNaN(page)){
    return res.send({error: 'Invalid Page'});
  }



  //use index (type and index needs to be replaced)
  queryDB(`SELECT * FROM ${req.body.type} ORDER BY score DESC LIMIT 50 OFFSET ${page * 50}`).then(function(result){
    let formattedResult = result.map((value, index) => {
      return {
        place:1 + (page * 50) + index,
        name:value.username,
        score:value.score,
        date:'string'
      }
    })
    
    
    
    res.send({result:formattedResult})
  }).catch(next);
  
  //use search term
  /*queryDB('SELECT 50 FROM type USE INDEX (index) WHERE username LIKE ? order by score').then(function(result){

  });*/
});

module.exports = router;