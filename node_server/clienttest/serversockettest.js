
var redis = require('redis');
var Promise = require('bluebird');
Promise.promisifyAll(redis);
//Promise.promisifyAll(redis.RedisClient.prototype);
//Promise.promisifyAll(redis.Multi.prototype);
var rclient = redis.createClient();

var socketio = require('socket.io');
Promise.promisifyAll(socketio);
var io = socketio();

//send all the past votes from the room to the client
function historicalVotes(room_id, client) {

	//TODO: connect to the db for the room id


	//grab each timestep
	rclient.lrangeAsync("history", 0, -1).map(function(reply) {
		return rclient.getAsync(reply);
	}).map(function(history) {

		if (!history) return;
		
		//convert each history string into json
		var hisJ = JSON.parse(history);

		//remove the connected users string
		delete hisJ.connected;
		return hisJ;
	}).then(function(completeHist) {
		//send as array to client
		return client.emit("data", completeHist);
	});
}

function sendVotes(room_id) {

	//TODO: connect to the db for the room_id

	var connectedUsers = [];

	//grab the vote state
	rclient.lrangeAsync("connected", 0, -1).map(function(reply) {
		connectedUsers = reply;
		return rclient.getAsync(reply);
	}).then(function (res) {
		//tally up the votes
		votes = {"yes": 0, "no": 0};
		for (vote of res) {
			if (vote === "yes") {
				votes["yes"] += 1;
			} else if (vote === "no") {
				votes["no"] += 1;
			}
		}

		var now = Date.now();
		votes["ts"] = now;
		voteStr = JSON.stringify(votes);

		//broadcast the votes
		io.to(room_id).emit('step', voteStr);

		votes["connected"] = connectedUsers;
		histStr = JSON.stringify(votes);

		//glob the data of this timestep into the redis historical field
		return rclient.lpushAsync("history", now).then(function() {
			return rclient.setAsync(now, histStr);
		});
	}).then(function() {
		console.log("done");
	}).catch(function(err) {
		console.log(err);
	});	
	//call this fn again
	setTimeout(function() { sendVotes(room_id); }, 1000);
}

io.on('connection', function(client) {

	//rclient.lpush("connected", "usr1");
	client.join("roomy");
	historicalVotes("roomy", client);
	//console.log(client);



	//io.to('roomy').emit("message", {msg: "hello"});
});

setTimeout(function() { sendVotes("roomy"); }, 1000);


io.listen(3002);
