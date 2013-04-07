var heatmap = {
  userID: null,
  userCompany: null,
  userName: null,
  userEmail: null,
  accessToken: null,
  sumCells: 0,
  allCellValues: [],
  maxCellValue: 0,

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
      access_token: accessToken
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
      dataType: 'jsonp'
    });
    return apiResponse;
  },

  addRow: function(cellValues) {

    var container = d3.select('div#chart_container');
    var rows = container.selectAll('div.row');
    var newRowID = "row_" + rows[0].length;
    container.append('div').classed('row', true).attr('id', newRowID);

    //add cells to the new row
    var row = container.select('div#' + newRowID);
    for(var i = 0; i < cellValues.length; i++) {
      this.sumCells += cellValues[i];
      this.allCellValues.push(cellValues[i]);
      this.maxCellValue = Math.max(this.maxCellValue, cellValues[i]);
      var cellID = "cell_" + newRowID + "_" + i;
      row.append('div').classed('cell_white', true).attr('id', cellID);
    }
    row.selectAll('div').data(cellValues).attr(
      'title', 
      function(cellValue) {
        return cellValue;
      });
  },

  paintGrid: function() {
    var container = d3.select('div#chart_container');
    var that = this;
    container
    .selectAll('div.cell_white')
    .data(this.allCellValues)
    .style(
      'background-color', 
      function(cellValue) { 
        var colour = that.getColour(cellValue, that.sumCells);
        console.log(colour);
        return colour; 
      });
  },

  getColour: function(cellValue, sumCells) {
    var R, G, B, A;
    R = 255;
    //see how close it is to the max cell value
    var diffFromMax = this.maxCellValue - cellValue;
    //the smaller diffFromMax, the redder it should be.
    var diffFrac = diffFromMax/(this.maxCellValue ? this.maxCellValue : 1);
    B = Math.round(255 * diffFrac);
    G = Math.round(100 * diffFrac);
    A = 0.05 + cellValue/this.maxCellValue;
    return 'rgba(' + R + ',' + G + ',' + B + ',' + A + ')';
  },

  getInsights: function(facetDefs, dateFrom, dateTo) {
    if(!this.userID) {
      return false;
    }
    var data = {
      endpoint: 'insights',
      facetdefinitions: encodeURIComponent(JSON.stringify(facetDefs)),
      date_from: dateFrom,
      date_to: dateTo,
      access_token: this.accessToken,
      user_id: this.userID
    };
    console.log("Using data: ");
    console.log(data);
    $.ajax({
      url: 'api.php',
      data: data,
      success: function(response) {
        console.log(response);
      },
      dataType: 'jsonp'
    });
  }
}
