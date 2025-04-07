const dotenv = require('dotenv');
dotenv.config();  // Load environment variables from .env file

const config = require('./config/config.json');  // Load the config file
const environment = process.env.NODE_ENV || 'development';  // Use NODE_ENV or default to development

const currentConfig = config[environment];  // Get the configuration based on the current environment

console.log(`Using ${environment} configuration:`);  // Log which configuration is being used
console.log(currentConfig);

var app = require('express')();
var express = require('express');
var path = require('path');
var http = require('http').Server(app);
const cookieParser = require('cookie-parser');
// Import Router file
var pageRouter = require('./routes/routes');
var session = require('express-session');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var i18n = require("i18n-express");
var urlencodeParser = bodyParser.urlencoded({ extended: true });
app.use(urlencodeParser);
app.use(session({ resave: false, saveUninitialized: true, secret: 'nodedemo' }));
app.use(flash());
app.use(cookieParser());
// Import DB connection (Sequelize)
const db = require('./db'); // Import the Sequelize instance

// for i18n usage
app.use(i18n({
    translationsPath: path.join(__dirname, 'i18n'), // Specify translations files path
    siteLangs: ["es", "en", "fr", "ru", "it", "gr", "sp"],
    textsVarName: 'translation'
}));

app.use(express.static(__dirname + '/public'));
app.use('/public', express.static('public'));
app.set('layout', 'layouts/layout');
var expressLayouts = require('express-ejs-layouts');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

// Define all routes
pageRouter(app);

app.all('*', function (req, res) {
    res.locals = { title: 'Error 500' };
    res.render('auth/auth-500', { layout: "layouts/layout-without-nav" });
});

// Test the database connection (Sequelize)
db.authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.');
    })
    .catch((error) => {
        console.error('Unable to connect to the database:', error);
    });

// Start the server and listen on the specified port
http.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
