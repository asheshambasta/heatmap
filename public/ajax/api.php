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
    'cache'         =>  TRUE,
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

  if('INSIGHTS' !== $endpoint) {
    //make an ordinary request to api
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
    $responseArr = json_decode($response, TRUE);
  } else {
    //call api differently for INSIGHTS, process date ranges based on cache first.
    $userID = ifsetor($_GET, 'user_id', '');
    $facetDigest = md5(ifsetor($_GET, 'facetdefinitions', ''));
    $insightKey = $userID . $facetDigest . $endpoint;
    $insightCacheObj = $bucket->get($insightKey);
    $cacheArr = $insightCacheObj->data[0];
    error_log("###cached dates: " . json_encode(array_keys($cacheArr)));
    $dateFrom = $_GET['date_from'];
    $dateTo = $_GET['date_to'];
    $timeFrom = strtotime($dateFrom);
    $timeTo = strtotime($dateTo);
    $times = array();
    $dayLen = 3600 * 24;
    $i = 0;
    while($timeFrom <= $timeTo) {
      $date = date('Y-m-d', $timeFrom);
//      error_log("###Processing cache date " . $date);
      if(!isset($cacheArr[$date]) && !isset($times[$i])) {
        $times[$i] = array($date);
      } 
      
      if (isset($times[$i])) {
        $times[$i][1] = $date;
      } 

      $i += isset($cacheArr[$date]) ? 1 : 0;
      $timeFrom += $dayLen;
    }

    $__GET = $_GET;
    $responseArr = array();
    foreach($times as $range) {
      if($range[0] == $range[1]) {
        continue;
      }
      $__GET['date_from'] = $range[0];
      $__GET['date_to'] = $range[1];
      $request = array();
      $params = array_keys($_GET);
      foreach($params as $param) {
        if('endpoint' == $param) {
          continue;
        }
        $request[] = $param . "=" . $__GET[$param];
      }

      $requestStr = implode('&', $request);
      $url .= "?" . $requestStr;
      error_log("###Intermediate req: " . $url);
      error_log("###times: " . json_encode($times));
      $response = file_get_contents($url);
      $responseArr = array_merge($responseArr, json_decode($response, TRUE));
    }
  }

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
      $curDate = date("Y-m-d");
      //go through outputarray and put in all keys except for the current day

      $responseKeys = $responseArr['response'][0]['keys'];
      $responseData = $responseArr['response'][0]['data'][0];

      foreach($responseKeys as $index => $dateTime) {
        if(FALSE !== strpos($dateTime['text'], $curDate)) {
          unset($responseKeys[$index]);
          unset($responseData[$index]);
        }
      }

      error_log("### Datetimes: " . json_encode($responseKeys));
      //      error_log("###" . json_encode($responseKeys));

  
      $insightCacheObj = $bucket->get($insightKey);
     //cache the rest to riak now
      $_cache = !empty($insightCacheObj->data) ? $insightCacheObj->data[0] : array();
      foreach($responseKeys as $index => $dateTime) {
        $date = $dateTime['text'];
        $dateSplit = explode(" ", $date);
        $day = 
          preg_replace("/([0-9]{2})\/([0-9]{2})\/([0-9]{4})/", "$3-$2-$1", $dateSplit[0]);
        error_log("### " . $dateSplit[0] . " - " . $day);
        $time = $dateSplit[1];
        if (!isset($_cache[$day])) {
          $_cache[$day] = array();
        }
        $_cache[$day][$time] = $responseData[$index];
      }
      $cacheData = $bucket->newObject($insightKey, array($_cache));
      error_log("### setting cache for insights: " . $insightKey . json_encode($_cache));
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
