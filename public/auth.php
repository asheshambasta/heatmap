<?php
require_once 'init.php';
$_SESSION['access_token'] = NULL;
if (isset($_REQUEST['code'])) {
  //get new access token
  $tokenURL = 'http://app.engagor.com/oauth/access_token/?client_id=' . CLIENT_ID . '&client_secret=' . CLIENT_SECRET . '&grant_type=authorization_code&code=' . $_REQUEST['code'];
  $responseStr = file_get_contents($tokenURL);
  error_log("###" . $responseStr);
  $tokenResponse = json_decode($responseStr, TRUE);
  //check if we got an access_token without problems
  if(isset($tokenResponse['access_token'])) {
    //set in the session
    $_SESSION['access_token'] = $tokenResponse['access_token'];
    //and now redirect to index
    $redirectURL = "Location: http://" . $_SERVER['SERVER_NAME'] . '/index.php';
    header($redirectURL, TRUE);
  } else {
    //handle errors here
    echo "Error getting access token: " . var_export($tokenResponse, TRUE);
  }
} else {
  //handle authentication failure here
}
?>
