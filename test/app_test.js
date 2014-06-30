var request = require('supertest'),
	redis = require("redis"),
	client = redis.createClient(),
  	app = require('../server.js');


describe('app', function(){
	it('responds to /', function(done){
		request(app)
			.get('/')
			.expect('Content-Type', /text/)
			.expect(200, /Inbox Status/)
			.end(done);
	})


	describe('pushing values', function(){
	
		it('can set foo', function(done){
			request(app)
				.post('/set/foo', {value:10})
				.expect('Content-Type', /application\/json/)
				.end(done)
		})
		
		it('can errors without value', function(done){
			request(app)
				.post('/set/bar')
				.expect('Content-Type', /application\/json/)
				.expect(403)
				.end(done)
		})
		
	})


	describe('clearing values', function(){
	
		it('can clear foo', function(done){
			request(app)
				.post('/clear/foo')
				.expect('Content-Type', /application\/json/)
				.end(done)
		})

	});

	describe('persistence', function(){
		before(function(done){
			request(app)
				.post('/set/persist', {value:10})
				.end(done)
		})

		before(function(done){
			request(app)
				.post('/set/persist', {value:20})
				.end(done)
		})

		// xit('persisted in redis', function(done){})
	})

})