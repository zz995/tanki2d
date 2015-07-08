function Keys(){
    this.up = false;
    this.left = false;
    this.right = false;
    this.down = false;
    this.space = false;
    this.shift = false;
    this.enterPressOne = false;
    this.data = '';
}
Keys.prototype.onKeyDown = function(e) {
    var that = this,
        c = e.keyCode;
    switch (c) {
        case 65:
        case 37: // Left
            that.left = !that.enterPressOne;
            break;
        case 87:
        case 38: // Up
            that.up = !that.enterPressOne;
            break;
        case 68:
        case 39: // Right
            that.right = !that.enterPressOne;
            break;
        case 83:
        case 40: // Down
            that.down = !that.enterPressOne;
            break;
        case 32: // Space
            that.space = !that.enterPressOne;
            break;
        case 16: // Shift
            that.shift = !that.enterPressOne;
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
            break;
        case 16: // Shift
            that.shift = false;
            break;
    };
};