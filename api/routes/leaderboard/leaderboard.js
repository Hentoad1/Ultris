var express = require('express');
var router = express.Router();

var {queryDB} = require('../../modules/database.js');

const rowsPerPage = 50;

router.post('/', function(req, res, next) {
  
  let valid = ['blitz', 'sprint'].includes(req.body.type);
  if (!valid){
    return res.send({error: 'Invalid Request Type'});
  }

  let page = new Number(req.body.page); //make sure index is a number, stop sql injection

  if (isNaN(page)){
    return res.send({error: 'Invalid Page'});
  }

  const sprintQuery = `SELECT * FROM sprint WHERE score IS NOT NULL ORDER BY score LIMIT ${rowsPerPage} OFFSET ${page * rowsPerPage}`;
  const blitzQuery = `SELECT * FROM blitz WHERE score != 0 ORDER BY score DESC LIMIT ${rowsPerPage} OFFSET ${page * rowsPerPage}`;

  const sprintCount = `SELECT COUNT(*) FROM sprint WHERE score IS NOT NULL`;
  const blitzCount = `SELECT COUNT(*) FROM blitz WHERE score != 0`;

  let rowsQuery = req.body.type === 'sprint' ? sprintQuery : blitzQuery;
  let countQuery = req.body.type === 'sprint' ? sprintCount : blitzCount;



  queryDB(rowsQuery).then(function(result){
    let formattedRows = result.map((value, index) => {
      return {
        place:1 + (page * rowsPerPage) + index,
        name:value.username,
        score:value.score,
        date:value.date
      }
    })
    
    queryDB(countQuery).then(function(output){
      //example output: [ { 'COUNT(*)': 3 } ]

      let totalRows = Object.values(output[0])[0]

      let formattedResult = {
        rows:formattedRows,
        totalPages:Math.ceil(totalRows / rowsPerPage)
      };

      res.send({result:formattedResult})
    }).catch(next);
  }).catch(next);
});

module.exports = router;