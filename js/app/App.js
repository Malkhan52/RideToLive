/* eslint-disable no-undef */
(function(module) {
  var isFirstVideo = true;

  /**
   * This is the main init function
   */
  module.init = function() {
    // Figure out what the suffix for
    HPT.jPlayerSuffix = "-mid";
    // HPT.downloadSpeed = parseInt(purl().param("s"));
    HPT.downloadSpeed = 10023;

    if (HPT.downloadSpeed > 300) {
      HPT.jPlayerSuffix = "";
    } else if (HPT.downloadSpeed > 140) {
      HPT.jPlayerSuffix = "-mid";
    } else {
      HPT.jPlayerSuffix = "-small";
    }
    //console.log(HPT.jPlayerSuffix);

    // Make sure if they're on IE8 that they have flash installed
    if (Util.isIE8() && !Util.hasFlash()) {
      Onboarding.showModal("flash_required");
    }

    Flow.init();

    // Unsupported device notification handler
    if (Util.isMobile()) {
      var supportedDevices = [
        "iPad4", // iPad Air
        "iPhone5", // iPhone 5
        "iPhone6", // iPhone 5s
        "iPhone OS 6",
        "iPhone OS 7",
        "iPhone OS 8",
        "iPhone OS 9",
        "iPhone OS 10",
        "iPhone OS 11",
        "iPad; CPU OS 6",
        "iPad; CPU OS 7",
        "iPad; CPU OS 8",
        "iPad; CPU OS 9",
        "iPad; CPU OS 10",
        "iPad; CPU OS 11",
        "GT-I9505", // Samsung S4
        "SM-G900[A-Z]",
        "SCL23",
        "SC-04F",
        "SM-G900FQ",
        "SM-G92", // Samsung S5
        "C6903",
        "C6902/L39h",
        "C6906",
        "C6916",
        "C6943",
        "L39t",
        "SO-01F",
        "SOL23", // Z1
        "D6502",
        "D6503",
        "D6543",
        "SO-03F", // Z2
        "D6603",
        "D6633",
        "D6643",
        "D6653",
        "D6616",
        "D6708",
        "SO-01G",
        "SOL26",
        "L55t",
        "L55u" // Z3
      ];

      var re = new RegExp(supportedDevices.join("|"), "i");

      // Show iphone orientation message.
      if (
        Util.isIOS() &&
        window.localStorage.getItem("iphone_motion_warning") !== "done"
      ) {
        window.localStorage.setItem("iphone_motion_warning", "done");
        Onboarding.showModal("iphone_motion_orientation_notification");
      } else if (!re.test(navigator.userAgent)) {
        // Onboarding.showModal('unsupported_notification');
        $('[data-action="devices_notification"]')
          .find(".close")
          .hide();
        $('[data-action="devices_notification"]')
          .find('[data-action="hide_modal"]')
          .hide();
        $('[data-action="devices_notification"]')
          .find('[data-action="exit_test"]')
          .addClass("yellow");
        //$('[data-action="devices_notification"] .title').html('<p>' + navigator.userAgent + '</p>');
      }

      // Check if the user is on android and not chrome
      else if (Util.isAndroid() && !Util.isChrome()) {
        alert(
          "For the best experience on an Android device, you should use Chrome for Android."
        );
      }

      // Check if they're iphone and < 5
      // else if ((Util.isIPhone() && Util.isLessThan5()) || Util.isMobile()) {
      //   Onboarding.showModal("wifi_notification");
      // }
    }

    (function($) {
      $(this).bind("touchstart", function preventZoom(e) {
        var t2 = e.timeStamp,
          t1 = $(this).data("lastTouch") || t2,
          dt = t2 - t1,
          fingers = e.originalEvent.touches.length;
        $(this).data("lastTouch", t2);
        if (!dt || dt > 500 || fingers > 1) return; // not double-tap

        if (Util.isIPhone()) e.preventDefault(); // double tap - prevent the zoom
        // also synthesize click events we just swallowed up
        $(this)
          .trigger("click")
          .trigger("click");
      });
    })(jQuery);
  };

  /**
   * @param then - Function to call when training is finished
   */
  module.showTraining = function(then) {
    // Fire training page view event
    Analytics.fireEvent("training");

    $("#content").fadeOut("slow", function() {
      Training.showAndPlayTraining(HPT.typeOfControls, then);
    });
  };

  /**
   * This is the VERY main entry point to loading and playing a test (duh)
   * @param deviceType        - One of mobile, tablet, desktop, onDevice (HPT.typeOfControls)
   * @param videoType         - One of jpeg, html, flash (HPT.typeOfVideo)
   * @param scenarioType      - One of commuter, recreational (HPT.typeOfTest)
   * @param index             - The index of the test in Settings.tests (HPT.currentIndex)
   * @param playrateDisabled  - Disable play rate for browsers that can do video, but suck at setting play rate
   */
  module.loadAndPlayTest = function(
    deviceType,
    videoType,
    scenarioType,
    index,
    playrateDisabled
  ) {
    // Setting up the progress circle and current test title
    $(".progressCircle .text").html(
      Settings.tests[scenarioType][index]["title"].toUpperCase()
    );
    $(".test-name").html(
      Settings.tests[scenarioType][index]["title"].toUpperCase()
    );
    $(".test-name-title").html(
      Settings.tests[scenarioType][index]["summary_title"].toUpperCase()
    );
    $(".on-device-test-name-title").html(
      Settings.tests[scenarioType][index]["summary_title"].toUpperCase()
    );
    if (Util.isMobile()) {
      $(".test-name-title").hide();
    }
    $("#overlay .on-device .metric").hide();
    $(".progressCircle .circle_sprite").removeClass(
      "one two three four five six"
    );
    switch (index) {
      case 0:
        $(".progressCircle .circle_sprite").addClass("one");
        break;
      case 1:
        $(".progressCircle .circle_sprite").addClass("two");
        break;
      case 2:
        $(".progressCircle .circle_sprite").addClass("three");
        break;
      case 3:
        $(".progressCircle .circle_sprite").addClass("four");
        break;
      case 4:
        $(".progressCircle .circle_sprite").addClass("five");
        break;
      case 5:
        $(".progressCircle .circle_sprite").addClass("six");
        break;
      default:
        $(".progressCircle .circle_sprite").addClass("one");
        break;
    }
    if (scenarioType == "commuter") {
      $(".circle_sprite").addClass("six_divisions");
      $(".circle_sprite").removeClass("five_divisions");
    }

    UI.initBikeChanger(HPT.typeOfBike);

    $("#content").hide();
    $(".bike-overlay").show();

    if (isFirstVideo) {
      UI.init(HPT.typeOfControls, videoType);
    }

    UI.doResize();
    UI.showLoader();

    var jsonURL = Settings.tests[scenarioType][index]["filename"];
    var canvas;
    if (HPT.typeOfTest == "jpeg" && Util.isMobile()) {
      canvas = $("canvas.main")[0].getContext("2d");
    } else {
      canvas = null;
    }
    SequenceManager.loadTest(jsonURL, {
      onProgress: function(event) {
        UI.setLoadedPercent(Math.floor(event * 100) + "%");
      },
      onComplete: function() {
        if ($("body").hasClass("on-device")) {
          UI.scrollTop();
        }
        // Use SequenceManager to play
        SequenceManager.start();
      },
      videoContainer: Settings.jplayerContainerSelector,
      canvasContext: canvas,
      type: deviceType,
      playrateDisabled: playrateDisabled
    });

    isFirstVideo = false;

    $("#overlay").fadeIn("slow", function() {
      $("body").addClass("showing-video");
      $(".video-area-wrapper").show();
      $(".video-area").fadeIn("slow");
    });
  };

  module.nextVideo = function() {
    // Properly destroy the videos, this might help with php server issues
    var $videos = $(".jplayer-area video");
    for (var i = 0; i < $videos.length; i++) {
      $videos[i].src = "";
      $videos[i].load();
      //delete($videos[i]);
    }

    // Clear the current sequences
    $(".jplayer-area").html("");
    SequenceManager.clearSequences();

    // Make sure there is another sequence in this list
    HPT.currentIndex++;
    if (HPT.currentIndex >= Settings.tests[HPT.typeOfTest].length) {
      throw "Trying to load a test outside the list of tests available in Settings.tests";
    }

    // Do the load and play
    module.loadAndPlayTest(
      HPT.typeOfControls,
      HPT.typeOfVideo,
      HPT.typeOfTest,
      HPT.currentIndex
    );

    // Show the overlay stuff
    UI.unhideMask();
  };
})((window.App = window.App || {}));
