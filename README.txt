= SimpleGraph

http://benaskins.github.com/simplegraph

== Description

Simple javascript graphs using Raphael and jQuery. 

Based on the Raphael analytics example (http://raphaeljs.com/analytics.html) by Dmitry Baranovskiy 

== Disclaimer

SimpleGraph is immature. If you stretch it much beyond the few simple examples you may run into one or two quirks. 
One glaring issue is the inability to plot negative values on the y-axis, well, to be fair, they do get plotted, but 
not anywhere visible on the page :) I hope to address this soon. But if you get there first, please fork, fix, and 
send pull requests. 

== Usage

The SimpleGraph function takes four arguments:

  target:: where the rendered graph will land
  data:: an array of values to plot against the y-axis
  labels:: an array of values for labelling the x-axis
  options:: hash of options to customise the graph (see below)
  
Simple example:

  $("#myGraph").simplegraph([1,2,3,3,2,1], ["a","b","c","d","e","f"]);
  
Will render a graph that looks a little something like this (open index.html for actual rendered samples):

  |   ._.
  | ./   \.
  |/       \.
  |__________
  a b c d e f

== Options

SimpleGraph takes a hash of options as it's third argument. Here's what you can customise:

  eg. parameter:: [default] description

  width:: [600] width of rendered image
  height:: [250] height of rendered image
  leftGutter:: [30] space to reserve to the left of the graph. Allocates space for y-axis caption and labels
  bottomGutter:: [20] space to reserve above the graph. Allocates space for x-axis
  topGutter:: [20] space to reserve below the graph
  labelColor:: [#000] text color for all labels
  labelFont:: ["Arial"] font for all labels
  labelFontSize:: ["9px"] font size for all labels
  gridBorderColor:: ["#ccc"] background grid color, points will be plotted on the grid
  drawPoints:: [true] whether or not to draw points on the graph
  pointColor:: ["#000"] point color
  pointRadius:: [3] point radius   
  activePointRadius:: [5] active point radius - used when hovering on points    
  drawLine:: [true] whether or not to join points on the graph with a line
  lineColor:: ["#000"] self explanatory yah?
  lineWidth:: [3] self explanatory yah?
  lineJoin:: ["round"] round | miter | bevel - how to join the lines on the graph
  fillUnderLine:: [false] fill under lines
  fillColor:: ["#000"]
  fillOpacity:: [0.2]
  drawBars:: [false] want a bar graph?
  barColor:: ["#000"] need i explain?
  addHover:: [true] oh hover.. displays a little popup with y and x axis values for the selected point
  mysteryFactor:: [0] it's a mystery

== Contributors

Dmitry Baranovskiy provided all of the initial code for plotting points on a graph using Raphael
Ben Askins took that example and created the SimpleGraph function
Lachie Cox improved sample code
Lachlan Hardy removed lint
Martin Stannard added bar graphs
Colin Campbell-McPherson eliminated repetition from setStyleDefaults

Fork it on github: http://github.com/benaskins/simplegraph

Send feedback & suggestions to ben.askins [at] gmail.com

== License

Copyright (c) 2008 Ben Askins

Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
