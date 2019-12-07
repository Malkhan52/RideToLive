/* eslint-disable prettier/prettier */
(function(module) {

    var targetX, targetY;
    var currentX, currentY;
    var viewUpdateLastTime;
    var viewUpdateTimer;
    var selectBlocked = false;

    module.init = function() {
        // if (Util.isAndroid()) {
        //     HPT.alternate = "small";
        // }
        if (Util.hasFlag('SIZE')) {
            var params = Util.getDetailsFromUrl();
            HPT.alternate = params['SIZE'];
        }

        Orientation.onOrientation(module.receivePositionData);
        $(".mask-div").addClass('on-device');
        $("body").addClass("on-device");

        $("#overlay .on-device .throttle").on('touchstart', function() {
            $(this).addClass("active");
            UI.speedControls('throttle', true);
        });
        $("#overlay .on-device .brake").on('touchstart', function() {
            $(this).addClass("active");
            UI.speedControls('brake', true);
        });
        $("#overlay .on-device .throttle").on('touchend', function() {
            $(this).removeClass("active");
            UI.speedControls('throttle', false);
        });
        $("#overlay .on-device .brake").on('touchend', function() {
            $(this).removeClass("active");
            UI.speedControls('brake', false);
        });

        if (Util.isAndroid()) {
            $("#overlay .mask-img").on('touchstart', module.touchMask);
        } else {
            $("#overlay .mask-div").on('touchstart', module.touchMask);
        }
    };

    module.touchMask = function(e) {
        // Figure out viewing area
        var viewingArea = UI.getViewingArea();
        var ratio = UI.getRatio();
        var width = viewingArea.width * ratio;
        var height = viewingArea.height * ratio;
        var top = viewingArea.top * ratio;
        var left = $(window).width() / 2 - (width / 2);
        top = $(window).height() / 2 - (height / 2) - top;
        var touchX = e.originalEvent.pageX || e.originalEvent.touches[0].pageX;
        var touchY = e.originalEvent.pageY || e.originalEvent.touches[0].pageY;

        if (touchX > left && touchX < left + width && touchY > top && touchY < top + height) {
            if (touchX < $(window).width() / 2) {
                // Selected a
                module.selectA();
            }
            else {
                // Selected b
                module.selectB();
            }
        }
    };

    module.selectA = function() {
        if (!selectBlocked) {
            UI.chooseA();
            selectBlocked = true;
            $(".on-device-a").addClass("active");
            setTimeout(function () {
                $(".on-device-a").removeClass("active");
            }, 10);
            setTimeout(function () {
                selectBlocked = false;
            });
        }
    };

    module.selectB = function() {
        if (!selectBlocked) {
            UI.chooseB();
            selectBlocked = true;
            $(".on-device-b").addClass("active");
            setTimeout(function () {
                $(".on-device-b").removeClass("active");
            }, 10);
            setTimeout(function () {
                selectBlocked = false;
            });
        }
    };

    module.receivePositionData = function(data) {
        var ratio = Util.dataToRatio(data);

        targetX = ratio.y;
        targetY = ratio.x;
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

}(window.OnDevice = window.OnDevice || {}));
