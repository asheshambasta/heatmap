<?php

function __echo($string) {
  if(APP_DEBUG) {
    echo $string . PHP_EOL;
  } else {
    return FALSE;
  }
}

function __err($errorMessage, $exit = TRUE) {
  fwrite(STDERR, $errorMessage . PHP_EOL);
  if ($exit) {
    exit();
  }
}

function setIncludes($verbose = FALSE) {
  $paths = array(get_include_path());
  $dir = dirname(__DIR__);
  $dirHandle = opendir($dir);
  while(FALSE !== ($file = readdir($dirHandle))) {
    if("." == $file || ".." == $file) {
      continue;
    }
    $dirname = $dir . DIRECTORY_SEPARATOR . $file;
    __echo("Setting include: $dirname");
    if(is_dir($dirname)) {
      if(is_readable($dirname)) {
        $paths[] = $dirname;
      } else {
        echo "$dirname is not readable, skipping" . PHP_EOL;
      }
    }
  }
  set_include_path(implode(PATH_SEPARATOR, $paths));
}

function setConstants($nestedINIData, $verbose = FALSE, $makeUppercase = TRUE) {
  foreach($nestedINIData as $section => $fields) {
    foreach($fields as $key => $value) {
      $constantName = $section . "_" . $key;
      $constantName = $makeUppercase ? strtoupper($constantName) : $constantName;
      __echo("Defining constant $constantName with value $value");
      define($constantName, $value);
    }
  }
}
?>
