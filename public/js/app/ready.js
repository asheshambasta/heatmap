/**
 * All the stuff hheatmapens here
 */
$(document).ready(
  function() {
  var 
  dataHolder  = $("#data_holder"),
  dateFrom    = $(dataHolder).data('date_from'),
  dateTo      = $(dataHolder).data('date_to');

  if (typeof api !== "undefined") {
    api.accessToken = $(dataHolder).data('access_token');
    api.setUserID();
    api.setAccountInfo(null, function() {
      api.getInsights(
        'Zomato.com', 
        [{"key":{"field":"date.added","grouping":"hour"},"value":null,"segmentation":{"field":"custom","field_values":{"Social":"source:social","News":"source:news","Blogs":"source:blogs","Forums":"source:forums"}},"type":"mentions"}],
        dateFrom, 
        dateTo
      );
    });
  }

  $('#login').click(function(event) {
    event.preventDefault();
    login();
  });

  login = function () {
    var username = $("#username").value();
    var password = $("#password").value();
    var data = {username: username, password: password};
    console.log(data);
  };
});
