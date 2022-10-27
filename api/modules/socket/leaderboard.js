let {QueryDB, queryDB} = require('../database');

const catchf = (err => console.log(err));

function addLeaderboardScore(type, uuid, score){

  if (score < 0){
    return;
  }

  queryDB(`SELECT * FROM ${type} WHERE uuid = ?`, [uuid]).then(results => {
    console.log(uuid);
    if (results.length === 0){
      console.log('guest account cannot save score');
      return;
    }
    let highscore = results[0].score;

    let date = (new Date).toLocaleDateString('en-US');

    if (score > highscore || highscore === null){
      queryDB(`UPDATE ${type} SET ? WHERE uuid = ?`, [{score,date}, uuid]).then(() => {
        queryDB(`ALTER TABLE ${type} ORDER BY score DESC`).catch(catchf);
      }).catch(catchf);
    }
  }).catch(catchf);
}

module.exports = addLeaderboardScore;