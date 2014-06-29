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


var
	app = express();

var port = process.env.PORT || 3000;

app.use(bodyParser.json())

// app.post(basicAuth('testUser', 'testPass'));

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

	if(value) client.zadd(key, -now, [now,value].join(' '))

	res.send(
		value ? 200 : 403,
		{status: value ? 'ok' : 'missing key'}
	);

})

app.post('/clear/:key', protect, function(req,res){
	client.del(req.param('key'))
	res.send({status:'cleared'})
})

app.get('/data/:key', function(req, res){

	var keys = [];

	client.zscan(req.param('key'), {count: 3})
	.on('data', function(s){
		keys.push(
			s.key.split(' ').map(function(n){
				return parseInt(n,10)
			}));
	})
	.on('end', function(){
		res.send(keys)	
	})
	
})

// all keys on the system
app.get('/keys', function(req, res){

	var keys = [];

	client.scan({count:100})
	.on('data', function(s){
		keys.push(s);
	})
	.on('end', function(){
		res.send(keys)	
	});

})

app.listen(port);

module.exports = app;
