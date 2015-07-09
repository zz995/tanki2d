function TankObj(data, color){
    this.dead = false;
    this.width = data.width;
    this.height = data.height;
    this.margin = data.margin;
    this.gun_height = data.gun_height;
    this.gub_width = data.gub_width;
    this.x = data.x;
    this.y = data.y;
    this.r = data.r;
    this.oldx = data.x;
    this.oldy = data.y;
    this.oldr = data.r;
    this.speed = data.speed;
    this.rotate_speed = data.rotate_speed;
    this.sleep = false;
    this.sleepClear = false;
    this.color = color;
    this.energy = 10;
    this.timeShot = data.timeShot;
    this.wasTimeShot = 0;
    this.wasShot = false;
    this.timeUpdatePos = 0;
    this.endX = data.x;
    this.endY = data.y;
    this.endR = data.r;
    this.t = 0;
    this.startTime = 0;
}
TankObj.prototype.clear = function (ctx){
    if(!(this.sleep&&this.sleepClear)) {
        if(this.sleep) this.sleepClear = true;
        else this.sleepClear = false;
        ctx.save();
        ctx.translate(this.oldx, this.oldy);
        ctx.rotate(this.oldr);
        ctx.clearRect(-(this.height - this.gun_height) / 2 - this.margin,
            -this.width / 2 - this.margin,
            this.height - this.gun_height + 2 * this.margin,
            this.width + 2 * this.margin);
        ctx.clearRect((this.height - this.gun_height) / 2,
            -this.gub_width / 2 - this.margin,
            this.gun_height + 2 * this.margin,
            this.gub_width + 2 * this.margin);
        this.oldx = this.x;
        this.oldy = this.y;
        this.oldr = this.r;
        ctx.restore();
    }
};
TankObj.prototype.redraw = function(ctx, tank) {
    ctx.save();
    ctx.translate(this.x, this.y);
    if(!this.dead && !this.sleep) {
        ctx.rotate(this.r);
        ctx.drawImage(tank, -(this.height - this.gun_height) / 2 /*+ x*/, -this.width / 2);
        ctx.fillStyle = this.color;
        if(this.wasShot){
            var d = (new Date())-this.wasTimeShot;
            var x = ((this.energy/2)/this.timeShot)*d;
            if(d<this.timeShot)
                ctx.fillRect(-(this.height - this.gun_height) / 2+5, -x, 5, 2*x);
            else this.wasShot=false;
        }else
            ctx.fillRect(-(this.height - this.gun_height) / 2+5, -this.width / 2+this.energy/2, 5, this.energy);
    }
    ctx.restore();
};

function Shot(){
    this.visible = false;
    this.x = 0;
    this.y = 0;
    this.r = 0;
    this.timeStartShot=0;
    this.needClear = false;
}
Shot.prototype.shot = function(ctx, im){
    if(this.visible) {
        //console.log('shot draw');
        this.visible = false;
        ctx.save();
        ctx.translate(this.x, this.y);//
        ctx.rotate(this.r);
        ctx.drawImage(im, 0, -(im.height/2));
        ctx.restore();
        setTimeout(function(){this.needClear=true;}.bind(this), 70);
    }
};
Shot.prototype.clear = function(ctx, im){
    if(this.needClear){
        this.needClear = false;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.r);
        ctx.clearRect(0, -(im.height/2), im.width, im.height);
        ctx.restore();
    }
};

function Btoom(){
    this.visible = false; //adb
    this.timeStartBtoom = new Date(); //dd
    this.width = 50;
    this.height = 50;
    this.x = 0;
    this.y = 0;
    this.global = false;
}
Btoom.prototype.btoom = function(ctx, im){
    if(this.visible) {
        var d = -Math.round((this.timeStartBtoom - (new Date())) / 30);
        if (d < 8) {
            this.width = im[d].width;
            this.height = im[d].height;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.drawImage(im[d], -this.height / 2, -this.width / 2);
            ctx.restore();
            this.needClear = false;
        } else {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.clearRect(-this.width / 2 - 10, -this.height / 2 - 10, this.width + 20, this.height + 20);
            ctx.restore();
            this.visible = false;
            this.global = false;
        }
    }
};

function LineLife(){
    this.hp = 100;
    this.x = 635;
    this.y = 10;
    this.w = 70;
    this.h = 15;
}
LineLife.prototype.drawHp = function(){
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(this.x+(100-this.hp)/100*this.w, this.y, this.w-(100-this.hp)/100*this.w, this.h);
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.lineWidth=2;
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.w,this.y);
    ctx.lineTo(this.x + this.w,this.y+this.h);
    ctx.lineTo(this.x,this.y+this.h);
    ctx.lineTo(this.x,this.y);
    ctx.stroke();
    ctx.restore();
};

LineLife.prototype.clear = function(){
    ctx.clearRect(this.x-1, this.y-1, this.w+2, this.h+2);
};
