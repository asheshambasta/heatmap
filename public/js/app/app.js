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
