<?php 
  include 'config.php';
  $pdo = setConnectionInfo();

    $query = "SELECT * FROM registration INNER JOIN ride_record ON registration.Id = ride_record.driverID";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $records = $stmt->fetchAll();
  
    if (isset($_POST['save'])) {
        $filename = $_POST['filename'];
    header("Content-Type: application/xls");    
    header("Content-Disposition: attachment; filename=".$filename.".xls");  
    header("Pragma: no-cache"); 
    header("Expires: 0");

    $flag = false;
    while ($row = mysql_fetch_assoc($records)) {
        if (!$flag) {
            // display field/column names as first row
            echo implode("\t", array_keys($row)) . "\r\n";
            $flag = true;
        }
        echo implode("\t", array_values($row)) . "\r\n";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <title>Admin</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js"></script>
</head>
<body>

<div class="container">
  <h2>All Recorded Data</h2>
  <h4><a href="index.php">Back To Home</a></h4>
  <div class="float-right">
      <form method="POST">
          <input type="text" name="filename" placeholder="Enter file name">
          <button type="submit" name="save">Save Data</button>
      </form>
  </div>           
  <table class="table table-striped">
    <thead>
      <tr>
        <th>Name</th>
        <th>Age</th>
        <th>Two Wheeler Type</th>
        <th>Date-Time</th>
        <th>Alert Type</th>
        <th>Reaction Time</th>
        <th>Selected Lane</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($records as $record) { ?>
      <tr>
        <td><?php echo($record['name']) ?></td>
        <td><?php echo($record['age']) ?></td>
        <td><?php echo($record['twoWheelerType']) ?></td>
        <td><?php echo($record['date']) ?></td>
        <td><?php echo($record['alertType']) ?></td>
        <td><?php echo($record['reactionTime']) ?></td>
        <td><?php echo($record['selectedLane']) ?></td>
      </tr>
     <?php } ?>
    </tbody>
  </table>
</div>

</body>
</html>
