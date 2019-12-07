/**
 * This class should take a JSON file and handle all the preparation
 * preloading, linking win and lose sequences in sequence objects.
 * The actual changing of sequences as they play happpens outside
 * this class as Sequences are connected by a linked-list type
 * structure.
 *
 * @constructor
 */
(function(module){

    var sequences = {};
    var firstSequence;
    var canvasWidth, canvasHeight;
    var sequenceType;
    var width;
    var height;
    var keys;
    var currentSequence;
    var sequenceChangeFuncs = [];
    var pollTimer;
    var lastCheckTime;
    var accelerationVector = 10;                // Increase 10kmph per second holding down the button
    var currentSpeed;                           // The current speed of the vehicle
    var startingSpeed;
    var onCompleteCallback;
    var onProgressCallback;
    var reactionTime;
    var selectedChoice;
    var approachSpeed;
    var sequenceTrail;
    var isFirstPlay = true;
    var hasShownAdvisorySpeedWarning = false;
    var lastChoiceIgnored = false;
    var testType = '';
    var isTraining;
    var isVideoBuffering = false;

    /**
     * Takes the URL to a json object,
     *
     * @param json URL to a json file that contains all the details for the test
     * @param options An object with the following callbacks
     *          - onProgress(e): Event structure
     *                  e = {
     *                      'sequenceNum' : ...             // Current index into the total list of sequences
     *                      'totalSequences' : ...          // Total number of sequences in this JSON
     *                      'percentLoaded' : ...           // Percent number of frames loaded for this sequence
     *                      'percentLoadedTotal' : ...      // Total percent loaded for whole JSON
     *                  }
     *          - onComplete
     *          - type: The control type they've chosen, should be one of: mobile, tablet, desktop, onDevice
     */
    module.loadTest = function(json, options) {
        options = options || {};

        if (options.isTraining) {
            isTraining = true;
        }
        else {
            isTraining = false;
        }

        var testFramesTotal = 0;
        var currentIndex = 0;
        var playrateDisabled = options.playrateDisabled;

        if (options.hasOwnProperty('onComplete')) {
            onCompleteCallback = options.onComplete;
        }
        if (options.hasOwnProperty('onProgress')) {
            onProgressCallback = options.onProgress;
        }

        // Cache buster
        json = json + '?' + (+ new Date());
        $.getJSON(json, function(data) {
            // Test for some stuff that's required in the json
            if (!data.hasOwnProperty("startingSpeed"))
                throw "JSON is missing a starting speed";

            // Put a list of the level names into an array
            keys = [];
            // Holds the percent of each sequence of the total, the sum of this array will be 1
            var amounts = [];
            for (var key in data.sequences) {
                keys.push(key);

                // This is for keeping individual loaded percentages per sequence
                data.sequences[key].loaded = 0;

                // Figure out the total amount of frames
                testFramesTotal += data.sequences[key].jpegSequence.numFrames;
            }

            for (var key in data.sequences) {
                amounts.push(data.sequences[key].jpegSequence.numFrames / testFramesTotal);
            }

            sequenceType = HPT.typeOfVideo;

            // Allow this to be overridden
            if (options.hasOwnProperty("force")) {
                sequenceType = options.force;
            }

            firstSequence = keys[0];
            currentSequence = keys[0];
            //width = data.sequences[keys[0]].width;
            //height = data.sequences[keys[0]].height;

            if (sequenceType == "jpeg") {
                width = Settings.jpegSequenceSize.width;
                height = Settings.jpegSequenceSize.height;
            }
            else {
                width = Settings.videoSequenceSize.width;
                height = Settings.videoSequenceSize.height;
            }

            var videoContainer = options.videoContainer;
            startingSpeed = data.startingSpeed;
            testType      = data.type;
            currentSpeed = startingSpeed;

            var alternate = HPT.alternate;

            UI.setSpeedOverlay(currentSpeed);

            var loadNext = function(index) {
                // Instead of loading jpeg sequences, we need to load sequences here, beacuse we're not sure which type we're going to use
                var options = data.sequences[keys[index]];
                var canvas;
                if (HPT.typeOfVideo == "jpeg") {
                    canvas = $(".jpeg-area canvas")[0].getContext('2d')
                }
                else {
                    canvas = null;
                }
                var sequence = new Sequence(keys[index], {
                    'index': index,
                    'playrateDisabled' : playrateDisabled,
                    'alternate' : alternate,
                    'jpegSequence' : options.jpegSequence,
                    'video' : options.video,
                    'winSequence' : options.winSequence,
                    'failSequence' : options.failSequence,
                    'width' : width,
                    'height' : height,
                    'videoFilename' : options.videoFilename,
                    'sequenceType' : sequenceType,
                    'canvasContext' : canvas,
                    'videoContainer' : videoContainer,
                    'playComplete' : module.sequencePlayComplete,
                    'action' : options.action,
                    'messageFast': options.messageFast,
                    'messageSlow': options.messageSlow,
                    'loadProgress' : function(event) {
                        if (onProgressCallback) {
                            if (sequenceType == "jpeg") {
                                // Jpeg sequences are loaded sequentially
                                var totalProgress = module.totalProgress(event.percent, index, keys.length);
                                onProgressCallback(totalProgress);
                            }
                            else {
                                // Jplayer sequences are loaded async
                                data.sequences[keys[index]].loaded = event.percent;

                                // Total the percentage loaded
                                var totalLoaded = 0;
                                for (var key in data.sequences) {
                                    totalLoaded += data.sequences[key].loaded;
                                }
                                totalLoaded = totalLoaded / keys.length;
                                onProgressCallback(totalLoaded);
                            }
                        }
                    },
                    'loadComplete' : function() {
                        // Load the next if there is one
                        sequences[keys[currentIndex]] = sequence;

                        currentIndex++;
                        if (currentIndex < keys.length) {
                            loadNext(currentIndex);
                        }
                        else {
                            // Play the first one
                            currentIndex++;
                            if (currentIndex < keys.length) {
                                loadNext(currentIndex);
                            }
                            else {
                                // Emit the onComplete event
                                if (options.hasOwnProperty('onComplete')) {
                                    options.onComplete();
                                }
                            }

                            // Init the UI at this point
                            if (isFirstPlay && !SoundManager.isInitCalled()) {
                                SoundManager.init(HPT.typeOfBike, function() {
                                    module.setSize(canvasWidth, canvasHeight);

                                    if (onCompleteCallback) {
                                        onCompleteCallback();
                                    }
                                });
                            }
                            else {
                                module.setSize(canvasWidth, canvasHeight);

                                if (onCompleteCallback) {
                                    onCompleteCallback();
                                }
                            }
                            isFirstPlay = false;
                        }
                    },
                    'speedLimits' : options.speedLimits,
                    'advisorySpeedLimits' : options.advisorySpeedLimits
                });
            };

            loadNext(0);
        }).fail(function(e) {
            alert("Error loading JSON");
        });
    };


    module.isBrakeOnlyTest = function(){
        return module.getTestType() == 'brake-only';
    };

    module.isSpeedOnlyTest = function(){
        return module.getTestType() == 'speed-only';
    };

    module.getTestType = function() {
        return testType;
    };

    module.restart = function() {
        currentSequence = keys[0];
    };

    module.startPolling = function() {
        lastCheckTime = new Date().getTime() / 1000;
        pollTimer = setInterval(module.poll, 100);
    };

    module.stopPolling = function() {
        clearInterval(pollTimer);
    };

    module.sequencePlayComplete = function() {

        sequenceTrail.push(sequences[currentSequence]);

        var passedSequence = sequences[currentSequence].didPass();
        var choiceMade = sequences[currentSequence].didMakeChoice();
        var winSequence = sequences[currentSequence].getWinSequence();
        var failSequence = sequences[currentSequence].getFailSequence();

        if (sequences[currentSequence].hasChoice() && !choiceMade) {
                lastChoiceIgnored = true;
        }
        else if (sequences[currentSequence].hasChoice() && choiceMade) {
            lastChoiceIgnored = false;
        }

        // Set the default choice for the results page if they didn't make a choice
        if (!passedSequence && sequences[currentSequence].action && sequences[currentSequence].action.type == "choice") {
            // Set the choice to the fail choice
            if (sequences[currentSequence].action.correct == "a") {
                module.setChoice("b");
            }
            else {
                module.setChoice("a");
            }
        }

        if (passedSequence) {
            if (winSequence != null) {
                sequences[currentSequence].stop();
                sequences[winSequence].play();
                currentSequence = winSequence;

                module.emitSequenceChange();
            }
            else {
                // This is the end of the game
                if (approachSpeed == null) {
                    approachSpeed = currentSpeed;
                }
                module.endTest();
            }
        }
        else {
            // Fix up the results if they didn't make a choice
            if (!choiceMade) {
                $(".results_table .reaction_time .odometer").removeClass('fast');
                $(".results_table .reaction_time .odometer").removeClass('okay');
                $(".results_table .reaction_time .odometer").removeClass('slow');
                $(".results_table .reaction_time .odometer").addClass('fail');
            }

            if (failSequence != null) {
                sequences[currentSequence].stop();
                sequences[failSequence].play();
                currentSequence = failSequence;

                module.emitSequenceChange();
            }
            else {
                // This is the end of the game
                if (approachSpeed == null) {
                    approachSpeed = currentSpeed;
                }
                module.endTest();
            }
        }
    }

    module.getFirstSequence = function() {
        return sequences[firstSequence];
    };

    module.getSequences = function() {
        return sequences;
    };

    module.setCanvasSize = function(width, height) {
        canvasWidth = width;
        canvasHeight = height;
    };

    module.getCanvasSize = function() {
        return {
            'width' : canvasWidth,
            'height' : canvasHeight
        };
    };

    module.getSequenceType = function() {
        return sequenceType;
    };

    module.getWidth = function() {
        return width;
    };

    module.getHeight = function() {
        return height;
    };

    module.setSize = function(width, height) {
        if (keys) {
            for (var i = 0; i < keys.length; i++) {
                if (sequences.hasOwnProperty(keys[i])) {
                    sequences[keys[i]].setSize(width, height);
                }
            }
        }
    };

    module.getCurrentSequence = function() {
        return sequences[currentSequence];
    };

    /**
     * Lightweight subpub for when a sequence changes over
     */
    module.onSequenceChange = function(func) {
        sequenceChangeFuncs.push(func);
    };

    module.emitSequenceChange = function() {
        for (var i = 0; i < sequenceChangeFuncs.length; i++) {
            sequenceChangeFuncs[i]();
        }
    };

    module.totalProgress = function(percent, currentSequence, totalSequences) {
        var percentPerSequence = 1/totalSequences;
        var currentPercent = currentSequence * percentPerSequence + percent * percentPerSequence;
        return currentPercent;
    };

    module.poll = function(delta) {
        // Do the speed check
        var now = new Date().getTime() / 1000;
        var delta = now - lastCheckTime;
        if (UI.isSpeedUp()) {
            module.speedUp(delta);
        }
        else if (UI.isSlowDown() && currentSpeed > 20) {
            module.slowDown(delta);
        }

        Debug.debugSpeed(currentSpeed);

        lastCheckTime = now;

        // Do the activate buttons check (only if this sequence needs it)
        var cs = sequences[currentSequence];

        if (cs.hasOwnProperty("action") && cs.action != undefined && cs.action.hasOwnProperty('type') && cs.action.type == "choice") {
            var currentSequenceTime = cs.getCurrentPosition();
            if (!cs.hasActivatedButtons && cs.action.start < currentSequenceTime) {
                Debug.debugMessage("Choice available");
                // Tell the phone to activate the buttons
                cs.hasActivatedButtons = true;
                if (HPT.typeOfControls == "mobile" || HPT.typeOfControls == "tablet")
                    MobileControllerDesktop.outgoing.activateButtons();
            }
            if (!cs.hasDeactivatedButtons && cs.action.end < currentSequenceTime) {
                Debug.debugMessage("Choice disabled");
                cs.hasDeactivatedButtons = true;
                MobileControllerDesktop.outgoing.deactivateButtons();
            }
        }

        // This part is JUST to trigger debug stuff for the
        if (cs.hasOwnProperty("action") && cs.action != undefined && cs.action.hasOwnProperty('type') && cs.action.type == "tap-brake") {
            var currentSequenceTime = cs.getCurrentPosition();
            if (!cs.hasActivatedButtons && cs.action.start < currentSequenceTime) {
                Debug.debugMessage("Tap brake start");
                // Tell the phone to activate the buttons
                cs.hasActivatedButtons = true;
            }
        }

        if (!window.DISABLE_SPEED_LIMITS) {
            // Check if the user is over the speed limit (only if this sequence has speed limits)
            if (!sequences[currentSequence].hasSpeedLimits()) {
                Debug.debugSpeedLimit("x");
            }
            else {
                Debug.debugSpeedLimit(sequences[currentSequence].getCurrentSpeedLimit());
            }
            if (sequences[currentSequence].hasSpeedLimits() && sequences[currentSequence].isOverSpeedLimit(currentSpeed)) {
                UI.overSpeedLimit(currentSpeed);

                // Pause just the video
                sequences[currentSequence].pause();
            }

            // Advisory speed checks
            if (!sequences[currentSequence].hasAdvisorySpeedLimits()) {
                Debug.debugAdvisorySpeedLimit("x");
            }
            else {
                Debug.debugAdvisorySpeedLimit(sequences[currentSequence].getCurrentAdvisorySpeedLimit());
            }
            if (!hasShownAdvisorySpeedWarning) {
                if (sequences[currentSequence].hasAdvisorySpeedLimits() && sequences[currentSequence].isOverAdvisorySpeedLimit(currentSpeed)) {
                    UI.overAdvisorySpeedLimit(currentSpeed);
                    UI.speedControls('throttle', false);
                    UI.speedControls('brake', false);
                    module.pause();
                    hasShownAdvisorySpeedWarning = true;
                }
            }
        }
    };

    module.pause = function() {
        module.stopPolling();
        sequences[currentSequence].pause();
        SoundManager.disableSounds(true);
        UI.pause();
    };

    module.resume = function() {
        module.startPolling();
        sequences[currentSequence].resume();
        UI.resume();
        SoundManager.reenableSounds(true);
    };

    module.speedUp = function(delta) {
        // Update the current speed
        currentSpeed = currentSpeed + delta * accelerationVector;

        UI.setSpeedOverlay(currentSpeed);

        // Set the playback speed at the same ratio as the speed change
        var playRate = 1 + (currentSpeed - startingSpeed) / startingSpeed;

        // Set the current speed
        for (var i = 0; i < keys.length; i++) {
            sequences[keys[i]].setPlayRate(playRate);
        }
    };

    module.slowDown = function(delta) {
        currentSpeed = currentSpeed - delta * accelerationVector;
        UI.setSpeedOverlay(currentSpeed);

        var playRate = 1 + (currentSpeed - startingSpeed) / startingSpeed;

        for (var i = 0; i < keys.length; i++) {
            sequences[keys[i]].setPlayRate(playRate);
        }
    };

    /**
     * Cleanup after the test is finished
     */
    module.endTest = function() {
        // Figure out if we passed
        var passed = false;
        var s;
        var lastActionWasTapBrake = false;
        while (s = sequenceTrail.pop()) {
            if (s.action) {
                passed = s.passTest;
                if (s.action.type == "tap-brake") {
                    lastActionWasTapBrake = true;
                }
                break;
            }
        }

        HPT.passedCurrentTest = passed;

        SoundManager.backgroundLoopFadeOut();
        SoundManager.disableSounds(false);
        $(".bike-overlay").fadeOut("fast");
        $(Settings.videoContainerSelector).fadeOut(function() {
            $(".video-area-wrapper").hide();
            Flow.showResults(reactionTime, sequences[currentSequence], selectedChoice, approachSpeed, passed, lastChoiceIgnored, lastActionWasTapBrake);
        });
        UI.endTest();
        module.stopPolling();
        if (HPT.typeOfControls == "mobile" || HPT.typeOfControls == "tablet") {
            // TODO: Is this right?
            MobileControllerDesktop.endViewUpdateLoop();
        }
        if (HPT.typeOfControls == "onDevice") {
            OnDevice.endViewUpdateLoop();
        }
    };

    module.recordReactionTime = function() {
        reactionTime = sequences[currentSequence].getReactionTime();
    };

    /**
     * Holds onto the users selection so the summary screen can know what they chose
     */
    module.setChoice = function(choice) {
        selectedChoice = choice;
        approachSpeed = currentSpeed;
    };

    module.start = function() {

        // Reset the status of the reaction time
        reactionTime = 1;
        selectedChoice = null;
        approachSpeed = null;
        sequenceTrail = [];

        // Makes sure the bike is the right size
        UI.doResize();

        if (window.DEBUG) {
            $(".debug-messages p").remove();
            $(".debug-sockets p").remove();
        }

        UI.setSpeedOverlay(startingSpeed);
        UI.startCountDown(module.playFirstSequence);
        if (HPT.typeOfControls == "mobile" || HPT.typeOfControls == "tablet") {
            MobileControllerDesktop.startViewUpdateLoop();
        }
        if (HPT.typeOfControls == "onDevice") {
            OnDevice.startViewUpdateLoop();
        }
    };

    /**
     * Similar to SequenceManager.start, except for training loop
     */
    module.startTraining = function() {
        selectedChoice = null;
        approachSpeed = null;
        sequenceTrail = [];
        module.playFirstSequenceTraining();
    };

    module.playFirstSequence = function() {
        reactionTime = 1;
        selectedChoice = null;
        approachSpeed = null;
        sequenceTrail = [];

        if (HPT.typeOfControls == "mobile" || HPT.typeOfControls == "tablet") {
            MobileControllerDesktop.outgoing.normalize();
        }
        if (HPT.typeOfControls == "onDevice") {
            Orientation.normalize();
        }

        Analytics.fireEvent('test');
        module.setSize(canvasWidth, canvasHeight);
        module.getFirstSequence().play();
        module.startPolling();
        SoundManager.reenableSounds(true);
    };

    module.playFirstSequenceTraining = function() {
        module.setSize(canvasWidth, canvasHeight);
        module.getFirstSequence().play();
    };

    /**
     * Resets all the loaded sequences for replay
     */
    module.reset = function() {
        for (var sequence in sequences) {
            sequences[sequence].reset();
        }
        currentSpeed = startingSpeed;

        sequences[keys[0]].setOnTop();
    };

    /**
     * Called just before we load a next test, resets the internal
     * representation of a test.
     */
    module.clearSequences = function() {
        for (var i in sequences) {
            sequences[i].cleanUp();
        }
        sequences = {};
        sequenceChangeFuncs = [];
    };

    module.setupResultsObject = function() {
        HPT.results = [];
        for (var i = 0; i < Settings.tests[HPT.typeOfTest].length; i++) {
            var result = {
                'passed': false,
                'title': Settings.tests[HPT.typeOfTest][i].title,
                'approach': false,
                'reaction': false,
                'position': null,
                'testType': null
            };
            HPT.results.push(result);
        }
    };

    module.isTraining = function() {
        return isTraining;
    };

    module.setBuffering = function(isBuffering) {
        isVideoBuffering = isBuffering;
    };

    module.isBuffering = function() {
        return isVideoBuffering;
    };

}(window.SequenceManager = window.SequenceManager || {}));
