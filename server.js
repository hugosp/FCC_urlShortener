var mongo = require('mongodb').MongoClient;
var express = require('express');
var validUrl = require('valid-url');

var app = express();
var database = process.env.MONGOLAB_URI;
var port = process.env.PORT || 8080;


app.use('/', express.static(__dirname + '/public'));

app.get('/*?',function(req, res) {
    var url = req.url.slice(1);
    var patt = /^[0-9]+$/;
    var id=0;
    var host = req.protocol +'://'+ req.hostname+'/';

    mongo.connect(database, function(err, db) {
        if (err) throw err;
        var collection = db.collection('url');
        collection.find().sort({id:-1}).toArray(function (err, result) {
            if (err) throw err;
            id = result[0].id;
            id++;

            if (validUrl.isUri(url)){
                collection.insert({
                    original_url: url,
                    short_url: host + id,
                    id: id
                } , function(err, data) {
                    if(err) throw err;
                    res.send(data.ops[0]);
                });
            } else if(patt.test(url)){
                collection.find({"id":Number(url)}).toArray(function(err,result) {
                    if(err) throw err;
                    console.log(result[0].original_url); 
                    res.redirect(result[0].original_url);
                });
            } else {
                res.sendFile('index.html',{root: './public'});
            }
            db.close();
        });
    });
});

app.listen(port);
