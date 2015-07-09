var game = {
        countTankClear: 0,
        startAnimate: false,
        id: 0
    },
    images = {
        tank: new Image(),
        imDes: new Image(),
        imShot: new Image(),
        imBtoom: [],
        imGlobalBtoom: []
    },
    players = {},
    ctx, keys, info,
    lifeLine,
    massageClient,
    socket = io();

jQuery.fn.center = function (){
    var h = (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop(),
        w = (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft();
    this.css("top", h + "px");
    this.css("left", w + "px");
};

function init(){
    $('#container').hide();
    $('#enter').center();
    setEventHandlers();
    $(".send").click(function () {
        var str = $('.login').val();
        if(/^[a-zA-Z0-9]{3,10}$/.test(str)&&str!==undefined)
            socket.emit('newPlayer', str);
        else alert('Not right login');
    });
}
function nextInit(){
        //console.log('next init start');
        $('#container').show();
        $('#enter').hide();
        $('#chat').hide();
        ctx = $('#gCan').get(0).getContext('2d');
        $('#gCan').attr('width', 720)
                  .attr('height', 480);
        $('#chat').hide();
        $('#container').center();
        massageClient = new Massage();
        lifeLine = new LineLife(),
        keys = new Keys();
        info = new Info();
        info.timeFPS = new Date().getTime();
        images.imDes.src = "image/destroyed.png";
        info.setPersonalInfo(0, ctx);
        setEventHandlers();
        images.tank.src = "image/tank.png";
        images.imShot.src = "image/shot.png";
        for(var i = 0; i<8; i++){
            var zz = new Image();
            zz.src = "image/1 ("+(i+1)+").png";
            var zg = new Image();
            zg.src = "image/2 ("+(i+1)+").png";
            images.imBtoom.push(zz);
            images.imGlobalBtoom.push(zg);
        }
    setNextEvenHandlers();
    game.startAnimate = true;
    info.timeSend = new Date().getTime();
    setInterval(function(){
        info.timeSend = new Date().getTime();
        socket.emit('checkPing');
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
    socket.on('id',function(a){game.id=a;});
    socket.on('endSleep', onEndSleep);
    socket.on('massage', onMassage);
    socket.on('newPlayer', onNewPlayer);
    socket.on('movePlayer', onMovePlayer);
    socket.on('shot', onShot);
    socket.on('deletePlayer', onDeletePlayer);
    socket.on('checkPing', onCheckPing);
}

function onCheckPing(){
    info.ping = (new Date().getTime())-info.timeSend;
}

function onEndSleep(data){
    var theTank = players[data.id].tank;
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
    if(data.id==game.id)lifeLine.hp = 100;
}

function onShot(data){
    var date = new Date();
    if(data.hit) {
        var vzruv = players[data.id].bt;
        vzruv.visible = true;
        vzruv.x = data.x;
        vzruv.y = data.y;
        vzruv.timeStartBtoom = date;
        if (data.lifeVictim.id !== false && data.lifeVictim.id == game.id) lifeLine.hp = data.lifeVictim.hp;
    }
    if(data.id == game.id) {
        var tank = players[data.id].tank;
        tank.wasTimeShot = date;
        tank.wasShot = true;
    }
    if(data.kill){
        var vzruv = players[data.id].bt;
        info.change(data.id, data.dest, data.lifeVictim.id, data.death);
        if(data.id == game.id)
            info.setPersonalInfo(data.dest, ctx);
        vzruv.visible = true;
        vzruv.x = data.vicX;
        vzruv.y = data.vicY;
        vzruv.timeStartBtoom = new Date();
        vzruv.global = true;
        if(data.lifeVictim.id==game.id)lifeLine.hp = 0;
        game.countTankClear++;
        players[data.lifeVictim.id].tank.sleep = true;
    }
    if(Math.sqrt((data.x-data.gunX)*(data.x-data.gunX)+(data.y-data.gunY)*(data.y-data.gunY))>=images.imShot.height/2) {
        var shot = players[data.id].st;
        shot.visible = true;
        shot.x = data.gunX;
        shot.y = data.gunY;
        shot.r = data.gunR;
    }
}

function onMovePlayer(data){
    for(var i in data) {
        if (!data.hasOwnProperty(i)) continue;
        var theTank = players[i].tank;
        var dataTank = data[i];
        theTank.endX = dataTank.x;
        theTank.endY = dataTank.y;
        theTank.endR = dataTank.r;
        theTank.timeUpdatePos = (new Date().getTime())-theTank.startTime;
        theTank.startTime = new Date().getTime();
        theTank.t = 0;
    }
}
function onDeletePlayer(id){
    //console.log('delete player ' + id);
    players[id].tank.dead = true;
    info.del(id);
}
function onNewPlayer(data){
    //console.log("New player connected "+data.playerId);
    players[data.playerId] = {
        tank: new TankObj(data.tank, info.listColor[data.color]),
        bt: new Btoom(),
        st: new Shot()
    };
    players[data.playerId].tank.timeUpdatePos = new Date().getTime();
    info.add(data.playerId, data.name, data.tank.destroyed, data.tank.yourDeath, data.color);
    if(data.playerId==game.id) info.color = info.listColor[data.color];
    this.life = 100;
}
function onResize(){
    $('#container').center();
    $('#enter').center();
}
function onKeydown(e) {
    keys.onKeyDown(e);
}
function onKeyup(e) {
    keys.onKeyUp(e);
}
function onMassage(msg){
    //console.log('massage: '+msg.str);
    massageClient.color = info.listColor[msg.color];
    massageClient.wrapText(ctx, msg.str);
    massageClient.wrapClearText(ctx);
    massageClient.drawMessage(ctx);
}
function animate(){
    if(game.startAnimate){
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
        var theTank = players[i].tank;
        //console.log('t: '+theTank.t);
        if(theTank.t<=1&&theTank.t>=0){
            theTank.x += (theTank.endX-theTank.x)*theTank.t;
            theTank.y += (theTank.endY-theTank.y)*theTank.t;
            theTank.r += (theTank.endR-theTank.r)*theTank.t;
        }
        theTank.t += (1/(theTank.timeUpdatePos/info.deltaTime));
    }
}

function draw(){
    info.deltaTime = (new Date().getTime())- info.timeFPS;
    info.timeFPS = new Date().getTime();
    info.clearFP(ctx);
    info.clearPersonaInfo(ctx);
    if(game.countTankClear>1){
        ctx.clearRect(0, 0, 720, 480);
        game.countTankClear=0;
    }
    if(info.needClear) info.clear(ctx);
    massageClient.wrapClearText(ctx);
    lifeLine.clear();
    for(var player in players){
        if(!players.hasOwnProperty(player)) continue;
        players[player].tank.clear(ctx);
        players[player].tank.redraw(ctx, images.tank);
        if (players[player].tank.dead)  players[player].st.needClear = true;
    }
    for(var player in players){
        if(!players.hasOwnProperty(player)) continue;
        players[player].st.clear(ctx, images.imShot);
        players[player].st.shot(ctx, images.imShot);
    }
    for(var player in players){
        if(!players.hasOwnProperty(player)) continue;
        players[player].bt.btoom(ctx, players[player].bt.global?images.imGlobalBtoom:images.imBtoom);
    }
    for(var player in players){
        if(!players.hasOwnProperty(player)) continue;
        if (players[player].tank.dead) delete players[player];
    }
    massageClient.drawMessage(ctx);
    lifeLine.drawHp();
    if(keys.shift)info.draw(ctx);
    info.drawPersonaInfo(ctx, images.imDes);
    info.fpsANDping(ctx);
}