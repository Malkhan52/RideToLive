/* eslint-disable prettier/prettier */
(function(module){

  /**
   * Only handles the showing of the results area, nothing to do with the hiding of whatever is
   * currently showing
   *
   * - reactionTime           A number between 0 & 1 representing their reaction time within the window of choice
   * - sequence               A Sequence object of the sequence that was active when the test ended
   * - selectedChoice         A string, a, b, or brake, OR null if they didn't make a choice
   * - approachSpeed          The speed of the user when they made a choice, or if they didn't make a choice, their final speed before the sequence ended
   * - passed                 Bool, whether they passed the test or not
   * - lastChoiceIgnored      Bool, whether the last choice they could make was ignored (for setting the reaction time)
   * - lastActionWasTapBrake  Whether or not the last action was a tap brake
   */
  module.showResults = function(reactionTime, sequence, selectedChoice, approachSpeed, passed, lastChoiceIgnored, lastActionWasTapBrake) {
    
    var newReactionTime = reactionTime*1.65;

    var x = document.getElementsByClassName("reaction_time_value");
    x[0].innerHTML = newReactionTime + " seconds";

    var str = window.location.href; 
    var res = str.match(/demo/g);
    if (res == null) {
      document.getElementById("reactionTime").value = newReactionTime;
      document.getElementById("selectedChoice").value = selectedChoice;
  }
    Analytics.fireEvent('result');
    // TODO: Process the results from this test and format them on the page

    // Set the text in the header
    if (reactionTime > 0.5) {
      // Slow
      $(".test_summary h3.heading").text(sequence.messageSlow[0]);
      $(".test_summary h4.sub_heading").text(sequence.messageSlow[1]);
    }
    else {
      // Fast
      $(".test_summary h3.heading").text(sequence.messageFast[0]);
      $(".test_summary h4.sub_heading").text(sequence.messageFast[1]);
    }

    // Set the approach speed
    approachSpeed = Math.floor(parseInt(approachSpeed));
    $(".results_table .approach_speed .speed").html(approachSpeed);

    var removeClasses = function() {
      $(".results_table .reaction_time .reaction, .results_table .reaction_time .status").removeClass("slow okay fast fail");
      $(".results_table .reaction_time .icon, .results_table .lane_position .icon").removeClass("tick cross");
    };

    // Set the correct class on reaction time
    if (reactionTime > 0.66) {
      // Slow
      removeClasses();
      $(".results_table .reaction_time .reaction").addClass("slow");
    }
    else if (reactionTime > 0.33) {
      // Average
      removeClasses();
      $(".results_table .reaction_time .reaction").addClass("okay");
    }
    else {
      // Fast
      removeClasses();
      $(".results_table .reaction_time .reaction").addClass("fast");
    }

    if (lastChoiceIgnored) {
      reactionTime = 1;
      removeClasses();
      $(".results_table .reaction_time .reaction").addClass("fail");
    }

    // The tick on the reaction time
    if (reactionTime == 1) {
      $(".results_table .reaction_time .status").addClass("fail");
      $(".results_table .reaction_time .status .icon").addClass("cross");
    }
    else {
      $(".results_table .reaction_time .status").removeClass("fail");
      $(".results_table .reaction_time .status .icon").addClass("tick");
    }

    // Deal with the last tile
    var isBrakeOnlyTest = SequenceManager.isBrakeOnlyTest();
    if (selectedChoice == null || selectedChoice == 'brake' || isBrakeOnlyTest) {
      $(".test_summary .results_table .lane_position").hide();
    }
    else {
      $(".test_summary .results_table .lane_position").show();

      if (selectedChoice == "b") {
        $(".test_summary .results_table .lane_position .position").removeClass("a").addClass("b");
      }
      else {
        $(".test_summary .results_table .lane_position .position").removeClass("b").addClass("a");
      }

      // Deal with tick icon
      if (passed) {
        $(".test_summary .results_table .lane_position .status").removeClass("fail").addClass("pass");
        $(".test_summary .results_table .lane_position .icon").removeClass("cross").addClass("tick");
      }
      else {
        $(".test_summary .results_table .lane_position .status").removeClass("pass").addClass("fail");
        $(".test_summary .results_table .lane_position .icon").removeClass("tick").addClass("cross");
      }
    }

    $('.test_summary .tips_container .tip_content .image').attr('src', Settings.tests[HPT.typeOfTest][HPT.currentIndex]['tips_image']);
    $('.test_summary .hazard_avoidance_tips_table .tip_image').css('background-image', 'url("' + Settings.tests[HPT.typeOfTest][HPT.currentIndex]['tips_image'] + '")');
    $('.test_summary .tips_container .tip_content .tip_copy').html(Settings.tests[HPT.typeOfTest][HPT.currentIndex]['tips_copy']);
    $('.test_summary .hazard_avoidance_tips_table .tip_copy').html(Settings.tests[HPT.typeOfTest][HPT.currentIndex]['tips_copy']);

    $(".video-area").hide();
    $(".video-area-wrapper").hide();
    $("#overlay").hide();
    $("body").removeClass("showing-video");
    $("#content").show();
    $("#content > *").hide();

    // Show all the buttons
    $(".test_summary button").show();

    // Check if we just finished the last test
    if (HPT.currentIndex == Settings.tests[HPT.typeOfTest].length - 1) {
      // This was the last test
      // $(".test_summary .save_test").hide();
      // }
      // else {
      $(".test_summary .continue").hide();
    }

    // Check if we passed or failed
    if (HPT.passedCurrentTest) {
      // Hide the retry button
      $(".test_summary .try_again").hide();
    }
    else {
      // Failed the test
      // TODO: Do we need to do anything special here?
    }

    // Populate the results into the final summary object
    HPT.results[HPT.currentIndex].passed = HPT.passedCurrentTest;
    // Approach can never be false
    HPT.results[HPT.currentIndex].approach = true;
    HPT.results[HPT.currentIndex].reaction = (reactionTime > 0.66) ? false : true;
    if (selectedChoice == "a" || selectedChoice == "b") {
      HPT.results[HPT.currentIndex].position = HPT.passedCurrentTest;
    }

    var isBrakeOnlyTest = SequenceManager.isBrakeOnlyTest();
    var isSpeedOnlyTest = SequenceManager.isSpeedOnlyTest();
    HPT.results[HPT.currentIndex].testType = SequenceManager.getTestType();

    if (!isBrakeOnlyTest && !isSpeedOnlyTest && selectedChoice !== "a" && selectedChoice !== "b") {
      // They missed the second a/b choice
      HPT.results[HPT.currentIndex].position = false;
    }

    module.saveResults(HPT.typeOfTest, HPT.currentIndex, HPT.results[HPT.currentIndex]);

    if ($("body").hasClass("on-device")) {
      $("#content > .test_summary.mobile").fadeIn('slow', function(){
        $("body").addClass("requires-scroll");
      });
    }
    else {
      $("#content > .test_summary.desktop").fadeIn('slow', function() {
        $("body").addClass("requires-scroll");
        Onboarding.resizeSummary();
      });
    }
  };

  module.scenarioComplete = function() {
    // Populate the final results table
    module.showPopulateSummary();

    // Swap the cards
    $(".test_summary").fadeOut("slow", function(){
      if ($("body").hasClass("on-device")) {
        $("body").addClass("requires-scroll");
        $("#instructionBar").fadeOut();
        $(".summary.mobile").fadeIn("slow");
      }
      else {
        $("body").addClass("requires-scroll");
        $("#instructionBar").fadeOut();
        $(".summary.desktop").fadeIn("slow");

        Analytics.fireEvent('summary');
      }
    });
  };

  /**
   * Shows the single test results (not the final results table)
   * Gets information from the HPT.results object
   */
  module.showPopulateSummary = function() {

    // Clear the rows
    $("table.summary.desktop table.results tbody tr").remove();
    var results = Flow.getResultsOnly();

    // Build the new rows
    var $sampleRow = $('<tr class="row"><td class="icon"><div class="eighty_px_container"><i class="image"></i></div></td><td class="result"></td><td class="approach"><i class="image"></i></td><td class="reaction"><i class="image"></i></td><td class="position"><i class="image"></i></td><td class="rider_tips"></td></tr>');

    var numCorrect = 0;
    for (var i = 0; i < results.length; i++) {
      if (results[i] != "") {
        var $newRow = $sampleRow.clone();

        // Set whether they passed the test or not
        if (!results[i].passed) {
          $newRow.addClass("failure");
        }
        else {
          numCorrect++;
        }

        // Set the title
        $newRow.find(".result").text(Settings.tests[results[i].type][results[i].id].summary_title);

        // Set the approach
        if (!results[i].approach) {
          $newRow.find(".approach").addClass("failure");
        }

        // Set the reaction time
        if (!results[i].reaction) {
          $newRow.find(".reaction").addClass("failure");
        }

        // Set the position
        if (results[i].position == null || results[i].testType == 'speed-only' || results[i].testType == 'test-only') {
          // Not relevant to this test
          $newRow.find(".position").html("");
        }
        else if (!results[i].position) {
          $newRow.find(".position").addClass("failure");
        }

        // Set the link
        $newRow.find(".rider_tips").html("<a href='" + Settings.tests[results[i].type][results[i].id].tips_link + "' target='_blank'>VIEW TIPS</a><i class='arrow'></i>");

        // Add to the table
        $("table.summary.desktop table.results tbody").append($newRow);
      }
    }

    if (numCorrect <= 2) {
      $("table.summary.desktop > tbody > tr > td > h3").html(Settings.summaryMessages.bad[0]);
      $("table.summary.desktop > tbody > tr > td > h4").html(Settings.summaryMessages.bad[1]);
    }
    else if (numCorrect == 3) {
      $("table.summary.desktop > tbody > tr > td > h3").html(Settings.summaryMessages.average[0]);
      $("table.summary.desktop > tbody > tr > td > h4").html(Settings.summaryMessages.average[1]);
    }
    else if (numCorrect == 4 || numCorrect == 5) {
      $("table.summary.desktop > tbody > tr > td > h3").html(Settings.summaryMessages.good[0]);
      $("table.summary.desktop > tbody > tr > td > h4").html(Settings.summaryMessages.good[1]);
    }
    else {
      $("table.summary.desktop > tbody > tr > td > h3").html(Settings.summaryMessages.awes[0]);
      $("table.summary.desktop > tbody > tr > td > h4").html(Settings.summaryMessages.awes[1]);
    }
  };

  /**
   * Shows the single test results (not the final results table)
   * Gets information from the HPT.results object
   */
  module.showPopulateSummaryMobile = function() {

    // Clear the rows
    $(".summary.mobile table.summary_table tbody tr").remove();
    var results = Flow.getResultsOnly();

    // Build the new rows
    var $sampleRow = $('<tr class="row"><td class="status"><div class="icon"></div></td><td class="test">CORNERING LEFT</td><td class="tip"></td></tr>');

    var numCorrect = 0;
    for (var i = 0; i < results.length; i++) {
      if (results[i] != "") {
        var $newRow = $sampleRow.clone();

        // Set whether they passed the test or not
        if (!results[i].passed) {
          $newRow.addClass("failure");
        }
        else {
          numCorrect++;
        }

        // Set the title
        $newRow.find(".test").text(Settings.tests[results[i].type][results[i].id].summary_title);

        // Set the link
        $newRow.find(".tip").html("<a href='" + Settings.tests[results[i].type][results[i].id].tips_link + "' target='_blank'>VIEW TIPS</a><i class='arrow'></i>");

        // Add to the table
        $(".summary.mobile table.summary_table tbody").append($newRow);
      }
    }

    if (numCorrect <= 2) {
      $(".summary.mobile > .heading").html(Settings.summaryMessages.bad[0]);
      $(".summary.mobile > .sub_heading").html(Settings.summaryMessages.bad[1]);
    }
    else if (numCorrect == 3) {
      $(".summary.mobile > .heading").html(Settings.summaryMessages.average[0]);
      $(".summary.mobile > .sub_heading").html(Settings.summaryMessages.average[1]);
    }
    else if (numCorrect == 4 || numCorrect == 5) {
      $(".summary.mobile > .heading").html(Settings.summaryMessages.good[0]);
      $(".summary.mobile > .sub_heading").html(Settings.summaryMessages.good[1]);
    }
    else {
      $(".summary.mobile > .heading").html(Settings.summaryMessages.awes[0]);
      $(".summary.mobile > .sub_heading").html(Settings.summaryMessages.awes[1]);
    }
  };

  module.init = function() {
    // Bind the buttons on the results page
    $(".test_summary .try_again").click(module.redoTest);
    // $(".test_summary .save_test").click();
    //$(".test_summary .continue").click(module.scenarioComplete);
    $(".summary.mobile .chooseAnother, .summary.desktop .chooseAnother").click(function () {
      window.location.href = $(this).attr('href');
    });

    // Bind the retry button on the speed fail page
    $(".speed_fail .yellow").click(module.redoTest);
    $(".advisory_warning .yellow").click(module.continueFromAdvisoryWarning);

    $(".summary a.chooseAnother").click(function(e){
      e.preventDefault();
      location.reload();
    });
  };

  /**
   * Just show the
   */
  module.showSpeedFail = function(speed) {
    // Show the whoops screen
    $('#bottomBar').hide();
    $(".video-area").hide();
    $(".video-area-wrapper").hide();
    $('.speed_fail .speedo .speed').html(Math.floor(speed).toString());
    $("#overlay").hide();
    $("body").removeClass("showing-video");
    $("#content > *").hide();
    $("#content").show();
    $("#content > .speed_fail").fadeIn('slow');

    // We need to pause the video otherwise it will keep playing in the background and we'll end up calling endTest again, later
    SequenceManager.stopPolling();
  };

  module.redoTest = function() {
    if (!$(this).hasClass('disabled')) {
      $(this).addClass('disabled');
      var $this = $(this);

      // Rewind everything
      SequenceManager.reset();

      // Re-show the bike overlay
      $(".bike-overlay").show();

      // Hide the results card
      $("#content").fadeOut('slow', function () {
        $("body").removeClass("requires-scroll");
        // Make sure the mask is visible
        UI.unhideMask();

        $(".video-area-wrapper").show();
        $(".video-area").fadeIn('slow', function () {
          $(".soundToggle").fadeIn();
          $(".bikeSelector").fadeIn();

          $this.removeClass('disabled');

          SequenceManager.restart();

          $(".speedoContainer .countdown").text("");
          $("#overlay .on-device .countdown").text("");

          SoundManager.rewindBgLoop();

          // Start the countdown
          SequenceManager.start();
        });
      });
    }
  };

  module.continueFromAdvisoryWarning = function() {
    $("#content").fadeOut('fast', function() {
      $("#overlay").fadeIn('fast', function() {
        $("body").addClass("showing-video");
        $(".video-area-wrapper").show();
        $(".video-area").fadeIn('slow', function() {
          SequenceManager.resume();
        });
      });
    });
  };

  module.nextTest = function() {
    $("#content").fadeOut('slow', function() {
      window.location.href = '/hpt/index.html';
    });
  };

  module.saveResults = function(type, id, result) {
    result.id = id;
    result.type = type;
    var testResults = JSON.parse(module.getResults());
    testResults[type][id] = result;
    window.localStorage.setItem('hptResults' , JSON.stringify(testResults));
  };

  module.initResults = function() {
    var commuterResults = [];
    for (var i = 0; i < Settings.tests['commuter'].length; i++) {
      commuterResults.push('');
    }

    var recreationalResults = [];
    for (var i = 0; i < Settings.tests['recreational'].length; i++) {
      recreationalResults.push('');
    }

    const results = {
      "commuter": commuterResults,
      "recreational": recreationalResults
    }
    window.localStorage.setItem('hptResults', JSON.stringify(results));
  };

  module.getResults = function() {
    if(window.localStorage.getItem('hptResults') == null) {
      module.initResults();
    }
    return window.localStorage.getItem('hptResults');
  }

  module.getResultsOnly = function() {
    const allResults = JSON.parse(module.getResults());
    if ( allResults !== null ) {
      return (allResults["commuter"]).concat(allResults["recreational"]);
    } else {
      return ''
    }
  }

}(window.Flow = window.Flow || {}));
