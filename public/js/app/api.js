var api = {
  userID: null,
  userCompany: null,
  userName: null,
  userEmail: null,
  accessToken: null,
  accounts: {},

  /**
   * Set the user id from API
   * @param   String  accessToken The access token for API calls
   */
  setUserID: function(accessToken) {
    //make ajax call to API
    var apiResponse = null;
    var that = this;
    var data = {
      endpoint: 'userinfo',
      access_token: accessToken || this.accessToken
    };
    $.ajax({
      url: 'api.php',
      data: data,
      success: function(response) {
        console.log(response);
        apiResponse = response;
        if(200 == response.meta.code) {
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
    return apiResponse;
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
      url: 'api.php',
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
      account_id: this.accounts[accountName]
    };
    console.log("Using data: ");
    console.log(data);
    $.ajax({
      url: 'api.php',
      data: data,
      success: function(response) {
        console.log(response);
      }
    });
  }
}
