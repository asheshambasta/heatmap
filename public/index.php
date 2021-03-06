<?php

require_once __DIR__ . DIRECTORY_SEPARATOR . 'init.php';
//check if access token is set for the user
if(!isset($_SESSION['access_token'])) {
  //if not, redirect for authorization
  //FIXME get a more static store for the access_token? Even memcached will do here
  $redirectURI = 
    'Location: http://app.engagor.com/oauth/authorize/?client_id=' . CLIENT_ID . '&response_type=code&scope=accounts_read%20socialprofiles%20accounts_write%20email';
  header($redirectURI);
  //after successful authorization, we'll redirect back to index.php and do the rest
  //of the stuff to call the api.
}

// else, user has access token, proceed with the stuff here.
?>
<html>
<head>
<link rel="stylesheet" type="text/css" href="css/default.css">
</head>
<body>
  <script src="js/std/d3.v3.min.js"></script>
  <script src="js/std/jquery-1.9.1.min.js"></script>
  <script src="js/app/heatmap.js"></script>
  <script src="js/app/api.js"></script>
  <script src="js/app/ready.js"></script>
  <div id="data_holder" 
    data-access_token="<?php echo $_SESSION['access_token']; ?>">
  </div>

  <div id="chart_container">
  </div>
  <div id="form" class="rightbox">
    <select id="account"/><br>
    <input type="text" id="facetdefinitions" placeholder="Facetdefinitions"/><br>
    <input type="text" id="date_from" placeholder="Date from"/><br>
    <input type="text" id="date_to" placeholder="Date to"/><br>
    <input type="text" id="threshold" placeholder="Threshold"/><br>
<input type="submit" value="Draw"/>
  </div>
  <div id="svg" class="rightbox">
  </div>
</body>
</html>
