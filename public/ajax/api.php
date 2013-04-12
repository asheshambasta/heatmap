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
  $response = $cacheData->data[0]; 
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

  $response = file_get_contents($url);
  $responseArr = json_decode($output, TRUE);

  //Cache only when there's no error, no point otherwise
  $toCache = $toCache && !isset($responseArr['error']);

  if($toCache) {
    //caching will be different for insights now
    //we'll cache everything except the current day.
    //parsing will also need to be done accordingly
    //the assumption is that the grouping is hourly only
    switch($endpoint) {
    case 'INSIGHTS':
      $userID = ifsetor($_GET, 'user_id', '');
      $facetDigest = md5(ifsetor($_GET, 'facetdefinitions', ''));
      $insightKey = $userID . $facetDigest . $endpoint;
      //create the cache key now
      $curDate = date("d/m/Y");
      //go through outputarray and put in all keys except for the current day

      $responseKeys = $responseArr['response'][0]['keys'];
      $responseData = $responseArr['response'][0]['data'][0];

      foreach($responseKeys as $index => $dateTime) {
        if(FALSE !== strpos($dateTime['text'], $curDate)) {
          unset($responseKeys[$index]);
          unset($responseData[$index]);
        }
      }

      //cache the rest to riak now
      $_cache = array();
      foreach($responseKeys as $index => $dateTime) {
        $date = $dateTime['text'];
        $cache[$date] = $responseData[$index];
      }
      $cacheData = $bucket->newObject($insightKey, array($_cache));
      error_log("### setting cache for insights: " . json_encode($_cache));
      break;
    default: 
      $cacheData = $bucket->newObject($endpoint, array($response));
      break;
    }
    $cacheData->store();
  }
  //FIXME add error handling stuff here as well
}
echo $response;
?>
