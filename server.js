var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

games = require('./js/sgame.js');
games.io = io;

http.listen(process.env.PORT || 3005, function(){
    console.log('listening on *:3005');
});

app.use(express.static(__dirname+'/public/'));  //���������� ��� �� � ��������� ����� ���� ��������� �� ������ � ��������

//�� ������� ������� index.html
app.get('/', function(req, res){
    res.sendfile(__dirname+'/public/index.html');
});

//������������� ������� ������
io.on('connection', onSocketConnection);

function onSocketConnection(socket) {
    //console.log('\n a user connected');
    socket.on('newPlayer', onNewPlayer);
}

function onProcessingDataUser(keys){
    games.processingDataUser(this, keys);
}

function onNewPlayer(name){
    var soc = this;
    //console.log('a new user '+soc.id+ ' name: '+name);

    if(/^[a-zA-Z0-9]{3,10}$/.test(name)&&name!==undefined) {
        //console.log('user created '+soc.id);
        io.to(soc.id).emit('loginTrue');

        games.findGame(soc, name);

        soc.on('dataUser', onProcessingDataUser);

        soc.on('checkPing', onCheckPing);

        soc.on('disconnect', onClientDisconnect);
    }
}

function onCheckPing(){
    games.checkPing(this);
}

function onClientDisconnect(){
    //console.log('user disconnected');
    games.endGame(this);
}