var request = require('supertest')
  , app = require('../server.js');


describe('app', function(){
	it('responds to /', function(done){
		request(app)
			.get('/')
			.expect('Content-Type', /text/)
			.expect(200, done);
	})
})