const express = require("express");
const bodyParser = require("body-parser");
const address = require("address");
const path = require("path");
var fs = require('fs');
var http = require('http');
var https = require('https');

var privateKey = fs.readFileSync('privatekey.pem').toString();
var certificate = fs.readFileSync('certificate.pem').toString();

var credentials = { key: privateKey, cert: certificate };

const app = express();

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(8080);
httpsServer.listen(8443);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "images")));

require("./app/route")(app);
