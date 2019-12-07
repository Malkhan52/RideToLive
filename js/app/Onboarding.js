/* eslint-disable no-undef */
(function(module) {
  "use strict";

  var syncId;
  var introReadyToPlay = false;
  var playrateDisabled = false;
  var watchedIntro = false;

  // Init
  module.init = function() {
    // Binding of events
    module.landingPage();
    module.bindOnboardingFlow();
    module.triggerResize();
    module.skipToTestByUrl();

    // Add class for mobile
    if (Util.isMobile()) {
      $("body").addClass("on-device");
    }

    // Resizing stuff for the intro videos
    $(window).resize(module.resizeIntroVideo);

    // Facebook baggage
    window.fbAsyncInit = function() {
      FB.init({
        appId: "607370209372071",
        xfbml: true,
        version: "v2.1"
      });
    };

    (function(d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");

    // Google analytics bindings
    Analytics.init();

    $("#commuter0").on("click", function(e) {
      e.preventDefault();
      module.skipToTest("commuter", 0);
    });
    $("#commuter1").on("click", function(e) {
      e.preventDefault();
      module.skipToTest("commuter", 1);
    });
    $("#commuter2").on("click", function(e) {
      e.preventDefault();
      module.skipToTest("commuter", 2);
    });
    $("#commuter3").on("click", function(e) {
      e.preventDefault();
      module.skipToTest("commuter", 3);
    });
    $("#commuter4").on("click", function(e) {
      e.preventDefault();
      module.skipToTest("commuter", 4);
    });
    $("#commuter5").on("click", function(e) {
      e.preventDefault();
      module.skipToTest("commuter", 5);
    });

    $("#recreational0").on("click", function(e) {
      e.preventDefault();
      module.skipToTest("recreational", 0);
    });
    $("#recreational1").on("click", function(e) {
      e.preventDefault();
      module.skipToTest("recreational", 1);
    });
    $("#recreational2").on("click", function(e) {
      e.preventDefault();
      module.skipToTest("recreational", 2);
    });
    $("#recreational3").on("click", function(e) {
      e.preventDefault();
      module.skipToTest("recreational", 3);
    });
    $("#recreational4").on("click", function(e) {
      e.preventDefault();
      module.skipToTest("recreational", 4);
    });
  };

  module.landingPage = function() {
    var testResults = Flow.getResultsOnly();
    $(".see-results1").on("click", function(e) {
      e.preventDefault();
      module.skipToTest("results", 1);
    });

    // Hide see results buttons if no test is taken.
    if (testResults !== null) {
      var isTestResultsEmpty = testResults.every(function(test) {
        return test == "";
      });
      if (isTestResultsEmpty) {
        $(".see-results1").css("display", "none");
      } else {
        $(".see-results").css("display", "inline-block");
      }

      // Add tick if test is passed.
      $.each(testResults, function(index, test) {
        if (test.passed === true) {
          $("#" + test.type + test.id).addClass("active");
        }
      });
    }
  };

  // Change page function
  module.changePage = function(page) {
    switch (page) {
      case "chooseTest":
        $("#content > *").fadeOut();
        $("#instructionBar").removeClass("backOnly closeOnly");
        $("#instructionBar").addClass("show");
        HPT.instruction = "CHOOSE YOUR TEST";
        $("#content > *." + page).fadeIn();
        break;

      case "chooseControls":
        $("#content > *").slideUp();
        $("#instructionBar")
          .removeClass("backOnly closeOnly")
          .addClass("backOnly")
          .fadeIn();
        HPT.instruction = "CHOOSE YOUR CONTROLS";
        $("#content > *." + page).show();
        break;

      case "connectPhone":
        $("#content > *").fadeOut();
        $("#instructionBar")
          .removeClass("backOnly closeOnly")
          .addClass("backOnly")
          .fadeIn();
        HPT.instruction = "CONNECT YOUR PHONE";
        $("#content > *." + page).fadeIn();
        break;

      case "introVideo":
        $("#content > *").slideUp();
        $("#instructionBar")
          .removeClass("backOnly closeOnly")
          .addClass("closeOnly")
          .fadeIn();
        $("#content > *." + page).show();
        break;

      case "instructions":
        $("#content > *").slideUp();
        $("#instructionBar")
          .removeClass("backOnly closeOnly")
          .addClass("closeOnly")
          .fadeIn();
        $("#content > *." + page).show();
        break;

      case "test_summary":
        $("#content > *").slideUp();
        $("#instructionBar")
          .removeClass("backOnly closeOnly")
          .addClass("closeOnly")
          .fadeIn();
        if (Util.isMobile()) {
          page = page + ".mobile";
        } else {
          page = page + ".desktop";
          module.resizeSummary();
        }
        $("#content > *." + page).show();
        $("body").css({ overflow: "auto" });
        break;

      case "speed_fail":
        $("#content > *").slideUp();
        $("#instructionBar")
          .removeClass("backOnly, closeOnly")
          .addClass("closeOnly")
          .fadeIn();
        $("#content > *." + page).show();
        break;

      case "summary":
        $("#content > *").slideUp();
        $("#instructionBar")
          .removeClass("backOnly, closeOnly")
          .addClass("closeOnly")
          .fadeIn();
        if (Util.isMobile()) {
          page = page + ".mobile";
        } else {
          page = page + ".desktop";
        }
        $("#content > *." + page).show();
        break;

      case "loading_screen_mobile":
        $("#content > *").slideUp();
        $("#instructionBar")
          .removeClass("backOnly, closeOnly")
          .addClass("closeOnly")
          .fadeIn();
        $("#content > *." + page).show();
        break;

      default:
        break;
    }
    $("#instructionBar .instruction").html(HPT.instruction);
  };

  // Modal messages handler
  module.showModal = function(modal) {
    var $overlay = $("#globalOverlay");

    var showNewModal = function() {
      $overlay.find('[data-action="' + modal + '"]').fadeIn();
    };

    if (modal === "hide") {
      $overlay.fadeOut(function() {
        $overlay
          .find(".modal")
          .removeClass("sent")
          .hide();
      });
    } else {
      if (!$overlay.is(":visible")) {
        $overlay.fadeIn(function() {
          showNewModal();
        });
      } else {
        $overlay.find(".modal:visible").fadeOut(function() {
          showNewModal();
        });
      }
    }
  };

  module.bindOnboardingFlow = function() {
    var syncId;

    $('[data-action="mobile_nav"]').on("click", function(e) {
      $("#mainHeader .links").slideToggle();
      $("#mainHeader .show-menu").toggleClass("active");
    });

    // Recaptcha stuffs
    //        Recaptcha.create("6Lc-oqkUAAAAAACyjR2DfzafPvE-QPcmiRS8sxUe",
    //            "recaptcha", {
    //                theme: "red",
    //                callback: Recaptcha.focus_response_field
    //            }
    //        );

    // Show Share Email
    // No longer needed. Using a mailto
    // $(".summary.desktop .email a").on("click", function(e) {
    //   e.preventDefault();
    //   module.showModal("share_email");
    // });

    // Share via Email
    $(
      '#globalOverlay [data-action="share_email"] [data-action="send_email"]'
    ).on("click", function() {
      if (!$('#globalOverlay [data-action="share_email"]').hasClass("sent")) {
        // Validation
        var $emailForm = $('[data-action="share_email"');

        if (!Util.validateEmail($emailForm.find(".to").val())) {
          $emailForm.find(".to").addClass("error");
        }

        if ($emailForm.find(".from_name").val() === "") {
          $emailForm.find(".from_name").addClass("error");
        } else {
          $emailForm.find(".from_name").removeClass("error");
        }

        if ($emailForm.find(".from_email").val() === "") {
          $emailForm.find(".from_email").addClass("error");
        } else {
          $emailForm.find(".from_email").removeClass("error");
        }

        if ($emailForm.find('[name="message"]').val() === "") {
          $emailForm.find('[name="message"]').addClass("error");
        } else {
          $emailForm.find('[name="message"]').removeClass("error");
        }

        // If passed validation
        if (
          Util.validateEmail($emailForm.find(".to").val()) &&
          $emailForm.find(".from_name").val() !== "" &&
          $emailForm.find(".from_email").val() !== "" &&
          $emailForm.find('[name="message"]').val() !== ""
        ) {
          $.ajax({
            type: "POST",
            url: "/share/page/13.json",
            data: {
              to: [$emailForm.find(".to").val()],
              yourName: $emailForm.find(".from_name").val(),
              yourEmail: $emailForm.find(".from_email").val(),
              message: $emailForm.find('[name="message"]').val(),
              recaptcha_challenge_field: $("#recaptcha_challenge_field").attr(
                "value"
              ),
              recaptcha_response_field: $("#recaptcha_response_field").val()
            },
            dataType: "JSON",
            success: function(data) {
              if (data["status"] === true) {
                $emailForm.addClass("sent");
              } else {
                //console.log('Error');
              }
            }
          });
        }
      }
    });

    // Show overlay
    $("#instructionBar .close").on("click", function() {
      module.showModal("close_test");
    });

    // Hide overlay
    $('#globalOverlay [data-action="hide_modal"]').on("click", function() {
      module.showModal("hide");
    });

    // Show device list
    $('#globalOverlay [data-action="show_device_list"]').on("click", function(
      e
    ) {
      e.preventDefault();
      module.showModal("devices_notification");
    });

    // Bind all the exit test buttons
    $('#globalOverlay [data-action="exit_test"]').on("click", function() {
      $("body").fadeOut(1000, function() {
        window.location.href = "/";
      });
    });

    // Landing page
    $(".landingPage td .start").on("click", function() {
      module.changePage("chooseTest");
    });

    // Select your type of test
    $(".chooseTest td").on("click", function(e) {
      if ($(this).hasClass("left")) {
        HPT.typeOfTest = "commuter";
      } else {
        HPT.typeOfTest = "recreational";
      }
      SequenceManager.setupResultsObject();
      HPT.typeOfBike = "naked";
      if ($(".chooseBike").hasClass("commuter")) {
        $("#bottomBar").addClass("commuter");
      } else {
        $("#bottomBar").removeClass("commuter");
      }

      if (Util.isMobile()) {
        HPT.typeOfControls = "onDevice";

        // TODO: THIS IS TEMP
        var args = Util.getDetailsFromUrl();
        var type = args.type;
        var id = args.id;

        Orientation.init();
        OnDevice.init();

        if (id) {
          HPT.currentIndex = parseInt(id);
        } else {
          HPT.currentIndex = 0;
        }

        if (Util.isIOS()) {
          HPT.typeOfVideo = "jpeg";
          HPT.typeOfControls = "onDevice";
          SoundManager.init(HPT.typeOfBike);
        } else if (Util.isSafari()) {
          // Safari macbook users only
          HPT.typeOfVideo = "jpeg";
          HPT.typeOfControls = "desktop";
          SoundManager.init(HPT.typeOfBike);
        } else {
          if (Util.isAndroid()) {
            HPT.typeOfControls = "onDevice";
            SoundManager.init(HPT.typeOfBike);
          }
          HPT.typeOfVideo = "html";
        }

        $("#instructionBar").removeClass("show");

        // Jump to training
        App.showTraining(function() {
          App.loadAndPlayTest(
            HPT.typeOfControls,
            HPT.typeOfVideo,
            HPT.typeOfTest,
            HPT.currentIndex
          );
        });
      } else {
        if (!$("#content > *").is(":animated")) {
          // The if statement fixes the double click issue of loading multiple copies of the training
          //if (!HPT.typeOfControls) {
          HPT.typeOfControls = "desktop";

          // TODO: THIS IS TEMP
          var args = Util.getDetailsFromUrl();
          var id = args.id;
          if (id) {
            HPT.currentIndex = parseInt(id);
          } else {
            HPT.currentIndex = 0;
          }

          // Selectively choose video method depending on browser
          // IE8: Flash
          // IE9+: HTML
          // Chrome: HTML
          // Firefox: Jpeg
          // Safari: Jpeg
          if (Util.isIE8()) {
            HPT.typeOfVideo = "flash";
          } else if (Util.isIE()) {
            // TODO WHICH ONE?
            HPT.typeOfVideo = "html";
          } else if (Util.isChrome()) {
            HPT.typeOfVideo = "html";
          } else if (Util.isSafari()) {
            HPT.typeOfVideo = "html";
            playrateDisabled = true;
          } else if (Util.isFirefox()) {
            HPT.typeOfVideo = "html";
            playrateDisabled = true;
          } else {
            HPT.typeOfVideo = "html";
          }

          // Show the close button only
          $("#instructionBar")
            .removeClass("backOnly closeOnly")
            .addClass("closeOnly");

          App.showTraining(function() {
            App.loadAndPlayTest(
              HPT.typeOfControls,
              HPT.typeOfVideo,
              HPT.typeOfTest,
              HPT.currentIndex,
              playrateDisabled
            );
          });
          module.changePage("introVideo");
        }
      }
      // if (!$("#content > *").is(":animated")) {
      //   module.changePage("chooseControl");
      // }
    });

    // Select test expanding
    $(".chooseTest tr td")
      .on("mouseenter", function() {
        $(".chooseTest tr td").each(function() {
          $(this)
            .removeClass("expanded")
            .addClass("collapsed");
        });

        $(this)
          .addClass("expanded")
          .removeClass("collapsed");
        module.resizeCommuterRecreation(
          $(this)
            .attr("class")
            .split(" ")[0]
        );
      })
      .on("mouseleave", function() {
        $(".chooseTest tr td").each(function() {
          $(this).removeClass("expanded collapsed");
        });

        module.resizeCommuterRecreation();
      });

    // Select bike
    $(".chooseBike td").on("click", function(e) {
      // if ($(this).hasClass("one")) {
      //   HPT.typeOfBike = "naked";
      // } else if ($(this).hasClass("two")) {
      //   HPT.typeOfBike = "sports";
      // } else {
      //   HPT.typeOfBike = "cruiser";
      // }
      HPT.typeOfBike = "naked";

      // Handle the bike switcher
      if ($(".chooseBike").hasClass("commuter")) {
        $("#bottomBar").addClass("commuter");
      } else {
        $("#bottomBar").removeClass("commuter");
      }

      if (Util.isMobile()) {
        HPT.typeOfControls = "onDevice";

        // TODO: THIS IS TEMP
        var args = Util.getDetailsFromUrl();
        var type = args.type;
        var id = args.id;

        Orientation.init();
        OnDevice.init();

        if (id) {
          HPT.currentIndex = parseInt(id);
        } else {
          HPT.currentIndex = 0;
        }

        if (Util.isIOS()) {
          HPT.typeOfVideo = "jpeg";
          HPT.typeOfControls = "onDevice";
          SoundManager.init(HPT.typeOfBike);
        } else if (Util.isSafari()) {
          // Safari macbook users only
          HPT.typeOfVideo = "jpeg";
          HPT.typeOfControls = "desktop";
          SoundManager.init(HPT.typeOfBike);
        } else {
          if (Util.isAndroid()) {
            HPT.typeOfControls = "onDevice";
          }
          HPT.typeOfVideo = "html";
        }

        $("#instructionBar").removeClass("show");

        // Jump to training
        App.showTraining(function() {
          App.loadAndPlayTest(
            HPT.typeOfControls,
            HPT.typeOfVideo,
            HPT.typeOfTest,
            HPT.currentIndex
          );
        });
      } else {
        if (!$("#content > *").is(":animated")) {
          module.changePage("chooseControls");
        }
      }
    });

    // Select controls
    $(".chooseControls td").on("click", function(e) {
      if ($(this).hasClass("one")) {
        var args = Util.getDetailsFromUrl();
        var id = args.id;
        if (id) {
          HPT.currentIndex = parseInt(id);
        } else {
          HPT.currentIndex = 0;
        }

        HPT.typeOfControls = "tablet";

        MobileControllerDesktop.init({
          onId: function(id) {
            syncId = id;
            $(".sync-id-container").text(id);
          }
        });
        $("table.connectPhone").addClass("tablet");
        if (!$("#content > *").is(":animated")) {
          module.changePage("connectPhone");
        }
      } else if ($(this).hasClass("two")) {
        var args = Util.getDetailsFromUrl();
        var id = args.id;
        if (id) {
          HPT.currentIndex = parseInt(id);
        } else {
          HPT.currentIndex = 0;
        }

        $("table.connectPhone").removeClass("tablet");
        HPT.typeOfControls = "mobile";

        MobileControllerDesktop.init({
          onId: function(id) {
            syncId = id;
            $(".sync-id-container").text(id);
          }
        });
        if (!$("#content > *").is(":animated")) {
          module.changePage("connectPhone");
        }
      } else {
        // The if statement fixes the double click issue of loading multiple copies of the training
        //if (!HPT.typeOfControls) {
        HPT.typeOfControls = "desktop";

        // TODO: THIS IS TEMP
        var args = Util.getDetailsFromUrl();
        var id = args.id;
        if (id) {
          HPT.currentIndex = parseInt(id);
        } else {
          HPT.currentIndex = 0;
        }

        // Selectively choose video method depending on browser
        // IE8: Flash
        // IE9+: HTML
        // Chrome: HTML
        // Firefox: Jpeg
        // Safari: Jpeg
        if (Util.isIE8()) {
          HPT.typeOfVideo = "flash";
        } else if (Util.isIE()) {
          // TODO WHICH ONE?
          HPT.typeOfVideo = "html";
        } else if (Util.isChrome()) {
          HPT.typeOfVideo = "html";
        } else if (Util.isSafari()) {
          HPT.typeOfVideo = "html";
          playrateDisabled = true;
        } else if (Util.isFirefox()) {
          HPT.typeOfVideo = "html";
          playrateDisabled = true;
        } else {
          HPT.typeOfVideo = "html";
        }

        // Show the close button only
        $("#instructionBar")
          .removeClass("backOnly closeOnly")
          .addClass("closeOnly");

        App.showTraining(function() {
          App.loadAndPlayTest(
            HPT.typeOfControls,
            HPT.typeOfVideo,
            HPT.typeOfTest,
            HPT.currentIndex,
            playrateDisabled
          );
        });
      }
    });

    // Skip intro video button
    $(".introVideo button").on("click", module.leaveIntroVideo);

    // Check valid phone number
    $(".connectPhone input").on("keyup", function(e) {
      if (
        $(this)
          .val()
          .match(/^\D*0(\D*\d){9}\D*$/)
      ) {
        $(this).addClass("valid");
      } else {
        $(this).removeClass("valid");
      }

      if ($(this).val().length > 0) {
        $(this).addClass("active");
      } else {
        $(this).removeClass("active");
      }
    });

    // Send the code
    $(".connectPhone button").on("click", function(e) {
      if ($(".connectPhone input").hasClass("valid")) {
        $(".connectPhone").fadeOut(function() {
          $(".connectPhone .copyWrapper").hide();
          $(".connectPhone h2").html("CHECK YOUR PHONE");
          $(".connectPhone .copyWrapper.sentOnly").show();
          $(".connectPhone").fadeIn();
        });
      }
    });

    // Use tablet
    $(".connectPhone .useTablet").on("click", function() {
      MobileControllerDesktop.disconnectSocket();
      module.changePage("chooseControls");
    });

    // Use mouse
    $(".connectPhone .useMouse").on("click", function() {
      MobileControllerDesktop.disconnectSocket();
      module.changePage("chooseControls");
    });

    // Choose bike background image resizing
    if (window.innerWidth > 768) {
      $(".chooseBike tr td")
        .on("mouseenter", function() {
          $(".chooseBike tr td").each(function() {
            $(this)
              .removeClass("expanded")
              .addClass("collapsed");
          });

          $(this)
            .addClass("expanded")
            .removeClass("collapsed");
        })
        .on("mouseleave", function() {
          $(".chooseBike tr td").each(function() {
            $(this).removeClass("expanded collapsed");
          });
        });
    }

    // Handle Expanded and Collapsed states
    $(".chooseControls tr td")
      .on("mouseenter", function() {
        $(".chooseControls tr td").each(function() {
          $(this)
            .removeClass("expanded")
            .addClass("collapsed");
        });
        $(this)
          .removeClass("collapsed")
          .addClass("expanded");
        module.resizeControls(
          $(this)
            .attr("class")
            .split(" ")[0]
        );
      })
      .on("mouseout", function() {
        $(this)
          .removeClass("expanded")
          .addClass("collapsed");
        module.resizeControls();
      });

    // Connect phone
    $(".connectPhone .buttonWrapper button").on("click", function() {
      if ($(".connectPhone input").hasClass("valid") && syncId) {
        MobileControllerDesktop.outgoing.sendSMS(
          $(".connectPhone input").val(),
          syncId
        );
      }
    });

    // Facebook social share
    /*$(
      ".summary.desktop .social .facebook a, .summary.mobile .social_icons .facebook a"
    ).on("click", function(e) {
      e.preventDefault();
      FB.ui({
        method: "feed",
        name: "Love to ride?",
        link: "http://ridetolive.nsw.gov.au",
        picture: document.domain + "/hpt/img/facebook_share.jpg",
        caption: " ",
        description:
          "Test your skills with this interactive hazard test at ridetolive.nsw.gov.au",
        redirect_uri: document.domain + "/hpt/"
      });
    });*/

    $(
      ".summary.desktop .social .facebook a, .summary.mobile .social_icons .facebook a"
    ).on("click", function(e) {
      e.preventDefault();
      var width = 626;
      var height = 328;
      window.open(
        "http://www.facebook.com/sharer.php?u=" +
          encodeURIComponent(window.location.href.split("?")[0]) +
          "&t=" +
          encodeURIComponent(document.title),
        "sharer",
        "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=" +
          width +
          ", height=" +
          height +
          ", top=" +
          screen.height / 2 -
          height / 2 +
          ", left=" +
          screen.width / 2 -
          width / 2
      );
    });

    // Twitter
    $(
      ".summary.desktop .social .twitter a, .summary.mobile .social_icons .twitter a"
    ).on("click", function(e) {
      e.preventDefault();
      Util.popupWindow(
        "https://twitter.com/intent/tweet?text=Love to ride? Test your skills with this interactive hazard test at " +
          encodeURIComponent("https://ridetolive.nsw.gov.au"),
        "",
        550,
        500
      );
    });
  };

  // Resize commuter/recreational screen
  module.resizeCommuterRecreation = function(item) {
    var containerWidth = $(".chooseTest").outerWidth(),
      imageWidth = 1920,
      gap = (containerWidth - imageWidth) / 2;

    switch (item) {
      case "left":
        $(".chooseTest .left").css({ "background-position": gap + "px 50%" });
        $(".chooseTest .right").css({ "background-position": "-960px 50%" });
        break;
      case "right":
        $(".chooseTest .left").css({ "background-position": gap + "px 50%" });
        $(".chooseTest .right").css({ "background-position": "0 50%" });
        break;
      default:
      // $(".chooseTest .left").css({ "background-position": gap + "px 50%" });
      // $(".chooseTest .right").css({ "background-position": "-480px 50%" });
    }
  };

  // Resize controls
  module.resizeControls = function(item) {
    var containerWidth = $(".chooseControls").outerWidth(),
      imageWidth = 1900,
      collapsedWidth = containerWidth / 4,
      gap = (containerWidth - imageWidth) / 2;

    switch (item) {
      case "one":
        $(".chooseControls .two").css({
          "background-position": -(containerWidth / 2 - gap) + "px 50%"
        });
        $(".chooseControls .three").css({
          "background-position": collapsedWidth - gap - imageWidth + "px 50%"
        });
        break;
      case "two":
        $(".chooseControls .two").css({ "background-position": "50% 50%" });
        $(".chooseControls .three").css({
          "background-position": collapsedWidth - gap - imageWidth + "px 50%"
        });
        break;
      case "three":
        $(".chooseControls .two").css({
          "background-position": -(collapsedWidth - gap) + "px 50%"
        });
        $(".chooseControls .three").css({
          "background-position": -(containerWidth / 2 - gap) + "px 50%"
        });
        break;
      default:
        $(".chooseControls .one").css({
          "background-position": (containerWidth - imageWidth) / 2 + "px 50%"
        });
        $(".chooseControls .two").css({ "background-position": "50% 50%" });
        $(".chooseControls .three").css({
          "background-position": -((containerWidth / 3) * 2 - gap) + "px 50%"
        });
        break;
    }
  };

  // Test summary desktop tips copy resizing baggage
  module.resizeSummary = function() {
    $(".test_summary.desktop .tip_copy").height(
      $(".test_summary.desktop .tips_container").height() -
        ($(".test_summary.desktop .tip_content").height() -
          $(".test_summary.desktop .tip_copy").height())
    );
  };

  // Resize function
  var _resizeEvent;

  $(window).on("resize", function() {
    // Clear current timeout
    clearTimeout(_resizeEvent);

    // Create new timeout
    _resizeEvent = setTimeout(function() {
      if ($("#mainHeader").is(":visible")) {
        $("#content").css(
          "height",
          window.innerHeight - $("#mainHeader").height()
        );
      } else {
        $("#content").css("height", window.innerHeight);
      }

      if ($("body").hasClass("on-device")) {
        UI.scrollTop();
      }

      module.resizeSummary();

      // Only resize the choose test page if they are on desktop
      if (window.innerWidth > 760) {
        module.resizeCommuterRecreation();
      }

      module.resizeControls();
    }, 0);
  });

  // Resize the page
  module.triggerResize = function() {
    $(window).trigger("resize");
  };

  module.triggerResize();

  module.resultsPageResizer = function() {
    // Which is bigger, left content or right content?
    var leftHeight = $(".test_summary.desktop .left").height();
    var rightHeight = $(".test_summary.desktop .right").height();
  };

  module.leaveIntroVideo = function() {
    if (!watchedIntro) {
      $(".intro-container").jPlayer("pause");
      $("#content").fadeOut("slow", function() {
        if ($(".intro-container video").length > 0) {
          $(".intro-container video")[0].src = "";
          $(".intro-container video")[0].load();
          //delete($(".intro-container video")[0]);
        }
        App.loadAndPlayTest(
          HPT.typeOfControls,
          HPT.typeOfVideo,
          HPT.typeOfTest,
          HPT.currentIndex,
          playrateDisabled
        );
      });
    }
    watchedIntro = true;
  };

  /**
   * Sweet javascript to position video
   */
  module.resizeIntroVideo = function() {
    if (introReadyToPlay) {
      var ww = $(window).width();
      var wh = $(window).height() - 140;

      if (ww / wh > Settings.introSize.width / Settings.introSize.height) {
        // Pad sides
        var nh = wh;
        var nw = (Settings.introSize.width / Settings.introSize.height) * nh;
        $(".introVideo").css("margin-top", "0px");
        $(".intro-container").jPlayer({
          size: {
            width: nw + "px",
            height: nh + "px"
          }
        });
      } else {
        var nw = ww;
        var nh = (Settings.introSize.height / Settings.introSize.width) * nw;
        var top = wh / 2 - nh / 2;
        // Pad top & bottom
        $(".introVideo").css("margin-top", top + "px");
        $(".intro-container").jPlayer({
          size: {
            width: nw + "px",
            height: nh + "px"
          }
        });
      }
    }
  };

  module.skipToTestByUrl = function() {
    var args = Util.getDetailsFromUrl();
    var type = args.type;
    var id = args.id;
    if (type && id) {
      module.skipToTest(type, id);
    }
  };

  module.skipToTest = function(type, id) {
    var args = Util.getDetailsFromUrl();

    if (type == "results") {
      module.changePage("summary");
      Flow.showPopulateSummary();
      Flow.showPopulateSummaryMobile();
    } else {
      HPT.typeOfTest = type ? type : "commuter";
      HPT.currentIndex = id ? parseInt(id) : 0;
      HPT.typeOfBike = "naked";

      SequenceManager.setupResultsObject();

      if (Util.isIOS()) {
        Orientation.init();
        OnDevice.init();
        HPT.typeOfVideo = "jpeg";
        HPT.typeOfControls = "onDevice";
        SoundManager.init(HPT.typeOfBike);
      } else if (Util.isSafari()) {
        // Safari macbook users only
        HPT.typeOfVideo = "jpeg";
        HPT.typeOfControls = "desktop";
        SoundManager.init(HPT.typeOfBike);
      } else {
        HPT.typeOfVideo = "html";
        if (Util.isAndroid()) {
          Orientation.init();
          OnDevice.init();
          HPT.typeOfControls = "onDevice";
        } else {
          HPT.typeOfControls = "desktop";
        }
      }

      //$("#instructionBar").removeClass("show");
      //module.changePage("introVideo");

      if (window.localStorage.getItem("hptTraining") === null) {
        App.showTraining();
      } else {
        if ((Util.isChrome() || Util.isFirefox()) && args.type != undefined) {
          App.showTraining();
        } else {
          // All safari user doesn't show training screen when return visitors.
          App.loadAndPlayTest(
            HPT.typeOfControls,
            HPT.typeOfVideo,
            HPT.typeOfTest,
            HPT.currentIndex
          );
        }
      }
    }
  };
})((window.Onboarding = window.Onboarding || {}));
