/**
 * All the stuff hheatmapens here
 */
$(document).ready(
  function() {
  //set the access token and the user id
  api.accessToken = $("#access_token").data('access_token');
  api.setUserID();
  api.setAccountInfo();
});
