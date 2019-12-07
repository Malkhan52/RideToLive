(function(module) {
  module.popupContainer = ".popup-container";
  module.jpegContainerSelector = ".jpeg-area";
  module.jpegCanvasSelector = ".jpeg-area canvas";
  module.jplayerContainerSelector = ".jplayer-area";
  module.videoContainerSelector = ".video-area";
  module.maskContainer = ".helmet-overlay";

  // How big the video should be, 1 means the width of the video equals the width of the mask
  module.zoomFactor = 2.15;

  // The original size of the a/b select overlay things
  module.blinkerOriginalSize = { width: 37, height: 345 };
  module.overlayOriginalSize = { width: 3200, height: 2000 };
  module.blinkerAOriginalPosition = { left: 1035, top: 820 };
  module.blinkerBOriginalPosition = { left: 2131, top: 820 };
  module.blinkerRelativeToCenter = { left: 570, right: 533 };

  // Sounds that aren't scene specific
  module.sounds = {
    sports: {
      "speed-up": "sequences/audio/ducati-speed-up",
      "slow-down": "sequences/audio/ducati-slow-down",
      loop: "sequences/audio/ducati-loop"
    },
    naked: {
      "speed-up": "sequences/audio/honda-speed-up",
      "slow-down": "sequences/audio/honda-slow-down",
      loop: "sequences/audio/honda-loop"
    },
    cruiser: {
      "speed-up": "sequences/audio/harley-speed-up",
      "slow-down": "sequences/audio/harley-slow-down",
      loop: "sequences/audio/harley-loop"
    }
  };

  // Intro videos
  module.introVideos = {
    commuter: {
      naked: "sequences/commuter/intro-commuter-naked",
      sports: "sequences/commuter/intro-commuter-sports"
    },
    recreational: {
      naked: "sequences/recreational/intro-recreational-naked",
      sports: "sequences/recreational/intro-recreational-sports",
      cruiser: "sequences/recreational/intro-recreational-cruiser"
    }
  };

  module.tests = {
    commuter: [
      {
        filename: "/hpt/json/commuter/2.json",
        title: "1. Buffering and approaching intersection",
        summary_title: "Commuter: Buffering and approaching intersection",
        tips_image:
          "/hpt/img/hazard_tips/image_hazard_losing_control_on_a_straight.png",
        tips_copy:
          "Moving from one side of your lane to the other will allow you to maintain your buffer zone at the side when you are passing a line of parked cars. You should set up for any situation when there is potential for something to enter the space three seconds in front of your vehicle.",
        tips_link: "/tips/safe-distance"
      },
      {
        filename: "/hpt/json/commuter/4.json",
        title: "2. Cornering Right",
        summary_title: "Commuter: Cornering Right",
        tips_image: "/hpt/img/hazard_tips/image_hazard_cornering_right.png",
        tips_copy:
          "Starting corners wide will improve your vision of oncoming traffic. Planning to finish in them tight will help you get your speed right and leave you room for slight errors. Most importantly, keep away from the head on zone. The key to good observation on the road is scanning. When scanning, look to your left and right and in your mirrors, as well as in front of you.",
        tips_link: "/tips/Cornering"
      },
      {
        filename: "/hpt/json/commuter/1.json",
        title: "3. Following Distance",
        summary_title: "Commuter: Following Distance",
        tips_image: "/hpt/img/hazard_tips/image_hazard_maintaining_space.png",
        tips_copy:
          "A three second crash avoidance space is needed to react and respond to situations in front of you. You should set up for any situation when there is potential for something to enter the space three seconds in front of your vehicle.",
        tips_link: "/tips/safe-distance"
      },
      {
        filename: "/hpt/json/commuter/6.json",
        title: "4. Buffering",
        summary_title: "Commuter: Buffering",
        tips_image: "/hpt/img/hazard_tips/image_hazard_lane_side_swipe.png",
        tips_copy:
          "Moving from one side of your lane to the other will allow you to maintain your buffer zone at the side when you are overtaking a slower moving vehicle. You should set up for any situation when there is potential for something to enter the space three seconds in front of your vehicle. The key to good observation on the road is scanning. When scanning, look to your left and right and in your mirrors, as well as in front of you.",
        tips_link: "/tips/safe-distance"
      },
      {
        filename: "/hpt/json/commuter/5.json",
        title: "5. Cornering Left & Right",
        summary_title: "Commuter: Cornering Left and Right",
        tips_image:
          "/hpt/img/hazard_tips/image_hazard_cornering_left_and_right.png",
        tips_copy:
          "Starting corners wide will improve your vision of oncoming traffic. Planning to finish in them tight will help you get your speed right and leave you room for slight errors. Most importantly, keep away from the head on zone. The key to good observation on the road is scanning. When scanning, look to your left and right and in your mirrors, as well as in front of you.",
        tips_link: "/tips/Cornering"
      },
      {
        filename: "/hpt/json/commuter/3.json",
        title: "6. Approaching An Intersection",
        summary_title: "Commuter: Approaching An Intersection",
        tips_image:
          "/hpt/img/hazard_tips/image_hazard_approaching_an_intersection.png",
        tips_copy:
          "Slow down and buffer when a vehicle could turn across your path or enter your lane. Buffering is positioning your bike to create maximum space around you, away from hazards. Moving away from danger may also increase the likelihood that you'll be seen by other vehicles.",
        tips_link: "/tips/safe-distance"
      }
    ],
    recreational: [
      {
        filename: "/hpt/json/recreational/2.json",
        title: "1. Right Hand Corner",
        summary_title: "Recreational: Right Hand Corner",
        tips_image: "/hpt/img/hazard_tips/image_hazard_cornering_right.png",
        tips_copy:
          "Starting corners wide will improve your vision of oncoming traffic. Planning to finish in them tight will help you get your speed right and leave you room for slight errors. Most importantly, keep away from the head on zone.",
        tips_link: "/tips/Cornering"
      },
      {
        filename: "/hpt/json/recreational/5.json",
        title: "2. Buffering",
        summary_title: "Recreational: Buffering",
        tips_image: "/hpt/img/hazard_tips/unused_3.png",
        tips_copy:
          "Moving from one side of your lane to the other will allow you to maintain your buffer zone at the side when you are overtaking a slower moving vehicle. You should set up for any situation when there is potential for something to enter the space three seconds in front of your vehicle.",
        tips_link: "/tips/safe-distance"
      },
      {
        filename: "/hpt/json/recreational/1.json",
        title: "3. Approaching An Intersection",
        summary_title: "Recreational: Approaching An Intersection",
        tips_image: "/hpt/img/hazard_tips/unused_1.png",
        tips_copy:
          "Slow down and buffer when a vehicle could turn across your path or enter your lane. Buffering is positioning your bike to create maximum space around you, away from hazards. Moving away from danger may also increase the likelihood that you'll be seen by other vehicles.",
        tips_link: "/tips/safe-distance"
      },
      {
        filename: "/hpt/json/recreational/3.json",
        title: "4. Left Then Right Corner",
        summary_title: "Recreational: Left Then Right Corner",
        tips_image:
          "/hpt/img/hazard_tips/image_hazard_cornering_left_and_right.png",
        tips_copy:
          "Starting corners wide will improve your vision of oncoming traffic. Planning to finish in them tight will help you get your speed right and leave you room for slight errors. Most importantly, keep away from the head on zone.",
        tips_link: "/tips/Cornering"
      },
      {
        filename: "/hpt/json/recreational/4.json",
        title: "5. Following distance",
        summary_title: "Recreational: Following distance",
        tips_image: "/hpt/img/hazard_tips/image_hazard_maintaining_space.png",
        tips_copy:
          "A three second crash avoidance space is needed to react and respond to situations in front of you. You should set up for any situation when there is potential for something to enter the space three seconds in front of your vehicle.",
        tips_link: "/tips/safe-distance"
      }
    ]
  };

  module.speedoOriginalSize = {
    width: 312,
    height: 232
  };

  module.videoOriginalSize = {
    width: 2048,
    height: 540
  };

  /**
   * This refers to the offset of the mirrors from the BIKE image at full size
   */
  module.bikes = {
    commuter: {
      naked: {
        filename: "/hpt/img/bikes/commuter-ducati.png",
        "original-size": {
          width: 1481,
          height: 291
        },
        "rear-left": {
          filename: "/hpt/img/rv_left.gif",
          left: 25,
          top: 51
        },
        "rear-right": {
          filename: "/hpt/img/rv_right.gif",
          left: 710,
          top: 46,
          width: 163,
          height: 76
        }
      },
      sports: {
        filename: "/hpt/img/bikes/commuter-honda.png",
        "original-size": {
          width: 1283,
          height: 318
        },
        "rear-left": {
          filename: "/hpt/img/rv_left.gif",
          left: 25,
          top: 51,
          width: 162,
          height: 76
        },
        "rear-right": {
          filename: "/hpt/img/rv_right.gif",
          left: 710,
          top: 46,
          width: 163,
          height: 76
        }
      }
    },
    recreational: {
      cruiser: {
        filename: "/hpt/img/bikes/recreational-harley.png",
        "original-size": {
          width: 1557,
          height: 567
        },
        "rear-left": {
          filename: "/hpt/img/bikes/rv_left.gif",
          left: 25,
          top: 51,
          width: 162,
          height: 76
        },
        "rear-right": {
          filename: "/hpt/img/rv_right.gif",
          left: 710,
          top: 46,
          width: 163,
          height: 76
        }
      },
      naked: {
        filename: "/hpt/img/bikes/recreational-ducati.png",
        "original-size": {
          width: 1481,
          height: 291
        },
        "rear-left": {
          filename: "/hpt/img/rv_left.gif",
          left: 25,
          top: 51,
          width: 162,
          height: 76
        },
        "rear-right": {
          filename: "/hpt/img/rv_right.gif",
          left: 710,
          top: 46,
          width: 163,
          height: 76
        }
      },
      sports: {
        filename: "/hpt/img/bikes/recreational-honda.png",
        "original-size": {
          width: 1283,
          height: 318
        },
        "rear-left": {
          filename: "/hpt/img/rv_left.gif",
          left: 25,
          top: 51,
          width: 162,
          height: 76
        },
        "rear-right": {
          filename: "/hpt/img/rv_right.gif",
          left: 710,
          top: 46,
          width: 163,
          height: 76
        }
      }
    }
  };

  /**
   * All videos should be the same size
   * All jpeg sequences should be the same size
   * Jpeg sequences can be different sizes to videos
   */
  module.jpegSequenceSize = {
    width: 1024,
    height: 270
  };
  module.videoSequenceSize = {
    width: 2048,
    height: 540
  };

  module.summaryMessages = {
    awes: ["Well done", "Keep up the great riding."],
    good: ["Pretty good", "But there's always room for improvement."],
    average: ["50/50", "Need to work on those odds."],
    bad: ["Not too impressive.", "Time to revisit the basics?"]
  };

  module.introSize = {
    width: 1280,
    height: 533
  };

  module.trainingJson = "/hpt/json/intro.json";

  // Use "" for local, otherwise change for production environments
  if (!window.ENV || window.ENV == "local") {
    module.sequencesRootLocation = "/hpt/";
  } else {
    module.sequencesRootLocation = "/hpt/";
  }

  if (!window.ENV || window.ENV == "local") {
    //module.socketServer = "http://152.146.138.230:3000";
    module.socketServer = "http://ride2livenodejs.vmlaustralia.com:3000";
  } else if (window.ENV == "dev") {
    module.socketServer = "http://ride2live-nodejs-dev.vmlaustralia.com:3000";
  } else if (window.ENV == "uat") {
    module.socketServer = "http://ride2live-nodejs-uat.vmlaustralia.com:3000";
  } else if (window.ENV == "production") {
    module.socketServer = "http://ride2livenodejs.vmlaustralia.com:3000";
  } else {
    module.socketServer = "http://ride2live-nodejs-dev.vmlaustralia.com:3000";
  }

  // module.downloadSpeed = parseInt(purl().param('s'));
  module.downloadSpeed = 10023;
})((window.Settings = window.Settings || {}));