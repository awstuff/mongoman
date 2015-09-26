var express = require("express");
var app = express();
var compression = require("compression");
app.use(compression());
var cors = require("cors");
app.use(cors());
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var path = require("path");
var paths = require("./app/paths");
var confdata = require("./" + paths.CONF_DATA);
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
