/* eslint-disable prettier/prettier */
(function(module){

    /**
     * Sums the contents of an array
     * @param array
     */
    module.sumArray = function(array) {
        var total = 0;
        for (var i = 0; i < array.length; i++) {
            total += array[i];
        }
        return total;
    };

    module.getZeros = function(numZeros) {
        var zeros = "";
        for (var i = 0; i < numZeros; i++) {
            zeros = zeros + "0";
        }
        return zeros;
    };

    module.isFunction = function(func) {
        var getType = {};
        return func && getType.toString.call(func) === '[object Function]';
    };

    module.getDetailsFromUrl = function() {
        var url = purl(window.location.href);
        var frags = url.attr("query").split("&");
        var args = {};
        for (var i = 0; i < frags.length; i++) {
            var kv = frags[i].split("=");
            args[kv[0]] = kv[1];
        }
        return args;
    };

    module.hasFlag = function(flag) {
        if (module.getDetailsFromUrl().hasOwnProperty(flag)) {
            return true;
        }
        else {
            return false;
        }
    };

    module.isMobile = function() {
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            return true;
        }
        else {
            return false;
        }
    };

    module.getQuery = function() {
        var url = purl(window.location.href);
        var query = url.attr('query');
        var path = url.attr('path');
        if (path == "/hpt/connect.php") {
            return query;
        }
        else {
            return path.replace(/\//g, '');
        }
    };

    /**
     * Takes the phone gyro data and turns it into ratios for UI.js
     */
    module.dataToRatio = function(data) {
        var y;
        var yRatio;
        //data.alpha = data.alpha || data.original.a;
        //data.gamma = data.gamma || data.original.g;

        if (data.alpha < 180) {
            // Looking left
            if (data.alpha > 30) {
                y = 1;
            }
            else {
                y = data.alpha / 30;
            }
            yRatio = (1 - y)*0.5;
        }
        else {
            // Looking right
            var tempY = 360 - data.alpha;
                if (tempY > 30) {
                    y = 1
            }
            else {
                y = tempY /30;
            }
            yRatio = 0.5 + (y * 0.5);
        }

        var tempX;
        if (data.gamma > 90) {
            tempX = 90;
        }
        else if (data.gamma < 0) {
            tempX = 90;
        }
        else if (data.gamma >= 0 && data.gamma < 40) {
            tempX = 40;
        }
        else {
            tempX = data.gamma;
        }

        var x;

        x = 1 - ((tempX - 40) / 50);

        //if (data.x < 0) data.x = 0;
        //if (data.x > 70) data.x = 70;
        //
        //x = data.x / 70;

        //return {x: x, y: yRatio};
        return {x: x, y: yRatio};
    };

    module.isIPhone = function() {
        if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
            return true;
        }
        else {
            return false;
        }
    };

    module.isIOS = function() {
        if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPad/i)) || (navigator.userAgent.match(/iPod/i))) {
            return true;
        }
        else {
            return false;
        }
    };

    module.isAndroid = function() {
        var ua = navigator.userAgent.toLowerCase();
        var isAndroid = ua.indexOf("android") > -1;
        return isAndroid;
    };

    module.isChrome = function() {
        var ua = navigator.userAgent.toLowerCase();
        var isChrome = ua.indexOf("chrome") > -1;
        return isChrome;
    };

    /**
     * Tries to figure out the iphone version by window.screen.height
     */
    module.isLessThan5 = function() {
        return (window.screen.height < 568);
    };

    module.popupWindow = function (url, title, w, h) {
        var left = (screen.width / 2) - (w / 2);
        var top = (screen.height / 2) - (h / 2);
        return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
    };

    module.isIE8 = function() {
        return !document.addEventListener;
    };

    module.isIE = function() {
        return /*@cc_on!@*/false || !!document.documentMode;
    };

    module.isSafari = function() {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    };

    module.isFirefox = function() {
        return typeof InstallTrigger !== 'undefined';
    };

    module.isOpera = function() {
        return !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    };

    module.hasFlash = function() {
        return swfobject.hasFlashPlayerVersion("9.0.18");
    };

    module.validateEmail = function (email) {
        var emailRegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return emailRegExp.test(email);
    };

}(window.Util = window.Util || {}));
