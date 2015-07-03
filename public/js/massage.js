function Massage(marginTop, marginLeft, maxWidth, lineHeight, count, color){
    this.visible = false;
    this.glabalMessage = [];//{text: [], col: 'blue'};
    this.glabalColorMessage = [];
    this.textToSend = false;
    this.count = count || 5;
    this.lineHeight = lineHeight || 12;
    this.maxWidth = maxWidth || 200;
    this.marginLeft = marginLeft || 5;
    this.marginTop = marginTop || 450;
    this.color = color || 'blue';
    this.top = this.marginTop;
    this.margin = 5;

}
Massage.prototype.wrapClearText = function(context) {
    context.clearRect(this.marginLeft-this.margin, this.marginTop+this.margin, this.maxWidth+2*this.margin, -this.lineHeight*(this.count+1)-2*this.margin);
};
Massage.prototype.wrapText = function(context, text) {
    context.font = "bold 12pt Calibri";
    text = text || '';
    var savetext = [];
    var words = text.split(" ");
    var countWords = words.length;
    var testLineWidth = 0;
    var testLine = '';
    var widthSpace = context.measureText(' ').width;
    this.top = this.marginTop;
    for (var n = 0; n < countWords && savetext.length < this.count; n++) {
        var widthWord = context.measureText(words[n]).width;
        if(testLineWidth+widthWord<=this.maxWidth){
            testLine+=words[n]+' ';
            testLineWidth+=widthWord+widthSpace;
        }else{
            if(testLine.length) {
                savetext.push(testLine);
            }
            if (widthWord > this.maxWidth) {
                for (var i = 0; i < words[n].length && savetext.length < this.count;) {
                    var widthChat = context.measureText(words[n].charAt(i)).width;
                    if (testLineWidth + widthChat <= this.maxWidth) {
                        testLine += words[n].charAt(i++);
                        testLineWidth += widthChat
                    } else {
                        savetext.push(testLine);
                        testLine = '';
                        testLineWidth = 0;
                    }
                }
            }else{
                testLine=words[n]+' ';
                testLineWidth=widthWord+widthSpace;
            }
        }
    }

    if(savetext.length<this.count && testLine.length>0 && testLine!=' ') savetext.push(testLine);

    this.top -= this.lineHeight*(savetext.length-1);

    for(var n = savetext.length, i = 0; i<this.count-n;  i++) {
        this.glabalMessage[i] = this.glabalMessage[i+n];
        this.glabalColorMessage[i] = this.glabalColorMessage[i+n];
        this.top -= this.lineHeight;
    }
    for(var n = 0;n<savetext.length;i++, n++){
        this.glabalMessage[i] = savetext[n];
        this.glabalColorMessage[i] = this.color;
    }
};
Massage.prototype.drawMessage = function(context) {

    context.save();
    context.textBaseline = "bottom";
    context.textAlign = "start";

    for(var i=this.count-1; i+1; i--){
        if(this.glabalMessage[i]!==undefined) {
            context.fillStyle = this.glabalColorMessage[i];
            context.fillText(this.glabalMessage[i], this.marginLeft, this.marginTop - this.lineHeight * (this.count - i-1));
        }
    }
    context.restore();
};