$(function () {

  // Get the data
  var temp_labels = [], temp_data = [], neg_temp_data = [];
  $("#temp-data tfoot th").each(function () {
      temp_labels.push($(this).html());
  });
  $("#temp-data tbody td.pos").each(function () {
      temp_data.push($(this).html());
  });
  $("#temp-data tbody td.neg").each(function () {
      neg_temp_data.push($(this).html());
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
  $("#simplest_graph_holder").simplegraph(temp_data, temp_labels);
  
  // - Temperature Graph - adds colour, fill, and a minimum value for the y axis
  $("#temp_graph_holder").simplegraph(temp_data, temp_labels,
    {penColor: "#f00", fillUnderLine: true, units: "ºC", minYAxisValue: 30, drawPoints: true});
  
  // - Rain Graph - adds a caption to the y axis
  $("#rain_graph_holder").simplegraph(rain_data, rain_labels,
    {penColor: "#00f", units: "mm", leftGutter: 60, minYAxisValue: 10, yAxisCaption: "Max Rainfall", yAxisLabelFont: "Times New Roman"});
  
  // - Combined Graph - plots two data sets with different scales on the one graph
  $("#combined_graph_holder").simplegraph(neg_temp_data, temp_labels,
    {penColor: "#f00", leftGutter: 90, units: "ºC", minYAxisValue: 10, yAxisCaption: "Max Temp", lowerBound: -10, drawPoints: true})
    .simplegraph_more(rain_data, {penColor: "#00f", units: "mm", minYAxisValue: 10, yAxisCaption: "Max Rainfall", lowerBound: 0});
  
  // - Bar Temperature Graph - adds colour, fill, and a minimum value for the y axis
  $("#bar_graph_holder").simplegraph(temp_data, temp_labels,
    {penColor: "#f00", units: "ºC", minYAxisValue: 30, drawBars: true, drawLine: false, drawPoints: false, drawGrid: false, barWidth: 20});
  
});
