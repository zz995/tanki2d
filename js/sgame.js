var stObj = require(__dirname+'/staticObjects.js'); //������ � ������� ��������� ����������� �������
var sgame = module.exports = { games : {}, count: 0, id: {}, io: {},
    pointsCanvas:[{x:0,y:0},{x:720, y:0},{x:720, y:480},{x:0, y:480}] //������� ������� ����
};
var UUID = require('node-uuid'); //������ ��� ��������� �� ������
function Tank(x, y, r){
    this.width = 20;
    this.height = 36;
    this.margin = 1;  //�������� �� ������� ����� �������� ������ ����� ��� �������

    this.gun_height =  31;
    this.gun_width = 12;
    this.gun_speed = 20;
    this.gun_r = 0;

    this.gub_width = 3;
    this.x = x;
    this.y = y;
    this.r = r;
    this.speed = 13;
    this.rotate_speed = 17;
    this.border = {}; //�������� ����� ��� �������� ������� � ����� �����
    this.border.body = new Intersect(Intersect.prototype.setPointsQuad.apply(this,
        [this.x,this.y,this.width/2-0.1,this.height/2-0.1,this.r]));
    this.border.gun = new Intersect(Intersect.prototype.setPointsQuad.apply(this,
        [this.x+((this.gun_height -5)/2)*Math.cos(this.r+this.gun_r),
            this.y+((this.gun_height -5)/2)*Math.sin(this.r+this.gun_r),
            this.gub_width/2-0.1,
            (this.gun_height -5)/2-0.1, this.r+this.gun_r]
    ));

    this.whenWasShot = new Date();
    this.timeShot = 1000;
    this.yourDeath = 0;
    this.life = 100;
    this.destroyed = 0;
    this.damageMin = 15;
    this.damageMax = 25;
    this.sleep = false;
}

function Intersect(pt){ //pt ����� ������� �������� �����
    this.points = pt || [];
}
Intersect.prototype.setPointsQuad = function(centrX, centrY, h, w, r){
    var weightX = w*Math.cos(r),
        weightY = w*Math.sin(r),
        heightX = h*Math.cos(r+Math.PI/2),
        heightY = h*Math.sin(r+Math.PI/2);
    this.points = [
        {
            x: centrX- weightX -heightX,
            y: centrY- weightY -heightY
        },
        {   x: centrX+ weightX -heightX,
            y: centrY+ weightY -heightY
        },
        {
            x: centrX+ weightX +heightX,
            y: centrY+ weightY +heightY
        },
        {
            x: centrX- weightX +heightX,
            y: centrY- weightY +heightY
        }
    ];
};

Intersect.prototype.pointObjInter = function(pt2){
    var nx = this.points[0].x, ny = this.points[0].y;
    var min = {x: 5000, y: 5000};
    for (j = 0; j < pt2.length; j++) {
        var t1 = this.points[0], t2 = this.points[1],
            t3 = pt2[j], t4 = pt2[(j + 1) % pt2.length];
        if (!this.intersectSeg(t1, t2, t3, t4)) continue;
        a1=t2.y-t1.y;
        a2=t4.y-t3.y;
        if(a1==a2) continue;
        b1=t1.x-t2.x;
        c1=-t1.x*(t2.y-t1.y)+t1.y*(t2.x-t1.x);
        b2=t3.x-t4.x;
        c2=-t3.x*(t4.y-t3.y)+t3.y*(t4.x-t3.x);
        var d=a1*b2-b1*a2;
        var point={x:(-c1*b2+b1*c2)/d, y:(-a1*c2+c1*a2)/d};
        if(Math.abs(nx-point.x)<Math.abs(nx-min.x)) min = point;
        else if(Math.abs(nx-point.x)==Math.abs(nx-min.x) && Math.abs(ny-point.y)<Math.abs(ny-min.y)) min=point;
    }
    return min;
};

Intersect.prototype.intersect = function(pt2){
    for(i=0; i<this.points.length; i++)
        for (j = 0; j < pt2.length; j++)
            if (this.intersectSeg(this.points[i], this.points[(i + 1) % this.points.length], pt2[j], pt2[(j + 1) % pt2.length]))
                return true;
    return false;
};
Intersect.prototype.intersectSeg = function(t1, t2, t3, t4) { //������������� �� ������� ������� �������
    intersect_1 = function(a, b, c, d){
        if (a>b){
            a^=b;
            b^=a;
            a^=b;
        }
        if (c>d){
            c^=d;
            d^=c;
            c^=d;
        }
        return (a<c?c:a)<=(b<d?b:d);
    };
    area = function(a, b, c){
        return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    };
    return intersect_1(t1.x, t2.x, t3.x, t4.x)
        && intersect_1(t1.y, t2.y, t3.y, t4.y)
        && area(t1, t2, t3) * area(t1, t2, t4) <= 0
        && area(t3, t4, t1) * area(t3, t4, t2) <= 0;
};

function Game(){
    this.roomId = UUID();
    this.timerId = 0;
    this.count = 1;
    this.players = {};
    this.maxPlayer = 4;
    this.staticObj = stObj;
    this.freeColor = [0, 1, 2, 3];
    this.message = [];
    this.whoDeleted = [];
    this.whoWake = [];
    this.posReset = [
        {x:53, y:57},
        {x:660, y:52},
        {x:658, y:435},
        {x:208, y:141},
        {x:540, y:361},
        {x:182, y:356},
        {x:542, y:133}];
}
function Player(id, t, n, c){
    this.playerId = id;
    this.tank = t;
    this.name = n || 'underfined';
    this.color = c || 0;
}
function rand(min, max){
    var rand = min - 0.5 + Math.random() * (max - min + 1);
    rand = Math.round(rand);
    return rand;
}
sgame.startGame = function(game, socket, name){
    socket.join(game.roomId);
    this.id[socket.id] = game.roomId; //�������������� ������ ��_������� - �������_�������
    for(var l= game.posReset[rand(0, game.posReset.length-1)], tankCreat = new Tank(l.x, l.y, rand(0, 360));
        sgame.collision(tankCreat, game, socket.id, true);){
        l= game.posReset[rand(0, game.posReset.length-1)];
        tankCreat = new Tank(l.x, l.y, rand(0, 360));
    }
    var color=0;
    if (!game.freeColor.length)
        color = 0;
    else color = game.freeColor.pop();

    game.players[socket.id] = new Player(socket.id, tankCreat, name, color);
    //console.log('name: '+game.players[socket.id].name+' color: '+game.players[socket.id].color);
    //console.log('data about new player send');
    var gg={};
    gg[socket.id] = game.players[socket.id];
    socket.broadcast.to(game.roomId).emit('newPlayer', {game: gg});
    socket.emit('newPlayer', {id: socket.id, game: game.players});

};
sgame.DataForSend = function (theGame){
    var obj = {};
    for(var i in theGame.players) {
        if (!theGame.players.hasOwnProperty(i)) continue;
        var theTank = theGame.players[i].tank;
        obj[i]={x: theTank.x, y:theTank.y, r: theTank.r, r_gun: theTank.gun_r};
    }
    obj.msg = theGame.message;
    obj.del = theGame.whoDeleted;
    obj.wake = theGame.whoWake;
    obj.date = new Date().getTime();
    return obj;
};
sgame.createGame = function(socket, name) {
    var crGame = new Game();
    //console.log('create game ');
    this.games[crGame.roomId] = crGame;
    this.count++;
    this.startGame(crGame, socket, name);
    crGame.timerId = setInterval(function(theGame) {
        this.io.to(theGame.roomId).emit('dataForUser', sgame.DataForSend(theGame));
        theGame.message.length = 0;
        theGame.whoDeleted.length = 0;
        theGame.whoWake.length = 0;
    }.bind(this, crGame), 60);
    //console.log('interval start');
};
sgame.endGame = function(socket){
    var theRoom = this.id[socket.id];
    var theGame = this.games[theRoom];
    if(theGame.count == 1){
        this.count--;
        //console.log('room delete ' + this.count);
        var iid =this.games[theRoom].timerId;
        clearInterval(this.games[theRoom].timerId);
        //console.log('interval stop: '+i);
        delete this.games[theRoom];
    } else {
        var color = theGame.players[socket.id].color;
        theGame.freeColor.push(color);
        delete theGame.players[socket.id];
        theGame.count--;
        theGame.whoDeleted.push(socket.id);
    }
};
sgame.findGame = function(socket, name){
    //console.log('run findGame');
    if(this.count){
        var resultFind = false;
        for(var i in this.games){
            if(!this.games.hasOwnProperty(i)) continue;
            var gameIns = this.games[i];
            if (gameIns.count < gameIns.maxPlayer){
                var resultFind = true;
                gameIns.count++;
                //console.log('player id ');
                this.startGame(gameIns, socket, name);
                break;
            }
        }
        if(!resultFind){
            this.createGame(socket, name);
        }
    } else {
        this.createGame(socket, name);
    }
};
sgame.collision = function(theTank, theGame, socket, put){
    var colBody = new Intersect();
    colBody.setPointsQuad(
        theTank.x,theTank.y,theTank.width/2-0.1,theTank.height/2-0.1,theTank.r
    );
    if(colBody.intersect(this.pointsCanvas)) return true;
    var colGun = new Intersect();
    colGun.setPointsQuad(
        theTank.x+((theTank.gun_height -5)/2)*Math.cos(theTank.r+theTank.gun_r),
        theTank.y+((theTank.gun_height -5)/2)*Math.sin(theTank.r+theTank.gun_r),
        theTank.gub_width/2-0.1,
        (theTank.gun_height -5)/2-0.1 , theTank.r+theTank.gun_r
    );
    if(put!==true) {
        //��������� �� ����������� � ������������ ���������
        var obj = theGame.staticObj;
        for (var i = 0; i < obj.length; i++) {
            if (colBody.intersect(obj[i]) || colGun.intersect(obj[i])) return true;
        }
    }
    if(theGame.count <= 1){
        theTank.border.body = colBody;
        theTank.border.gun = colGun;
        return false;
    }
    for(var i in theGame.players) {
        if (!theGame.players.hasOwnProperty(i)) continue;
        if (socket == theGame.players[i].playerId || theGame.players[i].tank.sleep) continue;
        var gameIns = theGame.players[i].tank;
        if (gameIns &&
            (colBody.intersect(gameIns.border.body.points)
             || colBody.intersect(gameIns.border.gun.points)
             || colGun.intersect(gameIns.border.body.points)
             || colGun.intersect(gameIns.border.gun.points)
            )
        ) return true;
    }
    theTank.border.body = colBody;
    theTank.border.gun = colGun;
    return false;
};
sgame.shot = function(theTank, theGame, socket){
    var px = theTank.x+((theTank.gun_height-5))*Math.cos(theTank.r+theTank.gun_r);
    var py = theTank.y+((theTank.gun_height-5))*Math.sin(theTank.r+theTank.gun_r);
    var startShot = new Intersect([
        {
            x:px,
            y:py
        },
        {
            x:px+(px-theTank.x)*75,
            y:py+(py-theTank.y)*75
        }
    ]);
    var min = {x: 5000, y: 5000};
    var obj = theGame.staticObj;
    for(var i=0; i<obj.length; i++){
        var point = startShot.pointObjInter(obj[i]);
        if(Math.abs(px-point.x)<Math.abs(px-min.x)) min = point;
        else if(Math.abs(px-point.x)==Math.abs(px-min.x) && Math.abs(py-point.y)<Math.abs(py-min.y)) min=point;
    }
    var victimId = false;
    for(var i in theGame.players) {
        if (!theGame.players.hasOwnProperty(i)) continue;
        if (socket == theGame.players[i].playerId || theGame.players[i].tank.sleep) continue;
        var gameIns = theGame.players[i].tank.border.body.points;
        var point = startShot.pointObjInter(gameIns);
        if(Math.abs(px-point.x)<Math.abs(px-min.x)) {
            min = point;
            victimId = theGame.players[i].playerId;
        }
        else if(Math.abs(px-point.x)==Math.abs(px-min.x) && Math.abs(py-point.y)<Math.abs(py-min.y)) {
            min=point;
            victimId = theGame.players[i].playerId;
        }
    }
    var kill = false;
    var destroyed_1, death_1;
    var vicX=0, vicY=0;
    if (victimId !== false){
        var pl = theGame.players[victimId].tank;
        var hp = pl.life-=rand(theTank.damageMin, theTank.damageMax);
        if(hp<=0){
            theTank.destroyed++;
            pl.yourDeath++;
            destroyed_1 = theTank.destroyed;
            death_1 = pl.yourDeath;
            pl.life=100;
            pl.sleep = true;
            this.io.to(theGame.roomId).emit('heKill', {id:victimId, x:pl.x, y:pl.y});
            setTimeout(function(victimId) {
                var p1 = theGame.players[victimId].tank;
                pl.sleep = false;
                for(var l= theGame.posReset[rand(0, theGame.posReset.length-1)], tankCreat = new Tank(l.x, l.y, rand(0, 360));
                    sgame.collision(tankCreat, theGame, socket.id, true);){
                    l= theGame.posReset[rand(0, theGame.posReset.length-1)];
                    tankCreat = new Tank(l.x, l.y, rand(0, 360));
                }
                pl.x= tankCreat.x; pl.y= tankCreat.y; pl.r= tankCreat.r;
                pl.gun_r = 0;
                p1.border.body= tankCreat.border.body;
                p1.border.gun= tankCreat.border.gun;
                theGame.whoWake.push(victimId);
            }.bind(this, victimId), 3000);
            kill=true;
        }
        vicX=pl.x;
        vicY=pl.y;
    }
    this.io.to(theGame.roomId).emit('shot', {kill:kill, dest: destroyed_1, death:death_1, hit:min.x!=5000 && min.y!=5000 && !kill, id:socket,  x: min.x, y:min.y, vicX:vicX, vicY:vicY, gunX:px, gunY:py, tankR:theTank.r, gunR:theTank.gun_r, lifeVictim:{id:victimId, hp:victimId===false?false:theGame.players[victimId].tank.life}});
};
sgame.processingDataUser = function(socket, data){
    var theGame = this.games[this.id[socket.id]];
    var theTank = theGame.players[socket.id].tank;
    if(data.msg!==false) {
        theGame.message.push({str: data.msg, color: theGame.players[socket.id].color});
        //console.log('message: '+data.msg);
    }
    if(theTank.sleep) return;
    var x=theTank.x, y=theTank.y, r=theTank.r, gr=theTank.gun_r;
    if(data.space && ((theTank.whenWasShot-(new Date()))<-theTank.timeShot)) {
        theTank.whenWasShot = new Date();
        sgame.shot(theTank, theGame, socket.id);
    }
    var rotSp = theTank.rotate_speed/data.delTime;
    var sp = theTank.speed/data.delTime;
    var gunRotSp = theTank.gun_speed/data.delTime;
    if(data.gunLeft)
        theTank.gun_r -= gunRotSp * Math.PI / 180;
    else if (data.gunRight)
        theTank.gun_r += gunRotSp * Math.PI / 180;
    if(data.left)
        theTank.r -= rotSp * Math.PI / 180;
    else if (data.right)
        theTank.r += rotSp * Math.PI / 180;
    if(data.up) {
        theTank.x += sp * Math.cos(theTank.r);
        theTank.y += sp * Math.sin(theTank.r);
    } else if (data.down) {
        theTank.x -= sp * Math.cos(theTank.r);
        theTank.y -= sp * Math.sin(theTank.r);
    }
    if(sgame.collision(theTank, theGame, socket.id)){
        theTank.r = r;
        theTank.x = x;
        theTank.y = y;
        theTank.gun_r = gr;
    }
};
sgame.checkPing = function(socket){
    socket.emit('checkPing');
};