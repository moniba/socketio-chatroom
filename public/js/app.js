var socket = io();
var $loginForm = $('#login-form');
var $loginArea = $('#login-area');
var $msgForm = $('#message-form');
var $messageArea = $('#message-area');
var $errorMessage = $('#error-msg');

socket.on('connect', function() {
	$loginForm.on('submit', function(e) {
		e.preventDefault();
		var $username = $.trim($loginForm.find('input[name=username]').val());
		var $room = $.trim($loginForm.find('input[name=room]').val());
		socket.emit('joinRoom', {
			username: $username,
			room: $room
		}, function(data) {
			if (data.nameAvailable) {
				$(".room-title").text('You are in the room: ' + $room);
				$messageArea.show();
				$loginArea.hide('slow');
			} else {
				$errorMessage.text(data.error);
			}
		});
	});
});

function scrollSmoothToBottom(id) {
	var div = document.getElementById(id);
	$('#' + id).animate({
		scrollTop: div.scrollHeight - div.clientHeight
	}, 500);
}

socket.on('message', function(message) {
	var momentTimestamp = moment.utc(message.timestamp);
	var $message = $('#messages');
	$message.append('<p><strong>' + message.username + '</strong> <span class="time">' + momentTimestamp.local().format("h:mma") + '</span></p>');
	$message.append('<div class="wrap-msg"><p>' + message.text + '</p></div>');
	scrollSmoothToBottom('messages');
});

$msgForm.on('submit', function(e) {
	e.preventDefault();
	var $message = $msgForm.find('input[name=message]');
	var $username = $loginForm.find('input[name=username]');
	var reg = /<(.|\n)*?>/g;
	if (reg.test($message.val()) == true) {
		alert('Sorry, that is not allowed!');
	} else {
		socket.emit('message', {
			username: $.trim($username.val()),
			text: $message.val()
		});
	}
	$message.val('');
});