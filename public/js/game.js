var socket,
    massageClient,
    keys,
    info,
    ctx,
    tank,
    bt = {},
    players = {},
    countTankClear = 0,
    myId,
    lifeLine = new LineLife(),
    startAnimate =false;
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
       //console.log('next init start');
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
        setEventHandlers();
        tank = new Image();
        tank.src = "image/tank.png";
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
    socket.on('kill', onKill);
    socket.on('deletePlayer', onDeletePlayer);
    socket.on('heKill', onHeKill);
}
function onKill(data){
    //console.log('set date destId: '+data.destId+' dest: '+data.dest+' victimId: '+data.deathId+' death: '+data.death);
    info.change(data.destId, data.dest, data.deathId, data.death);
}
function onEndSleep(data){
    var theTank = players[data.id];
    theTank.sleep = false;
    theTank.x= data.x;
    theTank.y= data.y;
    theTank.r= data.r;
    theTank.oldx = data.x;
    theTank.oldy = data.y;
    theTank.oldr = data.r;
    if(data.id==myId)lifeLine.hp = 100;
}
function onHeKill(data){
    //console.log('he kill');
    bt[data.id].visible = true;
    bt[data.id].x = data.x;
    bt[data.id].y = data.y;
    bt[data.id].timeStartBtoom = new Date();
    bt[data.id].global = true;
    if(data.id==myId)lifeLine.hp = 0;
    countTankClear++;
    var theTank = players[data.id];
    theTank.sleep = true;
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
}
function onMovePlayer(data){
    var theTank = players[data.id];
    theTank.x = data.x;
    theTank.y = data.y;
    theTank.r = data.r;
}
function onDeletePlayer(id){
    //console.log('delete player ' + id);
    players[id].dead = true;
    info.del(id);
}
function onNewPlayer(data){

    //console.log("New player connected "+data.playerId);
    players[data.playerId] = new TankObj(data.tank, info.listColor[data.color]);
    bt[data.playerId] = new Btoom();
    info.add(data.playerId, data.name, data.tank.destroyed, data.tank.yourDeath, data.color);
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

function onMassage(msg){
    //console.log('massage: '+msg.str);
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
    socket.emit("movePlayer", {up: keys.up, down: keys.down, left: keys.left, right: keys.right, space: keys.space});
    if(!keys.enterPressOne&&!/^\s*$/.test(keys.data)){
        socket.emit('massage', keys.data);
        keys.data='';
    }

}

function draw(){

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
    }
    for(var player in bt){
        if(!bt.hasOwnProperty(player)) continue;
        var babach = bt[player];
        babach.btoom(ctx,babach.global?imGlobalBtoom:imBtoom);
    }

    massageClient.drawMessage(ctx);
    lifeLine.drawHp();

    if(keys.shift)info.draw(ctx);
}
