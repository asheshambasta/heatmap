var HeatMap = function(holder, dateObj, paint, threshold) {
  var sumCells = 0,
  allCellValues = [],
  maxCellValue = null,
  numCells = 0,
  avg = 0;

  threshold = threshold || 0;

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
        canvas = container.append("svg:svg").attr("width", width).attr("height", height).attr("id", "canvas"),
        max = d3.max(values),
        sum = d3.sum(values),
        i = 0,
        path = [],
        circles =[],
        avg,
        scaleX = d3.scale.linear().domain([0, values.length - 1]).range([0, width]),
        scaleY = d3.scale.linear().domain([0, maxCellValue]).range([height - 20, 20]),
        x, y,
        colour = this.getColour(max, sum, true),
        distinct = {};

      for(i = 0; i < values.length; i++) {
        x = scaleX(i),
        y = scaleY(values[i]);
        path.push({x: x, y: y});

        if (threshold && threshold > values[i]) {
          continue;
        }

        canvas.append("circle")
          .attr("cx", x)
          .attr("cy", height)
          .attr("r", 1)
          .style("opacity", 0.2)
          .transition()
          .attr("cy", y)
          .attr("r", 5)
          .attr("title", values[i] + " mentions")
          .style("fill", "grey")
          .transition()
          .style("opacity", 0.5)
          .transition()
          .style("opacity", 0.3);

        canvas.append("text")
          .attr("x", x)
          .attr("y", height)
          .style("fill", "grey")
          .style("font-size", "xx-small")
          .text(i);

        if(!distinct[values[i]]) {
          canvas.append("text")
          .attr("x", 0)
          .attr("y", y)
          .style("fill", "grey")
          .style("font-size", "xx-small")
          .text(values[i]);
          }

        distinct[values[i]]  = true;
        }

      avg = sum / values.length;

      var drawLine = d3.svg
        .line()
        .x(function(d) {return d.x;})
        .y(function(d) {return d.y;})
        .interpolate("cardinal");

      var path = canvas.append("svg:path")
        .attr("d", drawLine(path));
        
        path
          .style("opacity", "0.2")
          .transition()
          .style("opacity", "1.0")
          .style("stroke-width", 2)
          .style("stroke", colour)
          .style("fill", "none");

          if(threshold) {
            canvas.append("svg:path")
              .attr("d", drawLine([{x: 0, y: scaleY(threshold)}, {x: width, y: scaleY(threshold)}]))
              .style("opacity", "0.3")
              .style("stroke-width", 1)
              .style("stroke", "grey")
              .style("fill", "none");
          }

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

    getColour: function(cellValue, sumCells, forGraph) {
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
      if(threshold && threshold > cellValue && !forGraph) {
        R = B = G = 200;
        A = 0.15;
      }
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
