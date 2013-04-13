var HeatMap = function(holder, dateObj, paint) {
  var sumCells = 0,
  allCellValues = [],
  maxCellValue = null,
  numCells = 0,
  avg = 0;

  $(holder).empty();

  var heatmap = {
    addRow: function(cellValues, date) {
      var container = d3.select(holder),
      rows = container.selectAll('div.row'),
      newRowID = "row_" + rows[0].length,
      row,
      i;

      numCells += cellValues.length;

      container.append('div').classed('row', true).attr('id', newRowID);
      row = container.select('div#' + newRowID);
      date = date || '';

      //add cells to the new row
      for(i = 0; i < cellValues.length; i++) {
        sumCells += cellValues[i];
        allCellValues.push(cellValues[i]);
        maxCellValue = 
          typeof maxCellValue !== "number" ? 
          cellValues[i] : Math.max(maxCellValue, cellValues[i]);

        var cellID = "cell_" + newRowID + "_" + i;
        row.append('div').classed('cell_white', true).attr('id', cellID);
        cellValues[i] = date + ' ' + i + ':00, ' + cellValues[i];
      }
      row.selectAll('div').data(cellValues).attr(
        'title', 
        function(cellValue) {
          return cellValue;
        });

        avg = sumCells / allCellValues.length;
        return this;
    },

    paintGrid: function() {
      var container = d3.select(holder)
      that = this;

      container
      .selectAll('div.cell_white')
      .data(allCellValues)
      .style(
        'background-color', 
        function(cellValue) { 
          var colour = that.getColour(cellValue, sumCells);
          console.log(cellValue + ':' + colour);
          return colour; 
        });
        return this;
    },

    getColour: function(cellValue, sumCells) {
      var G, A, 
      side = (cellValue > avg),
      diffFromMax = maxCellValue - cellValue,
      diffFrac = diffFromMax/(maxCellValue ? maxCellValue : 1),
      R = side ? 255 : Math.round(255 * diffFrac), 
      B = side ? Math.round(255 * diffFrac) : 255;
      //see how close it is to the max cell value
      //the smaller diffFromMax, the redder it should be.
      G = Math.round(100 * diffFrac);
      A = 0.15 + cellValue/maxCellValue * 0.85;
      return 'rgba(' + R + ',' + G + ',' + B + ',' + A + ')';
    },

    drawFromDateObj: function(dateObj, paint) {

      sumCells = 0,
      allCellValues = [],
      maxCellValue = null,
      numCells = 0;

      for(date in dateObj) {
        console.log("Adding row looks like: ");
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
      return this;
    }
  };

  if (dateObj) {
    heatmap.drawFromDateObj(dateObj, paint || false);
  }

  return heatmap;
}
