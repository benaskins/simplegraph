// Use this as a starting point to implement your own custom graphs

(function($) {

  var CustomGraph = {

    // Add function definitions here, they'll be used to extend your SimpleGraph instances
    // e.g.
    //
    // drawBackground: function() {
    //   this.canvas.rect(0, 0, 300, 300).attr({stroke: "none", fill: "#eaeaea"});
    // },
    //
    // Implement a draw() function if you want to change the standard implementation
    // e.g.
    //
    // draw: function() {
    //   this.drawBackground();
    //   this.dataSet.labelXAxis(this.grid, this.canvas);
    //   this.dataSet.labelYAxis(this.grid, this.canvas);
    //   this.dataSet.plot(this.grid, this.canvas);
    // },
    

    // Default settings for your custom graph
    // e.g.
    // 
    // defaults: {
    //   width: 200,
    //   height: 200,
    //   drawLine: false,
    //   drawBars: true,
    //   barWidth: 20,
    //   barOffset: 0,
    //   barColor: "#416A97"
    // }
  };

  var data   = [], 
      labels = [];

  $(function() {
    gatherData();
    $("#graph").each( function() {
      var canvas = Raphael(this, 300, 300);
      var custom_graph = new SimpleGraph(data, labels, canvas, $.extend({}, $.fn.simplegraph.defaults, CustomGraph.defaults));
      $.extend(custom_graph, CustomGraph);
      custom_graph.draw();
    });
  });
    
  function gatherData() {
    $("table td.data").each(function () {
        data.push($(this).html());
    });

    $("table td.label").each(function () {
        labels.push($(this).html());
    });
  }
  
})(jQuery);