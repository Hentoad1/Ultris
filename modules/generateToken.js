var {randomBytes} = require('crypto');

function generateToken(length){
  let buffer = randomBytes(length * (36 / 32));
  let code = buffer.toString('base64url');
  return code.slice(0, length);
}

module.exports = {generateToken};