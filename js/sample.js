window.onload = function () {

  // Get the data
  var temp_labels = [], temp_data = [];
  $("#temp-data tfoot th").each(function () {
      temp_labels.push($(this).html());
  });
  $("#temp-data tbody td").each(function () {
      temp_data.push($(this).html());
  });
  var rain_labels = [], rain_data = [];
  $("#rain-data tfoot th").each(function () {
      rain_labels.push($(this).html());
  });
  $("#rain-data tbody td").each(function () {
      rain_data.push($(this).html());
  });

  // Hide the data
  $("#rain-data").hide();
  $("#temp-data").hide();

  // Plot the data
  // - Temperature Graph
  var temp_graph = new SimpleGraph("temp_graph_holder", {lineColor: "#f00", pointColor: "#f00", fillUnderLine: true, fillColor: "#f00"});
  temp_graph.drawGrid(temp_labels, temp_data, 30);
  temp_graph.plot(temp_labels, temp_data, "ºC");
  // - Rain Graph
  var rain_graph = new SimpleGraph("rain_graph_holder", {lineColor: "#00f", pointColor: "#00f", leftGutter: 60});
  rain_graph.drawGrid(rain_labels, rain_data, 10);
  rain_graph.addYAxisLabels(0, "Max Rainfall (mm)");
  rain_graph.plot(rain_labels, rain_data, "mm");
  // - Combined Graph
  var combined_graph = new SimpleGraph("combined_graph_holder", {lineColor: "#f00", pointColor: "#f00", leftGutter: 90});
  combined_graph.drawGrid(temp_labels, temp_data, 30);
  combined_graph.addYAxisLabels(0, "Max Temp (ºC)");
  combined_graph.plot(temp_labels, temp_data, "ºC");
  combined_graph.changeYAxis(rain_labels, rain_data, 10);
  combined_graph.settings.lineColor = "#00f";
  combined_graph.settings.pointColor = "#00f";
  combined_graph.addYAxisLabels(30, "Max Rainfall (mm)");
  combined_graph.plot(rain_labels, rain_data, "mm");


};