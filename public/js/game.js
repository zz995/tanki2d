var socket,
    massageClient,
    keys,
    info,
    ctx,
    tank,
    bt = {},
    st = {},
    players = {},
    countTankClear = 0,
    myId,
    lifeLine = new LineLife(),
    startAnimate =false,
    imDes,
    imShot;
var imBtoom = [], imGlobalBtoom=[];
jQuery.fn.center = function (){
    var h = (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop(),
        w = (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft();
    this.css("top", h + "px");
    this.css("left", w + "px");
};
function init(){
    $('#container').hide();
    $('#enter').center();
    socket = io();
    setEventHandlers();
    $(".send").click(function () {
        var str = $('.login').val();
        if(/^[a-zA-Z0-9]{3,10}$/.test(str)&&str!==undefined)
            socket.emit('newPlayer', str);
        else alert('Invalid login');
    });
}
function nextInit(){
        console.log('next init start');
    document.unload=function() {
        alert( "Handler for .blur() called." );
    };
        $('#container').show();
        $('#enter').hide();
        $('#chat').hide();
        ctx = $('#gCan').get(0).getContext('2d');
        $('#gCan').attr('width', 720)
                  .attr('height', 480);
        $('#chat').hide();
        $('#container').center();
        massageClient = new Massage();
        keys = new Keys();
        info = new Info();
        info.timeFPS = new Date().getTime();
        imDes = new Image();
        imDes.src = "image/destroyed.png";
        info.setPersonalInfo(0, ctx);
        setEventHandlers();
        tank = new Image();
        tank.src = "image/tank.png";
        imShot = new Image();
        imShot.src = "image/shot.png";
        for(var i = 0; i<8; i++){
            var zz = new Image();
            zz.src = "image/1 ("+(i+1)+").png";
            var zg = new Image();
            zg.src = "image/2 ("+(i+1)+").png";
            imBtoom.push(zz);
            imGlobalBtoom.push(zg);
        }
    setNextEvenHandlers();
    startAnimate = true;
    info.timeSend = new Date().getTime();
    setInterval(function(){
        info.timeSend = new Date().getTime();
        socket.emit('checkPin');
    }, 2000);
    setInterval(function(){info.fps = (1/info.deltaTime*1000).toFixed(0)},2000);
}
function setEventHandlers(){
    $(window).bind('resize', onResize);
    socket.on('loginTrue', nextInit);
}
function setNextEvenHandlers(){
    $(window).bind('keydown', onKeydown);
    $(window).bind('keyup', onKeyup);
    socket.on('id',function(a){myId=a;});
    socket.on('endSleep', onEndSleep);
    socket.on('massage', onMassage);
    socket.on('newPlayer', onNewPlayer);
    socket.on('movePlayer', onMovePlayer);
    socket.on('shot', onShot);
 //   socket.on('kill', onKill);
    socket.on('deletePlayer', onDeletePlayer);
//    socket.on('heKill', onHeKill);
    socket.on('checkPin', onCheckPin);
}
function onCheckPin(){
    info.ping = (new Date().getTime())-info.timeSend;
    //console.log('afdgadf'+myId);
}
//function onAddDate(data){
  //  console.log('get statistic');
 //   info.add(data.id, data.name, 0, 0, data.color);
//}

function onEndSleep(data){
    var theTank = players[data.id];
    theTank.sleep = false;
    theTank.x= data.x;
    theTank.y= data.y;
    theTank.r= data.r;
    theTank.oldx = data.x;
    theTank.oldy = data.y;
    theTank.oldr = data.r;
    theTank.endX = data.x;
    theTank.endY = data.y;
    theTank.endR = data.r;
    if(data.id==myId)lifeLine.hp = 100;
}
function onHeKill(data){
    console.log('he kill');
    bt[data.id].visible = true;
    bt[data.id].x = data.x;
    bt[data.id].y = data.y;
    bt[data.id].timeStartBtoom = new Date();
    bt[data.id].global = true;
    if(data.id==myId)lifeLine.hp = 0;
    countTankClear++;
    var theTank = players[data.id];
    theTank.sleep = true;
   // if(data.id == myId) {
    //    var tank = players[data.id];
    //    tank.wasTimeShot = bt[data.id].timeStartBtoom;
    //    tank.wasShot = true;
   // }
}
function onShot(data){
    var date = new Date();
    if(data.hit) {
        //console.log('' + data.lifeVictim.id + ' shot');
        bt[data.id].visible = true;
        bt[data.id].x = data.x;
        bt[data.id].y = data.y;
        bt[data.id].timeStartBtoom = date;
        if (data.lifeVictim.id !== false && data.lifeVictim.id == myId) lifeLine.hp = data.lifeVictim.hp;
    }
    if(data.id == myId) {
        var tank = players[data.id];
        tank.wasTimeShot = date;
        tank.wasShot = true;
    }

    if(data.kill){
        info.change(data.id, data.dest, data.lifeVictim.id, data.death);
        if(data.id == myId)
            info.setPersonalInfo(data.dest, ctx);
        var vcId = data.lifeVictim.id;
        bt[vcId].visible = true;
        bt[vcId].x = data.vicX;
        bt[vcId].y = data.vicY;
        bt[vcId].timeStartBtoom = new Date();
        bt[vcId].global = true;
        if(vcId==myId)lifeLine.hp = 0;
        countTankClear++;
        var theTank = players[vcId];
        theTank.sleep = true;
    }
    if(Math.sqrt((data.x-data.gunX)*(data.x-data.gunX)+(data.y-data.gunY)*(data.y-data.gunY))>=imShot.height) {
        st[data.id].visible = true;
        st[data.id].x = data.gunX;
        st[data.id].y = data.gunY;
        st[data.id].r = data.gunR;
    }
}
//function onKill(data){
    //console.log('set date destId: '+data.destId+' dest: '+data.dest+' victimId: '+data.deathId+' death: '+data.death);
  //  info.change(data.destId, data.dest, data.deathId, data.death);

  //  if(data.destId == myId)
   //     info.setPersonalInfo(data.dest, ctx);
//}
function onMovePlayer(data){
    var theTank = players[data.id];
    //console.log('time update pos: '+((new Date().getTime())-theTank.timeUpdatePos));
    //theTank.timeUpdatePos = new Date().getTime();

    theTank.endX = data.x;
    theTank.endY = data.y;
    theTank.endR = data.r;
    theTank.dt = data.dt;
 /*
    theTank.x = data.x;
    theTank.y = data.y;
    theTank.r = data.r;
*/
    theTank.timeUpdatePos = (new Date().getTime())-theTank.startTime;
    theTank.startTime = new Date().getTime();
    theTank.t = 0;
}

function onDeletePlayer(id){
    console.log('delete player ' + id);
    players[id].dead = true;
    info.del(id);
}
function onNewPlayer(data){
    //console.log("New player connected "+data.game.playerId);
   // players[data.game.playerId] = new TankObj(data.game.tank);
    //bt[data.game.playerId] = new Btoom();
    //info.add(data.game.playerId, data.name, 0, 0, data.color);

    console.log("New player connected "+data.playerId);
    players[data.playerId] = new TankObj(data.tank, info.listColor[data.color]);

    players[data.playerId].timeUpdatePos = new Date().getTime();

    bt[data.playerId] = new Btoom();
    st[data.playerId] = new Shot();

    info.add(data.playerId, data.name, data.tank.destroyed, data.tank.yourDeath, data.color);

    if(data.playerId==myId) info.color = info.listColor[data.color];

    this.life = 100;
}
function onResize(){
    $('#container').center();
    $('#enter').center();
}
function onKeydown(e) {
    //console.log('Press key');
    keys.onKeyDown(e);
}
function onKeyup(e) {
    keys.onKeyUp(e);
}
//function onSocketConnected(){
  //  console.log('Connected to socket server');
  //  socket.emit('newPlayer');
//}
function onMassage(msg){
    console.log('massage: '+msg.str);
    massageClient.color = info.listColor[msg.color];
    massageClient.wrapText(ctx, msg.str);
    massageClient.wrapClearText(ctx);
    massageClient.drawMessage(ctx);
}
function animate(){
    if(startAnimate){
        update();
        draw();
    }
    window.requestAnimationFrame(animate);
}

function update(){
    socket.emit("movePlayer", {up: keys.up, down: keys.down, left: keys.left, right: keys.right, space: keys.space, delTime:info.deltaTime});
    if(!keys.enterPressOne&&!/^\s*$/.test(keys.data)){
        socket.emit('massage', keys.data);
        keys.data='';
    }


    for(var i in players) {
        if (!players.hasOwnProperty(i)) continue;
        var theTank = players[i];
        //var nowTime = (new Date().getTime())- theTank.startTime;*nowTime info.ping+200
        console.log('t: '+theTank.t);
        if(theTank.t<=1&&theTank.t>=0){
            //
            theTank.x += (theTank.endX-theTank.x)*theTank.t;
            //console.log('x: '+theTank.x);
            theTank.y += (theTank.endY-theTank.y)*theTank.t;
            theTank.r += (theTank.endR-theTank.r)*theTank.t;
        }
        theTank.t += (1/(theTank.timeUpdatePos/info.deltaTime));
    }

    /*
     var a = players[myId].sleep;
     var b = players[myId].dateStartSleep;
     var c = new Date().getTime();
     var d = players[myId].timeSleep;
     var e = b-c;
     console.log('a: '+a+' b: '+b+' c: '+c+' d: '+d+' e: '+e);
     console.log(players[myId].dateStartSleep-(new Date().getTime()));*/

}

function draw(){

   // for(var i=0; i<10000000; i++)
     //           var a =10;
    info.deltaTime = (new Date().getTime())- info.timeFPS;
    info.timeFPS = new Date().getTime();

    info.clearFP(ctx);
    info.clearPersonaInfo(ctx);
    if(countTankClear>1){
        ctx.clearRect(0, 0, 720, 480);
        countTankClear=0;
    }
    if(info.needClear) info.clear(ctx);
    massageClient.wrapClearText(ctx);
    lifeLine.clear();
    for(var player in players){
        if(!players.hasOwnProperty(player)) continue;
        players[player].clear(ctx);
        players[player].redraw(ctx);
        if (players[player].dead) delete players[player];
        /*
        if(players[player].sleep&&!players[player].wake){
            if((players[player].dateStartSleep-(new Date().getTime()))<=(-players[player].timeSleep)){
                socket.emit('endSleep');
                players[player].wake = true;

            }
        }
        */
    }
    for(var player in bt){
        if(!bt.hasOwnProperty(player)) continue;
        var babach = bt[player];
        babach.btoom(ctx,babach.global?imGlobalBtoom:imBtoom);
    }
    for(var i in st){
        if(!st.hasOwnProperty(i)) continue;
        st[i].clear(ctx, imShot);
        st[i].shot(ctx, imShot);
    }

    massageClient.drawMessage(ctx);
    lifeLine.drawHp();

    if(keys.shift)info.draw(ctx);


    info.drawPersonaInfo(ctx, imDes);
    info.fpsANDping(ctx);
    //players[myId].redrawLife(ctx);
}
