var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var sessions = require('express-session');
var logger = require('morgan');
var cors = require("cors");
var app = express();

require('dotenv').config();

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

var sessionMiddleware = sessions({
  secret: process.env.SESSIONSECRET,
	name: 'id',
  saveUninitialized:true,
  resave:false,
  cookie: {
    httpOnly:true,
    expires:30 * 24 * 60 * 60 * 1000,
    secure:false,
    sameSite:false
  }
});

app.use(sessionMiddleware);


app.use(async function(req, res, next){ //simulate latency
  await new Promise((resolve, reject) => setTimeout(resolve, 1000));
  next()
});

var router = require('./routes/index');
app.use('/', router);

// create 404 if no route is found
app.use(function(err, req, res, next) {
  if (err){
    return next(err);
  }
  
  if (res.headersSent){
    return;
  }

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

module.exports = {app, sessionMiddleware};
