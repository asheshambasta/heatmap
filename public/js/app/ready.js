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
    api.setUserID(null, function(apiResponse) {
      api.setAccountInfo(null, function() {
        for(acName in api.accounts) {
          var opt = new Option(acName, acName);
          $("select#account").append(opt);
        }
      });
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
          heatmap.drawFromDateObj(api.insightData, true);
        });
      $('div#chart_container').fadeIn('slow');
      });
});
});
