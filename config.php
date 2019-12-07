<?php

/*
 Sets up the PDO database connection
*/
function setConnectionInfo($values=array()) {
      //For EasyPHP Local Webserver
	$connString = "mysql:host=localhost;dbname=ridetolive";
      $user = "root"; 
      $password = "";
      $pdo = new PDO($connString,$user,$password);
      $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      return $pdo;      
}

session_start();

?>
