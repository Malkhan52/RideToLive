/* eslint-disable prettier/prettier */
/**
 * Options:
 * - options.filename
 * - options.width
 * - options.height
 * - options.loadProgress
 * - options.loadComplete
 * - options.playProgress
 * - options.playComplete
 * - options.videoContainer         Selector for the div that contains all the jplayer instances
 * - options.name                   The name as per the json file
 *
 * Stuff you can call:
 * - play()
 * - pause()
 * - resume()
 * - setPlayRate()
 * - stop()
 *
 */
var JPlayerSequence = function(options) {
    this.ready = false;
    this.filename = Settings.sequencesRootLocation + options.videoFilename;
    this._width = options.width;
    this._height = options.height;
    this.videoContainer = options.videoContainer;
    this.isPlaying = false;
    this._name = options.name;
    this.finisedLoad = false;
    this.gotTotalTime = false;

    this.isBuffering = false;
    this.index = options.index;

    this.bufferCheckTimer = 0;

    // For checking if buffering
    this.lastTime = 0;

    this.numZeros = Util.getZeros(options.jpegSequence.numFrames.toString().length);

    if (options.playrateDisabled) {
        this.playrateDisabled = true;
    }
    else {
        this.playrateDisabled = false;
    }

    if (options.hasOwnProperty("loadProgress")) {
        this.loadProgress = options.loadProgress;
    }
    if (options.hasOwnProperty("loadComplete")) {
        this.loadComplete = options.loadComplete;
    }
    if (options.hasOwnProperty("playProgress")) {
        this.playProgress = options.playProgress;
    }
    if (options.hasOwnProperty("playComplete")) {
        this.playComplete = options.playComplete;
    }

    var videoType;
    if (options.sequenceType == "html") {
        // Prefer html
        videoType = "html, flash";
    }
    else {
        videoType = "flash, html";
    }

    // Create a new container for this sequence
    var $jplayerElement = $("<div />");

    // Set background as first frame in video whilst loading [A-RON]
    if (HPT.typeOfTest === 'commuter' && (HPT.currentIndex + 1) === 6) {
        var number = "00";
    } else {
        number = "000";
    }
    //alert(this.filename);
    if (this.index == 0) {
        if (SequenceManager.isTraining()) {
            $jplayerElement.css({
                'background': "url('" + Settings.sequencesRootLocation + "sequences/intro/blurred/video00.jpg') no-repeat",
                'background-size': 'cover'
            });
        }
        else {
            $jplayerElement.css({
                //'background': "url('" + Settings.sequencesRootLocation + "sequences/" + HPT.typeOfTest + "/" + (HPT.currentIndex + 1) + "/intro-original/video" + number + ".jpg') no-repeat",
                'background': "url('" + this.filename + "-original/video" + this.numZeros + ".jpg') no-repeat",
                'background-size': 'cover'
            });
        }
    }

    $jplayerElement.addClass(this._name);
    $jplayerElement.addClass("inactive");
    this.jplayerSelector = this.videoContainer + " ." + this._name;
    $(this.videoContainer).append($jplayerElement);

    UI.doResize();

    //console.log(SequenceManager.getCanvasSize());

    var that = this;
    $(this.jplayerSelector).jPlayer({
        'ready' : function() {
            that.ready = true;
            $(this).jPlayer("setMedia", {
                'm4v' : that.filename + HPT.jPlayerSuffix + ".mp4",
                'webmv' : that.filename + ".webm"
            });
        },

        'loadeddata' : function(event) {
            that._totalTime = event.jPlayer.status.duration;
            this.gotTotalTime
        },
        'swfPath' : 'js/libs',
        'solution' : videoType,
        'supplied' : 'm4v,webmv',
        'preload' : 'auto',
        'size' : {
            'width' : SequenceManager.getCanvasSize().width,
            'height' : SequenceManager.getCanvasSize().height
            //'width' : that._width + 'px',
            //'height' : that._height + 'px'
        },
        'progress' : this._progress.bind(this),
        'ended' : this._playComplete.bind(this),
        'timeupdate' : this._timeUpdate.bind(this),
        'canplaythrough' : this._canPlayThrough.bind(this)
    });
};

JPlayerSequence.prototype._canPlayThrough = function(event) {
    if (!this.finishedLoad) {
        this._progress(event, true);
    }
};

JPlayerSequence.prototype.getCurrentPosition = function() {
    return this._currentTime / this._totalTime;
};

JPlayerSequence.prototype.checkForBuffering = function() {
    if ($(this.jplayerSelector + " video")[0] == undefined) {
        //debugger;
    }
    var currentTime = $(this.jplayerSelector + " video")[0].currentTime;
    if (currentTime == this.lastTime && currentTime > 0.8) {
        // We're buffering
        if (!this.isBuffering) {
            // Started buffering
            //console.log("Started buffering");
            this.bufferStarted();
        }

        this.isBuffering = true;
    }
    else {
        // We're not buffering
        if (this.isBuffering) {
            // Stopped buffering
            //console.log("Resumed from buffering");
            this.bufferEnded();
        }

        this.isBuffering = false;
    }
    this.lastTime = currentTime;
};

JPlayerSequence.prototype.bufferStarted = function() {
    if (!SequenceManager.isTraining()) {
        $("#buffering").show();
        var queueSpeedUp = false, queueSlowDown = false;

        // Check if they're currently holding down a button, if they are, make it press up and add it to the queue
        if (UI.isSpeedUp()) {
            UI.speedControls('throttle', false);
            queueSpeedUp = true;
        }
        if (UI.isSlowDown()) {
            UI.speedControls('brake', false);
            queueSlowDown = true;
        }

        SequenceManager.setBuffering(true);

        if (queueSpeedUp) {
            UI.speedControls('throttle', false);
        }
        if (queueSlowDown) {
            UI.speedControls('brake', false);
        }
    }
};

JPlayerSequence.prototype.bufferEnded = function() {
    if (!SequenceManager.isTraining()) {
        $("#buffering").hide();
        SequenceManager.setBuffering(false);
    }

    // Clear the queue in SequenceManager
    UI.processQueue();
};

JPlayerSequence.prototype.play = function() {
    if (this.ready) {
        $(this.jplayerSelector).jPlayer("play");
        $(this.jplayerSelector).addClass("active");
        $(this.jplayerSelector).removeClass("inactive");
        //console.log("Starting buffer check interval");
        this.bufferCheckTimer = setInterval(this.checkForBuffering.bind(this), 50);
        return true;
    }
    else {
        return false;
    }
};

JPlayerSequence.prototype.pause = function() {
    if (this.ready) {
        $(this.jplayerSelector).jPlayer("pause");
        //console.log("Stopping buffer check interval");
        clearInterval(this.bufferCheckTimer);
        return true;
    }
    else {
        return false;
    }
};

JPlayerSequence.prototype.resume = function() {
    $(this.jplayerSelector).jPlayer("play");
    //console.log("Starting buffer check interval");
    this.bufferCheckTimer = setInterval(this.checkForBuffering.bind(this), 200);
};

JPlayerSequence.prototype.setPlayRate = function(rate) {
    if (!this.playrateDisabled) {
        $(this.jplayerSelector).jPlayer("playbackRate", rate);
    }
};

JPlayerSequence.prototype.setSize = function(width, height) {
    this._width = width;
    this._height = height;
    $(this.jplayerSelector).jPlayer({
        "size": {
            "width": width + "px",
            "height": height + "px"
        }
    });
};

/**
 * Seeks to a point in the video
 */
JPlayerSequence.prototype.seekTo = function(percent) {
    if (percent * 100 > this.percentLoaded) {
        throw "Can't seek to this point because we haven't loaded that far yet";
    }
    var seekValue = this.percentLoaded * percent;

    $(this.jplayerSelector).jPlayer("playHead", seekValue);
};

JPlayerSequence.prototype.isReady = function() {
    return this.ready;
};

JPlayerSequence.prototype.stop = function() {
    $(this.jplayerSelector).addClass("inactive");
    $(this.jplayerSelector).removeClass("active");
    //$(this.jplayerSelector).jPlayer("pause", 0);
    $(this.jplayerSelector).jPlayer("stop");
    //console.log("Stopping buffer check interval");
    clearInterval(this.bufferCheckTimer);
};

/**
 * Safari doesn't report 1 when ready to play but does fire canplaythrough
 * so if canplaythrough happens, we ignore the percent loaded
 */
JPlayerSequence.prototype._progress = function(event, readyToPlay) {
    if (!this.gotTotalTime) {
        this._totalTime = event.jPlayer.status.duration;
        this.gotTotalTime = true;
    }

    var percentLoaded;
    if (readyToPlay) {
        percentLoaded = 100;
    }
    else {
        percentLoaded = event.jPlayer.status.seekPercent;
    }

    // This tries to preload the whole video, but the browser won't load the whole way through
    //if ($(this.jplayerSelector + " video")[0].buffered.length == 0) {
    //    percentLoaded = 0;
    //}
    //else {
    //    percentLoaded = $(this.jplayerSelector + " video")[0].buffered.end(0) / $(this.jplayerSelector + " video")[0].duration;
    //}

    //console.log("percentLoaded (" + this.jplayerSelector +"): " + percentLoaded);

    // Call the listener if it's there
    if (this.hasOwnProperty("loadProgress")) {
        this.loadProgress({
            'percent' : percentLoaded / 100
        });
    }

    this.percentLoaded = percentLoaded;

    if (percentLoaded >= 100 && !this.isPlaying && !this.finishedLoad) {
        // Finished loading,
        this.finishedLoad = true;
        this.loadComplete();
        this.isPlaying = true;
    }
};

JPlayerSequence.prototype._playComplete = function() {
    if (this.hasOwnProperty("playComplete")) {
        this.playComplete();
    }
    //console.log("Stopping buffer check interval");
    clearInterval(this.bufferCheckTimer);
};

JPlayerSequence.prototype._timeUpdate = function(event) {
    this._currentTime = event.jPlayer.status.currentTime;
};

JPlayerSequence.prototype.rewind = function() {
    $(this.jplayerSelector).jPlayer("stop");
};

JPlayerSequence.prototype.setOnTop = function() {
    $(this.jplayerSelector).removeClass("inactive");
    $(this.jplayerSelector).addClass("active");
};

JPlayerSequence.prototype.cleanUp = function() {
    clearInterval(this.bufferCheckTimer);
};
