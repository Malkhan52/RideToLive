(function(module){

    module.numDataReceived = 0;

    var syncId;
    var isSynced = false;
    var socket;

    var numPings;
    var receivedPings;
    var pingTimes;
    var pingComplete;
    var pingStart;
    var normalizedOffsets = {
        x: 0,
        y: 0,
        z: 0
    };

    var onSyncCallback = false;
    var onIdCallback = false;
    var onDataCallback = false;

    var targetX, targetY;
    var currentX, currentY;
    var viewUpdateTimer;
    var viewUpdateLastTime;

    /**
     * options.onData       A function that executes when the phone sends
     * options.onSync       Function gets called on initial sync
     * options.onId         A function to call when the browser gets the sync id options.onId(id)
     */
    module.init = function(options) {
        localStorage.debug='*';
        if (options) {
            if (options.hasOwnProperty('onSync')) {
                onSyncCallback = options.onSync;
            }
            if (options.hasOwnProperty('onId')) {
                onIdCallback = options.onId;
            }
            if (options.hasOwnProperty('onData')) {
                onDataCallback = options.onData;
            }
        }

        // Ask the server for a number and store it
        socket = io.connect(Settings.socketServer, {'transports': ['websocket', 'polling']});
        window.socket = socket;

        if (socket) {
            socket.on('connect', function() {
                if (!syncId) {
                    // This is the first connect
                    socket.emit('giveMeAnId');
                }
                else {
                    // Replay the id back to the server (this isn't the first sync)
                    module.incoming.heresAnId(syncId);
                }
            });
            socket.on('disconnect', function() {
                //alert("disconnected");
            });

            socket.on('test', function(){alert("received test")});

            socket.on('heresAnId', module.incoming.heresAnId);
            socket.on('positionData', module.incoming.receivePositionData);
            socket.on('synced', module.incoming.synced);
            socket.on('pong', module.incoming.pingReceive);
            socket.on('normalize', module.incoming.normalize);
            socket.on('brakeStart', module.incoming.brakeStart);
            socket.on('brakeEnd', module.incoming.brakeEnd);
            socket.on('throttleStart', module.incoming.throttleStart);
            socket.on('throttleEnd', module.incoming.throttleEnd);
            socket.on('selectA', module.incoming.selectA);
            socket.on('selectB', module.incoming.selectB);
        }
    };

    /**
     * Kill the socket for ever, called when we decide we want mouse
     * controls instead of phone controls
     */
    module.disconnectSocket = function () {
        if (socket) {
            socket.disconnect();
        }
    };

    module.startViewUpdateLoop = function() {
        viewUpdateLastTime = new Date().getTime() / 1000;
        viewUpdateTimer = setInterval(function() {
            var now = new Date().getTime() / 1000;
            module.update(now - viewUpdateLastTime);
            viewUpdateLastTime = now;
        }, 1000/30);
    };

    module.endViewUpdateLoop = function() {
        clearInterval(viewUpdateTimer);
    };

    /**
     * Used to tween the view to its target position
     */
    module.update = function(delta) {
        if (targetX) {
            if (!currentX) {
                currentX = targetX;
                currentY = targetY;
                UI.setViewPosition(currentX, currentY);
            }
            else {
                currentX = (targetX - currentX) / 2 + currentX;
                currentY = (targetY - currentY) / 2 + currentY;
                UI.setViewPosition(currentX, currentY);
            }
        }
    };

    /**
     * Run a ping test with a particular number of pings
     *
     * - onComplete             A function that takes a single parameter, average time
     */
    module.pingTest = function(n, onComplete) {
        numPings = n;
        receivedPings = 0;
        pingTimes = [];
        pingComplete = onComplete;

        for (var i = 0; i < numPings; i++) {
            setTimeout(module.outgoing.pingSend, i * 200);
        }
    };

    module.incoming = {
        'heresAnId': function(data) {
            syncId = data.id;

            if (onIdCallback) {
                onIdCallback(data.id);
            }

            // Send a confirmation back
            if (socket) {
                socket.emit('confirmId', {confirmId : syncId });
            }
        },
        'synced': function() {
            $("#content").hide();
            $(".video-area").show();
            $(".video-area-wrapper").show();
            $("#instructionBar").removeAttr('class').addClass('show closeOnly');

            if (onSyncCallback) onSyncCallback();
            isSynced = true;

            /**
             * ENTRY POINT TO THE SEQUENCE
             */
            HPT.typeOfControls = 'mobile';
            HPT.typeOfVideo = 'html';
            App.loadAndPlayTest(HPT.typeOfControls, HPT.typeOfVideo, HPT.typeOfTest, HPT.currentIndex);
        },
        'pingReceive': function(data) {
            receivedPings++;
            var now = new Date().getTime() / 1000;
            pingTimes.push(now - data.start);
            if (receivedPings >= numPings) {
                var runningTotal = 0;
                for (var i = 0; i < pingTimes.length; i++) {
                    runningTotal += pingTimes[i];
                }
                var avgTime = runningTotal/pingTimes.length;
                pingComplete(avgTime);
            }
        },
        'receivePositionData': function(data) {
            module.numDataReceived++;
            Debug.debugPosition(data);

            var ratio = Util.dataToRatio(data);

            targetX = ratio.y;
            targetY = ratio.x;
        },
        'normalize': function(data) {
            data.y = parseInt(data.y);

            normalizedOffsets = {
                x: 0, //data.x,
                y: data.y,
                z: 0 // data.z
            };
        },
        'brakeStart': function() {
            UI.speedControls('brake', true);
        },
        'brakeEnd': function() {
            UI.speedControls('brake', false);
        },
        'throttleStart': function() {
            UI.speedControls('throttle', true);
        },
        'throttleEnd': function() {
            UI.speedControls('throttle', false);
        },
        'selectA': function() {
            UI.chooseA();
        },
        'selectB': function() {
            UI.chooseB();
        },
        'pingSend': function() {
            pingStart = new Date().getTime() / 1000;
            if (socket) {
                socket.emit('ping', {
                    'start' : pingStart
                });
            }
        }
    };

    module.outgoing = {
        'deactivateButtons': function() {
            if (socket) {
                socket.emit('deactivateButtons');
            }
        },
        'activateButtons': function() {
            if (socket) {
                socket.emit('activateButtons');
            }
        },
        'sendSMS':function(phoneNumber, syncId) {
            if (socket) {
                socket.emit('sendSMS', {
                    phoneNumber: phoneNumber,
                    syncId: syncId
                });
            }
        },
        'normalize': function() {
            if (socket) {
                socket.emit('normalizePhone');
            }
        }
    };

}(window.MobileControllerDesktop = window.MobileControllerDesktop || {}));