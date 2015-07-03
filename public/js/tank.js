function TankObj(data){
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
TankObj.prototype.redraw = function(ctx/*x, r*/) { // х на скльок сдвинуть танк, r уголо поворота танка
    ctx.save();
    ctx.translate(this.x, this.y);
    //ctx.save();
    //ctx.rotate(this.r);
    //ctx.clearRect(-(this.height - this.gun_height) / 2 - this.margin,
     //   -this.width / 2 - this.margin,
     //   this.height - this.gun_height + 2*this.margin,
     //   this.width + 2*this.margin);
    //ctx.clearRect((this.height - this.gun_height)/2,
    //    -this.gub_width / 2 - this.margin,
   //     this.gun_height+2*this.margin,
    //    this.gub_width+2*this.margin);
    //ctx.restore();
    //if(arguments.length>1)
       // this.r += r * Math.PI / 180;
    if(!this.dead && !this.sleep) {
        ctx.rotate(this.r);
        ctx.drawImage(tank, -(this.height - this.gun_height) / 2 /*+ x*/, -this.width / 2);
    }
    ctx.restore();
   // if(arguments.length) {
        //this.x += x * Math.cos(this.r);
        //this.y += x * Math.sin(this.r);
    //}
    //this.plus_x = 0;
    //this.plus_rotate =0;
};
/*
TankObj.prototype.update = function(k){
    if(k.up)
        this.plus_x = this.speed;
    else if (k.down)
        this.plus_x = -this.speed;
    if(k.left)
        this.plus_rotate = -this.rotate_speed;
    else if (k.right)
        this.plus_rotate = this.rotate_speed;
};*/


function Btoom(){
    this.visible = false; //adb
    this.timeStartBtoom = new Date(); //dd
    this.width = 0;
    this.height = 0;
    this.x = 0;
    this.y = 0;
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
