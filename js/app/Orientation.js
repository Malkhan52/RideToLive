(function(module) {

    var PHONETYPES = {
        'ANDROID': 0,
        'IOS': 1,
        'OTHER': 2
    };
    var phoneType;
    var orientationListeners = [];
    var rawAlpha;
    var normalizedAlpha;
    var alphaOffset = 0;
    var receivedFirstOrientation = false;
    var clickToggle = false;
    var orientation;

    var originalOrientation = orientation = screen.orientation || screen.mozOrientation || screen.msOrientation || window.orientation;

    module.flip = function() {
        if (originalOrientation == 0 || originalOrientation == 180 || originalOrientation == -180) {
            location.reload();
        }
    };

    module.init = function() {
        // Get the phones type
        if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) {
            phoneType = PHONETYPES.IOS;
        }
        else if (/Android/i.test(navigator.userAgent)) {
            phoneType = PHONETYPES.ANDROID;
        }
        else {
            phoneType = PHONETYPES.OTHER;
        }

        orientation = screen.orientation || screen.mozOrientation || screen.msOrientation || window.orientation;

        // Set up the listener
        window.addEventListener('deviceorientation', function(e) {
            var orientation = screen.orientation || screen.mozOrientation || screen.msOrientation || window.orientation;

            // Deal with the click over issue
            if (phoneType == PHONETYPES.ANDROID && rawAlpha) {
                var difference = Math.abs(rawAlpha - e.alpha);
                if (difference > 120 && difference < 240) {
                    clickToggle = !clickToggle;
                }
            }

            var gamma;
            if (orientation == 90) {
                gamma = -e.gamma;
            }
            else {
                gamma = e.gamma;
            }

            for (var i = 0; i < orientationListeners.length; i++) {
                rawAlpha = e.alpha;

                var click = (clickToggle) ? 180 : 0;
                normalizedAlpha = (rawAlpha - alphaOffset + 360 + click) % 360;

                orientationListeners[i]({alpha: normalizedAlpha, gamma: gamma, raw: rawAlpha, offset: alphaOffset});
            }

            if (!receivedFirstOrientation) {
                setTimeout(module.normalize, 500);
                receivedFirstOrientation = true;
            }
        });
    };

    module.normalize = function() {
        alphaOffset = rawAlpha;
    };

    module.onOrientation = function(func) {
        orientationListeners.push(func);
    };

    module.isValidDevice = function() {
        // TODO: Check if their device is good
    };

}(window.Orientation = window.Orientation || {}));