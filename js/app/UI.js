/* eslint-disable prettier/prettier */
/**
 * This file handles stuff like setting up the visor, moving
 * the canvas around in response to the mouse location. Also handles
 * changes to screensize and dealing with changing everything on
 * the screen.
 */
(function(module, $) {
  var mouseX, mouseY;
  var canvasWidth, canvasHeight;
  var screenWidth, screenHeight;
  var maskCurrentWidth, maskCurrentHeight;
  var $overlay;
  var resizeTimeout;
  var isSpeedUp = false;
  var isSlowDown = false;
  var isAnimatingSelection = false;
  var isPaused = false;
  var videoType;
  var isShowingSpeedo = false;
  var currentViewPosition = { x: 0.5, y: 0.5 };
  var isResizeBound = false;

  // NEW RESIZE FUNCTIONALITY
  var resizeBox = { width: 1595, height: 909 }; // This is the size of the invisible box that surrounds the mask and the UI elements, if the window is less than this we need to resize everything
  var viewingArea = { width: 1255, height: 555, top: 47 }; // This is the area of the mask & it's position from the center
  var maskImageFullSize = { width: 3200, height: 2000 }; // The size of the mask overlay image itself
  var maskSizeRatio;

  var speedQueue = [];

  // We need to not allow the speedo to be toggled between speed and progress when we're loading a scenario
  var canToggleSpeedo = false;

  // Should be one of progress/speedo
  var speedoState = "progress";

  /**
   * Puts the visor on the screen, position the canvas initially
   */
  module.setupScreen = function() {};

  module.mouseMove = function(e) {
    mouseX = e.pageX;
    mouseY = e.pageY;

    module.setViewPosition(mouseX / screenWidth, mouseY / screenHeight);
  };

  /**
   * Move the canvas depending on the position of the mouse
   * @param dt - Delta time
   */
  module.update = function(dt) {
    // Get the current mouse position and shuffle around the canvas depending on the size of the screen
    var dx = mouseX / screenWidth;
    var dy = mouseY / screenHeight;
  };

  module.doResize = function(then) {
    if (resizeTimeout != null) {
      clearTimeout(resizeTimeout);
    }

    resizeTimeout = setTimeout(function() {
      var currentImageWidth, currentImageHeight;
      screenWidth = $(window).width();
      screenHeight = $(window).height();

      // Set the size of the mask
      if (screenWidth > resizeBox.width && screenHeight > resizeBox.height) {
        maskSizeRatio = 1;
      } else if (
        screenWidth / screenHeight >
        resizeBox.width / resizeBox.height
      ) {
        maskSizeRatio = screenHeight / resizeBox.height;
      } else {
        maskSizeRatio = screenWidth / resizeBox.width;
      }
      // Set a max ratio for widescreens say above 1400px.
      if (maskSizeRatio >= 0.88) {
        maskSizeRatio = 0.88;
      }

      // Set the size of the overlay (and position)
      var maskImageCurrentSize = {
        width: maskSizeRatio * maskImageFullSize.width,
        height: maskSizeRatio * maskImageFullSize.height
      };
      maskCurrentWidth = maskSizeRatio * viewingArea.width;
      maskCurrentHeight = maskSizeRatio * viewingArea.height;

      if (videoType == "jpeg") {
        $overlay.css(
          "background-size",
          maskImageCurrentSize.width +
            "px " +
            maskImageCurrentSize.height +
            "px"
        );
        $overlay.css(
          "background-position",
          -(maskImageCurrentSize.width / 2 - screenWidth / 2) +
            "px " +
            -(maskImageCurrentSize.height / 2 - screenHeight / 2) +
            "px"
        );
        $overlay.css("width", screenWidth + "px");
        $overlay.css("height", screenHeight + "px");
      } else {
        $overlay.css("width", maskImageCurrentSize.width + "px");
        $overlay.css("height", maskImageCurrentSize.height + "px");
        $overlay.css(
          "left",
          0 - (maskImageCurrentSize.width / 2 - screenWidth / 2) + "px"
        );
        $overlay.css(
          "top",
          0 - (maskImageCurrentSize.height / 2 - screenHeight / 2) + "px"
        );
      }

      canvasWidth = viewingArea.width * maskSizeRatio * Settings.zoomFactor;
      canvasHeight =
        (canvasWidth / Settings.videoOriginalSize.width) *
        Settings.videoOriginalSize.height;

      SequenceManager.setSize(canvasWidth, canvasHeight);

      if (videoType == "jpeg") {
        $(Settings.jpegCanvasSelector).attr("width", canvasWidth);
        $(Settings.jpegCanvasSelector).attr("height", canvasHeight);
      } else {
        $(Settings.jplayerContainerSelector).jPlayer("width", canvasWidth);
        $(Settings.jplayerContainerSelector).jPlayer("height", canvasHeight);
      }

      SequenceManager.setCanvasSize(canvasWidth, canvasHeight);

      resizeTimeout = null;

      if (HPT.typeOfControls == "onDevice") {
        module.setViewPosition(currentViewPosition.x, currentViewPosition.y);
      } else {
        module.setViewPosition(mouseX / screenWidth, mouseY / screenHeight);
      }

      var bikeWidth =
        Settings.bikes[HPT.typeOfTest][HPT.typeOfBike]["original-size"].width *
        maskSizeRatio;
      var bikeHeight =
        Settings.bikes[HPT.typeOfTest][HPT.typeOfBike]["original-size"].height *
        maskSizeRatio;

      var bikeTopOffset = 0;
      if (window.BIKESIZE) {
        var bikeResizeRatio = parseFloat($(".bike-resize-ratio").val());
        if (!isNaN(bikeResizeRatio)) {
          alert("bikeRaio");
          bikeWidth *= bikeResizeRatio;
          bikeHeight *= bikeResizeRatio;
        }
        var bikeResizeTop = parseFloat($(".bike-resize-top").val());
        if (!isNaN(bikeResizeTop)) {
          alert("bike top");
          bikeTopOffset = bikeHeight * bikeResizeTop;
        }
      }

      $(".bike-overlay .bike-etched").css("width", bikeWidth + "px");
      $(".bike-overlay .bike-etched").css("height", bikeHeight + "px");

      var bikeLeft = canvasWidth / 2 - bikeWidth / 2;
      var bikeTop = canvasHeight - bikeHeight + bikeTopOffset;
      $(".bike-overlay .bike-etched").css("left", bikeLeft + "px");
      $(".bike-overlay .bike-etched").css("top", bikeTop + "px");

      var rearViewLeftWidth =
        maskSizeRatio *
        Settings.bikes[HPT.typeOfTest][HPT.typeOfBike]["rear-left"].width;
      var rearViewLeftHeight =
        maskSizeRatio *
        Settings.bikes[HPT.typeOfTest][HPT.typeOfBike]["rear-left"].height;
      var rearViewLeftLeft =
        maskSizeRatio *
          Settings.bikes[HPT.typeOfTest][HPT.typeOfBike]["rear-left"].left +
        bikeLeft;
      var rearViewLeftTop =
        maskSizeRatio *
          Settings.bikes[HPT.typeOfTest][HPT.typeOfBike]["rear-left"].top +
        bikeTop;
      $(".bike-overlay .left").css("width", rearViewLeftWidth + "px");
      $(".bike-overlay .left").css("height", rearViewLeftHeight + "px");
      $(".bike-overlay .left").css("left", rearViewLeftLeft + "px");
      $(".bike-overlay .left").css("top", rearViewLeftTop + "px");

      var rearViewRightWidth =
        maskSizeRatio *
        Settings.bikes[HPT.typeOfTest][HPT.typeOfBike]["rear-right"].width;
      var rearViewRightHeight =
        maskSizeRatio *
        Settings.bikes[HPT.typeOfTest][HPT.typeOfBike]["rear-right"].height;
      var rearViewRightLeft =
        maskSizeRatio *
          Settings.bikes[HPT.typeOfTest][HPT.typeOfBike]["rear-right"].left +
        bikeLeft;
      var rearViewRightTop =
        maskSizeRatio *
          Settings.bikes[HPT.typeOfTest][HPT.typeOfBike]["rear-right"].top +
        bikeTop;
      $(".bike-overlay .right").css("width", rearViewRightWidth + "px");
      $(".bike-overlay .right").css("height", rearViewRightHeight + "px");
      $(".bike-overlay .right").css("left", rearViewRightLeft + "px");
      $(".bike-overlay .right").css("top", rearViewRightTop + "px");

      // Position the speedo
      $("#overlay .player").css(
        "left",
        $(window).width() / 2 - $("#overlay .player").width() / 2 + "px"
      );
      var h = Settings.speedoOriginalSize.height;
      $("#overlay .player").css(
        "top",
        $(window).height() / 2 +
          155 * maskSizeRatio -
          (h - h * maskSizeRatio) / 2 +
          "px"
      );
      $("#overlay .player").css("transform", "scale(" + maskSizeRatio + ")");

      // Resize the overlay indicators
      var ratio, leftA, topA, leftB, topB, width, height;
      if (videoType == "jpeg") {
        width = Math.floor(maskSizeRatio * Settings.blinkerOriginalSize.width);
        height = Math.floor(
          maskSizeRatio * Settings.blinkerOriginalSize.height
        );

        leftA =
          $(window).width() / 2 -
          Settings.blinkerRelativeToCenter.left * maskSizeRatio;
        leftB =
          $(window).width() / 2 +
          Settings.blinkerRelativeToCenter.right * maskSizeRatio;

        topA = topB =
          $(window).height() / 2 -
          (Settings.blinkerOriginalSize.height * maskSizeRatio) / 2;
      } else {
        width = Math.floor(maskSizeRatio * Settings.blinkerOriginalSize.width);
        height = Math.floor(
          maskSizeRatio * Settings.blinkerOriginalSize.height
        );

        leftA =
          maskSizeRatio * Settings.blinkerAOriginalPosition.left +
          $overlay.position().left;
        topA =
          maskSizeRatio * Settings.blinkerAOriginalPosition.top +
          $overlay.position().top;

        leftB =
          maskSizeRatio * Settings.blinkerBOriginalPosition.left +
          $overlay.position().left;
        topB =
          maskSizeRatio * Settings.blinkerBOriginalPosition.top +
          $overlay.position().top;
      }
      $(".indicator").css("width", width);
      $(".indicator").css("height", height);
      $(".a-select-indicator").css("left", leftA + "px");
      $(".a-select-indicator").css("top", topA + "px");
      $(".b-select-indicator").css("left", leftB + "px");
      $(".b-select-indicator").css("top", topB + "px");

      module.resizeTrainingHUD(maskSizeRatio);

      // Perform the thing we want to do after a resize (because of timers)
      if (then && Util.isFunction(then)) {
        then();
      }
    }, 75);
  };

  /**
   * Takes numbers between 0 & 1 for x & y, moves the canvas to the corresponding position
   */
  module.setViewPosition = function(x, y) {
    if (!isPaused) {
      // Get the max that the canvas can move on the x
      var maxX = canvasWidth - maskSizeRatio * viewingArea.width;
      // Max the canvas can move on the y
      var maxY = canvasHeight - maskSizeRatio * viewingArea.height;

      var leftOffset =
        screenWidth / 2 - (maskSizeRatio * viewingArea.width) / 2;
      var topOffset =
        screenHeight / 2 -
        (maskSizeRatio * viewingArea.height) / 2 -
        viewingArea.top * maskSizeRatio;

      $(Settings.videoContainerSelector).css(
        "left",
        -maxX * x + leftOffset + "px"
      );
      $(Settings.videoContainerSelector).css(
        "top",
        -maxY * y + topOffset + "px"
      );

      if (y > 0.7 && !isShowingSpeedo) {
        // Show speedo
        module.showSpeedo();
        isShowingSpeedo = true;
      } else if (y < 0.7 && isShowingSpeedo) {
        // Hide speedo
        module.showProgress();
        isShowingSpeedo = false;
      }
    }
  };

  module.initForTraining = function(vType) {
    videoType = vType;
    screenWidth = $(window).width();
    screenHeight = $(window).height();
    // Different overlays for different sequence types
    if (videoType == "jpeg") {
      // This needs to be a div with background image
      $overlay = $(".mask-div");
      $overlay.css("display", "block");
    } else {
      // This needs to be an img, no background-size in ie
      $overlay = $(".mask-img");
      $overlay.css("display", "block");
    }
    //$("#overlay").css("display", "block");

    // Initial resize
    module.doResize(function() {
      module.setViewPosition(0.5, 0.5);
    });

    // Handle browser resizes
    if (!isResizeBound) {
      $(window).resize(module.doResize);
      isResizeBound = true;
    }

    //$('body').mousemove(module.mouseMove);
  };

  /**
   * deviceType           The control type they've chosen, should be one of: mobile, tablet, desktop, onDevice{
   * vType                The video type, jpeg or html
   */
  module.init = function(deviceType, vType) {
    // Change the values for resizing if we're on device
    if (HPT.typeOfControls == "onDevice") {
      resizeBox = { width: 1325, height: 883 };
      viewingArea = { width: 1325, height: 664, top: 109 };
    }

    videoType = vType;
    // Bind the mute button
    $(".soundToggle").on("click", function() {
      SoundManager.muteToggle();
    });

    // Add the bike overlay
    $(".bike-overlay").append(
      "<img src='" +
        Settings.bikes[HPT.typeOfTest][HPT.typeOfBike].filename +
        "' class='bike-etched' />"
    );
    //$(".bike-overlay").append("<img src='" + Settings.bikes[HPT.typeOfTest][HPT.typeOfBike]['rear-left'].filename + "' class='rear-view left' />");
    //$(".bike-overlay").append("<img src='" + Settings.bikes[HPT.typeOfTest][HPT.typeOfBike]['rear-right'].filename + "' class='rear-view right' />");

    screenWidth = $(window).width();
    screenHeight = $(window).height();

    // Different overlays for different sequence types
    if (videoType == "jpeg") {
      // This needs to be a div with background image
      $overlay = $(".mask-div");
      $overlay.css("display", "block");
    } else {
      // This needs to be an img, no background-size in ie
      $overlay = $(".mask-img");
      $overlay.css("display", "block");
    }
    //$("#overlay").css("display", "block");

    // Initial resize
    module.doResize(function() {
      module.setViewPosition(0.5, 0.5);
    });

    // Handle browser resizes
    if (!isResizeBound) {
      $(window).resize(module.doResize);
    }

    // Only bind the keyboard when we're using the mouse
    if (deviceType == "desktop") {
      $("body").mousemove(module.mouseMove);
      $("body").on("keydown", function(e) {
        if (e.keyCode == 38) {
          e.preventDefault();
          module.speedControls("throttle", true);
        } else if (e.keyCode == 40) {
          e.preventDefault();
          module.speedControls("brake", true);
        } else if (e.keyCode == 37) {
          e.preventDefault();
          // Left
          module.chooseA();
        } else if (e.keyCode == 39) {
          e.preventDefault();
          module.chooseB();
        }
      });
      $("body").on("keyup", function(e) {
        if (e.keyCode == 38) {
          e.preventDefault();
          module.speedControls("throttle", false);
        } else if (e.keyCode == 40) {
          e.preventDefault();
          module.speedControls("brake", false);
        }
      });
    } else if (deviceType == "onDevice") {
      // Set up the gyro stuff
      window.deviceOrientation.onUpdate(function(data) {
        var ratio = Util.dataToRatio(data);
        currentViewPosition.x = ratio.y;
        currentViewPosition.y = ratio.x;
        module.setViewPosition(ratio.y, ratio.x);
      });
    }
  };

  module.chooseA = function() {
    if (SequenceManager.getCurrentSequence().canSelectPath()) {
      SequenceManager.getCurrentSequence().choosePath("a");
      module.selectionIndicator("a");

      // Record reaction time
      SequenceManager.recordReactionTime();
      SequenceManager.setChoice("a");
    }
  };

  module.chooseB = function() {
    if (SequenceManager.getCurrentSequence().canSelectPath()) {
      SequenceManager.getCurrentSequence().choosePath("b");
      module.selectionIndicator("b");

      // Record reaction time
      SequenceManager.recordReactionTime();
      SequenceManager.setChoice("b");
    }
  };

  /**
   * Handles input for speeding up and slowing down
   * @param type - Should be 'throttle' or 'brake'
   * @param isDown
   */
  module.speedControls = function(type, isDown) {
    if (!isPaused) {
      if (SequenceManager.isBuffering()) {
        /**
         * We don't want to process speed change events if we're buffering but we do
         * want to save a flag to restart the controls later
         */
        speedQueue.push({ type: type, isDown: isDown });
      } else {
        SoundManager.processInput(type, isDown);
        if (type == "throttle" && isDown) {
          isSpeedUp = true;
        } else if (type == "brake" && isDown) {
          isSlowDown = true;
          if (SequenceManager.getCurrentSequence().canTapBrake()) {
            SequenceManager.getCurrentSequence().tapBrake();
            SequenceManager.recordReactionTime();
            //SequenceManager.setChoice('brake');
          }
        } else if (type == "throttle" && !isDown) {
          isSpeedUp = false;
        } else if (type == "brake" && !isDown) {
          isSlowDown = false;
        }
      }
    }
  };

  module.isSpeedUp = function() {
    return isSpeedUp;
  };

  module.isSlowDown = function() {
    return isSlowDown;
  };

  /**
   * This replays all the speed control commands we
   * queued up while we were buffering
   */
  module.processQueue = function() {
    for (var i in speedQueue) {
      module.speedControls(speedQueue[i].type, speedQueue[i].isDown);
    }
    speedQueue = [];
  };

  module.setSpeedOverlay = function(speed) {
    // TODO - do this
    // Set the speed on the bike overlay

    // TODO - Remove this (temp)
    $(".speedoContainer .speed").text(Math.floor(speed));
    $("#overlay .on-device .speed .km").text(Math.floor(speed));
  };

  /**
   * Shows the selection indicator animation when a selection is made. This function only
   * handles the animation, whether this animation should happen or not is calculated
   * elsewhere.
   *
   * @param selection - String, should be 'a' or 'b'
   */
  module.selectionIndicator = function(selection) {
    
    var str = window.location.href; 
    var res = str.match(/testA/g);
    if (res != null) {
      var x = document.getElementById("Alert_sound");
      x.autoplay = false;
      x.load();
    }
    var str2 = window.location.href; 
    var res2 = str2.match(/testB/g);
    if (res2 != null) {
    $('#LED_light').css("visibility", "hidden");
  }
    if (!isAnimatingSelection) {
      var selector;
      if (selection == "a") {
        selector = ".a-select-indicator";
      } else {
        selector = ".b-select-indicator";
      }

      var $selection = $(selector);
      var blink = function(numLeft) {
        if (numLeft > 0) {
          if ($selection.css("display") == "block") {
            $selection.css("display", "none");
          } else {
            $selection.css("display", "block");
          }

          numLeft--;
          setTimeout(function() {
            blink(numLeft);
          }, 40);
        } else {
          $selection.css("display", "none");
          isAnimatingSelection = false;
        }
      };
      blink(12);
    }
  };

  /**
   * To be called when the user goes over the speed limit, just shows some
   * stuff to the user, doesn't do any logic stuff.
   *
   * Duplicates some functionality from UI.endTest
   */
  module.overSpeedLimit = function(speed) {
    SoundManager.backgroundLoopFadeOut();
    SoundManager.disableSounds(false);
    $(".bike-overlay").fadeOut("fast");

    // We need to pause the video otherwise it will keep playing in the background and we'll end up calling endTest again, later
    //SequenceManager.pause();
    $(Settings.videoContainerSelector).fadeOut(function() {
      $(".video-area-wrapper").hide();
      Flow.showSpeedFail(speed);
    });
    UI.endTest();
    SequenceManager.stopPolling();
  };

  module.overAdvisorySpeedLimit = function(speed) {
    $(Settings.videoContainerSelector).fadeOut("slow", function() {
      $(".video-area-wrapper").hide();
      $("#overlay").fadeOut("fast", function() {
        $("body").removeClass("showing-video");
        // Show the overlay
        $(".advisory_warning .speedo .speed").text(Math.floor(speed));
        $("#content > *").hide();
        $("#content .advisory_warning").show();
        $("#content").fadeIn();
      });
    });
  };

  module.pause = function() {
    isPaused = true;
  };

  module.resume = function() {
    isPaused = false;
  };

  module.endTest = function() {
    // Fade out the visor
    $overlay.fadeOut();

    // Stop the user from toggling
    canToggleSpeedo = false;

    $(".speedoContainer .loadIndicator").text("0%");
    $("#overlay .on-device .loadIndicator").text("0%");
     var str = window.location.href; 
    var res = str.match(/testA/g);
    if (res != null) {
      var x = document.getElementById("Alert_sound");
      x.autoplay = false;
      x.load();
    }
     var str2 = window.location.href; 
    var res2 = str2.match(/testB/g);
    if (res2 != null) {
    $('#LED_light').css("visibility", "hidden");
  }
  };

  module.showLoader = function() {
    // Set loader to 0%
    $(".speedoContainer .loadIndicator").text("0%");
    $("#overlay .on-device .loadIndicator").text("0%");

    // Hide progress circle
    $(".speedoContainer .loadIndicator").show();
    $("#overlay .on-device .loadIndicator").show();
    $(".progressCircle").hide();
    $(".test-name").hide();
    $(".speedoContainer .countdown").hide();
    $("#overlay .on-device .countdown").hide();
    $(".speedoContainer .speed").hide();
    $("#overlay .on-device .speed").hide();
    $(".speedoContainer .metric").hide();
    $("#overlay .on-device .metric").hide();
    $("#overlay .footer").hide();
  };

  module.startCountDown = function(then) {
    canToggleSpeedo = false;

    // Set countdown to 3
    $(".speedoContainer .countdown").text("");
    $("#overlay .on-device .countdown").text("");

    // Hide the load indicator
    $(".speedoContainer .loadIndicator").hide();
    $("#overlay .on-device .loadIndicator").hide();

    // Show the countdown div
    $(".speedoContainer").show();
    $(".speedoContainer .countdown").show();
    $("#overlay .on-device .countdown").show();
    $(".speedoContainer .metric").hide();
    $("#overlay .on-device .metric").hide();
    $(".speedoContainer .speed").hide();
    $("#overlay .on-device .speed").hide();
    $(".progressCircle").hide();
    $(".test-name").hide();

    // Do the countdown
    var i = 3;
    var countdown = function() {
      $(".speedoContainer .countdown").text(i);
      $("#overlay .on-device .countdown").text(i);
      i--;
      if (i >= 0) {
        setTimeout(countdown, 1000);
      } else {
        module.showSpeedo();

        $(".speedoContainer .countdown").hide();
        $("#overlay .on-device .countdown").hide();
        $(".speedoContainer .speed").show();
        $("#overlay .on-device .speed").show();
        $(".speedoContainer .metric").show();
        $("#overlay .on-device .metric").show();

        $(".speedoContainer").hide();
        $("#overlay .speedo .speed").hide();
        $(".progressCircle").show();
        $(".test-name").show();
        canToggleSpeedo = true;

        if (isShowingSpeedo) {
          module.showSpeedo();
        }

        if (then) {
          then();
        }
      }
    };
    setTimeout(countdown, 1000);
    setTimeout(function(){  
     var str = window.location.href; 
    var res = str.match(/testA/g);
    if (res != null) {
      var x = document.getElementById("Alert_sound");
      x.autoplay = true;
      x.load();
    }
     }, 8000);
    setTimeout(function(){  
      var str2 = window.location.href; 
      var res2 = str2.match(/testB/g);
      if (res2 != null) {
        $('#LED_light').css("visibility", "visible"); 
      }
    }, 8000);
  };

  /**
   * For when the user looks down
   */
  module.showSpeedo = function() {
    if (canToggleSpeedo) {
      $(".speedoContainer").show();
      $("#overlay .speedo .speed").show();
      $(".progressCircle").hide();
      $(".test-name").hide();
    }
  };

  /**
   * For when the user looks back up
   */
  module.showProgress = function() {
    if (canToggleSpeedo) {
      $(".speedoContainer").hide();
      $("#overlay .speedo .speed").hide();
      $(".progressCircle").show();
      $(".test-name").show();
    }
  };

  /**
   * Displays loaded percent in the speedo
   */
  module.setLoadedPercent = function(percent) {
    $(".loadIndicator").text(percent);
  };

  module.unhideMask = function() {
    $("#overlay").show();
    $("body").addClass("showing-video");
    $overlay.show();
  };

  module.resizeTrainingHUD = function(ratio) {
    // Set a max ratio here for widescreens > ~1400px.
    if (ratio >= 0.88) {
      ratio = 0.88;
    }
    $(".training_area").css({
      transform: "scale(" + ratio + ")"
    });
  };

  // Bike changer initializer
  module.initBikeChanger = function(bike) {
    $(".player .bikeSelector")
      .removeClass("sports naked cruiser")
      .addClass(bike);
    $("#bottomBar li").each(function() {
      $(this).removeClass("active");
    });
    $("#bottomBar li." + bike).addClass("active");
  };

  // Bike Changer
  module.changeBike = function(bike) {
    $(".speedoContainer").fadeOut();
    $("#overlay .speedo .speed").fadeOut();

    // Change the selection in the bottom bar
    $("#bottomBar li").removeClass("active");
    $("#bottomBar li." + bike).addClass("active");

    // Set the bike icon
    $(".bikeSelector").attr("class", "bikeSelector");
    $(".bikeSelector").addClass(bike);

    $("#bottomBar").slideToggle();

    // Change the bike
    HPT.typeOfBike = bike;

    //SoundManager.backgroundLoopFadeOut();
    SoundManager.disableSounds(true);
    $(Settings.videoContainerSelector).fadeOut("fast", function() {
      $(".video-area-wrapper").hide();
      SoundManager.destroyBg();
      // We need to pause the video otherwise it will keep playing in the background and we'll end up calling endTest again, later
      //SequenceManager.pause();

      // Remove all of the bike elements
      $(".bike-overlay").empty();

      // Add in the new bike elements
      $(".bike-overlay").append(
        "<img src='" +
          Settings.bikes[HPT.typeOfTest][HPT.typeOfBike].filename +
          "' class='bike-etched' />"
      );
      //$(".bike-overlay").append("<img src='" + Settings.bikes[HPT.typeOfTest][HPT.typeOfBike]['rear-left'].filename + "' class='rear-view left' />");
      //$(".bike-overlay").append("<img src='" + Settings.bikes[HPT.typeOfTest][HPT.typeOfBike]['rear-right'].filename + "' class='rear-view right' />");

      UI.endTest();
      SequenceManager.stopPolling();

      // Trigger the resize to resize the bike
      UI.doResize();

      $(".bikeSelector,.soundToggle").fadeOut("fast");

      // Start the test again
      setTimeout(function() {
        // De-initialize bike sounds
        SoundManager.deInit();

        // Initialize the bike sounds
        SoundManager.init(HPT.typeOfBike, function() {
          Flow.redoTest();
        });
      }, 3000);
      // Flow.redoTest();
    });
  };

  module.toggleBikeDrawer = function() {
    if (canToggleSpeedo) {
      $("#bottomBar").slideToggle();
    }
  };

  module.getRatio = function() {
    return maskSizeRatio;
  };

  module.getViewingArea = function() {
    return viewingArea;
  };

  module.scrollTop = function() {
    window.scrollTo(0, 0);
  };
})((window.UI = window.UI || {}), jQuery);
