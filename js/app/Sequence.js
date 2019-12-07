/**
 * This class should take a single sequence object & the name
 * of that sequence. Preloading happens as soon as you instantiate
 * the object.
 *
 * Stuff you can call:
 * - play()
 * - seekTo()
 * - stop()                     Stop with the intent of switching out this video for another
 * - didPass()                  Returns whether the sequence was completed successfully
 * - getWinSequence()
 * - getFailSequence()
 *
 * Options:
 * - options.jpegSequence           JpegSequence details from the JSON
 * - options.video                  URL of the video
 * - options.width                  Original width of the video
 * - options.height                 Original height of the video
 * - options.loadProgress           Callback function while sequence is loading
 * - options.loadComplete           Callback function when sequence has finished loading
 * - options.playProgress           Callback function for getting info while the video is playing
 * - options.playComplete           Callback function for video completed
 * - options.canvasContext          The context returned from canvas.getContext('2d'), the place the sequence will be rendererd to
 * - options.speedLimits            An array containing objects structured like this: {start: 0.3, speed: 60}
 * - options.advisorySpeedLimits
 * - options.messageFast            An array (title, tagline) of strings to display if we end on this sequence (OPTIONAL)
 * - options.messageSlow            As above, but for a slow reaction time
 * - options.alternate              Alternate string to append to jpegs (for loading smaller ones)
 */
var Sequence = function(name, options) {
    this.sequenceName = name;
    this.hasChosenPath = false;
    this.hasActivatedButtons = false;
    this.hasDeactivatedButtons = false;

    // Make sure the options are properly
    if (!options.hasOwnProperty("jpegSequence")) {
        throw "You're missing the jpegSequence details from the json file";
    }
    if (!options.hasOwnProperty("video")) {
        throw "You're missing the video file from the json file";
    }
    if (!options.hasOwnProperty("width") || !options.hasOwnProperty("height")) {
        throw "You need to include width and height in the json file";
    }
    if (!options.hasOwnProperty("sequenceType")) {
        throw "Sequence type missing in Sequence class";
    }
    if (options.sequenceType != "jpeg" && options.sequenceType != "html" && options.sequenceType != "flash") {
        throw "Sequence type must be jpeg or flash or html";
    }
    if (!options.hasOwnProperty("videoContainer")) {
        throw "videoContainer not set";
    }
    this.winSequence = options.winSequence;
    this.failSequence = options.failSequence;

    this.passTest = false;

    this.sequenceType = options.sequenceType;

    this.messageFast = options.messageFast;
    this.messageSlow = options.messageSlow;

    this.advisorySpeedLimits = options.advisorySpeedLimits;

    if (options.sequenceType == "jpeg") {
        // Initialize the jpeg sequence
        options.jpegSequence.width = options.width;
        options.jpegSequence.height = options.height;

        if (options.hasOwnProperty("loadProgress")) this.loadProgressListener = options.loadProgress;
        if (options.hasOwnProperty("loadComplete")) this.loadCompleteListener = options.loadComplete;
        if (options.hasOwnProperty("playProgress")) this.playProgressListener = options.playProgress;
        if (options.hasOwnProperty("playComplete")) this.playCompleteListener = options.playComplete;

        options.jpegSequence.loadProgress = this._loadProgress.bind(this);
        options.jpegSequence.loadComplete = this._loadComplete.bind(this);
        options.jpegSequence.playProgress = this._playProgress.bind(this);
        options.jpegSequence.playComplete = this._playComplete.bind(this);
        options.jpegSequence.canvasContext = options.canvasContext;

        options.jpegSequence.alternate = options.alternate;
        this.jpegSequence = new JpegSequence(options.jpegSequence);
        this.jpegSequence.batchPreload(4);
    }
    else {
        if (options.hasOwnProperty("loadProgress")) this.loadProgressListener = options.loadProgress;
        if (options.hasOwnProperty("loadComplete")) this.loadCompleteListener = options.loadComplete;
        if (options.hasOwnProperty("playProgress")) this.playProgressListener = options.playProgress;
        if (options.hasOwnProperty("playComplete")) this.playCompleteListener = options.playComplete;

        options.loadProgress = this._loadProgress.bind(this);
        options.loadComplete = this._loadComplete.bind(this);
        options.playProgress = this._playProgress.bind(this);
        options.playComplete = this._playComplete.bind(this);
        options.name = name;

        // Create a new JPlayerSequence
        this.jplayerSequence = new JPlayerSequence(options);
    }

    // Set up the actions
    this.action = options.action;

    this.speedLimits = options.speedLimits;
};

Sequence.prototype.setPlayRate = function(rate) {
    if (this.sequenceType == "jpeg") {
        this.jpegSequence.setPlayRate(rate);
    }
    else {
        this.jplayerSequence.setPlayRate(rate);
    }
};

/**
 * Seek to a point in the video
 *
 * @param percent - A number between 0 and 1
 */
Sequence.prototype.seekTo = function(percent) {
    if (this.sequenceType == "jpeg") {
        this.jpegSequence.seekTo(percent);
    }
    else {
        this.jplayerSequence.seekTo(percent);
    }
};

Sequence.prototype.hasSpeedLimits = function() {
    if (this.speedLimits) return true;
    else return false;
};

Sequence.prototype.hasAdvisorySpeedLimits = function() {
    if (this.advisorySpeedLimits) return true;
    else return false;
};

/**
 * Called when the user makes an a or b selection
 */
Sequence.prototype.choosePath = function(path) {
    if (path != 'a' && path != 'b') {
        throw "Invalid path option";
    }

    // Check if they should be able to select
    if (this.action.type == 'choice') {
        if (this.canSelectPath()) {
            // We're ok to make a selection
            if (path == this.action.correct) {
                this.passTest = true;
            }
            else {
                this.passTest = false;
            }
            this.hasChosenPath = true;
        }
    }
};

Sequence.prototype.canSelectPath = function() {
    var currentPosition = this.getCurrentPosition();
    if (this.action) {
        return currentPosition > this.action.start && currentPosition < this.action.end && !this.hasChosenPath && this.action.type == "choice";
    }
    else {
        return false;
    }
};

Sequence.prototype.getReactionTime = function() {
    var currentPosition = this.getCurrentPosition();
    var reactionTimeRatio = (currentPosition - this.action.start) / (this.action.end - this.action.start);
    return reactionTimeRatio;
};

/**
 * Are they in the position where tapping the brake will make them pass the sequence?
 */
Sequence.prototype.canTapBrake = function() {
    var currentPosition = this.getCurrentPosition();
    if (this.action) {
        return currentPosition > this.action.start && currentPosition < this.action.end && !this.hasChosenPath && this.action.type == "tap-brake";
    }
    else {
        return false;
    }
};

Sequence.prototype.tapBrake = function() {
    this.passTest = true;
    this.hasChosenPath = true;
};

/**
 * Gets the current position in the sequence as a number between 0 and 1
 */
Sequence.prototype.getCurrentPosition = function() {
    if (this.sequenceType == "jpeg") {
        return this.jpegSequence.getCurrentPosition();
    }
    else {
        return this.jplayerSequence.getCurrentPosition();
    }
};

Sequence.prototype.getCurrentSpeedLimit = function() {
    //LAME SO LAME SO CRAP LAME
    //var currentPosition = this.getCurrentPosition();
    //for (var i = 0; i < this.speedLimits.length; i++) {
    //    if ((currentPosition >= this.speedLimits[i].start && i == this.speedLimits.length - 1) || (currentPosition >= this.speedLimits[i].start && currentPosition < this.speedLimits[i+1].start)) {
    //        return this.speedLimits[i].speed;
    //    }
    //}
    //return false;

    // OH MY GOSH HOW L33T!?
    var currentPosition = this.getCurrentPosition();
    return _.reduceRight(this.speedLimits, function(result, i) {
        if (result === false && currentPosition >= i.start) {
            result = i.speed;
        }
        return result;
    }, false);
};

Sequence.prototype.getCurrentAdvisorySpeedLimit = function() {
    var currentPosition = this.getCurrentPosition();
    return _.reduceRight(this.advisorySpeedLimits, function(result, i) {
        if (result === false && currentPosition >= i.start) {
            result = i.speed;
        }
        return result;
    }, false);
};

Sequence.prototype.isOverSpeedLimit = function(currentSpeed) {
    var currentSpeedLimit = this.getCurrentSpeedLimit();
    if (!currentSpeedLimit) {
        return false;
    }
    else {
        return Math.floor(currentSpeed) > this.getCurrentSpeedLimit();
    }
};

Sequence.prototype.isOverAdvisorySpeedLimit = function(currentSpeed) {
    var currentAdvisorySpeedLimit = this.getCurrentAdvisorySpeedLimit();
    if (currentAdvisorySpeedLimit == false) return false;
    return Math.floor(currentSpeed) > currentAdvisorySpeedLimit;
};

Sequence.prototype.play = function() {
    if (this.sequenceType == "jpeg") {
        this.jpegSequence.play();
    }
    else {
        this.jplayerSequence.play();
    }
};

Sequence.prototype.setSize = function(width, height) {
    if (this.sequenceType == "jpeg") {
        this.jpegSequence.setSize(width, height);
    }
    else {
        this.jplayerSequence.setSize(width, height);
        this.jplayerSequence.setSize(width, height);
    }
};

Sequence.prototype.stop = function() {
    if (this.sequenceType == "jpeg") {
        this.jpegSequence.stop();
    }
    else {
        this.jplayerSequence.stop();
    }
};

Sequence.prototype.didPass = function() {
    return this.passTest;
};

Sequence.prototype.getWinSequence = function() {
    return this.winSequence;
};

Sequence.prototype.getFailSequence = function() {
    return this.failSequence;
}

/**
 * These functions listen from events coming up from JpegSequence or JPlayerSequence
 */
Sequence.prototype._loadProgress = function(event) {
    if (this.hasOwnProperty("loadProgressListener")) this.loadProgressListener(event);
};

Sequence.prototype._loadComplete = function(event) {
    if (this.hasOwnProperty("loadCompleteListener")) this.loadCompleteListener(event);
};

Sequence.prototype._playProgress = function(event) {
    if (this.hasOwnProperty("playProgressListener")) this.playProgressListener(event);
};

Sequence.prototype._playComplete = function(event) {
    if (this.hasOwnProperty("playCompleteListener")) this.playCompleteListener(event);
};

/**
 * Pauses a currently running video.
 */
Sequence.prototype.pause = function() {
    if (this.sequenceType == "jpeg") {
        this.jpegSequence.pause();
    }
    else {
        this.jplayerSequence.pause();
    }
};

Sequence.prototype.resume = function() {
    if (this.sequenceType == "jpeg") {
        this.jpegSequence.resume();
    }
    else {
        this.jplayerSequence.resume();
    }
};

Sequence.prototype.reset = function() {
    this.setPlayRate(1);
    this.hasChosenPath = false;
    this.hasActivatedButtons = false;
    this.hasDeactivatedButtons = false;
    this.passTest = false;
    if (this.sequenceType == "jpeg") {
        this.jpegSequence.stop();
        this.jpegSequence.rewind();
    }
    else {
        this.jplayerSequence.stop();
        this.jplayerSequence.rewind();
    }
};

/**
 * Returns whether a sequence has an action or not, braking or selecting route
 */
Sequence.prototype.hasChoice = function() {
    if (this.action) {
        return true;
    }
    else {
        return false;
    }
};

Sequence.prototype.didMakeChoice = function() {
    if (!this.hasChosenPath) {
        return false;
    }
    else {
        return true;
    }
};

Sequence.prototype.setOnTop = function() {
    if (this.sequenceType != "jpeg") {
        this.jplayerSequence.setOnTop();
    }
};

Sequence.prototype.cleanUp = function() {
    if (this.sequenceType == "jpeg") {
        this.jpegSequence.cleanUp();
    }
    else {
        this.jplayerSequence.cleanUp();
    }
};
