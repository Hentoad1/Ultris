let {queryDB} = require('../database');

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

    let date = (new Date).toLocaleDateString('en-US');



    if (highscore === null || (type === 'sprint' && score < highscore) || (type !== 'sprint' && score > highscore)){
      queryDB(`UPDATE ${type} SET ? WHERE uuid = ?`, [{score,date}, uuid]).then(() => {
        console.log('updated');
      }).catch(catchf);
    }else{
      console.log(`score [${score}] < highscore [${highscore}]`);
    }
  }).catch(catchf);
}

module.exports = addLeaderboardScore;