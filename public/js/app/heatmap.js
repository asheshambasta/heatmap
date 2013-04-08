var heatmap = {
  sumCells: 0,
  allCellValues: [],
  maxCellValue: 0,

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


}
