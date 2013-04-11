<?php
require_once dirname(__DIR__) . DIRECTORY_SEPARATOR . 'init.php';
header('content-type: application/json;'); 

$username = ifsetor($_GET, 'username', '');
$password = ifsetor($_GET, 'password', '');
$mode = ifsetor($_GET, 'mode', 'CHECK');
$user = new User($username, $password);
$output = array('value' => FALSE);

switch(strtoupper($mode)) {
case 'CHECK':
  $output['value'] = $user->checkUsernameAvailability();
  break;
case 'SIGNUP':
  if($output['value'] = $user->checkUsernameAvailability()) {
    $user->signup();
  }
  break;
case 'SIGNIN':
  if ($output['value'] = $user->authenticate()) {
    $_SESSION['user'] = $user;
  }
  break;
}
echo json_encode($output);
?>
