var express = require("express");
var app = express();
var compression = require("compression");
app.use(compression());
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var path = require("path");
var paths = require("./app/paths");
var confdata = require("./" + paths.CONF_DATA);
var auth = require("basic-auth");
app.use(function (req, res, next) {
	var credentials = auth(req);
	if (!credentials || credentials.name !== confdata.basicAuth.USERNAME || credentials.pass !== confdata.basicAuth.PASSWORD) {
		res.setHeader("WWW-Authenticate", "Basic realm='MongoManager'");
		res.sendStatus(401);
	} else {
		next();
	}
});
var mongodb = require("mongodb");
mongodb.MongoClient.connect(confdata.DB_URL, function (err, db) {
	if (err) {
		throw err;
	}
	app.use("/" + confdata.API_NAME, express.static(__dirname + "/views/static"));
	var port = process.env.PORT || confdata.PORT;
	var router = express.Router();
	require("./" + paths.routing.ROUTES)(router, db);
	app.use("/" + confdata.API_NAME, router);
	app.listen(port);
});
