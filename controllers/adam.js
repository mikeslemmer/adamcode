var fs = require('fs');
var redis = require('redis');
var redisClient = redis.createClient(); //6379, 'localhost', '');
var uuid = require('node-uuid');


module.exports = {
	index: function(req, res) { 
		res.render("index", {
			title: "Adam Code",
			gameId: uuid.v1()	// Hmmm
		});	    
	}
};