(function($) {
  
  // Global, yet private to the world beyond the closure.
  //
  //   closures are natural
  //   closures are good
  //   not every language has them
  //   but every language should
  //
  //- convenience
  var canvas;
  var settings;
  var graph;
  var grid;
  //- required to implement hover function
  var isLabelVisible;
  var leaveTimer;
  
  $.fn.simplegraph = function(data, labels, options) {
    settings = $.extend({}, $.fn.simplegraph.defaults, options);

    setStyleDefaults();
    setPenColor();
        
    graph = new Graph(data, labels);
    grid  = new Grid(graph, settings);
    
    return this.each( function() {    
      canvas = Raphael(this, settings.width, settings.height);
      if (settings.autoDraw) {
        $.fn.simplegraph.draw();
      }      
    })
  };

  // Public

  $.fn.simplegraph.defaults = {
    autoDraw: true,
    drawGrid: true,
    units: "",
    // Dimensions
    width: 600,
    height: 250,
    leftGutter: 30,
    bottomGutter: 20,
    topGutter: 20,
    // Label Style
    labelColor: "#000",
    labelFont: "Verdana",
    labelFontSize: "10px",
    // Grid Style
    gridBorderColor: "#ccc",
    // -- Y Axis Captions
    yAxisOffset: 0,
    // Graph Style
    // -- Points
    drawPoints: true,
    pointColor: "#000",
    pointRadius: 3,    
    activePointRadius: 5,    
    // -- Line
    drawLine: true,
    lineColor: "#000",
    lineWidth: 3,
    lineJoin: "round",
    // -- Bars
    drawBars: false,
    barColor: "#000",
    barWidth: 10,
    // -- Fill
    fillUnderLine: false,
    fillColor: "#000",
    fillOpacity: 0.2,
    // -- Hover
    addHover: true
  };

  $.fn.simplegraph.draw = function() {
    if (settings.drawGrid) {
      $.fn.simplegraph.drawGrid();      
    }
    if (settings.yAxisCaption) {
      $.fn.simplegraph.labelYAxis();
    }
    $.fn.simplegraph.labelXAxis();
    $.fn.simplegraph.plot();    
  }
  
  $.fn.simplegraph.drawGrid = function() {
    grid.draw(canvas);
  }
  
  $.fn.simplegraph.labelYAxis = function() {
    graph.labelYAxis(grid, canvas, settings);
  }

  $.fn.simplegraph.labelXAxis = function() {
    graph.labelXAxis(grid, canvas, settings.xAxisLabelStyle);
  }
  
  $.fn.simplegraph.plot = function() {
    graph.plot(grid, canvas, settings);
  }

  // Plot another set of values on an existing graph, use it like this:
  //   $("#target").simplegraph(data, labels).simplegraph.more(moreData);
  $.fn.simplegraph.more = function(data, options) {
    var new_graph = new Graph(data, graph.labels);
    settings.penColor = options.penColor;
    setPenColor();
    settings = $.extend(settings, options);
    var new_grid  = new Grid(new_graph, settings);
    if (settings.autoDraw) {
      new_graph.labelYAxis(new_grid, canvas, settings);
      new_graph.plot(new_grid, canvas, settings);    
    }
  }
  
  // Default hoverIn callback, this is public and as such can be overwritten. You can write your
  // own call back with the same signature if you want different behaviour.
  $.fn.simplegraph.hoverIn = function(value, label, x, y, frame, hoverLabel, dot) {
    clearTimeout(leaveTimer);
    var newcoord = {x: x * 1 + 7.5, y: y - 19};
    if (newcoord.x + 100 > settings.width) {
        newcoord.x -= 114;
    }
    hoverLabel[0].attr({text: value}).show().animateTo(newcoord.x + 50, newcoord.y + 15, (isLabelVisible ? 100 : 0));
    hoverLabel[1].attr({text: label}).show().animateTo(newcoord.x + 50, newcoord.y + 30, (isLabelVisible ? 100 : 0));
    frame.show().animateTo(newcoord.x, newcoord.y, (isLabelVisible ? 100 : 0));
    if (settings.drawPoints) {
      dot.attr("r", settings.activePointRadius);
    }
    isLabelVisible = true;
    canvas.safari();
  }

  // Default hoverOut callback, this is public and as such can be overwritten. You can write your
  // own call back with the same signature if you want different behaviour.
  $.fn.simplegraph.hoverOut = function(frame, label, dot) {
    if (settings.drawPoints) {
      dot.attr("r", settings.pointRadius);
    }
    canvas.safari();
    leaveTimer = setTimeout(function () {
      isLabelVisible = false;
        frame.hide();
        label[0].hide();
        label[1].hide();
        canvas.safari();
    }, 1);
  }
    
  // Private

  // Holds the data and labels to be plotted, provides methods for labelling the x and y axes,
  // and for plotting it's own points. Each method requires a grid object for translating values to
  // x,y pixel coordinates and canvas object on which to draw.
  function Graph(data, labels) {
    this.data   = data;
    this.labels = labels;
    
    this.labelXAxis = function(grid, canvas, style) {
      $.each(this.labels, function(i, label) {
        var x = grid.x(i);
        canvas.text(x, canvas.height - 6, label).attr(style).toBack();
      })
    };

    this.labelYAxis = function(grid, canvas, settings) {
      // Legend
      canvas.rect(
        grid.leftEdge - (30 + settings.yAxisOffset), //TODO PARAM - Label Colum Width
        grid.topEdge, 
        30, //TODO PARAM - Label Column Width
        grid.height
      ).attr({stroke: settings.lineColor, fill: settings.lineColor, opacity: 0.3}); //TODO PARAMS - legend border and fill style

      for (var i = 1, ii = (grid.rows) + 1; i < ii; i = i + 2) {
        var value = (ii - i)*2,
            y     = grid.y(value) + 4, // TODO: Value of 4 works for default dimensions, expect will need to scale
            x     = grid.leftEdge - (6 + settings.yAxisOffset);    
        canvas.text(x, y, value).attr(settings.yAxisLabelStyle);        
      }
      var caption = canvas.text(
        grid.leftEdge - (20 + settings.yAxisOffset), 
        (grid.height/2) + (settings.yAxisCaption.length / 2), 
        settings.yAxisCaption + " (" + settings.units + ")").attr(settings.yAxisCaptionStyle).rotate(270);
      // Increase the offset for the next caption (if any)
      settings.yAxisOffset = settings.yAxisOffset + 30;
    }

    this.plot = function(grid, canvas, settings) {
      var line_path = canvas.path({
        stroke: settings.lineColor, 
        "stroke-width": settings.lineWidth, 
        "stroke-linejoin": settings.lineJoin
      }); 

      var fill_path = canvas.path({
        stroke: "none", 
        fill: settings.fillColor, 
        opacity: settings.fillOpacity
      }).moveTo(settings.leftGutter, settings.height - settings.bottomGutter);

      var bars  = canvas.group(),
          dots  = canvas.group(),
          cover = canvas.group();

      var hoverFrame = dots.rect(10, 10, 100, 40, 5).attr({
        fill: "#fff", stroke: "#474747", "stroke-width": 2}).hide(); //TODO PARAM - fill colour, border colour, border width
      var hoverText = [];
      hoverText[0] = canvas.text(60, 25, "").attr(settings.hoverValueStyle).hide(); 
      hoverText[1] = canvas.text(60, 40, "").attr(settings.hoverLabelStyle).hide(); 

      // Plot the points
      (function(graph) {
        $.each(graph.data, function(i, value) {
          var y = grid.y(value),
              x = grid.x(i),
              label = graph.labels ? graph.labels[i]  : " ";
            
          if (settings.drawPoints) {
            var dot = dots.circle(x, y, settings.pointRadius).attr({fill: settings.pointColor, stroke: settings.pointColor});
          }
          if (settings.drawBars) {
            bars.rect(x, y, settings.barWidth, (settings.height - settings.bottomGutter) - y).attr({fill: settings.barColor, stroke: "none"});
          }
          if (settings.drawLine) {
            line_path[i == 0 ? "moveTo" : "cplineTo"](x, y, 10);
          }
          if (settings.fillUnderLine) {
            fill_path[i == 0 ? "lineTo" : "cplineTo"](x, y, 10);
          }
          if (settings.addHover) {
            var rect = canvas.rect(x - 50, y - 50, 100, 100).attr({stroke: "none", fill: "#fff", opacity: 0}); //TODO PARAM - hover target width / height
            $(rect[0]).hover( function() {
              $.fn.simplegraph.hoverIn(value, label, x, y, hoverFrame, hoverText, dot);
            }, 
            function() {
              $.fn.simplegraph.hoverOut(hoverFrame, hoverText, dot);
            });
          }
        });
      })(this);
      
      if (settings.fillUnderLine) {
        fill_path.lineTo(grid.x(this.data.length - 1), settings.height - settings.bottomGutter).andClose();      
      }
      hoverFrame.toFront();    
    }
  }
  
  // Holds the dimensions of the grid, and provides methods to convert values into x,y
  // pixel coordinates. Also, provides a method to draw a grid on a supplied canvas.
  function Grid(graph, settings) {
    this.setYAxis = function() {
      this.height        = settings.height - settings.topGutter - settings.bottomGutter;
      this.maxValueYAxis = calculateMaxYAxis();
      this.Y             = this.height / this.maxValueYAxis;
    }

    this.setXAxis = function() {
      this.X = (settings.width - settings.leftGutter) / graph.data.length;    
    }

    this.setDimensions = function() {
      this.leftEdge = settings.leftGutter;
      this.topEdge  = settings.topGutter;
      this.width    = settings.width - settings.leftGutter - this.X;
      this.columns  = graph.data.length - 1; 
      this.rows     = this.maxValueYAxis / 2; //TODO PARAM - steps per row    
    }

    this.draw = function(canvas) {
      canvas.drawGrid(
        this.leftEdge, 
        this.topEdge, 
        this.width, 
        this.height, 
        this.columns, 
        this.rows, 
        settings.gridBorderColor
      );
    }

    this.x = function(value) {
      return settings.leftGutter + this.X * value;
    }

    this.y = function(value) {
      return settings.height - settings.bottomGutter - this.Y * value;
    }

    this.setYAxis();
    this.setXAxis()
    this.setDimensions();

    // Private
    function calculateMaxYAxis() {
      var max = Math.max.apply(Math, graph.data),
      maxOveride = settings.minYAxisValue;
      if (maxOveride && maxOveride > max) {
        max = maxOveride;
      }
      return max;
    };    
  }
  
  function setStyleDefaults() {
    var targets = ["xAxisLabel", "yAxisLabel", "yAxisCaption", "hoverLabel", "hoverValue"];
    var types   = ["Color", "Font", "FontSize"];
    $.each(targets, function(index, target) {
      $.each(types, function(index, type) {
        if (!settings[target + type]) {
          settings[target + type] = settings["label" + type];
        }        
      });
    });

    settings.labelStyle = {
      font: settings.labelFontSize + '"' + settings.labelFont + '"', 
      fill: settings.labelColor
    }

    $.each(targets, function(index, target) {
      settings[target + "Style"] = {
        font: settings[target + "FontSize"] + ' '+ settings[target + "Font"] + ' ', 
        fill: settings[target + "Color"]
      };
    });
  }

  function setPenColor() {
    if (settings.penColor) {
      settings.lineColor  = settings.penColor;
      settings.pointColor = settings.penColor;
      settings.fillColor  = settings.penColor;
      settings.barColor   = settings.penColor;
    }
  }
  
})(jQuery);
