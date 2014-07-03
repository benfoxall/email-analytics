var express = require('express'),
	bodyParser = require('body-parser'),
	basicAuth = require('basic-auth-connect'),
	redis = require("redis"),
	url = require('url'),
	client;

require("redis-scanstreams")(redis);

if (process.env.REDISTOGO_URL) {
	var redisURL = url.parse(process.env.REDISTOGO_URL);

	client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
	client.auth(redisURL.auth.split(":")[1]);
} else {
    client = redis.createClient();
}

var LIST_LENGTH = 500;
var
	app = express();

var port = process.env.PORT || 3000;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

//cors
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Cache-Control", "public, max-age=600"); //ten minutes
  next();
 });

app.use(express.static(__dirname + '/public'));

var protect = (process.env.USER && process.env.PASS) ?
	basicAuth(process.env.USER, process.env.PASS) :
	function(_,_,next){return next()};

/* 
	Set a value for a given key
	POST /set/keyname {value:20 }
*/
app.post('/set/:key', protect, function(req,res){

	var key = req.param('key'),
		value = req.param('value'),
		now = +new Date;

	var listkey = 'stat-' + key;
	if(value) client.lpush(listkey, [now,value].join(' '), redis.print)

	res.send(
		value ? 200 : 403,
		{status: value ? 'ok' : 'missing key'}
	);

	client.ltrim(listkey, 0, LIST_LENGTH)

})

app.post('/clear/:key', protect, function(req,res){
	var listkey = 'stat-' + req.param('key');
	client.del(listkey)
	res.send({status:'cleared'})
})

app.get('/data/:key', function(req, res){

	var listkey = 'stat-' + req.param('key');
	client.lrange(listkey,0, LIST_LENGTH, function(err, resp){
		var keys = resp.map(function(item){
			return item.split(' ').map(function(n){
				return parseInt(n,10)
			});
		});
		res.send(keys)
	})

})

// all keys on the system
app.get('/keys', function(req, res){

	var keys = [];

	client.scan({pattern:'stat-*'})
	.on('data', function(s){
		keys.push(s.substr(5));
	})
	.on('end', function(){
		res.send(keys)	
	});

})

app.listen(port);

module.exports = app;
