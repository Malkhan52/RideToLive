/**
 * Handles the videos as jpeg sequences, this class does the
 * low level preloading and applying frames to a canvas.
 * Jpegs filenames should have a prefix, then a number from
 * 0 to 99999, then a .jpg extension. Eg. video00010.jpg
 *
 * Options:
 *  - options.location          Folder that all the jpegs are in
 *  - options.prefix            Filename prefix
 *  - options.numFrames         Total number of frames in the sequence
 *  - options.frameRate         Number of frames per second
 *  - options.width             Width of the original jpegs
 *  - options.height            Height of the original jpegs
 *  - options.loadProgress      Callback to be called while the sequence is loading
 *  - options.loadComplete      Callback to be called when loading is complete
 *  - options.playProgress      Callback to be called while sequence is playing
 *  - options.playComplete      Callback to be called when sequence is complete
 *  - options.canvasContext     The 2d context that the images should be drawn to
 *  - options.alternate         Optional string that appends onto the end of the folder to load, for loading smaller images
 *
 * Stuff you can call:
 *  - play()
 *  - pause()
 *  - resume()
 *  - setPlayRate()
 *  - batchPreload(numToBatch)
 *  - setSize(width, height)
 *  - seekTo(percent)
 *  - stop()                    Stops with the intent of being switched out
 *  - getCurrentPosition()      Returns a number between 0 and 1
 */
var JpegSequence = function(options) {
    // Make sure all required options have been provided
    if (!options.hasOwnProperty("location")) {
        throw "Must include a location for jpegs";
    }
    if (!options.hasOwnProperty("prefix")) {
        throw "Must include a prefix for the files";
    }
    if (!options.hasOwnProperty("numFrames")) {
        throw "Must include the number of frames with numFrames";
    }
    if (!options.hasOwnProperty("frameRate")) {
        throw "Must include the frame rate with the option frameRate";
    }
    if (!options.hasOwnProperty("width") || !options.hasOwnProperty("height")) {
        throw "Must include a width and a height";
    }

    // These two keep track of time so we're only emitting events every 250ms
    this.lastLoadEvent = 0;
    this.lastProgressEvent = 0;

    this.location = Settings.sequencesRootLocation + options.location;
    this.prefix = options.prefix;
    this.numFrames = options.numFrames;
    this.frameRate = options.frameRate;
    this._width = options.width;
    this._height = options.height;
    this.numLoaded = 0;
    this.isPlaying = false;
    this.playRate = 1;
    this.canvasContext = options.canvasContext;

    if (options.alternate) {
        this.alternate = "-" + options.alternate;
    }
    else {
        this.alternate = "";
    }

    // Used when we're figuring out what the individual frames look like
    this._numDigits = this.numFrames.toString().length;
    this._zeros = Util.getZeros(this._numDigits);

    if (options.hasOwnProperty("loadProgress")) {
        this.loadProgress = options.loadProgress;
    }
    if (options.hasOwnProperty("loadComplete")) {
        this.loadComplete = options.loadComplete;
    }
    if (options.hasOwnProperty("playComplete")) {
        this.playComplete = options.playComplete;
    }
    if (options.hasOwnProperty("playProgress")) {
        this.playProgress = options.playProgress;
    }

    this.progressInformDelta = 0;
    // Emit a playProgress event every x seconds
    this.progressInformLength = 0.1;
    this.frames = [];
    this.lastFrame = 0;
    this.numFramesRequested = 0;
    this.stateTime = 0;
    this.currentFrame = 0;
};

JpegSequence.prototype.getCurrentPosition = function() {
    return this.currentFrame / this.numFrames;
};

/**
 * Preloads the sequence sending numToBatch requests at a time, the
 * optimal value for numToBatch seems to be about 4
 *
 * @param numToBatch - Number of images to load at the same time
 */
JpegSequence.prototype.batchPreload = function(numToBatch) {
    for (var i = 0; i < numToBatch; i++) {
        this._preload();
    }
};

JpegSequence.prototype.play = function() {
    if (!this.canvasContext) {
        throw "Canvas context not set";
    }

    this.resumeFromFrame = 0;
    this.isPlaying = true;
    this.lastTime = new Date().getTime() / 1000;

    this._startAnimation();
};

JpegSequence.prototype.pause = function() {
    this.isPlaying = false;
    this.resumeFromFrame = this.currentFrame;
};

JpegSequence.prototype.resume = function() {
    this.isPlaying = true;
    this.resumeFromFrame = this.currentFrame;
    this.stateTime = 0;
};

JpegSequence.prototype.setPlayRate = function(rate) {
    if (this.isPlaying) {
        // We need to keep the leftover statetime that we haven't used yet, otherwise we get stuck on a frame while we brake
        this.stateTime = this.stateTime - (this.currentFrame - this.resumeFromFrame) / (this.playRate * this.frameRate);

        this.resumeFromFrame = this.currentFrame;
        this.playRate = rate;
    }
    else {
        this.playRate = rate;
    }
};

JpegSequence.prototype.setSize = function(width, height) {
    this._width = width;
    this._height = height;
};

/**
 * Seeks to a position in the timeline between 0 & 1
 */
JpegSequence.prototype.seekTo = function(percent) {
    if (percent > 1 || percent < 0) {
        throw "Cannot seek past 1 or before 0";
    }
    this.currentFrame = Math.floor(percent * this.numFrames);
};

JpegSequence.prototype.stop = function() {
    if (this._animationId != null) {
        this._stopAnimation();
    }
}

JpegSequence.prototype._startAnimation = function() {
    this._lastTime = new Date().getTime() / 1000;
    this._animationId = window.requestAnimationFrame(this._continueAnimation.bind(this));
};

JpegSequence.prototype._continueAnimation = function() {
    var nowTime = new Date().getTime() / 1000;
    var delta = nowTime - this._lastTime;
    this._update(delta);
    this._lastTime = nowTime;
    this._animationId = window.requestAnimationFrame(this._continueAnimation.bind(this));
    this.stateTime += delta;
};

/**
 * Stops the animation frame loop
 */
JpegSequence.prototype._stopAnimation = function() {
    if (this._animationId == null) {
        throw "Tried to stop the animation when it is not playing";
    }
    else {
        window.cancelAnimationFrame(this._animationId);
        this._animationId = null;
    }
};

JpegSequence.prototype._update = function(deltaTime) {
    if (this.isPlaying) {
        var now = new Date().getTime() / 1000;

        this.currentFrame = Math.floor(this.stateTime * this.playRate * this.frameRate + this.resumeFromFrame);

        // Figure out how many digits need to be in the filename
        // Only continueOn if there's more frames
        if (this.currentFrame < this.numFrames) {
            // Only actually change the image if it's a new image (don't re-create between frames)
            if (this.currentFrame != this.lastFrame) {
                //var img = new Image();
                //img.src = this.location + this.alternate + "/" + this.prefix + String(this._zeros + this.currentFrame).slice(-this._numDigits) + ".jpg";
                this.canvasContext.drawImage(this.frames[this.currentFrame], 0, 0, this._width, this._height);
                this.lastFrame = this.currentFrame;
            }
        }
        else {
            if (this.hasOwnProperty("playComplete")) {
                this._playComplete();
            }
        }

        // Emit a play progress event if it's time to
        var delta = now - this.lastTime;
        this.progressInformDelta += delta;

        if (this.progressInformDelta > this.progressInformLength && this.hasOwnProperty("playProgress")) {
            // Emit the progress event if one is due
            if (now - this.lastProgressEvent > 0.25) {
                this.playProgress({
                    'percent': this.currentFrame / this.numFrames,
                    'time': this.currentFrame / this.numFrame * (this.numFrames * this.frameRate)
                });
                this.lastProgressEvent = now;
            }

            // Reset the counter
            this.progressInformLength = 0;
        }

        this.lastTime = now;

        // Return how far through the animation we are
        return this.currentFrame / this.numFrames;
    }
};

JpegSequence.prototype._playComplete = function() {
    // Stop the loop and inform sequence
    this._stopAnimation();
    this.isPlaying = false;
    this.playComplete();
}

JpegSequence.prototype._preload = function() {
    var now = new Date().getTime() / 1000;
    this.numFramesRequested++;
    this.frames.push(new Image());
    var index = this.frames.length - 1;
    this.frames[index].jpgContext = this;
    this.frames[index].src = this.location + this.alternate + "/" + this.prefix + String(this._zeros + index).slice(-this._numDigits) + ".jpg";
    this.frames[index].onload = function() {
        this.jpgContext.numLoaded++;
        if (this.jpgContext.hasOwnProperty("loadProgress")) {
            if (now - this.jpgContext.lastLoadEvent > 0.25) {
                this.jpgContext.loadProgress({
                    'percent': this.jpgContext.numLoaded / this.jpgContext.numFrames
                });
                this.jpgContext.lastLoadEvent = now;
            }
        }
        if (this.jpgContext.numFramesRequested < this.jpgContext.numFrames) {
            this.jpgContext._preload();
        }
        if (this.jpgContext.numLoaded >= this.jpgContext.numFrames && this.jpgContext.hasOwnProperty("loadComplete")) {
            // Finished loading
            this.jpgContext.loadProgress({'percent': 1});
            this.jpgContext.loadComplete();
        }
    };
};

JpegSequence.prototype.rewind = function() {
    this.currentFrame = 0;
    this.stateTime = 0;
    this.lastFrame = 0;
    this.resumeFromFrame = 0;
    // Seems like play() takes care of everything else
};

JpegSequence.prototype.cleanUp = function() {
    // Nothing to see here
};