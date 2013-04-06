var userID        = null;
var userCompany   = null;
var userName      = null;
var userEmail     = null;
var accessToken   = null;

/**
 * Set the user id from API
 * @param   String  accessToken The access token for API calls
 */
function setUserID(accessToken) {
  //make ajax call to API
  $.ajax({
    url: 'http://api.engagor.com/me',
    data: {access_token: accessToken},
    type: 'post',
    success: function(response) {
      console.log(response);
      if(200 == response.meta.code) {
        userID        = response.response.id;
        userCompany   = response.response.company;
        userName      = response.response.name;
        userEmail     = response.response.email;
      }
    },
    dataType: 'jsonp'
  });
}

function addRow(cellValues) {
  //pad cellValues, if needed
  for (var i = cellValues.length; i < 24; i++) {
    cellValues.push({value: -1});
  }
  var container = d3.select('div#chart_container');
  var rows = container.selectAll('div.row');
  var newRowID = "row_" + rows[0].length;
  container
  .append('div')
  .classed('row', true)
  .attr('id', newRowID);
  //add cells to the new row
  var row = container.select('div#' + newRowID);
  for(var i = 0; i < 24; i++) {
    var cellID = "cell_" + newRowID + "_" + i;
    row.append('div').classed('cell_white', true).attr('id', cellID);
  }
  container.select('div#' + newRowID).selectAll('div').data(cellValues);
}

function getInsights(facetDefs, dateFrom, dateTo) {
  if(!userID) {
    return false;
  }
  var url = 'http://api.engagor.com/' + userID +  '/insights/facets';
  console.log("Trying to get insights from: " + url);
  var data = {
    facetdefinitions: JSON.stringify(facetDefs),
    date_from: dateFrom,
    date_to: dateTo,
    access_token: accessToken
  };
  console.log("Using data: ");
  console.log(data);
  $.ajax({
    url: url,
    data: data,
    success: function(response) {
      console.log(response);
    },
    type: 'POST',
    dataType: 'jsonp'
  });
}


/**
 * All the stuff happens here
 */
$(document).ready(
  function() {
  //set the access token and the user id
  accessToken = $("#access_token").data('access_token');
  setUserID(accessToken);
});
