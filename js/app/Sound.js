/**
 * Wrapper for dealing with short playing sounds like speed up and slow down.
 *
 * options:
 * - filename               The filename, should be mp3
 * - name                   Unique identifier for this sound (to be added to dom element)
 * - minPlayTime            Minimum time (in seconds) that the clip can play for
 */
var Sound = function(options) {
    if (!options.hasOwnProperty('filename')) {
        throw "Sound object missing filename";
    }
    if (!options.hasOwnProperty('name')) {
        throw "Sound object missing name";
    }

    this.filename = options.filename;
    this.name = "sound-" + options.name;
    this.minPlayTime = options.minPlayTime;

    // Create the dom element and add it to the page
    var $domElement = $("<div />");
    $domElement.addClass(this.name);
    this.name = "." + this.name;
    $("body").append($domElement);

    var that = this;
    $(this.name).jPlayer({
        'ready' : function() {
            $(that.name).jPlayer("setMedia", {
                'mp3' : that.filename + '.mp3',
                'oga' : that.filename + '.ogg'
            });
        },
        'solution' : 'html,flash',
        'swfPath' : 'js/libs',
        'supplied' : 'mp3,oga',
        'preload' : 'auto',
        'canplaythrough' : function() {
            that.onReadyCallback();
        }
    });

    this.state = "stopped";
    this.isKeyDown = false;
    this.lastPlayTime = 0;
    this.disabled = false;
    this.isMuted = false;

    this.onReadyCallback = options.onReady;
};

Sound.prototype.keydown = function() {
    if (!this.disabled) {
        var now = new Date().getTime() / 1000;
        if (!this.isKeyDown && now - this.lastPlayTime > this.minPlayTime && !this.isMuted) {
            // Start playing
            $(this.name).jPlayer("pause", 0);
            $(this.name).jPlayer("volume", 1);
            clearTimeout(this.fadeOutTimer);
            $(this.name).jPlayer("play");
            this.state = "playing";
            this.lastPlayTime = new Date().getTime() / 1000;
        }
        this.isKeyDown = true;
    }
};

Sound.prototype.keyup = function() {
    if (this.state == "playing") {
        this.state = "fadeout";

        this.fadeOutI = 10;
        this.fadeOutTimer = setTimeout(this.fadeOut.bind(this), 50);
    }
    this.isKeyDown = false;
};

Sound.prototype.fadeOut = function() {
    $(this.name).jPlayer("volume", this.fadeOutI / 10);

    this.fadeOutI--;
    if (this.fadeOutI >= 0) {
        this.fadeOutTimer = setTimeout(this.fadeOut.bind(this), 50);
    }
    else {
        $(this.name).jPlayer("pause", 0);
        this.state = "stopped";
    }
};

Sound.prototype.disable = function() {
    this.keyup();
    this.disabled = true;
};

Sound.prototype.enable = function() {
    this.disabled = false;
};

Sound.prototype.mute = function() {
    this.isMuted = true;
};

Sound.prototype.unmute = function() {
    this.isMuted = false;
};

Sound.prototype.destroy = function() {
    $(this.name).jPlayer("destroy");
};