var api = {
  userID: null,
  userCompany: null,
  userName: null,
  userEmail: null,
  accessToken: null,
  accounts: {},
  insightData: {},
  apiResponse: null,

  /**
   * Set the user id from API
   * @param   String  accessToken The access token for API calls
   */
  setUserID: function(accessToken, callback) {
    //make ajax call to API
    var apiResponse,
      that = this,
      data = {
        endpoint: 'userinfo',
        access_token: accessToken || this.accessToken
      };

    //make synchronous ajax call to our mighty api.php script
    $.ajax({
      url: 'ajax/api.php',
      async: false,
      data: data,
      success: function(response) {
        apiResponse = response;
        if(200 === response.meta.code) {
          that.userID        = response.response.id;
          that.userCompany   = response.response.company;
          that.userName      = response.response.name;
          that.userEmail     = response.response.email;
        }
      },
      error: function(xhr, errorMsg, err) {
        console.log(errorMsg);
        console.log(err);
      }
    });
    return 
      typeof callback == "undefined" ? null : callback(apiResponse), 
      apiResponse;
  },

  setAccountInfo: function(accessToken) {
    var apiResponse = null,
    that = this,
    apiResponse = null,
    data = {
      endpoint: 'accounts',
      access_token: accessToken || this.accessToken
    };
    $.ajax({
      async: false,
      url: 'ajax/api.php',
      data: data,
      success: function(response) {
        console.log(response);
        if(200 == response.meta.code) {
          var i;
          for(i = 0; i < response.response.count; i++) {
            var elem = response.response.data[i];
            that.accounts[elem.name] = elem.id;
          }
        }
      },
      error: function(xhr, errorMsg, err) {
        console.log(errorMsg);
        console.log(err);
      }
    });
  },

  getInsights: function(accountName, facetDefs, dateFrom, dateTo) {

    if(!this.accounts[accountName]) {
      return false;
    }

    var data = {
        endpoint: 'insights',
        facetdefinitions: encodeURIComponent(JSON.stringify(facetDefs)),
        date_from: dateFrom,
        date_to: dateTo,
        access_token: this.accessToken,
        account_id: this.accounts[accountName],
        user_id: this.userID
      },
      that = this;

    console.log("Using data: ");
    console.log(data);
    $.ajax({
      async: false,
      url: 'ajax/api.php',
      data: data,
      success: function(response) {
        console.log(response);
        that.apiResponse = response;
      }
    });
  },

  setInsightData: function(response) {
    if(!response || 200 !== response.meta.code) {
      return false;
    }
    var keys = response.response[0].keys,
      data = response.response[0].data[0],
      i;

    this.insightData = {};

    for(i = 0; i < keys.length; i++) {
      var key = keys[i]['text'],
        keySplit = key.split(" "),
        date = keySplit[0],
        time = keySplit[1];

      if(!this.insightData[date]) {
        this.insightData[date] = {
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

      this.insightData[date][time] = data[i];
    }
  }
}
