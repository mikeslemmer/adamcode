var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var passport = require('passport');
var passportConf = require('./config/passport');
var path = require('path');
var secrets = require('./config/secrets');
var favicon = require('serve-favicon');
var flash = require('express-flash');

// Create the app.
var app = express();

// Redis
var redis = require('redis');
var redisClient = redis.createClient(); //6379, 'localhost', '');
var RedisStore = require('connect-redis')(session);	// For storing sessions.

// Controllers
var userController = require('./controllers/user');

// Game Server
//var gameServer = require('./app/gameserver.js');
//gameServer.listen(app, 5001);

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use('/jquery', express.static(path.join(__dirname, '/node_modules/jquery/dist')));
app.use('/jshashes', express.static(path.join(__dirname, '/node_modules/jshashes')));
app.use('/node-uuid', express.static(path.join(__dirname, '/node_modules/node-uuid')));
app.use('/socket.io-client', express.static(path.join(__dirname, '/node_modules/socket.io-client')));
app.use('/bootstrap', express.static(path.join(__dirname, '/node_modules/bootstrap/dist')));
app.use('/bootstrap-social', express.static(path.join(__dirname, '/node_modules/bootstrap-social')));
app.use('/font-awesome', express.static(path.join(__dirname, '/node_modules/font-awesome')));

app.use(cookieParser());
app.use(bodyParser.json({limit: '50mb'}));       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.set('views', __dirname + '/views');

// Turn on handlebars.
var exphbs = require('express-handlebars');
app.engine('.hbs', exphbs({defaultLayout: 'single', extname: '.hbs'}));
app.set('view engine', '.hbs');

app.use(flash());
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: secrets.session.secret || 'keyboard cat',
    resave: true,
  	saveUninitialized: true
}));

// Turn on passport for auth.
app.use(passport.initialize());
app.use(passport.session());


// Store the user in locals for the template.
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});


// Routes
// app.get('/', aController.index);

// User account routes
/**
 * OAuth authentication routes. (Sign in)
 */
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_location'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});

app.get('/account/unlink/:provider', passportConf.isAuthenticated, userController.getOauthUnlink);



app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});


module.exports = app;

