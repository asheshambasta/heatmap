var API = function(accessToken) {
  var userID    = null,
    userCompany = null,
    userName    = null,
    userEmail   = null,
    accounts    = {},
    insightData = {},
    apiResponse = null;

  var api = {

    /**
     * Set the user id from API
     * @param {function}  [callback]                          The callback.
     */
    setUserID: function(callback) {
      //make ajax call to API
      var apiResponse,
      data = {
        endpoint: 'userinfo',
        access_token: accessToken 
      };

      $.ajax({
        url: 'ajax/api.php',
        data: data,
        success: function(response) {
          apiResponse = response;
          if(200 === response.meta.code) {
            userID        = response.response.id;
            userCompany   = response.response.company;
            userName      = response.response.name;
            userEmail     = response.response.email;
          }
          if(typeof callback == "function") {
            callback(apiResponse);
          }
        },
        error: function(xhr, errorMsg, err) {
          console.log(errorMsg);
          console.log(err);
        }
      });
      return this;
    },

    /**
     * Set the account info for the given userID
     * @param {String}  [accessToken = accessToken] Access token for API calls
     */
    setAccountInfo: function(callback) {
      var apiResponse = null,
        apiResponse = null,
        data = {
          endpoint: 'accounts',
          access_token: accessToken || accessToken
        };
      $.ajax({
        url: 'ajax/api.php',
        data: data,
        success: function(response) {
          console.log(response);
          if(200 == response.meta.code) {
            var i;
            for(i = 0; i < response.response.count; i++) {
              var elem = response.response.data[i];
              accounts[elem.name] = elem.id;
            }
            callback(accounts);
          }
        },
        error: function(xhr, errorMsg, err) {
          console.log(errorMsg);
          console.log(err);
        }
      });
      return this;
    },

    getInsights: function(accountName, facetDefs, dateFrom, dateTo, callback) {

      if(!accounts[accountName]) {
        return false;
      }

      var data = {
        endpoint: 'insights',
        facetdefinitions: encodeURIComponent(JSON.stringify(facetDefs)),
        date_from: dateFrom,
        date_to: dateTo,
        access_token: accessToken,
        account_id: accounts[accountName],
        user_id: userID
      };

      console.log("Using data: ");
      console.log(data);
      $.ajax({
        async: false,
        url: 'ajax/api.php',
        data: data,
        success: function(response) {
          console.log(response);
          apiResponse = response;
          if ("function" == typeof callback) {
            callback(apiResponse);
          }
        }
      });
      return this;
    },

    setInsightData: function(response) {

      insightData = {};

      for(date in response) {

        if(!insightData[date]) {
          insightData[date] = {
            '00:00': 0,
            '01:00': 0,
            '02:00': 0,
            '03:00': 0,
            '04:00': 0,
            '05:00': 0,
            '06:00': 0,
            '07:00': 0,
            '08:00': 0,
            '09:00': 0,
            '10:00': 0,
            '11:00': 0,
            '12:00': 0,
            '13:00': 0,
            '14:00': 0,
            '15:00': 0,
            '16:00': 0,
            '17:00': 0,
            '18:00': 0,
            '19:00': 0,
            '20:00': 0,
            '21:00': 0,
            '22:00': 0,
            '23:00': 0
          };
        }

        for(time in response[date]) {
          insightData[date][time] = response[date][time];
        }
      }
      return this;
    },

    getInsightData: function() {
      return insightData;
    }
  };
  return api;
};
