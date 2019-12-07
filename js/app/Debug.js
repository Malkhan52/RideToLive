(function(module){

    module.debugMessage = function(message) {
        if (window.DEBUG) {
            $(".debug-messages").append("<p>" + message + "</p>");
        }
    };

    module.debugSpeed = function(speed) {
        if (window.DEBUG) {
            speed = parseInt(speed);
            $(".debug-speed .inner").html(speed);
        }
    };

    module.debugSpeedLimit = function(speedLimit) {
        if (window.DEBUG) {
            $(".debug-speed-limit .inner").html(speedLimit);
        }
    };

    module.debugAdvisorySpeedLimit = function(advisorySpeedLimit) {
        if (window.DEBUG) {
            $(".debug-advisory-speed-limit .inner").html(advisorySpeedLimit);
        }
    };

    module.debugSockets = function(e) {
        if (window.DEBUG) {
            var outString = "";
            for (var i in e) {
                outString += i + ": " + e[i] + "<br />";
            }

            $(".debug-sockets").html(outString);
        }
    };

    module.init = function() {
        var args = Util.getDetailsFromUrl();
        if (args.hasOwnProperty("DEBUG")) {
            window.DEBUG = true;
            $("body").append("<div class='debug-messages'><div class='title'>Debug Messages</div><div class='inner'></div></div>");
            $("body").append("<div class='debug-speed'><div class='title'>Speed</div><div class='inner'></div></div>");
            $("body").append("<div class='debug-speed-limit'><div class='title'>Speed Limit</div><div class='inner'></div></div>");
            $("body").append("<div class='debug-advisory-speed-limit'><div class='title'>Advisory Speed</div><div class='inner'></div></div>");
            $("body").append("<div class='debug-sockets'><div class='title'>Socket Messages</div><div class='inner'></div></div>");
            $("body").append("<div class='debug-position'><div class='title'>Position Data</div><div class='inner'><div>a: <span class='alpha-number'></span></div><div class='alpha'></div><div>b: <span class='beta-number'></span></div><div class='beta'></div><div>g: <span class='gamma-number'></span></div><div class='gamma'></div></div></div>");
        }
        if (args.hasOwnProperty("DISABLE_SPEED_LIMITS")) {
            window.DISABLE_SPEED_LIMITS = true;
        }
        if (args.hasOwnProperty("BIKESIZE")) {
            window.BIKESIZE = true;
            $("body").append('<input type="text" class="bike-resize-ratio" placeholder="Resize Ratio" />');
            $("body").append('<input type="text" class="bike-resize-top" placeholder="Top Ratio" />');
            $("body").append('<input type="button" class="bike-do-resize" value="Apply" />');
            $("body").append('<input type="button" class="bike-resize-pause" value="Pause" />');
            $(".bike-resize-pause").click(function(){
                SequenceManager.getCurrentSequence().pause();
            });
            $(".bike-do-resize").click(function() {
                UI.doResize();
            });
        }
    };

    module.debugPosition = function(data) {
        if (window.DEBUG) {
            $('.debug-position .alpha-number').text(data.original['a']);
            $('.debug-position .beta-number').text(data.original['b']);
            $('.debug-position .gamma-number').text(data.original['g']);

            $(".debug-position .alpha").css("width", (data.original['a'] / 360) * 100 + "%");
            $(".debug-position .beta").css("width", ((data.original['b'] + 180) / 360) * 100 + "%");
            $(".debug-position .gamma").css("width", ((data.original['g'] + 90) / 180) * 100 + "%");
        }
    };

}(window.Debug = window.Debug || {}));