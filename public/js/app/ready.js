/**
 * All the stuff hheatmapens here
 */
$(document).ready(
  function() {
  //set the access token and the user id
  heatmap.accessToken = $("#access_token").data('access_token');
  heatmap.setUserID(heatmap.accessToken);
});
