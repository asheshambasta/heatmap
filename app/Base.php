<?php
abstract class Base {

  /**
   * Get the data stored in $bucketName with $key
   * @param   string $bucketName  The name of the bucket
   * @param   string $key         The key to fetch from the bucket
   * @return  array               The data stored at the key inside the given bucket
   */
  public function query($bucketName, $key) {
    //get the bucket
    global $riak;
    $bucket = $riak->bucket($bucketName);
    $data = $bucket->get($key);
    return $data->data;
  }

  /**
   * Save the data in the bucket
   * @param   string $bucketName  The name of the bucket
   * @param   string $key         The key to store the data at
   * @param   array  $data        The data to be stored at the key inside the given bucket
   */
  public function save($bucketName, $key, $data) {
    global $riak;
    $bucket = $riak->bucket($bucketName);
    $newDataObj = $bucket->newObject($key, $data);
    $newDataObj->store();
  }
}
?>
