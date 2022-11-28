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

  const sprintQuery = `SELECT * FROM sprint WHERE score IS NOT NULL ORDER BY score LIMIT 50 OFFSET ${page * 50}`;
  const blitzQuery = `SELECT * FROM WHERE score != 0 ORDER BY score DESC LIMIT 50 OFFSET ${page * 50}`;

  let query = req.body.type === 'sprint' ? sprintQuery : blitzQuery;

  //most likely desc needs to not be used if sprint is the type
  queryDB(query).then(function(result){
    let formattedResult = result.map((value, index) => {
      return {
        place:1 + (page * 50) + index,
        name:value.username,
        score:value.score,
        date:value.date
      }
    })
    
    
    
    res.send({result:formattedResult})
  }).catch(next);
});

module.exports = router;