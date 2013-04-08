<?php
require_once 'init.php';
header('content-type: application/json;'); 
$urlInfo = array(

  'USERINFO'    => array(

    'url'           => 'http://api.engagor.com/me', 
    'cache'         => TRUE,
    'cache_expire'  => 0),

  'ACCOUNTS'    => array(
    'url'           => 'http://api.engagor.com/me/accounts',
    'cache'         => FALSE,
    'cache_expire'  => 0),

  'INSIGHTS'    => array(

    'url'           => 'http://api.engagor.com/:account_id/insights/facets',
    'cache'         => FALSE,
    'cache_expire'  => 0)

  );
$endpoint = strtoupper($_REQUEST['endpoint']);

$riak = new Basho\Riak\Riak(RIAK_ADDR, RIAK_PORT);
$bucketName = $_SESSION['access_token'];
$bucket = $riak->bucket($bucketName);
$cacheData = $bucket->get($endpoint);

if(!empty($cacheData->data)) {
  //cache hit
  $output = stripslashes($cacheData->data[0]); 
  error_log("###CACHE HIT FOR: " . $bucketName . "/" . $endpoint);
} else {
  //cache miss
  error_log("###CACHE MISS FOR: " . $bucketName . "/" . $endpoint);
  $url = $urlInfo[$endpoint]['url'];
  $toCache = $urlInfo[$endpoint]['cache'];

  if(isset($_REQUEST['user_id'])) {
    $url = str_replace(':account_id', $_REQUEST['account_id'], $url);
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

  $output = file_get_contents($url);
  $outputArr = json_decode($output, TRUE);

  //Cache only when there's no error, no point otherwise
  if(!isset($outputArr['error']) && $toCache) {
    $cacheData = $bucket->newObject($endpoint, array($output));
    $cacheData->store();
  }
  //FIXME add error handling stuff here as well
}
echo $output;
?>
