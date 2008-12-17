$(document).ready(function () {

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
  // - Simplest Possible Graph - no customisations
  var temp_graph = new SimpleGraph("simplest_graph_holder", temp_labels, temp_data);
  // - Temperature Graph - adds colour, fill, and a minimum value for the y axis
  var temp_graph = new SimpleGraph("temp_graph_holder", temp_labels, temp_data, 
    {lineColor: "#f00", pointColor: "#f00", fillUnderLine: true, fillColor: "#f00", units: "ºC", minYAxisValue: 30});
  // - Rain Graph - adds a caption to the y axis
  var rain_graph = new SimpleGraph("rain_graph_holder", rain_labels, rain_data,
    {lineColor: "#00f", pointColor: "#00f", units: "mm", leftGutter: 60, minYAxisValue: 10, yAxisCaption: "Max Rainfall"});
  // - Combined Graph - plots two data sets with different scales on the one graph
  var combined_graph = new SimpleGraph("combined_graph_holder", temp_labels, temp_data,
    {lineColor: "#f00", pointColor: "#f00", leftGutter: 90, units: "ºC", minYAxisValue: 30, yAxisCaption: "Max Temp"});
  combined_graph.plotAdditionalDataSet(rain_data, 
    {yAxisCaption: "Max Rainfall", minYAxisValue: 10, penColor: "#00f", units: "mm"})
});
