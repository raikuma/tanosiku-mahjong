const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session')

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());
app.use(session({
    secret: '!@#$TANOSI$#@!',
    resave: false,
    saveUninitialized: true
}));

const http = require('http').Server(app);
const io = require('socket.io')(http);
const router = require('./router/main')(app);
const lobbyManager = require('./lobby-manager')(app, io);
const debug = require('./debug')(app, io);

http.listen(3000, function () {
    console.log('Example app listenling on port 3000!');
});