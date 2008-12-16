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
  var temp_graph = new SimpleGraph("temp_graph_holder", temp_labels, temp_data, "ºC",
    {lineColor: "#f00", pointColor: "#f00", fillUnderLine: true, fillColor: "#f00"});
  temp_graph.drawGrid(30);
  temp_graph.plot();
  // - Rain Graph
  var rain_graph = new SimpleGraph("rain_graph_holder", rain_labels, rain_data, "mm",
    {lineColor: "#00f", pointColor: "#00f", leftGutter: 60});
  rain_graph.drawGrid(10);
  rain_graph.addYAxisLabels(0, "Max Rainfall");
  rain_graph.plot();
  // - Combined Graph
  var combined_graph = new SimpleGraph("combined_graph_holder", temp_labels, temp_data, "ºC",
    {lineColor: "#f00", pointColor: "#f00", leftGutter: 90});
  combined_graph.drawGrid(30);
  combined_graph.addYAxisLabels(0, "Max Temp");
  combined_graph.plot();
  combined_graph.newDataSet(rain_data, 10);
  combined_graph.settings.lineColor = "#00f";
  combined_graph.settings.pointColor = "#00f";
  combined_graph.addYAxisLabels(30, "Max Rainfall");
  combined_graph.plot();
};