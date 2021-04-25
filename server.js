// imports
var express = require('express');
var bodyParser = require('body-parser')
var apiRouter = require('./apiRouter').router;

// instantiate sever

var server = express ();

// body-parser

server.use(bodyParser.urlencoded({ extended: true}));
server.use(bodyParser.json())


// configure routes

server.get('/', function (req, res){
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send('<h1>Bonjour sur mon super server</h1>')
});

server.use('/api/', apiRouter)

// launch server
server.listen(8181, function(){
    console.log('Connecté sur 8181')
});