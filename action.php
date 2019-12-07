<?php 
  include 'config.php';
  $pdo = setConnectionInfo();

    if (isset($_POST['submit'])) {
        $name = $_POST['name'];
        $age = $_POST['age'];
        $twoWheelerType = $_POST['twoWheelerType'];
        $query = "INSERT INTO registration (name, age, twoWheelerType) VALUES (?, ?, ?);";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$name, $age, $twoWheelerType]);
        
    }

?>