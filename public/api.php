<?php
require_once 'init.php';
ob_clean();
$urlInfo = array(

  'userinfo'    => array(

    'url'           => 'http://api.engagor.com/me', 
    'cache_expire'  => 0),

  'insights'    => array(

    'url'           => 'http://api.engagor.com/:account_id/insights/facets',
    'cache_expire'  => 0)

);
$key = md5(implode('.', $_REQUEST));
$output = array('info' => 'from_cache', 'output' => '');
//FIXME check cache for key, if hit, return from cache, else try calling api
if(FALSE) {
  //cache hit
} else {
  //prepare to call the api
  $url = $urlInfo[$_REQUEST['endpoint']]['url'];
  if(isset($_REQUEST['user_id'])) {
    $url = str_replace(':account_id', $_REQUEST['user_id'], $url);
  }
  $request = array();
  $params = array_keys($_REQUEST);
  foreach($params as $param) {
    if('endpoint' == $param) {
      continue;
    }
    $request[] = $param . "=" . $_REQUEST[$param];
  }

  $requestStr = implode('&', $request);
  $url .= "?" . $requestStr;
  echo file_get_contents($url);
  //FIXME add error handling stuff here as well
}
?>
