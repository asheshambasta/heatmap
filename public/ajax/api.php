<?php
require_once dirname(__DIR__) . DIRECTORY_SEPARATOR . 'init.php';
header('content-type: application/json;'); 

$urlSpecs = array(

  'USERINFO'    => array(

    'url'           =>  'http://api.engagor.com/me', 
    'cache'         =>  TRUE,
    'cache_expire'  =>  0),

  'ACCOUNTS'    => array(

    'url'           =>  'http://api.engagor.com/me/accounts',
    'cache'         =>  TRUE,
    'cache_expire'  =>  0),

  'INSIGHTS'    => array(

    'url'           =>  'http://api.engagor.com/:account_id/insights/facets',
    'replace_key'   =>  ':account_id',
    'get_key'       =>  'account_id',
    'cache'         =>  FALSE,
    'cache_expire'  =>  0)

  );

$endpoint = strtoupper($_GET['endpoint']);
$urlSpec = $urlSpecs[$endpoint];

$bucketName = $_SESSION['access_token'];
$bucket = $riak->bucket($bucketName);
$cacheData = $bucket->get($endpoint);

if(!empty($cacheData->data)) {
  //cache hit
  $output = $cacheData->data[0]; 
  error_log("###CACHE HIT FOR: " . $bucketName . "/" . $endpoint);
} else {
  //cache miss
  error_log("###CACHE MISS FOR: " . $bucketName . "/" . $endpoint);
  $url = $urlSpec['url'];
  $toCache = $urlSpec['cache'];

  if(isset($urlSpec['replace_key'])) {
    $getKey = $urlSpec['get_key'];
    $url = str_replace($urlSpec['replace_key'], $_GET[$getKey], $url);
  }

  $request = array();
  $params = array_keys($_GET);
  foreach($params as $param) {
    if('endpoint' == $param) {
      continue;
    }
    $request[] = $param . "=" . $_GET[$param];
  }

  $requestStr = implode('&', $request);
  $url .= "?" . $requestStr;
  error_log("###" . $url);

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
