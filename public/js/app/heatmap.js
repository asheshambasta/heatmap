var heatmap = {
  sumCells: 0,
  allCellValues: [],
  maxCellValue: null,
  numCells: 0,

  addRow: function(cellValues, date) {
    var container = d3.select('div#chart_container'),
      rows = container.selectAll('div.row'),
      newRowID = "row_" + rows[0].length,
      row,
      i;

    this.numCells += cellValues.length;

    container.append('div').classed('row', true).attr('id', newRowID);
    row = container.select('div#' + newRowID);
    date = date || '';

    //add cells to the new row
    for(i = 0; i < cellValues.length; i++) {
      this.sumCells += cellValues[i];
      this.allCellValues.push(cellValues[i]);
      this.maxCellValue = 
        typeof this.maxCellValue !== "number" ? 
          cellValues[i] : Math.max(this.maxCellValue, cellValues[i]);

      var cellID = "cell_" + newRowID + "_" + i;
      row.append('div').classed('cell_white', true).attr('id', cellID);
      cellValues[i] = date + ' ' + i + ':00, ' + cellValues[i];
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
        console.log(cellValue + ':' + colour);
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
    A = 0.05 + cellValue/this.maxCellValue * 0.95;
    return 'rgba(' + R + ',' + G + ',' + B + ',' + A + ')';
  },

  drawFromDateObj: function(dateObj, paint) {

    this.sumCells = 0,
    this.allCellValues = [],
    this.maxCellValue = null,
    this.numCells = 0;

    for(date in dateObj) {
      console.log("Adding row that looks like: ");
      console.log(dateObj[date]);
      //make an array out of the given date
      var dateArr = [];
      for(time in dateObj[date]) {
        dateArr.push(dateObj[date][time]);
      }
      this.addRow(dateArr, date);
    }
    if(true === paint) {
      this.paintGrid();
    }
  }
}
