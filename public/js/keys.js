function Keys(){
    this.up = false;
    this.left = false;
    this.right = false;
    this.down = false;
    this.space = false;
    this.enterPressOne = false;
    this.data = '';
}
Keys.prototype.onKeyDown = function(e) {
    var that = this,
        c = e.keyCode;
    switch (c) {
        // Controls
        case 65:
        case 37: // Left
            that.left = true;
            break;
        case 87:
        case 38: // Up
            that.up = true;
            break;
        case 68:
        case 39: // Right
            that.right = true;
            break;
        case 83:
        case 40: // Down
            that.down = true;
            break;
        case 32: // Space
            that.space = true;
            break;
    };
};
Keys.prototype.onKeyUp = function(e) {
    var that = this,
        c = e.keyCode;
    switch (c) {
        case 65:
        case 37: // Left
            that.left = false;
            break;
        case 87:
        case 38: // Up
            that.up = false;
            break;
        case 68:
        case 39: // Right
            that.right = false;
            break;
        case 83:
        case 40: // Down
            that.down = false;
            break;
        case 32: // Space
            that.space = false;
            break;
        case 13:
            if(that.enterPressOne) {
                that.enterPressOne = false;
                $('#chat').fadeTo('normal', 0).blur();
                this.data = $('#chat').val();
                $('#chat').val('');
            } else {
                that.enterPressOne = true;
                $('#chat').fadeTo('normal', 0.75).focus();
            }
        /*
            if(visible){
                visible = false;
                if(!/^\s*$/.test($('#chat').val())) {
                    wrapText(ctx, $('#chat').val());
                    $('#chat').val('');
                }
                $('#chat').fadeTo('normal', 0).blur();

            }else{
                visible = true;
                $('#chat').fadeTo('normal', 0.75).focus();
            }*/
            break;
    };
};