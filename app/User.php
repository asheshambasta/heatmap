<?php
require_once 'Base.php';
class User extends Base {

  private $username;
  private $password;
  private $accessToken;
  private $authenticated;

  const BUCKET_NAME = 'users';

  /**
   * Create new user object
   * @param   string    $username     The username of the user
   * @param   string    $password     (Optional) The password of the user
   * @param   string    $accessToken  (Optional) The access token, if available
   */
  public function __construct($username, $password = '', $accessToken = '') {
    $this->username     = $username;
    $this->password     = $password;
    $this->accessToken  = $accessToken;
    return $this;
  }

  /**
   * Get the details of the user
   */
  private function getDetails() {
    //currently, we're storing the data associated with the user in a bucket called
    //BUCKET_NAME (see above), and the key used is the username.
    //The value stored at each key is an array of the user's password and access token.
    $data = $this->query(self::BUCKET_NAME, $this->username);
    return $data;
  }

  /**
   * Set the details of the user, right now, we only have the access token 
   * as the user detail. Note that we can call this method
   * only if the user is authenticated. It'll have no effect otherwise.
   */
  private function setDetails() {
    //can be called only when the user is authenticated
    if($this->authenticated) {
      $userData = $this->getDetails();
      $this->accessToken = ifsetor($userData, 'accessToken', '');
      $this->password = ifsetor($userData, 'password');
    }
    return $this->authenticated;
  }

  /**
   * Authenticate the current user
   */
  public function authenticate() {
    $userData = $this->getDetails();
    return ($this->authenticated = ($this->password === $userData['password']));
  }

  /**
   * Check if username is available
   */
  public function checkUsernameAvailability() {
    $userData = $this->getDetails();
    return empty($userData);
  }

  /**
   * Save the user to riak
   */
  public function signup() {
    $data = array('password' => $this->password, 'accessToken' => $this->accessToken);
    $this->save(self::BUCKET_NAME, $this->username, $data);
  }

  /**
   * Set the new access token to the object
   * @param   string    $accessToken  The new access token
   */
  public function setAccessToken($accessToken) {
    $this->accessToken = $accessToken;
  }

  /**
   * Set the new data for the user
   * @param   array     $newData  The new data for the object
   */
  public function update($newData) {
    $this->setDetails();
    if(isset($newData['username'])) {
      unset($newData['username']);
    }
    foreach($newData as $key => $value) {
      $this->$key = $value;
    }
    $this->signup();
  }
}
?>
