/**
 * All the stuff hheatmapens here
 */
$(document).ready(
  function() {
  var dataHolder  = $("#data_holder");
  api.accessToken = $(dataHolder).data('access_token');
  var dateFrom    = $(dataHolder).data('date_from');
  var dateTo      = $(dataHolder).data('date_to');
  api.setUserID();
  api.setAccountInfo(null, function() {
     api.getInsights(
      'Zomato.com', 
      [{"key":{"field":"date.added","grouping":"hour"},"value":null,"segmentation":{"field":"custom","field_values":{"Social":"source:social","News":"source:news","Blogs":"source:blogs","Forums":"source:forums"}},"type":"mentions"}],
      dateFrom, 
      dateTo
     );
  });

  //FIXME this should be inside a callback, not setTimeout. Ugly hack.
  setTimeout(function() {
  }, 2000);
});
