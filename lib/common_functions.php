<?php
/**
 * Return variable or the default value as specified if variable isn't set
 * @param   mixed   $variable   The variable to check
 * @param   string  $key      (Optional) The key to check, if variable is an array
 * @param   mixed   $default    (Optional) The default value to return 
 * @return  mixed   The variable, if set, or the default
 */
function ifsetor($variable, $key = NULL, $default = NULL) {
  if (!is_null($key) && is_array($variable)) {
    $ret = isset($variable[$key]) ? $variable[$key] : $default;
  } else {
    $ret = isset($variable) ? $variable : $default;
  }
  return $ret;
}
?>
