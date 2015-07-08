function Info(){
    this.yourDeath = 0;
    this.destroyed = 0;
    this.x = 360;
    this.y = 240;
    this.w = 300;
    this.h = 0;
    this.lineH = 19;
    this.title = 'Information';
    this.listColor = ['#8470FF', '#CDD402', 'green', 'red'];
    this.data = [];
    this.dataForChange = {};
    this.needClear = false;
    this.forPerInfFontSize = 15;
    this.stPerWhith = 0;
    this.imageHeight = 21;
    this.imageWidth = 28;
    this.color = 0;
    this.oldPerWhith = 0;
    this.timeSend = 0;
    this.ping = 0;
    this.fps = 0;
    this.timeFPS = 0;
    this.deltaTime = 0;
}
Info.prototype.add = function(id, namePlayer, dest, dead, numberColor){
    if(this.dataForChange[id]!=undefined)return;
    this.data.push({
        name: namePlayer,
        destroyed: dest,
        death: dead,
        exist: true,
        color: numberColor
    });
    this.dataForChange[id]=this.data[this.data.length-1];
    this.sort();
};
Info.prototype.change = function(idDest, dest, idDead, dead){
    this.dataForChange[idDest].destroyed = dest;
    this.dataForChange[idDead].death = dead;
    this.sort();
};
Info.prototype.sort = function(){
    for(var i= 0; i<this.data.length-1; i++)
        for(var j= 0; j<this.data.length-i-1; j++)
            if(this.data[j].destroyed < this.data[j+1].destroyed){
                var k = this.data[j];
                this.data[j] = this.data[j+1];
                this.data[j+1] = k;
            } else {
                if((this.data[j].destroyed == this.data[j+1].destroyed)
                    &&(this.data[j].death > this.data[j+1].death)){
                    var k = this.data[j];
                    this.data[j] = this.data[j+1];
                    this.data[j+1] = k;
                }
            }
};
Info.prototype.del = function(id){
    this.dataForChange[id].exist=false;
    for(var i= 0, j= 0; i<this.data.length; i++){
        if(this.data[i].exist) this.data[j++]=this.data[i];
    }
    this.data.length = j;
    delete this.dataForChange[id];
};
Info.prototype.clear = function(ctx){
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.clearRect(-this.w/2-1,-this.h/2-1, this.w+2, this.h+2);
    ctx.restore();
    this.needClear = false;
};
Info.prototype.draw = function(ctx){
    this.needClear = true;
    this.h= (this.data.length+2)*this.lineH;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#166634";
    ctx.fillRect(-this.w/2,-this.h/2, this.w, this.h);
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#000000";
    ctx.fillRect(-this.w/2,-this.h/2, this.w, this.lineH);

    ctx.beginPath();
    ctx.globalAlpha = 0.3;
    ctx.lineWidth=2;
    ctx.moveTo(-this.w/2+20, -this.h/2+this.lineH);
    ctx.lineTo(-this.w/2+20, this.h/2);
    ctx.moveTo(-this.w/2+190, -this.h/2+this.lineH);
    ctx.lineTo(-this.w/2+190, this.h/2);
    ctx.moveTo(-this.w/2+245, -this.h/2+this.lineH);
    ctx.lineTo(-this.w/2+245, this.h/2);
    ctx.moveTo(-this.w/2, -this.h/2+2*this.lineH);
    ctx.lineTo(this.w/2, -this.h/2+2*this.lineH);
    ctx.stroke();

    for(var i= 0, l = this.data.length/2>>0; i/2<l; i+=2){
        ctx.fillRect(-this.w/2,-this.h/2+(3+i)*this.lineH, this.w, this.lineH);
    }

    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "#000000";
    ctx.fillRect(-this.w/2,-this.h/2, this.w, 2*this.lineH);

    ctx.globalAlpha = 1;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(this.title, -ctx.measureText(this.title).width/2, 15-this.h/2);

    ctx.fillText('N', -this.w/2+2,15-this.h/2+this.lineH);
    ctx.fillText('Name players', -this.w/2+5+20,15-this.h/2+this.lineH);
    ctx.fillText('Killed', -this.w/2+5+190,15-this.h/2+this.lineH);
    ctx.fillText('Death', -this.w/2+5+245,15-this.h/2+this.lineH);

    for(var i=1; i<=this.data.length;++i){
        ctx.shadowColor = "#000000";
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.shadowBlur = 1;
        ctx.fillStyle = this.listColor[this.data[i-1].color];
        ctx.fillText(i.toString(), -this.w/2+2, 15-this.h/2+this.lineH*(i+1));
        ctx.fillText(this.data[i-1].name, -this.w/2+5+20, 15-this.h/2+this.lineH*(i+1));
        ctx.fillText(this.data[i-1].destroyed, -this.w/2+5+190, 15-this.h/2+this.lineH*(i+1));
        ctx.fillText(this.data[i-1].death, -this.w/2+5+245, 15-this.h/2+this.lineH*(i+1));

    }
    ctx.restore();
};
Info.prototype.setPersonalInfo = function(dest, ctx){
    this.destroyed = dest.toString();
    ctx.save();
    ctx.font = 'bold '+this.forPerInfFontSize.toString()+'pt Calibri';
    this.stPerWhith = ctx.measureText(dest).width;
    console.log('width text: '+this.stPerWhith);
    ctx.restore();
};

Info.prototype.drawPersonaInfo = function(ctx, im){
    this.oldPerWhith = this.stPerWhith;
    ctx.save();
    ctx.font = 'bold '+this.forPerInfFontSize.toString()+'pt Calibri';
    ctx.shadowColor = "#000000";
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.shadowBlur = 1;
    ctx.fillStyle = this.color;
    ctx.fillText(this.destroyed, 720-5-this.stPerWhith, 480-5);
    ctx.restore();
    ctx.drawImage(im, 720-this.stPerWhith-this.imageWidth-10, 480-this.imageHeight);
};

Info.prototype.clearPersonaInfo = function(ctx) {
    ctx.clearRect(720-this.oldPerWhith-this.imageWidth-10-1, 480-this.imageHeight-1, this.oldPerWhith+this.imageWidth+10+2, this.imageHeight+2);
};

Info.prototype.fpsANDping = function(ctx){
    ctx.save();
    ctx.font = 'bold 12pt Calibri';
    ctx.shadowColor = "#000000";
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.shadowBlur = 1;
    ctx.fillStyle = this.color;
    ctx.fillText('ping: '+this.ping, 5, 15);
    ctx.fillText('fps: '+this.fps, 5, 30);
    ctx.restore();

};

Info.prototype.clearFP = function(ctx){
    ctx.clearRect(0,0,100,46);
};