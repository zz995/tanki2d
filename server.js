var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

games = require('./js/sgame.js');
games.io = io;

http.listen(process.env.PORT || 5000, function(){
    console.log('listening on *:3005');
});

app.use(express.static(__dirname+'/public/'));  //необходимо что бы с документа можна было добрать до стилей и скриптов

//по запросу выводит index.html
app.get('/', function(req, res){
    res.sendfile(__dirname+'/public/index.html');
});

//прослушивание события конект
io.on('connection', onSocketConnection);

function onSocketConnection(socket) {
    console.log('\n a user connected');

    socket.on('newPlayer', onNewPlayer);

    socket.on("movePlayer", onMovePlayer);

    socket.on('massage', onMassage);

    socket.on('disconnect', onClientDisconnect);

    socket.on('endSleep', onEndSleep);
};

function onEndSleep(){
    console.log('EndSleep');
}

function onMovePlayer(keys){
    games.movePlayer(this, keys);
}

function onNewPlayer(){
    //socket = this;
    console.log('a new user '+this.id);
    games.findGame(this);
    //io.to(socket.rooms[1]).emit('massage', {str: 'qwerty', color: 'black'});
   // socket.broadcast.emit('massage', {str: 'qwerty', color: 'black'});
    //socket.broadcast.emit('massage', {str: 'User connected', color: 'green'});
   // socket.emit('massage', {str: 'You online', color: 'green'});
}

function onMassage(msg){
    console.log('massage: ' + msg);
    //io.emit('massage', {str: msg, color: 'blue'});
    io.to(this.rooms[1]).emit('massage', {str: msg, color: 'blue'});
}

function onClientDisconnect(){
    console.log('user disconnected');
    //console.dir(this.adapter.rooms);
    games.endGame(this);
}
