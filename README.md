# SimpleGraph

Zero-dependency SVG graphs. No jQuery, no Raphael, no build step.

[Live demo](https://benaskins.github.io/simplegraph/)

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
| `target` | string or Element | CSS selector or DOM element |
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
