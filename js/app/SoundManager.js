/**
 * Deals with all the audio stuff, setting up, playing etc.
 */
(function(module){

    var speedUpReady = false;
    var slowDownReady = false;
    var $bgLoop;
    var $speedUp;
    var $slowDown;
    var timeSinceSpeedUp = 0;
    var timeSinceSlowDown = 0;
    var minSpeedUpPlayTime = 3;
    var minSlowDownPlayTime = 3.5;
    var canPlay = true;
    var speedUpTimer;
    var speedUp;
    var speedDown;
    var bgFadeout = 20;
    var isMuted = false;
    var isDisabled = true;

    var bgLoaded, speedUpLoaded, slowDownLoaded;
    var hasFinishedLoadingSounds = false;
    var onReadyCallback;
    var isInitCalled = false;

    /**
     * Takes in the json data and sets up all the players
     *
     * type - The chosen motorbike type, should be one of 'naked', 'sports', 'cruiser'
     * onReady - A function to call when the audio is loaded
     */
    module.init = function(type, onReady) {
        isInitCalled = true;
        bgLoaded = speedUpLoaded = slowDownLoaded = hasFinishedLoadingSounds = false;
        onReadyCallback = onReady;

        // Get the main background loop
        var bgLoop = Settings.sequencesRootLocation + Settings.sounds[type].loop;
        // $bgLoop = $("<audio id='bg-loop' preload='auto' src='" + bgLoop + ".ogg'></audio>");
        // $bgLoop[0].loop = true;
        $bgLoop = $("<div class='background-loop-container' />");
        $("body").append($bgLoop);

        $bgLoop.jPlayer({
            'ready' : function() {
                $bgLoop.jPlayer("setMedia", {
                    'mp3' : bgLoop + '.mp3',
                    'oga' : bgLoop + '.ogg'
                });
            },
            'solution' : 'html,flash',
            'swfPath' : 'js/libs',
            'supplied' : 'mp3,oga',
            'preload' : 'auto',
            'loop': true,
            'canplaythrough': function(e) {
                bgLoaded = true;
                module.somethingLoaded();
            }
        });

        speedUp = new Sound({
            'filename' : Settings.sequencesRootLocation + Settings.sounds[type]['speed-up'],
            'name' : 'speed-up',
            'minPlayTime' : 0.1,
            'onReady': function() {
                speedUpLoaded = true;
                module.somethingLoaded();
            }
        });
        slowDown = new Sound({
            'filename' : Settings.sequencesRootLocation + Settings.sounds[type]['slow-down'],
            'name' : 'slow-down',
            'minPlayTime' : 0.1,
            'onReady': function() {
                slowDownLoaded = true;
                module.somethingLoaded();
            }
        });

        if ($.cookie("isMuted") != undefined) {
            if ($.cookie("isMuted") == "1") {
                module.mute();
            }
        }
    };

    module.somethingLoaded = function() {
        if (bgLoaded && speedUpLoaded && slowDownLoaded && !hasFinishedLoadingSounds) {
            hasFinishedLoadingSounds = true;
            if (onReadyCallback) {
                onReadyCallback();
            }
        }
    };

    module.deInit = function () {
        speedUp.destroy();
        slowDown.destroy();
        $('#bg-loop, .sound-speed-up, .sound-slow-down').remove();
    };

    module.startBgLoop = function() {
        if (!isMuted) {
            $bgLoop.jPlayer({volume: 1});
            $bgLoop.jPlayer('play');
        }
        isDisabled = false;
    };

    /**
     * Receive input that triggers a sound
     * @param type - Should be one of 'throttle' or 'brake'
     * @param isDown - Whether the user is pressing down or releasing
     */
    module.processInput = function(type, isDown) {
        if (type == 'throttle' && isDown) {
            speedUp.keydown();
        }
        else if (type == 'throttle' && !isDown) {
            speedUp.keyup();
        }
        else if (type == 'brake' && isDown) {
            slowDown.keydown();
        }
        else if (type == 'brake' && !isDown) {
            slowDown.keyup();
        }
    };

    /**
     * @param includeBg - Do we want to disable the background loop?
     */
    module.disableSounds = function(includeBg) {
        speedUp.disable();
        slowDown.disable();
        if (includeBg) {
            $bgLoop.jPlayer('pause');
        }
        isDisabled = true;
    };

    /**
     * @param includeBg - Do we want to disable the background loop?
     */
    module.reenableSounds = function(includeBg) {
        speedUp.enable();
        slowDown.enable();
        if (includeBg && !isMuted) {
            $bgLoop.jPlayer({volume: 1});
            $bgLoop.jPlayer('play');
        }
        bgFadeout = 20;
        isDisabled = false;
    };

    module.backgroundLoopFadeOut = function() {
        $bgLoop.jPlayer({volume: bgFadeout / 20});

        bgFadeout--;
        if (bgFadeout >= 0) {
            this.fadeOutTimer = setTimeout(module.backgroundLoopFadeOut, 50);
        }
        else {
            $bgLoop.jPlayer('pause');
        }
    };

    module.muteToggle = function() {
        if (isMuted) {
            module.unmute();
        }
        else {
            module.mute();
        }
    };

    module.mute = function() {
        $(".soundToggle").addClass("disabled");
        speedUp.mute();
        slowDown.mute();
        isMuted = true;
        $bgLoop.jPlayer('pause');
        $.cookie("isMuted", "1");
    };

    module.unmute = function() {
        $(".soundToggle").removeClass("disabled");
        speedUp.unmute();
        slowDown.unmute();
        isMuted = false;
        if (!isDisabled) {
            $bgLoop.jPlayer('play');
        }
        $.cookie("isMuted", "0");
    };

    module.rewindBgLoop = function() {
        $bgLoop.jPlayer('pause');
        $bgLoop.jPlayer('stop');
    };

    module.destroyBg = function() {
        $bgLoop.jPlayer("destroy");
        $bgLoop.remove();
    };

    module.isInitCalled = function() {
        return isInitCalled;
    };

}(window.SoundManager = window.SoundManager || {}));