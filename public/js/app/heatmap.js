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

        var cellID = "cell_" + newRowID + "_" + i;
        row.append('div').classed('cell_white', true).attr('id', cellID);
        cellTitles.push(date + ' ' + i + ':00, ' + cellValues[i]);
      }

      maxCellValue = Math.max(d3.max(cellValues), maxCellValue || 0);

      row.selectAll('div').data(cellTitles).attr(
        'title', 
        function(cellTitle) {
          return cellTitle;
        });

        $('div#' + newRowID).click(function(event) {
          event.preventDefault();
          that.drawGraph(cellValues, 'div#' + newRowID);
        });

        avg = sumCells / allCellValues.length;
        return this;
    },

    drawGraph: function(values, rowIdentifier, containerIdentifier, width, height) {
      containerIdentifier = containerIdentifier || "div#svg";
      $(containerIdentifier).empty();
      width = width || 300;
      height = height || 300;
      var container = d3.select(containerIdentifier),
        canvas = container.append("svg:svg").attr("width", width).attr("height", height),
        max = d3.max(values),
        i = 0,
        path = [],
        avg,
        sum = 0;

      for(i = 0; i < values.length; i++) {
        path.push({x: i, y: values[i]});
        sum += values[i];
      }

      avg = sum / values.length;

      var scaleX = d3.scale.linear().domain([0, values.length - 1]).range([0, width]),
        scaleY = d3.scale.linear().domain([0, maxCellValue]).range([height - 50, 20]);

      var drawLine = d3.svg
        .line()
        .x(function(d) {return scaleX(d.x);})
        .y(function(d) {return scaleY(d.y);})
        .interpolate("cardinal");

      canvas.append("svg:path")
        .attr("d", drawLine(path))
        .style("stroke-width", 2)
        .style("stroke", this.getColour(max, sum))
        .style("fill", "none");
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
      $("div#svg").empty();

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
