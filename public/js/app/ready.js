/**
 * All the stuff hheatmapens here
 */
$(document).ready(
  function() {
  var dataHolder  = $("#data_holder");

  if (typeof API !== "undefined") {
    var api = new API($(dataHolder).data('access_token'));
    api.setUserID(function(apiResponse) {
      api.setAccountInfo(function(accounts) {
        for(acName in accounts) {
          var opt = new Option(acName, acName);
          $("select#account").append(opt);
        }
      });
    });
  }

  //get the form ready.
  $('input[type="submit"]').click(function(event) {
    event.preventDefault();
    //gather data from all the input fields and submit
    var account = $('select#account').val(),
      facetdefs = JSON.parse($('input[placeholder="Facetdefinitions"]').val()),
      dateFrom = $('input[placeholder="Date from"]').val(),
      dateTo = $('input[placeholder="Date to"]').val(),
      goAhead = account && facetdefs && dateFrom && dateTo;

      if(!goAhead) {
        alert("Are you sure all fields are set?");
        return;
      }
      console.log({account: account, facetdefinitions: facetdefs, date_from: dateFrom, date_to: dateTo});

      $('div#chart_container').fadeOut('fast', function() {
        $(this).empty();
        //draw the grid here
        api.getInsights(account, facetdefs, dateFrom, dateTo, function(response) {
          api.setInsightData(response, true); 
          heatmap.drawFromDateObj(api.getInsightData(), true);
        });
      $('div#chart_container').fadeIn('slow');
      });
});
});
