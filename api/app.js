var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mysql2 = require('mysql2/promise');
var MySQLStore = require('express-mysql-session')(session);
var sharedSession = require('express-socket.io-session');
var logger = require('morgan');
var cors = require("cors");
var app = express();

require('dotenv').config();

require('./modules/email');

app.set("trust proxy", 1);

// direct to build folder
let dir = path.resolve(__dirname + '/../client/build');
app.use(express.static(dir));

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const db_options = {
	host: "localhost",
	user: "root",
	password: process.env.DATABASE_PASSWORD,
	database:'session',
	port:'3306'
}

var connection = mysql2.createPool(db_options);
var sessionStore = new MySQLStore({
  secret: process.env.SESSIONSECRET,
  resave: true,
  saveUninitialized: true,
}, connection);

const session_options = {
  secret: process.env.SESSIONSECRET,
  resave: false,
  saveUninitialized:true,
  store:sessionStore,
  cookie: {
    httpOnly:false,
    expires:1000 * 60 * 60 * 24 * 30,
    secure:false,
    sameSite:'lax',
  }
};

let sessionMiddleware = session(session_options);

app.use(sessionMiddleware);

var router = require('./routes/index');
app.use('/', router);

let wrapMiddleware = (io) => {
  const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

  io.use(sharedSession(sessionMiddleware,{
    autoSave:true,
  }));
}

// create 404 if no route is found
app.use(function(req, res, next) {
  console.log('not found on path: ' + req.url);
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  //res.locals.message = err.message;
  //res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log(err);

  if (res.headersSent){
    return;
  }
  res.status(err.status ?? 500);
  res.send({error:'An unexpected error has occured. Please try again later.'});
});

module.exports = {app, wrapMiddleware};
