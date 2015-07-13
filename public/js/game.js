var game = {
        startAnimate: false,
        id: 0
    },
    images = {
        tank: new Image(),
        gun: new Image(),
        imDes: new Image(),
        imShot: new Image(),
        imBtoom: [],
        imGlobalBtoom: []
    },
    players = {},
    ctx, keys, info,
    lifeLine,
    messageClient,
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
        messageClient = new Message();
        lifeLine = new LineLife();
        keys = new Keys();
        info = new Info();
        info.timeFPS = new Date().getTime();
        images.imDes.src = "image/destroyed.png";
        info.setPersonalInfo(0, ctx);
        setEventHandlers();
        images.tank.src = "image/tank.png";
        images.gun.src = "image/gun.png";
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
    socket.on('newPlayer', onNewPlayer);
    socket.on('dataForUser', onDataForUser);
    socket.on('shot', onShot);
    socket.on('checkPing', onCheckPing);
}

function onCheckPing(){
    info.ping = (new Date().getTime())-info.timeSend;
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
        //game.countTankClear++;
        players[data.lifeVictim.id].tank.sleep = true;
        message({str: 'User killed', color: info.dataForChange[data.id].color});
    }
    if(Math.sqrt((data.x-data.gunX)*(data.x-data.gunX)+(data.y-data.gunY)*(data.y-data.gunY))>=images.imShot.height/2) {
        var shot = players[data.id].st;
        shot.visible = true;
        shot.x = data.gunX;
        shot.y = data.gunY;
        shot.r = data.tankR+data.gunR;
        game.countShotClear++;
    }
}

function onDataForUser(data){

    for(var i in data) {
        if (!data.hasOwnProperty(i)||i=='msg'||i=='del'||i=='wake'||i=='date') continue;
        var theTank = players[i].tank;
        if(data.date > theTank.timeUpdate) theTank.timeUpdate = data.date;
        else {
            console.log('data is old');
            continue;
        }
        var dataTank = data[i];
        theTank.endX = dataTank.x;
        theTank.endY = dataTank.y;
        theTank.endR = dataTank.r;
        theTank.endGun_r = dataTank.r_gun;
        theTank.timeUpdatePos = (new Date().getTime())-theTank.startTime;
        theTank.startTime = new Date().getTime();
        theTank.t = 0;
    }
    data.msg.forEach(function(item){message(item);});
    data.del.forEach(function(item){deletePlayer(item);});
    data.wake.forEach(function(item){
        var theTank = players[item].tank;
        theTank.sleep = false;
        theTank.x = data[item].x;
        theTank.y = data[item].y;
        theTank.r = data[item].r;
        theTank.oldr_gun = data[item].r_gun;
        if(item==game.id)lifeLine.hp = 100;
    });
}

function deletePlayer(id){
    //console.log('delete player ' + id);
    players[id].tank.dead = true;
    message({str: 'User disconnected', color: info.dataForChange[id].color});
    info.del(id);
}

function onNewPlayer(data){
    //console.log("New player connected "+data.playerId);
    for(var i in data.game) {
        if (!data.game.hasOwnProperty(i)) continue;
        players[i] = {
            tank: new TankObj(data.game[i].tank, info.listColor[data.game[i].color]),
            bt: new Btoom(),
            st: new Shot()
        };
        players[i].tank.timeUpdatePos = new Date().getTime();
        info.add(i, data.game[i].name, data.game[i].tank.destroyed, data.game[i].tank.yourDeath, data.game[i].color);
        message({str: 'User connected', color: data.game[i].color});
    }
    if(data.id != undefined) {
        game.id = data.id;
        info.color = info.listColor[data.game[data.id].color];
        message({str: 'You online', color: data.game[data.id].color});
    }
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

function message(msg){
    //console.log('message: '+msg.str);
    messageClient.color = info.listColor[msg.color];
    messageClient.wrapText(ctx, msg.str);
    messageClient.wrapClearText(ctx);
    messageClient.drawMessage(ctx);
}

function animate(){
    if(game.startAnimate){
        update();
        draw();
    }
    window.requestAnimationFrame(animate);
}

function update(){
    var checkEnterData = !keys.enterPressOne&&!/^\s*$/.test(keys.data);
    socket.emit("dataUser", {
        up: keys.up, down: keys.down,
        left: keys.left, right: keys.right,
        gunLeft: keys.gunLeft, gunRight: keys.gunRight,
        space: keys.space, delTime:info.deltaTime,
        msg: checkEnterData?keys.data:false
    });
    if(checkEnterData) keys.data='';

    for(var i in players) {
        if (!players.hasOwnProperty(i)) continue;
        var theTank = players[i].tank;
        //console.log('t: '+theTank.t);
        if(theTank.t<=1&&theTank.t>=0){
            theTank.x += (theTank.endX-theTank.x)*theTank.t;
            theTank.y += (theTank.endY-theTank.y)*theTank.t;
            theTank.r += (theTank.endR-theTank.r)*theTank.t;
            theTank.gun_r += (theTank.endGun_r-theTank.gun_r)*theTank.t;
        }
        theTank.t += (1/(theTank.timeUpdatePos/info.deltaTime));
    }
}

function draw(){
    info.deltaTime = (new Date().getTime())- info.timeFPS;
    info.timeFPS = new Date().getTime();
    info.clearFP(ctx);
    info.clearPersonaInfo(ctx);
    if(info.needClear) info.clear(ctx);
    messageClient.wrapClearText(ctx);
    lifeLine.clear();
    for(var player in players){
        if(!players.hasOwnProperty(player)) continue;
        players[player].tank.clear(ctx);
        players[player].tank.redraw(ctx, images.tank, images.gun);
        if (players[player].tank.dead)  players[player].st.needClear = true;
    }
    for(var player in players){
        if(!players.hasOwnProperty(player)) continue;
        players[player].st.clear(ctx, images.imShot);
        if (players[player].tank.dead){
            delete players[player];
            continue;
        }
        players[player].st.shot(ctx, images.imShot);
    }
    for(var player in players){
        if(!players.hasOwnProperty(player)) continue;
        players[player].bt.btoom(ctx, players[player].bt.global?images.imGlobalBtoom:images.imBtoom);
    }
    messageClient.drawMessage(ctx);
    lifeLine.drawHp();
    if(keys.shift)info.draw(ctx);
    info.drawPersonaInfo(ctx, images.imDes);
    info.fpsANDping(ctx);
}