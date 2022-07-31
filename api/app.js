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


// direct to public folder folder
//app.use(express.static(path.resolve(__dirname + '/../../client/public')));

// direct to build folder
let dir = path.resolve(__dirname + '/../client/build');
app.use(express.static(dir));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

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
    //httpOnly: true,
    expires:30 * 24 * 60 * 60 * 1000,
    secure:false,
    sameSite:false
  }
});



//socket io.use call goes here


app.use(sessionMiddleware);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var accountRouter = require('./routes/account');

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/account', accountRouter);

/*
acountRouter
testUsername
register
login
logout
*/


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = {app, sessionMiddleware};
