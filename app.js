const express = require("express");
const path = require('path');
const app = express();
var nodemailer = require('nodemailer');
var MemoryStore = require('connect').session.MemoryStore;

var mongoose = require('mongoose');
var config = {
    mail: require('./config/mail')
};

var Account = require('./models/Account')(config, mongoose, nodemailer);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.limit('1mb'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session(
    {secret: "SocialNet secret key", store: new MemoryStore()}));
mongoose.connect('mongodb://localhost/nodebackbone');

app.get('/', function(req, res){
    res.render('index.ejs');
});

app.get('/account/authenticated', function(req, res) {
    if ( req.session.loggedIn ) {
        res.send(200);
    } else {
        res.send(401);
    }
});

app.post('/register', function(req, res) {
    const firstName = req.param('firstName', '');
    const lastName = req.param('lastName', '');
    const email = req.param('email', null);
    const password = req.param('password', null);
    if ( null == email || null == password ) {
        res.send(400);
        return;
    }
    Account.register(email, password, firstName, lastName);
    res.send(200);
});

app.post('/login', function(req, res) {
    console.log('login request');
    var email = req.param('email', null);
    var password = req.param('password', null);
    if ( null == email || email.length < 1
        || null == password || password.length < 1 ) {
            res.send(400);
            return;
        }
        Account.login(email, password, function(success) {
            if ( !success ) {
                res.send(401);
                return;
            }
            console.log('login was successful');
            res.send(200);
        });
    });

app.post('/forgotpassword', function(req, res) {
    var hostname = req.headers.host;
    var resetPasswordUrl = 'http://' + hostname + '/resetPassword';
    var email = req.param('email', null);
    if ( null == email || email.length < 1 ) {
        res.send(400);
        return;
    }
Account.forgotPassword(email, resetPasswordUrl, function(success){
    if (success) {
        res.send(200);
    } else {
        // Username or password not found
        res.send(404);
    }
});

app.get('/resetPassword', function(req, res) {
    var accountId = req.param('account', null);
    res.render('resetPassword.jade', {locals:{accountId:accountId}});
});

app.post('/resetPassword', function(req, res) {
    var accountId = req.param('accountId', null);
    var password = req.param('password', null);
    if ( null != accountId && null != password ) {
        Account.changePassword(accountId, password);
    }
    res.render('resetPasswordSuccess.jade');
});
});

app.listen(8080);