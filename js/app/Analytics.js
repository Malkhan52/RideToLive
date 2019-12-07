// Google Analytics Page Views
(function(module){

    module.init = function () {
        // Choose ride type
        $('.landingPage .start').on('click', function () {
            ga('send', 'pageview', '/choose-ride-type');
        });

        // Choose bike type
        $('.chooseTest td').on('click', function () {
            ga('send', 'pageview', '/' + HPT.typeOfTest + '/choose-your-bike');
        });

        // Choose controls
        $('.chooseBike td').on('click', function () {
            ga('send', 'pageview', '/' + HPT.typeOfTest + '/' + HPT.typeOfBike + '/choose-controls');
        });

        // Enter Pin
        $('.chooseControls .one, .chooseControls .two').on('click', function () {
            ga('send', 'pageview', '/' + HPT.typeOfTest + '/' + HPT.typeOfBike + '/' + HPT.typeOfControls + '/enter-pin');
        });
    };

    module.fireEvent = function (page) {
        switch (page) {
            case 'training':
                ga('send', 'pageview', '/' + HPT.typeOfTest + '/' + HPT.typeOfBike + '/' + HPT.typeOfControls + '/test/training');
                break;

            case 'intro':
                ga('send', 'pageview', '/' + HPT.typeOfTest + '/' + HPT.typeOfBike + '/' + HPT.typeOfControls + '/test/intro');
                break;

            case 'test':
                ga('send', 'pageview', '/' + HPT.typeOfTest + '/' + HPT.typeOfBike + '/' + HPT.typeOfControls + '/test/scenario' + (HPT.currentIndex + 1));
                break;

            case 'result':
                ga('send', 'pageview', '/' + HPT.typeOfTest + '/' + HPT.typeOfBike + '/' + HPT.typeOfControls + '/test/scenario' + (HPT.currentIndex + 1) + '/result');
                break;

            case 'summary':
                ga('send', 'pageview', '/' + HPT.typeOfTest + '/' + HPT.typeOfBike + '/' + HPT.typeOfControls + '/test/summary');
                break;
        };
    };

    facebookLikeTracking = function() {
        var counter = arguments[0] || 0;
        if (typeof FB === 'undefined' && counter < 20) {
            counter++;
            setTimeout(function() {
                facebookLikeTracking(counter);
            }, 200);
        } else if (typeof FB !== 'undefined') {

            FB.Event.subscribe('edge.create', function(targetUrl) {
                ga('send', 'social', 'facebook', 'like', targetUrl);
            });

            FB.Event.subscribe('edge.remove', function(targetUrl) {
                ga('send', 'social', 'facebook', 'unlike', targetUrl);
            });

            FB.Event.subscribe('message.send', function(targetUrl) {
                ga('send', 'social', 'facebook', 'send', targetUrl);
            });
        }
    };
    twitterTweetsTracking = function() {
        var counter = arguments[0] || 0;
        if (typeof twttr === 'undefined' && counter < 20) {
            counter++;
            setTimeout(function() {
                twitterTweetsTracking(counter);
            }, 200);
        } else if (typeof twttr !== 'undefined') {

            function trackTwitter(intent_event) {

                function extractParamFromUri(uri, paramName) {
                    if (!uri) {
                        return;
                    }
                    var regex = new RegExp('[\\?&#]' + paramName + '=([^&#]*)');
                    var params = regex.exec(uri);
                    if (params != null) {
                        return unescape(params[1]);
                    }
                    return;
                }

                if (intent_event) {
                    var opt_pagePath = location.href;
                    if (intent_event.target && intent_event.target.nodeName == 'IFRAME') {
                        opt_target = extractParamFromUri(intent_event.target.src, 'url');
                    }
                    ga('send', 'social', 'twitter', 'tweet', opt_pagePath);
                }
            }

            //Wrap event bindings - Wait for async js to load
            twttr.ready(function(twttr) {
                //event bindings
                twttr.events.bind('tweet', trackTwitter);
            });
        }
    };

    twitterTweetsTracking();
    facebookLikeTracking();

}(window.Analytics = window.Analytics || {}));