var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');
var connectedUsers = {};

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {
	console.log('A user is connected.');

	socket.on('disconnect', function() {
		var userData = connectedUsers[socket.id];
		if (typeof userData !== 'undefined') {
			socket.leave(connectedUsers[socket.id]);
			io.to(userData.room).emit('message', {
				username: 'System',
				text: userData.username + ' has left!',
				timestamp: moment().valueOf()
			});
			delete connectedUsers[socket.id];
		}
	});

	socket.on('joinRoom', function(req, callback) {
		if (req.room.replace(/\s/g, "").length > 0 && req.username.replace(/\s/g, "").length > 0) {
			var nameTaken = false;

			Object.keys(connectedUsers).forEach(function(socketId) {
				var userInfo = connectedUsers[socketId];
				if (userInfo.username.toUpperCase() === req.username.toUpperCase()) {
					nameTaken = true;
				}
			});

			if (nameTaken) {
				callback({
					nameAvailable: false,
					error: 'Sorry this username is taken!'
				});
			} else {
				connectedUsers[socket.id] = req;
				socket.join(req.room);
				socket.broadcast.to(req.room).emit('message', {
					username: 'System',
					text: req.username + ' has joined!',
					timestamp: moment().valueOf()
				});
				callback({
					nameAvailable: true
				});
			}
		} else {
			callback({
				nameAvailable: false,
				error: 'Hey, please fill out the form!'
			});
		}
	});

	socket.on('message', function(message) {
		message.timestamp = moment().valueOf();
		io.to(connectedUsers[socket.id].room).emit('message', message);
	});

	socket.emit('message', {
		username: 'System',
		text: 'Hey there! Ask someone to join this chat room to start talking.',
		timestamp: moment().valueOf()
	});

});

http.listen(PORT, function() {
	console.log('Server started on port ' + PORT);
});