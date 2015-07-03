var socket,
    massageClient,
    keys,
    ctx,
    tank,
    bt = {},
    players = {},
    countTankClear = 0,
    myId,
    lifeLine = new LineLife();
var imBtoom = [];
jQuery.fn.center = function (){
    var h = (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop(),
        w = (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft();
    this.css("top", h + "px");
    this.css("left", w + "px");
};

function init(){
        $('#chat').hide();
        ctx = $('#gCan').get(0).getContext('2d');
        $('#gCan').attr('width', 720)
                  .attr('height', 480);
        $('#container').center();
        socket = io();
        massageClient = new Massage();
        keys = new Keys();
        setEventHandlers();
        tank = new Image();
        tank.src = "image/tank.png";
        for(var i = 0; i<8; i++){
            var zz = new Image();
            zz.src = "image/1 ("+(i+1)+").png";
            imBtoom.push(zz);
        }
}

function setEventHandlers(){
    $(window).bind('resize', onResize);
    $(window).bind('keydown', onKeydown);
    $(window).bind('keyup', onKeyup);
    socket.on('id',function(a){myId=a;});
    socket.on('connect', onSocketConnected);
    socket.on('endSleep', onEndSleep);
    socket.on('massage', onMassage);
    socket.on('newPlayer', onNewPlayer);
    socket.on('movePlayer', onMovePlayer);
    socket.on('shot', onShot);
    socket.on('deletePlayer', onDeletePlayer);
    socket.on('heKill', onHeKill);
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
    console.log('he kill');
    bt[data.id].visible = true;
    bt[data.id].x = data.x;
    bt[data.id].y = data.y;
    bt[data.id].timeStartBtoom = new Date();
    if(data.id==myId)lifeLine.hp = 0;
    countTankClear++;
    var theTank = players[data.id];
    theTank.sleep = true;
}
function onShot(data){
    bt[data.id].visible = true;
    bt[data.id].x = data.x;
    bt[data.id].y = data.y;
    bt[data.id].timeStartBtoom = new Date();
    if(data.lifeVictim.id!==false&&data.lifeVictim.id==myId) lifeLine.hp=data.lifeVictim.hp;
}
function onMovePlayer(data){
    var theTank = players[data.id];
    theTank.x = data.x;
    theTank.y = data.y;
    theTank.r = data.r;
}
function onDeletePlayer(id){
    console.log('delete player ' + id);
    players[id].dead = true;
}
function onNewPlayer(data){
    console.log("New player connected "+data.playerId);
    players[data.playerId] = new TankObj(data.tank);
    bt[data.playerId] = new Btoom();

}
function onResize(){
    $('#container').center();
}

function onKeydown(e) {
    keys.onKeyDown(e);
}

function onKeyup(e) {
    keys.onKeyUp(e);
}

function onSocketConnected(){
    console.log('Connected to socket server');
    socket.emit('newPlayer');
}

function onMassage(msg){
    console.log('massage: '+msg.str);
    massageClient.color = msg.color;
    massageClient.wrapText(ctx, msg.str);
    massageClient.wrapClearText(ctx);
    massageClient.drawMessage(ctx);
}

function animate(){
    update();
    draw();
    window.requestAnimationFrame(animate);
}

function update(){
    socket.emit("movePlayer", {up: keys.up, down: keys.down, left: keys.left, right: keys.right, space: keys.space});
    if(!keys.enterPressOne&&!/^\s*$/.test(keys.data)){
        socket.emit('massage', keys.data);
        keys.data='';
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

    if(countTankClear>1){
        ctx.clearRect(0, 0, 720, 480);
        countTankClear=0;
    }
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
        bt[player].btoom(ctx,imBtoom);
    }

    massageClient.drawMessage(ctx);
    lifeLine.drawHp();
    //players[myId].redrawLife(ctx);
}
