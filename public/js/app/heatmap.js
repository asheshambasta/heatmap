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
      i,
      cellTitles = [],
      that = this;

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
        cellTitles.push(date + ' ' + i + ':00, ' + cellValues[i]);
      }

      row.selectAll('div').data(cellTitles).attr(
        'title', 
        function(cellTitle) {
          return cellTitle;
        });

        row.attr('data-values', cellValues.join());

        $('div#' + newRowID).click(function(event) {
          event.preventDefault();
          that.drawGraph('div#' + newRowID);
        });

        avg = sumCells / allCellValues.length;
        return this;
    },

    drawGraph: function(rowIdentifier, containerIdentifier, width, height) {
      containerIdentifier = containerIdentifier || "div#svg";
      $(containerIdentifier).empty();
      width = width || 300;
      height = height || 300;
      var values = ($(rowIdentifier).data('values')).split(','),
        container = d3.select(containerIdentifier),
        canvas = container.append("svg:svg").attr("width", width).attr("height", height),
        dx = width/values.length,
        max = values[0],
        i = 0,
        yscale,
        path = [],
        x = 0,
        that = this,
        sumCells = 0;

      for(i = 1; i < values.length; i++) {
        max = Math.max(max, values[i]);
      }

      yscale = (height - 100)/max;

      for(i = 0, x = 0; i < values.length; i++, x += dx) {
        path.push({x: x, y: (height - 50 - values[i] * yscale), orig: values[i]});
        sumCells += values[i];
      }

      var drawLine = d3.svg
        .line()
        .x(function(d) {return d.x;})
        .y(function(d) {return d.y;})
        .interpolate("cardinal");

      canvas.append("svg:path")
        .attr("d", drawLine(path))
        .style("stroke-width", 2)
        .style("stroke", "red")
        .style("fill", "none");

      console.log(path);

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
