var express = require('express');
var app = express();
var path = require("path");
var bodyParser = require('body-parser');

app.use(express.static(path.join(__dirname, 'dist'), {
    setHeaders: (res, path, stat) => {
        res.set({'Expires': new Date('2018-12-12')})
    }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var server = app.listen(8089, function() {
    console.log('Listening on port %d', server.address().port);
});