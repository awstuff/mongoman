var paths = require("./paths");
var confdata = require("./../" + paths.CONF_DATA);
var path = require("path");

module.exports = function (router, db) {
    router.get("/", function (req, res) {
        res.sendFile(path.resolve("./views/index.html"));
    });
    router.get("/dbname", function (req, res) {
        res.send(db.databaseName);
    });
    router.get("/collections", function (req, res) {
        db.listCollections().toArray(function (err, collections) {
            if (err) {
                res.sendStatus(500);
                return;
            }
            res.json(collections.map(function (e) {
    			return e.name;
    		}));
        });
    });
    router.get("/documents/:col", function (req, res) {
        db.collection(req.params.col).find({}).toArray(function (err, docs) {
    		if (err) {
                res.sendStatus(500);
                return;
    		}
    		res.json(docs);
    	});
    });
    router.post("/newdocument", function (req, res) {
        var collection = req.body.collection;
        var doc = req.body.document;
        try {
            doc = JSON.parse(doc);
        } catch (e) {
            res.sendStatus(400);
            return;
        }
        db.collection(collection).insert(doc, function (err) {
            if (err) {
                res.sendStatus(500);
                return;
            }
            res.json({
                success : true
            });
        });
    });
    router.post("/clear", function (req, res) {
        var collection = req.body.collection;
        db.collection(collection).remove({}, function (err) {
            if (err) {
                res.sendStatus(500);
                return;
            } else {
                res.json({
                    success : true
                });
            }
        });
    });
    router.post("/remove", function (req, res) {
        var collection = req.body.collection;
        var doc = req.body.document;
        try {
            doc = JSON.parse(doc);
        } catch (e) {
            res.sendStatus(400);
            return;
        }
        delete doc._id;
        db.collection(collection).remove(doc, function (err) {
            if (err) {
                res.sendStatus(500);
                return;
            } else {
                res.json({
                    success : true
                });
            }
        });
    });
    router.post("/filter", function (req, res) {
        var collection = req.body.collection;
        var filter = req.body.filter;
        try {
            filter = JSON.parse(filter);
        } catch (e) {
            res.sendStatus(400);
            return;
        }
        db.collection(collection).find(filter).toArray(function (err, docs) {
    		if (err) {
                res.sendStatus(500);
                return;
    		}
    		res.json(docs);
    	});
    });
};
