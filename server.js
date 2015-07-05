var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

games = require('./js/sgame.js');
games.io = io;

http.listen(process.env.PORT || 3005, function(){
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


}

function onEndSleep(){
    console.log('EndSleep');
}

function onMovePlayer(keys){
    games.movePlayer(this, keys);
}

function onNewPlayer(name){
    var soc = this;
    console.log('a new user '+soc.id+ ' name: '+name);

    if(/^[a-zA-Z0-9]{3,10}$/.test(name)&&name!==undefined) {
        console.log('user created '+soc.id);
        io.to(soc.id).emit('loginTrue');

        games.findGame(soc, name);

        soc.on('movePlayer', onMovePlayer);

        soc.on('massage', onMassage);

        soc.on('disconnect', onClientDisconnect);

        soc.on('endSleep', onEndSleep);
    }
}

function onMassage(msg){
    games.massage(this, msg);
}

function onClientDisconnect(){
    console.log('user disconnected');
    //console.dir(this.adapter.rooms);
    games.endGame(this);
}
