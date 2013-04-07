var userID        = null;
var userCompany   = null;
var userName      = null;
var userEmail     = null;
var accessToken   = null;
var sumCells      = 0;
var allCellValues = [];

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

  var container = d3.select('div#chart_container');
  var rows = container.selectAll('div.row');
  var newRowID = "row_" + rows[0].length;
  container.append('div').classed('row', true).attr('id', newRowID);

  //add cells to the new row
  var row = container.select('div#' + newRowID);
  for(var i = 0; i < cellValues.length; i++) {
    sumCells += cellValues[i];
    allCellValues.push(cellValues[i]);
    var cellID = "cell_" + newRowID + "_" + i;
    row.append('div').classed('cell_white', true).attr('id', cellID);
  }
  row.selectAll('div').data(cellValues).attr(
    'title', 
    function(cellValue) {
      return cellValue;
    });
}

function paintGrid() {
  var container = d3.select('div#chart_container');
  container
    .selectAll('div.cell_white')
    .data(allCellValues)
    .style(
      'background-color', 
      function(cellValue) { 
        return getColor(cellValue, sumCells); 
      });
}

function getColor(cellValue, sumCells) {
  var R, G, B;
  R = G = B = 255;
  var frac = cellValue/(sumCells ? sumCells : 1);
  var diff = Math.round(255 * frac);
  B -= diff;
  G -= diff;
  return 'rgb(' + R + ',' + G + ',' + B + ')';
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
