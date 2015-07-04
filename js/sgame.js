var stObj = require(__dirname+'/staticObjects.js');
var sgame = module.exports = { games : {}, count: 0, id: {}, io: {},
    pointsCanvas:[{x:0,y:0},{x:720, y:0},{x:720, y:480},{x:0, y:480}]
};
var UUID = require('node-uuid');
function Tank(x, y, r){
    this.width = 20;
    this.height = 48;
    this.margin = 1;
    this.gun_height =  10;
    this.gub_width = 3;
    this.x = x;
    this.y = y;
    this.r = r;
    this.speed = 1;
    this.rotate_speed = 1;
    this.border = {};
    this.border.body = new Intersect(Intersect.prototype.setPointsQuad.apply(this,
        [this.x,this.y,this.width/2-0.1,(this.height-this.gun_height)/2-0.1,this.r]));
    this.border.gun = new Intersect(Intersect.prototype.setPointsQuad.apply(this,
        [this.x+((this.height-this.gun_height)/2)*Math.cos(this.r)+(this.gun_height/2)*Math.cos(this.r),
        this.y+((this.height-this.gun_height)/2)*Math.sin(this.r)+(this.gun_height/2)*Math.sin(this.r),
        this.gub_width/2-0.1,
        this.gun_height/2-0.1,this.r]
    ));
    this.whenWasShot = new Date();
    this.timeShot = 500;
    this.yourDeath = 0;
    this.life = 100;
    this.destroyed = 0;
    this.damage = 25;
    this.sleep = false;
}

function Intersect(pt){ //pt масив который содержит точки
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
        console.log('was tohs x: '+point.x+' y: '+point.y);
        if(Math.abs(nx-point.x)<Math.abs(nx-min.x)) min = point;
        else if(Math.abs(nx-point.x)==Math.abs(nx-min.x) && Math.abs(ny-point.y)<Math.abs(ny-min.y)) min=point;
    }
    console.log('was minn x: '+min.x+' y: '+min.y);
    return min;
};

Intersect.prototype.intersect = function(pt2){
    for(i=0; i<this.points.length; i++)
        for (j = 0; j < pt2.length; j++)
            if (this.intersectSeg(this.points[i], this.points[(i + 1) % this.points.length], pt2[j], pt2[(j + 1) % pt2.length]))
                return true;
    return false;
};
Intersect.prototype.intersectSeg = function(t1, t2, t3, t4) { //пересекаються ли отрезки заданые точками
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
    this.count = 1;
    this.players = {};
    this.maxPlayer = 4;
    this.staticObj = stObj;
}
Game.prototype.intersect = function(id, ps){

};
function Player(id, t){
    this.playerId = id;
    this.tank = t;
}
function rand(min, max){
    var rand = min - 0.5 + Math.random() * (max - min + 1);
    rand = Math.round(rand);
    return rand;
}

sgame.startGame = function(game, socket){
    socket.join(game.roomId);
    this.id[socket.id] = game.roomId; //ассоциативнный массив ид_клиента - комната_клиента
    socket.emit('massage', {str: 'You online', color: 'green'});
    socket.emit('id', socket.id);
    socket.broadcast.to(game.roomId).emit('massage', {str: 'User connected', color: 'green'});

    for(var tankCreat = new Tank(rand(0, 620)+ 50, rand(0, 380)+ 50, rand(0, 360));sgame.collision(tankCreat, game, socket.id);){
        tankCreat = new Tank(rand(0, 620)+ 50, rand(0, 380)+ 50, rand(0, 360));
    }

    game.players[socket.id] = new Player(socket.id, tankCreat);
    //console.dir(game.players[socket.id]);
    console.log('data about new player send');
    for (var player in game.players){
       if(!game.players.hasOwnProperty(player)) continue;
       this.io.to(game.roomId).emit('newPlayer', game.players[player] /*game.players[socket.id]*/);
    }
};
sgame.createGame = function(socket) {
    var crGame = new Game();
    console.log('create game ');
    //var pla = new Player(socket.id);
   // crGame.players[socket.id] = new Player(socket.id);
   // console.log('player id ' + crGame.players[socket.id].playerId);
    this.games[crGame.roomId] = crGame;
    this.count++;
    this.startGame(crGame, socket);
};
sgame.endGame = function(socket){
    var theRoom = this.id[socket.id];
    var theGame = this.games[theRoom];
    //console.dir(theGame);
    if(theGame.count == 1){
        this.count--;
        console.log('room delete ' + this.count);
        delete this.games[theRoom];
    } else {
        delete theGame.players[socket.id];
        theGame.count--;
        console.log('player delete ' + theGame.count);
        socket.broadcast.to(theRoom).emit('massage', {str: 'user disconnected', color: 'red'});
        this.io.to(theRoom).emit('deletePlayer', socket.id);
        //sgame.sendAllInGame(theGame, 'deletePlayer', socket.id);
    }
};
sgame.findGame = function(socket){
    console.log('run findGame');
    if(this.count){
        var resultFind = false;
        for(var i in this.games){
            if(!this.games.hasOwnProperty(i)) continue;
            var gameIns = this.games[i];
            if (gameIns.count < gameIns.maxPlayer){
                var resultFind = true;
                gameIns.count++;
                gameIns.players[socket.id] = new Player(socket.id);
                console.log('player id ' + gameIns.players[socket.id].playerId);
                this.startGame(gameIns, socket);
                break;
            }
        }
        if(!resultFind){
            this.createGame(socket);
        }
    } else {
        this.createGame(socket);
    }
};

sgame.collision = function(theTank, theGame, socket){
    //console.log('colision');
    var colBody = new Intersect();
    colBody.setPointsQuad(
        theTank.x,theTank.y,theTank.width/2-0.1,(theTank.height-theTank.gun_height)/2-0.1,theTank.r
    );
    if(colBody.intersect(this.pointsCanvas)) return true;
    var colGun = new Intersect();
    colGun.setPointsQuad(
        theTank.x+((theTank.height-theTank.gun_height)/2)*Math.cos(theTank.r)+(theTank.gun_height/2)*Math.cos(theTank.r),
        theTank.y+((theTank.height-theTank.gun_height)/2)*Math.sin(theTank.r)+(theTank.gun_height/2)*Math.sin(theTank.r),
        theTank.gub_width/2-0.1,
        theTank.gun_height/2-0.1,theTank.r
    );
    //console.log(theGame.count.toString());
    //провверка на столкновеня с статическими объектами
    var obj = theGame.staticObj;
    for(var i=0; i<obj.length; i++){
        if (colBody.intersect(obj[i])||colGun.intersect(obj[i])) return true;
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
    var px = theTank.x+((theTank.height-theTank.gun_height)/2)*Math.cos(theTank.r)+(theTank.gun_height)*Math.cos(theTank.r);
    var py = theTank.y+((theTank.height-theTank.gun_height)/2)*Math.sin(theTank.r)+(theTank.gun_height)*Math.sin(theTank.r);
    console.log('was shot x: '+px+' y: '+py);
    var startShot = new Intersect([
        {x:px,
         y:py
        },
        {x:px+720*Math.cos(theTank.r),
         y:py+480*Math.sin(theTank.r)
        }
    ]);
    var min = {x: 5000, y: 5000};
    var obj = theGame.staticObj;
    for(var i=0; i<obj.length; i++){
        var point = startShot.pointObjInter(obj[i]);
        //console.log('was tohs x: '+point.x+' y: '+point.y);
        console.log('minn minn x: '+min.x+' y: '+min.y);
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
    if (victimId !== false){
        var pl = theGame.players[victimId].tank;
        var hp = pl.life-=theTank.damage;
        if(hp<=0){
            theTank.destroyed++;
            pl.yourDeath++;
            pl.life=100;
            pl.sleep = true;
            //theGame.players[i].tank.
            this.io.to(theGame.roomId).emit('heKill', {id:victimId, x:pl.x, y:pl.y});
            this.io.to(theGame.roomId).emit('massage', {str: 'user kill', color: 'black'});
            setTimeout(function(victimId) {
                var p1 = theGame.players[victimId].tank;
                pl.sleep = false;
                for(var tankCreat = new Tank(rand(0, 620)+ 50, rand(0, 380)+ 50, rand(0, 360));sgame.collision(tankCreat, theGame, victimId);){
                    tankCreat = new Tank(rand(0, 620)+ 50, rand(0, 380)+ 50, rand(0, 360));
                }
                pl.x= tankCreat.x; pl.y= tankCreat.y; pl.r= tankCreat.r;
                p1.border.body= tankCreat.border.body;
                p1.border.gub= tankCreat.border.gub;
                this.io.to(theGame.roomId).emit('endSleep', {id: victimId, x: p1.x, y: p1.y, r: p1.r});
            }.bind(this, victimId), 3000);
            kill=true;

           // pl.x = 1000;
          //  pl.y = 1000;
        }

    }
    if(min.x!=5000 && min.y!=5000 && !kill)
        this.io.to(theGame.roomId).emit('shot', {id:socket,  x: min.x, y:min.y, lifeVictim:{id:victimId, hp:victimId===false?false:theGame.players[victimId].tank.life}});
    else console.log('mimo');
};

sgame.movePlayer = function(socket, keys){
    var theGame = this.games[this.id[socket.id]];
    var theTank = theGame.players[socket.id].tank;
    if(theTank.sleep) return;
    var x=theTank.x, y=theTank.y, r=theTank.r;
    //console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    //console.dir(theTank);
    if(keys.space && ((theTank.whenWasShot-(new Date()))<-theTank.timeShot)) {
        theTank.whenWasShot = new Date();
        sgame.shot(theTank, theGame, socket.id);
    }
    if(keys.left)
        theTank.r -= theTank.rotate_speed * Math.PI / 180;
    else if (keys.right)
        theTank.r += theTank.rotate_speed * Math.PI / 180;

    if(keys.up) {
        theTank.x += theTank.speed * Math.cos(theTank.r);
        theTank.y += theTank.speed * Math.sin(theTank.r);
        //console.log('keyup     ' + theTank.x + '     ' + theTank.y);
    } else if (keys.down) {
        theTank.x -= theTank.speed * Math.cos(theTank.r);
        theTank.y -= theTank.speed * Math.sin(theTank.r);
    }
    if(sgame.collision(theTank, theGame, socket.id)){
        theTank.r = r;
        theTank.x = x;
        theTank.y = y;
    }
    this.io.to(theGame.roomId).emit('movePlayer', {id: socket.id, x: theTank.x, y:theTank.y, r: theTank.r});
};