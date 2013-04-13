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
  $url = $urlSpec['url'];
  $toCache = $urlSpec['cache'];

  if(isset($urlSpec['replace_key'])) {
    $getKey = $urlSpec['get_key'];
    $replaceKey = $urlSpec['replace_key'];
    $url = str_replace($urlSpec['replace_key'], $_GET[$getKey], $url);
  }

  if('INSIGHTS' !== $endpoint) {
    //make an ordinary request to api
    error_log("###CACHE MISS FOR: " . $bucketName . "/" . $endpoint);
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

    $response = file_get_contents($url);
    $responseArr = json_decode($response, TRUE);

  } else {

    //call api differently for INSIGHTS, process date ranges based on cache first.
    $userID = ifsetor($_GET, 'user_id', '');
    $facetDigest = md5(ifsetor($_GET, 'facetdefinitions', ''));
    $insightKey = $userID . $facetDigest . $endpoint;
    $insightCacheObj = $bucket->get($insightKey);
    $cacheArr = $insightCacheObj->data[0];
    $dateFrom = $_GET['date_from'];
    $dateTo = $_GET['date_to'];
    $timeFrom = strtotime($dateFrom);
    $timeTo = strtotime($dateTo);
    $times = array();
    $dayLen = 3600 * 24;
    $i = 0;

    $responseArr = array('keys' => array(), 'values' => array());
    while($timeFrom <= $timeTo) {
      $date = date('Y-m-d', $timeFrom);
      if(!isset($cacheArr[$date]) && !isset($times[$i])) {
        $times[$i] = array($date);
      } 

      if (isset($times[$i])) {
        $times[$i][1] = $date;
      } 

      $i += isset($cacheArr[$date]) ? 1 : 0;

      if(isset($cacheArr[$date])) {
        foreach($cacheArr[$date] as $time => $value) {
          $responseArr['keys'][] = $date . " " . $time;
          $responseArr['values'][] = $value;
        }
      }
      $timeFrom += $dayLen;
    }

    $__GET = $_GET;

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
      $_url = $url . "?" . $requestStr;
      error_log("###Making req: " . $_url);
      $response = file_get_contents($_url);
      $_response = json_decode($response, TRUE);

      if(!empty($_response['response'])) {
        $i = 0;
        foreach($_response['response'][0]['keys'] as $key) {
          $timestamp = $key['name'];
          $responseArr['keys'][] = date('Y-m-d H:i', $timestamp);
          $responseArr['values'][] = $_response['response'][0]['data'][0][$i];
          $i++;
        }
      }
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
      //create the cache key now
      $curDate = date("Y-m-d");
      //go through outputarray and put in all keys except for the current day

      $responseKeys = $responseArr['keys'];
      $responseData = $responseArr['values'];

      foreach($responseKeys as $index => $dateTime) {
        if(FALSE !== strpos($dateTime, $curDate)) {
          unset($responseKeys[$index]);
          unset($responseData[$index]);
        }
      }

      //      error_log("###" . json_encode($responseKeys));

      $insightCacheObj = $bucket->get($insightKey);
      //cache the rest to riak now
      $_cache = !empty($insightCacheObj->data) ? $insightCacheObj->data[0] : array();
      foreach($responseKeys as $index => $dateTime) {
        $date = $dateTime;
        $dateSplit = explode(" ", $date);
        $day = 
          preg_replace("/([0-9]{2})\/([0-9]{2})\/([0-9]{4})/", "$3-$2-$1", $dateSplit[0]);
        $time = $dateSplit[1];
        if (!isset($_cache[$day])) {
          $_cache[$day] = array();
        }
        $_cache[$day][$time] = $responseData[$index];
      }
      //normalize cache, don't leave gaps
      $_response = array();
      $timeFrom = strtotime($_GET['date_from']);
      $timeTo = strtotime($_GET['date_to']);
      $dayLen = 24 * 3600;
      while($timeFrom < $timeTo) {
        $key = date('Y-m-d', $timeFrom);
        if(!isset($_cache[$key])) {
          $_cache[$key] = array();
        }
        $_response[$key] = $_cache[$key];
        $timeFrom += $dayLen;
      }
      $cacheData = $bucket->newObject($insightKey, array($_cache));
      $response = json_encode($_response);
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
