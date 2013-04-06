<?php
session_start();
set_include_path(
  implode(
    PATH_SEPARATOR, 
    array(
      get_include_path(), 
      dirname(__DIR__) . DIRECTORY_SEPARATOR . 'lib')));
?>
