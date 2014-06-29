var express = require('express'),
	app = express();

var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.send('hello world (express)');
});

app.listen(port);

module.exports = app;