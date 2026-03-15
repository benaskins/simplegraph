# SimpleGraph

Zero-dependency SVG graphs. No jQuery, no Raphael, no build step.

[Live demo](https://benaskins.github.io/simplegraph/)

## Why

You have some numbers. You want a graph on a page. You don't want to install a bundler, configure a build pipeline, or read 200 pages of documentation.

SimpleGraph is one function call, one JS file, one CSS file. Drop them in and go.

- **D3** is a toolkit for building visualisations, not a charting library. A line chart is 50+ lines of code.
- **Chart.js** is 200KB+ with its own canvas renderer, animation system, and plugin architecture.
- **Plotly/Highcharts** are enterprise-grade and enterprise-weight.

SimpleGraph is 6KB, renders to native SVG, and styles with plain CSS. If you outgrow it, you probably need D3. Until then, you don't.

## Install

Download `simplegraph.js` or reference it directly:

```html
<script src="simplegraph.js"></script>
```

## Usage

```js
simplegraph('#target', data, labels, options);
```

**Arguments:**

| Arg | Type | Description |
|---|---|---|
| `target` | string, Element, or SVGElement | CSS selector, DOM element, or SVG element |
| `data` | array | Numeric values to plot |
| `labels` | array | X-axis labels |
| `options` | object | Optional configuration |

### Minimal example

```js
simplegraph('#chart', [20, 23, 23, 28, 28, 22, 25],
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
```

### Multiple series

```js
simplegraph('#chart', tempData, days, {
  penColor: '#DC2626',
  yAxisCaption: 'Temperature',
  units: 'ºC'
}).more(rainData, {
  penColor: '#2563EB',
  yAxisCaption: 'Rainfall',
  units: 'mm'
});
```

## Options

| Option | Default | Description |
|---|---|---|
| `width` | 600 | SVG width |
| `height` | 250 | SVG height |
| `penColor` | null | Shorthand for line, point, fill, and bar color |
| `drawLine` | true | Draw connecting line |
| `lineColor` | '#000' | Line stroke color |
| `lineWidth` | 2 | Line stroke width |
| `smooth` | true | Smooth curves (cubic bezier) |
| `drawPoints` | false | Draw data points |
| `pointColor` | '#000' | Point fill color |
| `pointRadius` | 3 | Point radius |
| `activePointRadius` | 5 | Point radius on hover |
| `drawBars` | false | Draw bar chart |
| `barColor` | '#000' | Bar fill color |
| `barWidth` | 10 | Bar width in pixels |
| `fillUnderLine` | false | Fill area under the line |
| `fillColor` | '#000' | Fill color |
| `fillOpacity` | 0.15 | Fill opacity |
| `drawGrid` | false | Draw background grid |
| `gridColor` | '#e5e5e5' | Grid line color |
| `addHover` | true | Show tooltip on hover |
| `yAxisCaption` | null | Y-axis label text |
| `units` | '' | Unit suffix for tooltips and y-axis |
| `lowerBound` | 0 | Minimum y-axis value |
| `minYAxisValue` | null | Force minimum y-axis ceiling |
| `leftGutter` | 30 | Left padding |
| `topGutter` | 20 | Top padding |
| `bottomGutter` | 20 | Bottom padding |
| `labelColor` | '#666' | Axis label color |
| `labelFont` | 'system-ui' | Axis label font |
| `labelFontSize` | 11 | Axis label font size |

### Update, destroy

`simplegraph` returns a handle for updating data or tearing down:

```js
var chart = simplegraph('#chart', data, labels, options);

// Replace data (re-renders in place)
chart.update([25, 30, 28, 32, 27, 24, 29]);

// Replace data, labels, and options
chart.update(newData, newLabels, { penColor: '#2563EB' });

// Remove from DOM
chart.destroy();
```

Calling `simplegraph()` on the same target is also idempotent — it replaces the previous graph rather than appending a second one.

### Reactive frameworks

The handle API works naturally with any reactive framework:

```js
// Svelte
let data = $state([20, 23, 23, 28]);
let chart;

$effect(() => {
  if (!chart) {
    chart = simplegraph(container, data, labels);
  } else {
    chart.update(data);
  }
  return () => chart.destroy();
});
```

```js
// React
useEffect(() => {
  const chart = simplegraph(ref.current, data, labels, options);
  return () => chart.destroy();
}, [data, labels]);
```

You can also pass an SVG element directly if your framework manages the DOM:

```js
simplegraph(svgElement, data, labels, options);
```

## v1 → v2 migration

v2 drops jQuery and Raphael. The API has changed:

```js
// v1 (jQuery plugin)
$('#target').simplegraph(data, labels, options);
$('#target').simplegraph_more(moreData, options);

// v2 (vanilla JS)
simplegraph('#target', data, labels, options);
simplegraph('#target', data, labels, options).more(moreData, options);
```

If you need v1, it's preserved at [v1.0.0](https://github.com/benaskins/simplegraph/releases/tag/v1.0.0).

## License

MIT
