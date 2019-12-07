(function(module) {
  var segmentClasses = {
    desktop: ["one", "two", "three", "four", "five", "six"],
    onDevice: ["one", "two", "three", "four", "five", "six"]
  };
  var testType;
  var index; // The number into the training slides
  var completeCallback;
  var trainingComplete = false;

  /**
   * @param type                      // One of desktop, mobile, tablet, onDevice
   * @param then                      // A function to call once they've been through the training
   */
  module.showAndPlayTraining = function(type, then) {
    completeCallback = then;

    testType = type;
    index = 0;

    HPT.instruction = "";
    $("#instructionBar .instruction").html(HPT.instruction);
    $("#instructionBar")
      .addClass("closeOnly")
      .fadeIn();
    $(".bike-overlay").show();
    $(".bikeSelector").hide();
    $(".speedoContainer").hide();
    $("#overlay .speedo .speed").hide();
    $(".soundToggle").hide();

    // Mobile specific
    if (Util.isMobile()) {
      $("#overlay .speedo").hide();
      $("#overlay .brake").hide();
      $("#overlay .throttle").hide();
      $("#overlay .player").show();
    }

    UI.initForTraining(HPT.typeOfVideo);

    $("#overlay").fadeIn("slow", function() {
      $("body").addClass("showing-video");

      $(".video-area").fadeIn();
      $(".video-area-wrapper").fadeIn("fast", function() {
        var canvas;
        if (HPT.typeOfVideo == "jpeg") {
          canvas = $("canvas.main")[0].getContext("2d");
        } else {
          canvas = null;
        }

        if (!Util.isSafari()) {
          SequenceManager.loadTest(Settings.trainingJson, {
            onProgress: function(event) {
              //UI.setLoadedPercent(Math.floor(event*100) + "%");
            },
            onComplete: function() {
              // Use SequenceManager to play
              UI.doResize(function() {
                SequenceManager.startTraining();
              });
            },
            videoContainer: Settings.jplayerContainerSelector,
            canvasContext: canvas,
            type: HPT.typeOfControls,
            isTraining: true
          });
        }

        module.showFirstCard(type);

        if (!Util.isMobile()) {
          $(".training_circle")
            .delay("200")
            .fadeIn("slow");
        }
        $(".player .next")
          .delay("400")
          .fadeIn("slow");

        $(".player .skip-training")
          .delay("400")
          .fadeIn("slow");

        $(".training_area")
          .delay("600")
          .fadeIn("slow");

        $(".player .next")
          .unbind("click")
          .on("click", module.next);

        $(".player .skip-training")
          //.unbind("click")
          .on("click", function() {
            App.loadAndPlayTest(
              HPT.typeOfControls,
              HPT.typeOfVideo,
              HPT.typeOfTest,
              HPT.currentIndex
            );
            module.endTraining();
          });
      });
    });
  };

  module.showFirstCard = function(type) {
    $(".training_area > *").hide();
    $(".training_area ." + type).show();

    $(".training_area ." + type + " tr > td").hide();
    $(".training_area ." + type + " tr td:nth-child(1)").show();
  };

  module.next = function() {
    // Is there another one?
    index++;
    if (index < $(".training_area ." + testType + " td").size()) {
      $(".training_circle").attr(
        "class",
        "training_circle " + segmentClasses[testType][index]
      );

      $(".training_area ." + testType + " td").hide();
      $(
        ".training_area ." + testType + " td:nth-child(" + (index + 1) + ")"
      ).show();

      // replace NEXT with START TEST on last screen of training.
      if (index == 5) {
        $(this).text("START TEST");
        // Hide skip on last step.
        $(".player .skip-training").hide();
      }
    } else {
      if (!trainingComplete) {
        App.loadAndPlayTest(
          HPT.typeOfControls,
          HPT.typeOfVideo,
          HPT.typeOfTest,
          HPT.currentIndex
        );
        module.endTraining();
      }
      trainingComplete = true;
    }
  };

  module.endTraining = function() {
    //console.log("END OF TRAINING");
    // Unbind next button
    // Unbind mousemove
    $(".video-area").fadeOut("fast", function() {
      $("#overlay").fadeOut("slow", function() {
        $("body").removeClass("showing-video");
        // Destroy the videos
        var $videos = $(".jplayer-area video");
        for (var i = 0; i < $videos.length; i++) {
          $videos[i].src = "";
          $videos[i].load();
          //delete($videos[i]);
        }

        // Mobile specific
        if (Util.isMobile()) {
          $("#overlay .speedo").show();
          $("#overlay .player").hide();
        }

        // Clear the current sequences
        $(".jplayer-area").html("");
        SequenceManager.clearSequences();

        // Hide training specific elements
        $(".training_circle").hide();
        $(".player .next").hide();
        $(".player .skip-training").hide();
        $(".training_area").hide();

        // Reenable non-training elements
        $(".speedoContainer").show();
        $("#overlay .speedo .speed").show();
        $(".soundToggle").show();
        $("#overlay .brake").show();
        $("#overlay .throttle").show();

        App.loadAndPlayTest(
          HPT.typeOfControls,
          HPT.typeOfVideo,
          HPT.typeOfTest,
          HPT.currentIndex
        );
        var str = window.location.href; 
        var res = str.match(/demo/g);
        if (res == null) {
          window.localStorage.setItem("hptTraining", "done");
        }
      });
    });
  };
})((window.Training = window.Training || {}));
