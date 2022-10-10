let {QueryDB, queryDB} = require('../database');

const catchf = (err => console.log(err));

function addLeaderboardScore(type, scoreData){
  let uuid = scoreData.uuid;
  let score = scoreData.score;

  if (score < 0){
    return;
  }

  queryDB('SELECT * FROM ? WHERE uuid = ?', [type, uuid]).then(results => {
    let highscore = 0;
    if (results.length > 0){
      highscore = results[0].score;
    }

    if (score > highscore){
      queryDB('DELETE FROM ? WHERE uuid = ?', [type, uuid]).then(() => {        
        queryDB('INSERT INTO ? SET ?', [type, scoreData]).then(() => {
          console.log('done');
        }).catch(catchf);
      }).catch(catchf);
    }
  }).catch(catchf);
}

module.exports = addLeaderboardScore;