<?php 
  include 'config.php';
  $pdo = setConnectionInfo();
    
    if (isset($_SESSION["Id"])) {
        $riderID = $_SESSION["Id"];
        $riderName = $_SESSION["name"];
    }

    if (isset($_POST['submitTestA'])) {
        $driverID = $riderID;
        $reactionTime = $_POST['reactionTime'];
        $alertType = $_POST['alertTypeTestA'];
        $selectedLane = $_POST['selectedLane'];
        $query = "INSERT INTO ride_record (driverID, reactionTime, alertType, selectedLane) VALUES (?, ?, ?, ?);";
        $stmt = $pdo->prepare($query);
    try {
        $stmt->execute([$driverID, $reactionTime, $alertType, $selectedLane]);
        
    } catch(PDOExecption $e) {
        $pdo->rollback();
        print "Error!: " . $e->getMessage() . "</br>";
    }        
    }
?>


<!DOCTYPE html>
<html lang="en">
    <!-- 4d434d43204d4f544f524359434c4520434c5542 -->
    <head>

        <!-- Google Tag Manager -->
        <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-PFJ85D5');</script>
        <!-- End Google Tag Manager -->

        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, minimal-ui, user-scalable=no, minimum-scale=1">
        <meta name="description" content="Check out motorcycle tips, trips and an interactive hazard test at ridetolive.nsw.gov.au.">
        <meta name="keywords" content="Ride to Live">
        <meta property="og:title" content="RIDE TO LIVE"/>
        <meta property="og:description" content="Check out motorcycle tips, trips and an interactive hazard test at ridetolive.nsw.gov.au."/>
        <title>Test - Ride to Live</title>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css">
        <link rel="icon" type="image/icon" href="img/favicon.ico">
        <link href="css/style.css" rel="stylesheet" type="text/css" media="all">
        <link href="css/dirk.css" rel="stylesheet" type="text/css" media="all">
        <!--[if lte IE 8]>
        <link href="css/ie8.css" rel="stylesheet" type="text/css" media="all">
        <![endif]-->

        <!-- GA -->
        <script>
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

            ga('create', 'UA-45664925-6', 'auto');
            ga('send', 'pageview');
        </script>
        <style type="text/css">
            #Alert_sound{
                position: absolute;
                left: 620px;
                top: 48px;
              visibility: hidden;
            }
            #testA{
                position: absolute;
                top: 50px;
                left: 230px;
            }
        </style>
    </head>
    <body>

    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PFJ85D5"
                      height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->

        <div id="buffering">
            <div class="inner">
                <img src="img/buffering.png" />
            </div>
        </div>
        <div id="overlay">
            <h1 class="test-name-title"></h1>
            <div class="on-device">
                <div class="on-device-a"></div>
                <div class="on-device-b"></div>
                <h1 class="on-device-test-name-title"></h1>
                <button class="throttle">Throttle</button>
                <button class="brake">Brake</button>

                <div class="speedo">
                    <div class="loadIndicator"></div>
                    <div class="countdown"></div>
                    <div class="speed">
                        <div class="km"></div>
                        <div class="metric">KM/H</div>
                    </div>
                    <div class="test-name"></div>
                </div>
            </div>
            <img src="img/old/visor.png" class="mask-img" />
            <div class="mask-div"></div>
            <img src="img/old/a-select-overlay.png" class="a-select-indicator indicator" />
            <img src="img/old/b-select-overlay.png" class="b-select-indicator indicator" />

            <div class="training_area">
                <table class="content desktop">
                    <tbody>
                        <tr>
                            <td class="one">
                                USE YOUR MOUSE/TRACKPAD<br />
                                TO MOVE YOUR VISOR
                                <div class="image"></div>
                            </td>
                            <td class="two">
                                <span class="focus">CHECK YOUR SPEED</span><br />
                                MOVE YOUR MOUSE DOWN TO<br />
                                SEE YOUR SPEEDOMETER
                                <div class="image"></div>
                            </td>
                            <td class="three">
                                USE THE DOWN ARROW<br />
                                TO <span class="focus">BRAKE</span>
                                <div class="image"></div>
                            </td>
                            <td class="four">
                                USE THE UP ARROW<br />
                                TO <span class="focus">THROTTLE</span>
                                <div class="image"></div>
                            </td>
                            <td class="five">
                                USE THE SIDE ARROWS WHEN<br/ >
                                YOU NEED TO CHOOSE A LINE
                                <div class="image"></div>
                            </td>
                            <td class="six">
                                ENSURE YOUR SOUND IS ON<br/ >
                                BEFORE STARTING
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="player">
                <div class="progressCircle">
                    <div class="circle_sprite five_divisions one"></div>
                    <p class="text">
                        CORNERING RIGHT
                    </p>
                </div>
                <div class="training_circle one">
                    <p class="text">TRAINING</p>
                </div>
                <div class="speedoContainer">
                    <div class="speedo five_divisions"></div>
                    <div class="loadIndicator"></div>
                    <div class="countdown"></div>
                    <p class="speed">
                        60
                    </p>
                    <p class="metric">KM/H</p>
                </div>
                <div class="soundToggle"></div>
                <div class="button_wrapper">
                  <button class="skip-training">SKIP TRAINING</button>
                  <div class="next">NEXT</div>
                </div>
            </div>
            <div class="footer">
              <p class="terms">
                By proceeding to this webpage, you acknowledge that you have read, understood and accept the
                <a href="https://ridetolive.nsw.gov.au/pages/site-terms">Terms</a>.
                The information on this Site is intended to give only a theoretical indication of your
                 ability to assess and manage the risks of motorcycle riding. It remains your responsibility
                 at all times to ensure you are a licensed, capable and safe rider.
              </p>
          </div>

        </div>

        <div class="video-area-wrapper">
            <div class="video-area" style="display:none">
                <div class="bike-overlay"></div>
                <div class="jpeg-area">
                    <canvas class="main" width="0" height="0"></canvas>
                </div>
                <div class="jplayer-area"></div>
            </div>
        </div>

        <div id="mainHeader">
            <audio id="Alert_sound" controls>
              <source src="./sequences/audio/Alert_sound1.mp3" type="audio/mpeg">
              Your browser does not support the audio element.
            </audio>
            <ul class="mobile-toggle">
              <li class="toggle">
                <a
                  href="#"
                  data-action="mobile_nav"
                  class="show-menu"
                  ><i></i> <span><span class="el-offscreen"> Menu</span> </span></a
                >
              </li>
            </ul>
            <ul class="links">
                <li class="first active">
                    <a class="test" href="/hpt/index.html" target="_self"></a>
                </li>
                <li>
                    <a class="trips" href="/trips"></a>
                </li>
                <li class="last">
                    <a class="tips" href="/tips"></a>
                </li>
            </ul>
        </div>
        <div id="instructionBar">
            <div class="close"></div>
            <div class="back"></div>
            <p class="instruction">
                CHOOSE YOUR TEST
            </p>
        </div>

        <div id="content">

            <!-- Landing page -->
            <div class="layout-tests landingPage">
                <section class="section--split">
                    <div class="bg">
                        <div></div>
                        <div></div>
                    </div>
                    <header class="section--split__header">
                        <h2><a href="index.php">Back to Test</a></h2>
                        <h2><?php echo("Hello! ".$riderName); ?></h2>
                        <h1>Take the virtual ride</h1>
                        <p>Choose a test</p>
                    </header>

                    <div class="accordion">
                        <label for="commuter">
                            <h2 class="option">Commuter Test A</h2>
                        </label>
                        <input type="checkbox" name="test-type" id="commuter" />
                        <div id="testA">
                            <a href="" id="commuter0" class="button--large test-tile">Buffering and Approaching An intersection</a>
                            <!-- <a href="" id="commuter1" class="button--large test-tile">Cornering Right</a>
                            <a href="" id="commuter2" class="button--large test-tile">Following distance</a>
                            <a href="" id="commuter3" class="button--large test-tile">Buffering</a>
                            <a href="" id="commuter4" class="button--large test-tile">Cornering Left & Right</a>
                            <a href="" id="commuter5" class="button--large test-tile">Approaching An Intersection</a>
                             --><div class="accordion__footer">
                                <a href="" class="button--primary see-results">See Results</a>
                            </div>
                        </div>
                    </div>
                    <div class="accordion">
                        <label for="recreational">
                            <h2 class="option">Instructions</h2>
                        </label>
                        <div class="training_area">
                <table class="content desktop">
                    <tbody>
                        <tr>
                            <td class="one button--large test-tile">
                                USE YOUR MOUSE/TRACKPAD
                                TO MOVE YOUR VISOR
                                <div class="image"></div>
                            </td>
                            <td class="two button--large test-tile">
                                CHECK YOUR SPEED
                                MOVE YOUR MOUSE DOWN TO
                                SEE YOUR SPEEDOMETER
                                <div class="image"></div>
                            </td>
                            <td class="three button--large test-tile">
                                USE THE DOWN ARROW
                                TO BRAKE
                                <div class="image"></div>
                            </td>
                            <td class="four button--large test-tile">
                                USE THE UP ARROW
                                TO THROTTLE
                                <div class="image"></div>
                            </td>
                            <td class="five button--large test-tile">
                                USE THE SIDE ARROWS WHEN
                                YOU NEED TO CHOOSE A LINE
                                <div class="image"></div>
                            </td>
                            <td class="six button--large test-tile">
                                ENSURE YOUR SOUND IS ON
                                BEFORE STARTING
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
                    </div><!-- 
                    <div class="section--split__footer">
                        <a href="" class="button--primary see-results">See Results</a>
                    </div> -->
                </section>
            </div>

            <!--  Choose the test -->
            <table class="chooseTest">
                <tbody>
                    <tr>
                        <td class="left">
                            <i class="icon"></i>
                            <p class="option">
                                COMMUTER
                            </p>
                        </td>
                        <td class="right">
                            <i class="icon"></i>
                            <p class="option">
                                RECREATIONAL
                            </p>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Connect phone -->
            <table class="connectPhone">
                <tbody>
                    <tr>
                        <td>
                            <h2 class="phone">CONNECT YOUR SMARTPHONE TO YOUR COMPUTER</h2>
                            <h2 class="tablet">CONNECT YOUR TABLET FOR HANDHELD CONTROL</h2>
                            <div class="buttonWrapper phone">
                                <input type="text" placeholder="Enter your mobile number" /><button>SMS ME A LINK</button>
                            </div>

                            <div class="copyWrapper">
                                <p>
                                    <span class="phone-inline">Or go</span><span class="tablet-inline">Go</span> to <a href="https://ridetolive.nsw.gov.au" target="_blank">ridetolive.nsw.gov.au</a> on your <span class="phone-inline">mobile</span><span class="tablet-inline">tablet</span> browser and enter <strong class="sync-id-container">...</strong>
                                </p>
                                <p class="chooseAnother">
                                    Use your <a class="white useTablet" href="#"><span class="phone-inline">tablet</span><span class="tablet-inline">phone</span></a> or <a class="white useMouse" href="#">mouse</a>.
                                </p>
                            </div>

                            <div class="copyWrapper sentOnly">
                                <p>
                                    Haven't recieved the link?
                                </p>
                                <p>
                                    <a href="#">Send it again</a> or go to <a href="https://ridetolive.nsw.gov.au">ridetolive.nsw.gov.au</a> in your mobile browser and enter <strong class="sync-id-container">...</strong>
                                </p>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Connected -->
            <table class="connected">
                <tbody>
                    <tr>
                        <td>
                            <h2>YOU ARE NOW CONNECTED</h2>
                            <div class="connectedImage"></div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Instructions -->
            <table class="instructions">
                <tbody>
                    <tr>
                        <td>
                            <i class="close"></i>
                            <div class="mask"></div>
                            <p>
                                MOVE YOUR MOUSE/TRACKPAD<br/>
                                TO MOVE YOUR VISOR
                            </p>
                            <div class="player">
                                <div class="progressCircle">
                                    <div class="circle_sprite five_divisions one"></div>
                                    <p class="text">
                                        CORNERING RIGHT
                                    </p>
                                </div>
                                <div class="speedoContainer">
                                    <div class="speedo five_divisions"></div>
                                    <p class="speed">
                                        60
                                    </p>
                                    <p class="metric">KM/H</p>
                                </div>
                                <div class="soundToggle"></div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Loading Screen Mobile -->
            <table class="loading_screen_mobile">
                <tbody>
                    <tr>
                        <td>
                            <div class="wrapper">
                                <div class="loading-percentage">54%</div>
                                <div class="loading-message">Loading panoramic video,<br />hand on for a minute or two...</div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Speed fail -->
            <table class="speed_fail">
                <tbody>
                <tr>
                    <td>
                        <h2 class="title">TOO FAST!</h2>
                        <h3 class="description">Keep an eye on the speedo.</h3>
                        <div class="speedo">
                            <p class="speed"></p>
                            <p class="metric">KM/H</p>
                        </div>
                        <button class="button yellow">TRY AGAIN</button>
                    </td>
                </tr>
                </tbody>
            </table>

            <!-- Advisory warning -->
            <table class="advisory_warning">
                <tbody>
                <tr>
                    <td>
                        <h2 class="title">WATCH THAT SPEEDO</h2>
                        <h3 class="description">Advisory signs are there to assist you in making decisions as you approach corners, intersections and speed humps.</h3>
                        <div class="speedo">
                            <p class="speed">68</p>
                            <p class="metric">KM/H</p>
                        </div>
                        <button class="button yellow">CONTINUE</button>
                    </td>
                </tr>
                </tbody>
            </table>

            <!-- Test summary for desktop-->
            <table class="test_summary desktop">
                <tbody>
                    <tr class="aspect_ratio_bar">
                        <td></td>
                    </tr>
                    <tr class="letter_box">
                        <td>
                            <table class="content">
                                <tbody>
                                    <tr>
                                        <td class="results_container">
                                            <h3 class="heading"></h3>
                                            <h4 class="sub_heading"></h4>
                                            <table class="results_table">
                                                <thead>
                                                    <tr>
                                                        <td class="approach_speed">APPROACH<br>SPEED</td>
                                                        <td class="reaction_time">REACTION<br>TIME</td>
                                                        <td class="lane_position">LANE<br>POSITION</td>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td class="approach_speed">
                                                            <div class="approach">
                                                                <p class="speed">58</p>
                                                                <p class="metric">KM/H</p>
                                                            </div>
                                                            <div class="status pass"></div>
                                                        </td>
                                                        <td class="reaction_time reaction_time_value">
                                                            <div class="reaction fail"></div>
                                                            <div class="status pass"></div>
                                                        </td>
                                                        <td class="lane_position">
                                                            <div class="position a"></div>
                                                            <div class="status fail"></div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <div class="button_wrapper">
                                                <form method="POST">
                                                    <input type="hidden" name="reactionTime" id="reactionTime">
                                                    <input type="hidden" name="alertTypeTestA" id="alertTypeTestA" value="sound">
                                                    <input type="hidden" name="selectedLane" id="selectedChoice">
                                                <button class="try_again">TRY AGAIN</button>
                                                <button type="submit" name="submitTestA" class="save_test">SAVE TEST</button>
                                                </form>
                                            </div>
                                        </td>
                                        <td class="tips_container">
                                            <table class="tip_content">
                                                <thead>
                                                    <tr>
                                                        <td class="heading">HAZARD AVOIDANCE TIPS</td>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            <img class="image" src="img/hazard_tips/image_hazard_approaching_an_intersection.png" alt="">
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td class="tip_copy">On right curves slow down and keep to the left until you see the road is clear of oncoming traffic.</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr class="aspect_ratio_bar">
                        <td></td>
                    </tr>
                </tbody>
            </table>

            <!-- Test summary for mobile -->
            <div class="test_summary mobile">
                <h3 class="heading"></h3>
                <h4 class="sub_heading"></h4>
                <table class="results_table">
                    <tbody>
                        <tr class="approach_speed">
                            <td class="status">
                                <div class="icon tick"></div>
                            </td>
                            <td class="title">APPROACH SPEED</td>
                        </tr>
                        <tr class="reaction_time">
                            <td class="status">
                                <div class="icon cross"></div>
                            </td>
                            <td class="title">REACTION TIME</td>
                        </tr>
                        <tr class="lane_position">
                            <td class="status">
                                <div class="icon tick"></div>
                            </td>
                            <td class="title">LANE POSITION</td>
                        </tr>
                    </tbody>
                </table>
                <div class="button_wrapper">
                    <form method="POST">
                        <input type="hidden" name="reactionTime" id="reactionTime">
                        <input type="hidden" name="alertTypeTestA" id="alertTypeTestA" value="sound">
                        <input type="hidden" name="selectedLane" id="selectedChoice">
                    <button class="try_again">TRY AGAIN</button>
                    <button type="submit" name="submitTestA" class="save_test">SAVE TEST</button>
                    </form>
                </div>
                <p class="avoidance_tips">
                    HAZARD AVOIDANCE TIPS
                </p>
                <div class="double_arrow_down"></div>
                <table class="hazard_avoidance_tips_table">
                    <thead>
                        <tr>
                            <td colspan="2">HAZARD AVOIDANCE TIPS</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="tip_image"></td>
                            <td class="tip_copy">Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum.</td>
                        </tr>
                    </tbody>
                </table>
                <div class="button_wrapper">
                    <form method="POST">
                        <input type="hidden" name="reactionTime" id="reactionTime">
                        <input type="hidden" name="alertTypeTestA" id="alertTypeTestA" value="sound">
                        <input type="hidden" name="selectedLane" id="selectedChoice">
                    <button class="try_again">TRY AGAIN</button>
                    <button type="submit" name="submitTestA" class="save_test">SAVE TEST</button>
                    </form>
                </div>
            </div>

            <!-- Overall summary for desktop -->
            <table class="summary desktop">
                <tbody>
                    <tr>
                        <td>
                            <h3>PRETTY GOOD</h3>
                            <h4>BUT NO ROOM FOR COMPLACENCY</h4>
                            <table class="results" align="center" border="0" cellspacing="1" cellpadding="0" width="100%">
                                <thead>
                                    <tr>
                                        <th class="result" colspan="2">RESULT</th>
                                        <th class="approach">APPROACH</th>
                                        <th class="reaction">REACTION</th>
                                        <th class="position">POSITION</th>
                                        <th class="rider_tips">RIDER TIPS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr class="row failure">
                                        <td class="icon">
                                            <div class="eighty_px_container">
                                                <i class="image"></i>
                                            </div>
                                        </td>
                                        <td class="result">CORNERING RIGHT</td>
                                        <td class="approach failure">
                                            <i class="image"></i>
                                        </td>
                                        <td class="reaction">
                                            <i class="image"></i>
                                        </td>
                                        <td class="position failure">
                                            <i class="image"></i>
                                        </td>
                                        <td class="rider_tips"><a href="/tips/Cornering" target="_blank">VIEW TIPS <i class="arrow"></i></a></td>
                                    </tr>
                                    <tr class="row">
                                        <td class="icon">
                                            <div class="eighty_px_container">
                                                <i class="image"></i>
                                            </div>
                                        </td>
                                        <td class="result">CORNERING LEFT</td>
                                        <td class="approach failure">
                                            <i class="image"></i>
                                        </td>
                                        <td class="reaction">
                                            <i class="image"></i>
                                        </td>
                                        <td class="position failure">
                                            <i class="image"></i>
                                        </td>
                                        <td class="rider_tips"><a href="/tips/Cornering" target="_blank">VIEW TIPS <i class="arrow"></i></a></td>
                                    </tr>
                                    <tr class="row">
                                        <td class="icon">
                                            <div class="eighty_px_container">
                                                <i class="image"></i>
                                            </div>
                                        </td>
                                        <td class="result">SAFE BUFFERING</td>
                                        <td class="approach failure">
                                            <i class="image"></i>
                                        </td>
                                        <td class="reaction">
                                            <i class="image"></i>
                                        </td>
                                        <td class="position failure">
                                            <i class="image"></i>
                                        </td>
                                        <td class="rider_tips"><a href="/tips/Cornering" target="_blank">VIEW TIPS <i class="arrow"></i></a></td>
                                    </tr>
                                    <tr class="row">
                                        <td class="icon">
                                            <div class="eighty_px_container">
                                                <i class="image"></i>
                                            </div>
                                        </td>
                                        <td class="result">APPROACHING AN INTERSECTION</td>
                                        <td class="approach failure">
                                            <i class="image"></i>
                                        </td>
                                        <td class="reaction">
                                            <i class="image"></i>
                                        </td>
                                        <td class="position failure">
                                            <i class="image"></i>
                                        </td>
                                        <td class="rider_tips"><a href="/tips/safe-distance" target="_blank">VIEW TIPS <i class="arrow"></i></a></td>
                                    </tr>
                                    <tr class="row failure">
                                        <td class="icon">
                                            <div class="eighty_px_container">
                                                <i class="image"></i>
                                            </div>
                                        </td>
                                        <td class="result">AVOIDING A LANE SIDE SWIPE</td>
                                        <td class="approach failure">
                                            <i class="image"></i>
                                        </td>
                                        <td class="reaction">
                                            <i class="image"></i>
                                        </td>
                                        <td class="position failure">
                                            <i class="image"></i>
                                        </td>
                                        <td class="rider_tips"><a href="/tips/safe-distance" target="_blank">VIEW TIPS <i class="arrow"></i></a></td>
                                    </tr>
                                    <tr class="row">
                                        <td class="icon">
                                            <div class="eighty_px_container">
                                                <i class="image"></i>
                                            </div>
                                        </td>
                                        <td class="result">AVOIDING HAZARD</td>
                                        <td class="approach failure">
                                            <i class="image"></i>
                                        </td>
                                        <td class="reaction">
                                            <i class="image"></i>
                                        </td>
                                        <td class="position failure">
                                            <i class="image"></i>
                                        </td>
                                        <td class="rider_tips"><a href="/tips/safe-distance" target="_blank">VIEW TIPS <i class="arrow"></i></a></td>
                                    </tr>
                                </tbody>
                            </table>
                            <div class="social_wrapper">
                                <button class="button yellow chooseAnother" href="/hpt/index.html">TAKE ANOTHER TEST</button>
                                <ul class="social">
                                    <li class="share">
                                        SHARE THIS TEST:
                                    </li>
                                    <li class="twitter">
                                        <a href="#"></a>
                                    </li>
                                    <li class="facebook">
                                        <a href="#"></a>
                                    </li>
                                    <li class="email">
                                        <a href="mailto:?subject=Tests from ridetolive.nsw.gov.au&body=Hi,%0D%0A%0D%0ACheck out the tests over at ridetolive.nsw.gov.au.%0D%0A%0D%0A"></a>
                                    </li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Overall summary for mobile -->
            <div class="summary mobile">
                <h3 class="heading">PRETTY GOOD</h3>
                <h4 class="sub_heading">BUT NO ROOM FOR COMPLACENCY</h4>
                <table class="summary_table">
                    <tbody>
                        <tr class="row failure">
                            <td class="status">
                                <div class="icon"></div>
                            </td>
                            <td class="test">CORNERING RIGHT</td>
                            <td class="tip"><a href="/tips/Cornering" target="_blank"><span class="copy">VIEW TIPS</span></a></td>
                        </tr>
                        <tr class="row">
                            <td class="status">
                                <div class="icon"></div>
                            </td>
                            <td class="test">CORNERING LEFT</td>
                            <td class="tip"><a href="/tips/Cornering" target="_blank"><span class="copy">VIEW TIPS</span></a></td>
                        </tr>
                        <tr class="row">
                            <td class="status">
                                <div class="icon"></div>
                            </td>
                            <td class="test">SAFE BUFFERING</td>
                            <td class="tip"><a href="/tips/safe-distance" target="_blank"><span class="copy">VIEW TIPS</span></a></td>
                        </tr>
                        <tr class="row">
                            <td class="status">
                                <div class="icon"></div>
                            </td>
                            <td class="test">APPROACHING AN INTERSECTION</td>
                            <td class="tip"><a href="/tips/safe-distance" target="_blank"><span class="copy">VIEW TIPS</span></a></td>
                        </tr>
                        <tr class="row failure">
                            <td class="status">
                                <div class="icon"></div>
                            </td>
                            <td class="test">AVOIDING A LANE SIDE SWIPE</td>
                            <td class="tip"><a href="/tips/safe-distance" target="_blank"><span class="copy">VIEW TIPS</span></a></td>
                        </tr>
                        <tr class="row">
                            <td class="status">
                                <div class="icon"></div>
                            </td>
                            <td class="test">AVOIDING HAZARD</td>
                            <td class="tip"><a href="/tips/safe-distance" target="_blank"><span class="copy">VIEW TIPS</span></a></td>
                        </tr>
                    </tbody>
                </table>
                <button class="yellow chooseAnother" href="/hpt/index.html">TAKE ANOTHER TEST</button>
                <div class="share_wrapper">
                    <p class="copy">SHARE THIS TEST:</p>
                    <ul class="social_icons">
                        <li class="twitter">
                            <a href="#"></a>
                        </li>
                        <li class="facebook">
                            <a href="#"></a>
                        </li>
                        <li class="email">
                            <a href="mailto:?subject=Tests from ridetolive.nsw.gov.au&body=Hi,%0D%0A%0D%0ACheck out the tests over at ridetolive.nsw.gov.au.%0D%0A%0D%0A"></a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Choose bike bar -->
        <div id="bottomBar">
            <ul>
                <li class="naked active">
                    <i></i><span>NAKED</span>
                </li>
                <li class="sports">
                    <i></i><span>SPORTS</span>
                </li>
                <li class="cruiser">
                    <i></i><span>CRUISER</span>
                </li>
            </ul>
        </div>

        <!-- Global overlay module -->
        <div id="globalOverlay">
            <div class="table">
                <div class="row">
                    <!-- Install flash modal -->
                    <div data-action="flash_required" class="modal">
                        <div class="top_section">
                            <h2 class="title">Flash Required</h2>
                            <p class="message">
                                Please install the flash plugin from <a href="http://get.adobe.com/flashplayer/">http://get.adobe.com/flashplayer/</a>
                            </p>
                        </div>
                    </div>

                    <!-- Close test modal -->
                    <div data-action="close_test" class="modal">
                        <div class="top_section">
                            <div class="close" data-action="hide_modal"></div>
                            <h2 class="title">EXIT</h2>
                            <p class="message">
                                Are you sure you want to exit the test?
                            </p>
                        </div>
                        <div class="bottom_section">
                            <button class="yellow" data-action="hide_modal">NO</button>
                            <button data-action="exit_test">YES</button>
                        </div>
                    </div>
                    <!-- /Close test modal -->

                    <!-- Share email modal -->
                    <div data-action="share_email" class="modal">

                        <div class="top_section">
                            <div class="close" data-action="hide_modal"></div>
                            <h2 class="title">EMAIL TRIP</h2>

                            <label for="to">TO</label>
                            <input type="text" class="to">

                            <label for="from_name">FROM</label>
                            <input type="text" class="from_name half_width" placeholder="Your name">
                            <input type="text" class="from_email half_width" placeholder="Your Email">

                            <label for="message">MESSAGE</label>
                            <textarea name="message"></textarea>

                            <div id="recaptcha"></div>
                        </div>

                        <div class="bottom_section">
                            <div class="sent_copy">
                                <div class="tick"></div>
                                <p class="copy">Your email has been sent</p>
                            </div>
                            <button data-action="send_email">SEND</button>
                        </div>
                    </div>
                    <!-- / Share email modal -->

                    <!-- Wifi modal -->
                    <div data-action="wifi_notification" class="modal">
                        <div class="top_section">
                            <div class="close" data-action="hide_modal"></div>
                            <h2 class="title">PLEASE NOTE</h2>

                            <p class="message">
                                Take the test via Wi-Fi to avoid using up your mobile data.<br />
                            </p>
                        </div>

                        <div class="bottom_section">
                            <button data-action="exit_test">EXIT</button>
                            <button class="yellow" data-action="hide_modal">CONTINUE</button>
                        </div>
                    </div>
                    <!-- /Wifi modal -->

                    <!-- Unsupported modal -->
                    <div data-action="unsupported_notification" class="modal">
                        <div class="top_section">
                            <h2 class="title">SORRY</h2>

                            <p class="message">
                                This experience uses cutting-edge tech that's not available on your device.<br />
                                Check the list of <a href="#" data-action="show_device_list">suggested devices</a> to see which devices the Test will work on, or try it on your desktop.
                            </p>
                        </div>

                        <div class="bottom_section">
                            <button class="yellow" data-action="exit_test">EXIT</button>
                        </div>
                    </div>
                    <!-- /Unsupported modal -->

                    <!-- Device modal -->
                    <div data-action="devices_notification" class="modal">
                        <div class="top_section">
                            <div class="close" data-action="hide_modal"></div>
                            <h2 class="title">SUPPORTED DEVICES</h2>

                            <ul class="device_list">
                                <li>iPhone 5</li>
                                <li>iPhone 5s</li>
                                <li>iPhone 6</li>
                                <li>iPhone 6s</li>
                                <li>iPad Air</li>
                                <li>Samsung S4</li>
                                <li>Samsung S5</li>
                            </ul>
                        </div>

                        <div class="bottom_section">
                            <button data-action="exit_test">EXIT</button>
                            <button class="yellow" data-action="hide_modal">CONTINUE</button>
                        </div>
                    </div>
                    <!-- /Device modal -->

                    <!-- IPhone Motion & Orientation modal -->
                    <div data-action="iphone_motion_orientation_notification" class="modal">
                        <div class="top_section">
                            <div class="close" data-action="hide_modal"></div>
                            <h2 class="title">PLEASE NOTE</h2>

                            <p class="message">
                                Please enable the Motion setting in:<br />
                                Settings &gt; Safari &gt; Motion & Orientation Access<br />
                            </p>
                        </div>

                        <div class="bottom_section">
                            <button data-action="exit_test">EXIT</button>
                            <button class="yellow" data-action="hide_modal">CONTINUE</button>
                        </div>
                    </div>
                    <!-- /Device modal -->
                </div>
            </div>
        </div>

        <!-- Scripts -->
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js"></script>
        <script src="//www.google.com/recaptcha/api.js"></script>
        <script src="js/libs/jQuery/jquery-1.11.1.min.js"></script>
        <script src="js/libs/plugins.js"></script>
        <script src="js/libs/jquery.jplayer.js"></script>
        <script src="js/libs/orientation.js"></script>
        <script src="js/libs/lodash.js"></script>
        <script src="js/libs/swfobject.js"></script>
        <script src="js/app/Analytics.js"></script>
        <script src="js/app/Util.js"></script>
        <script src="js/app/Settings.js"></script>
        <script src="js/app/UI.js"></script>
        <script src="js/app/JpegSequence.js"></script>
        <script src="js/app/JPlayerSequence.js"></script>
        <script src="js/app/Sequence.js"></script>
        <script src="js/app/SequenceManager.js"></script>
        <script src="js/app/Sound.js"></script>
        <script src="js/app/SoundManager.js"></script>
        <script src="js/app/Flow.js"></script>
        <script src="js/app/Debug.js"></script>
        <script src="js/app/Onboarding.js"></script>
        <script src="js/app/Orientation.js"></script>
        <script src="js/app/OnDevice.js"></script>
        <script src="js/app/MobileControllerDesktop.js"></script>
        <script src="js/app/Training.js"></script>
        <script src="js/app/App.js"></script>
        <script src="js/intro-script.js"></script>
    </body>
</html>
