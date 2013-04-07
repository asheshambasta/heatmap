<?php
define('PUBLIC_DIR', __DIR__);
define('UNIVERSAL_DIR', dirname(__DIR__));
session_start();
set_include_path(
  implode(
    PATH_SEPARATOR, 
    array(
      get_include_path(), 
      dirname(__DIR__) . DIRECTORY_SEPARATOR . 'app')));


require_once 'Riak/Riak.php';
require_once 'Riak/Bucket.php';
require_once 'Riak/Object.php';
require_once 'Riak/Utils.php';
require_once 'Riak/StringIO.php';
//read main.ini and initialise global constants based on that.
$mainINIPath = UNIVERSAL_DIR . DIRECTORY_SEPARATOR . 'config/main.ini';
$config = parse_ini_file($mainINIPath, TRUE);
foreach($config as $section => $constants) {
  foreach($constants as $constName => $value) {
    $constName = strtoupper($section . "_" . $constName);
    define($constName, $value);
  }
}

//include all library files, plece them only when you absolutely need them everytime
//in /lib
$libPath = UNIVERSAL_DIR . DIRECTORY_SEPARATOR . "lib";
$dirhandle = opendir($libPath);
while(FALSE !== ($filename = readdir($dirhandle))) {
  if('..' == $filename || '.' == $filename) {
    continue;
  }
  require_once $libPath . DIRECTORY_SEPARATOR . $filename;
}
$clearSession = ifsetor($_REQUEST, 'clear', FALSE);
error_log("clearsession: " . $clearSession);
if($clearSession) {
  session_destroy();
  session_unset();
  session_start();
}
?>
