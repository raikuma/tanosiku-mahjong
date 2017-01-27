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

const router = require('./router/main')(app);

app.listen(3000, function() {
    console.log('Example app listenling on port 3000!');
});