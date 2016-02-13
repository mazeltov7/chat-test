var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

http.listen(3000, function() {
  console.log('listening on *:3000');
});

// public以下を読み込んで使えるように
app.use(express.static(__dirname + '/public'));

var numUsers = 0;

// ルートへのアクセスでindex.htmlを返す
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

// チャットのイベントの対応
io.on('connection', function(socket) {
  var addedUser = false;

  socket.on('new message', function(data) {
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    })
  })

  socket.on('add user', function(username) {
    if (addedUser) return;

    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  socket.on('disconnect', function() {
    if (addedUser) {
      --numUsers;
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });

  socket.on('typing', function() {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  socket.on('stop typing', function() {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });


});


