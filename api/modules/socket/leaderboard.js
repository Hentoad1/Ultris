let {QueryDB, queryDB} = require('../database');

const catchf = (err => console.log(err));

function addLeaderboardScore(type, uuid, score){

  if (score < 0){
    return;
  }

  queryDB(`SELECT * FROM ${type} WHERE uuid = ?`, [uuid]).then(results => {
    if (results.length === 0){
      console.log('guest account cannot save score');
      return;
    }
    let highscore = results[0].score;

    if (score > highscore){
      queryDB(`UPDATE ${type} SET score = ? WHERE uuid = ?`, [score, uuid]).catch(catchf);
    }
  }).catch(catchf);
}

module.exports = addLeaderboardScore;