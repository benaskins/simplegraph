// SimpleGraph v2 — zero-dependency SVG graphs
// https://github.com/benaskins/simplegraph
// MIT License

(function (root) {
  'use strict';

  var defaults = {
    width: 600,
    height: 250,
    leftGutter: 30,
    bottomGutter: 20,
    topGutter: 20,
    // Grid
    drawGrid: false,
    gridColor: '#e5e5e5',
    // Points
    drawPoints: false,
    pointColor: '#000',
    pointRadius: 3,
    activePointRadius: 5,
    // Line
    drawLine: true,
    lineColor: '#000',
    lineWidth: 2,
    smooth: true,
    // Bars
    drawBars: false,
    barColor: '#000',
    barWidth: 10,
    barOffset: 0,
    // Fill
    fillUnderLine: false,
    fillColor: '#000',
    fillOpacity: 0.15,
    // Labels
    labelColor: '#666',
    labelFont: 'system-ui, -apple-system, sans-serif',
    labelFontSize: 11,
    // Y Axis
    yAxisCaption: null,
    yAxisOffset: 0,
    units: '',
    lowerBound: 0,
    minYAxisValue: null,
    // X Axis
    xAxisLabelOffset: 0,
    // Hover
    addHover: true,
    // Pen shorthand
    penColor: null
  };

  function extend(target, source) {
    var result = {};
    for (var k in target) result[k] = target[k];
    if (source) for (var k in source) result[k] = source[k];
    return result;
  }

  function svgEl(tag, attrs, parent) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) for (var k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }

  // ── Grid calculation ──

  function Grid(data, settings) {
    var maxVal = Math.max.apply(Math, data);
    if (settings.minYAxisValue && settings.minYAxisValue > maxVal) {
      maxVal = settings.minYAxisValue;
    }

    this.leftEdge = settings.leftGutter;
    this.topEdge = settings.topGutter;
    this.innerHeight = settings.height - settings.topGutter - settings.bottomGutter;
    this.innerWidth = settings.width - settings.leftGutter;
    this.maxY = maxVal;
    this.lowerBound = settings.lowerBound;
    this.stepX = this.innerWidth / data.length;
    this.scaleY = this.innerHeight / (this.maxY - this.lowerBound);
    this.columns = data.length - 1;
    this.rows = Math.floor((this.maxY - this.lowerBound) / 2);
  }

  Grid.prototype.x = function (i) {
    return this.leftEdge + this.stepX * i;
  };

  Grid.prototype.y = function (val) {
    return this.topEdge + this.innerHeight - this.scaleY * (val - this.lowerBound);
  };

  // ── Smooth path via cubic bezier ──

  function smoothPath(points) {
    if (points.length < 2) return '';
    var d = 'M ' + points[0][0] + ' ' + points[0][1];
    for (var i = 1; i < points.length; i++) {
      var prev = points[i - 1];
      var curr = points[i];
      var cpx = (prev[0] + curr[0]) / 2;
      d += ' C ' + cpx + ' ' + prev[1] + ', ' + cpx + ' ' + curr[1] + ', ' + curr[0] + ' ' + curr[1];
    }
    return d;
  }

  function straightPath(points) {
    return points.map(function (p, i) {
      return (i === 0 ? 'M ' : ' L ') + p[0] + ' ' + p[1];
    }).join('');
  }

  // ── Tooltip ──

  function createTooltip(svg) {
    var g = svgEl('g', { class: 'sg-tooltip', opacity: '0', 'pointer-events': 'none' }, svg);
    var rect = svgEl('rect', {
      rx: '4', ry: '4', fill: '#fff', stroke: '#ccc', 'stroke-width': '1',
      filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.12))'
    }, g);
    var textVal = svgEl('text', {
      class: 'sg-tooltip-value', 'text-anchor': 'middle',
      'font-size': '13', 'font-weight': '600', fill: '#1a1a1a',
      'font-family': 'system-ui, -apple-system, sans-serif'
    }, g);
    var textLabel = svgEl('text', {
      class: 'sg-tooltip-label', 'text-anchor': 'middle',
      'font-size': '11', fill: '#888',
      'font-family': 'system-ui, -apple-system, sans-serif'
    }, g);
    return { g: g, rect: rect, textVal: textVal, textLabel: textLabel };
  }

  function showTooltip(tip, value, label, x, y, settings) {
    var text = value + (settings.units ? ' ' + settings.units : '');
    tip.textVal.textContent = text;
    tip.textLabel.textContent = label || '';

    var padX = 12, padY = 8, gap = 8;
    var valLen = text.length * 7.5;
    var labLen = (label || '').length * 6.5;
    var w = Math.max(valLen, labLen) + padX * 2;
    w = Math.max(w, 60);
    var h = label ? 44 : 28;

    var tx = x - w / 2;
    var ty = y - h - gap;
    if (tx < 0) tx = 0;
    if (tx + w > settings.width) tx = settings.width - w;
    if (ty < 0) ty = y + gap;

    tip.rect.setAttribute('x', tx);
    tip.rect.setAttribute('y', ty);
    tip.rect.setAttribute('width', w);
    tip.rect.setAttribute('height', h);
    tip.textVal.setAttribute('x', tx + w / 2);
    tip.textVal.setAttribute('y', ty + (label ? 18 : 18));
    tip.textLabel.setAttribute('x', tx + w / 2);
    tip.textLabel.setAttribute('y', ty + 34);
    tip.g.setAttribute('opacity', '1');
  }

  function hideTooltip(tip) {
    tip.g.setAttribute('opacity', '0');
  }

  // ── Draw functions ──

  function drawGrid(svg, grid, settings) {
    var g = svgEl('g', { class: 'sg-grid', stroke: settings.gridColor, 'stroke-width': '1' }, svg);
    // Vertical lines
    for (var i = 0; i <= grid.columns; i++) {
      var x = grid.x(i);
      svgEl('line', { x1: x, y1: grid.topEdge, x2: x, y2: grid.topEdge + grid.innerHeight }, g);
    }
    // Horizontal lines
    for (var j = 0; j <= grid.rows; j++) {
      var y = grid.topEdge + (grid.innerHeight / grid.rows) * j;
      svgEl('line', { x1: grid.leftEdge, y1: y, x2: grid.leftEdge + grid.innerWidth - grid.stepX, y2: y }, g);
    }
  }

  function drawXLabels(svg, labels, grid, settings) {
    var g = svgEl('g', { class: 'sg-x-labels' }, svg);
    labels.forEach(function (label, i) {
      svgEl('text', {
        x: grid.x(i) + settings.xAxisLabelOffset,
        y: settings.height - 4,
        'text-anchor': 'middle',
        'font-size': settings.labelFontSize,
        'font-family': settings.labelFont,
        fill: settings.labelColor
      }, g).textContent = label;
    });
  }

  function drawYAxis(svg, grid, settings) {
    var g = svgEl('g', { class: 'sg-y-axis' }, svg);

    // Value labels
    for (var i = 1; i < grid.rows; i += 2) {
      var val = (grid.rows - i) * 2 + settings.lowerBound;
      var y = grid.y(val) + 4;
      var x = grid.leftEdge - (6 + settings.yAxisOffset);
      svgEl('text', {
        x: x, y: y, 'text-anchor': 'end',
        'font-size': settings.labelFontSize,
        'font-family': settings.labelFont,
        fill: settings.labelColor
      }, g).textContent = val;
    }

    // Caption
    if (settings.yAxisCaption) {
      var caption = settings.yAxisCaption + (settings.units ? ' (' + settings.units + ')' : '');
      var cx = grid.leftEdge - (20 + settings.yAxisOffset);
      var cy = grid.topEdge + grid.innerHeight / 2;
      svgEl('text', {
        x: cx, y: cy, 'text-anchor': 'middle',
        'font-size': settings.labelFontSize,
        'font-family': settings.labelFont,
        fill: settings.labelColor,
        transform: 'rotate(-90, ' + cx + ', ' + cy + ')'
      }, g).textContent = caption;

      settings.yAxisOffset += 30;
    }
  }

  function plotData(svg, data, labels, grid, settings, tooltip) {
    var g = svgEl('g', { class: 'sg-data' }, svg);
    var points = data.map(function (v, i) { return [grid.x(i), grid.y(v)]; });
    var pathD = settings.smooth ? smoothPath(points) : straightPath(points);
    var bottom = settings.height - settings.bottomGutter;

    // Fill
    if (settings.fillUnderLine && points.length > 1) {
      var fillD = pathD +
        ' L ' + points[points.length - 1][0] + ' ' + bottom +
        ' L ' + points[0][0] + ' ' + bottom + ' Z';
      svgEl('path', {
        d: fillD, fill: settings.fillColor, opacity: settings.fillOpacity, stroke: 'none'
      }, g);
    }

    // Line
    if (settings.drawLine && points.length > 1) {
      svgEl('path', {
        d: pathD, fill: 'none',
        stroke: settings.lineColor,
        'stroke-width': settings.lineWidth,
        'stroke-linejoin': 'round',
        'stroke-linecap': 'round'
      }, g);
    }

    // Bars
    if (settings.drawBars) {
      data.forEach(function (v, i) {
        var x = grid.x(i) + settings.barOffset;
        var y = grid.y(v);
        var h = bottom - y;
        svgEl('rect', {
          x: x - settings.barWidth / 2, y: y,
          width: settings.barWidth, height: Math.max(0, h),
          fill: settings.barColor, rx: '1'
        }, g);
      });
    }

    // Points & hover targets
    data.forEach(function (v, i) {
      var x = grid.x(i);
      var y = grid.y(v);
      var label = labels ? labels[i] : '';

      var dot = null;
      if (settings.drawPoints) {
        dot = svgEl('circle', {
          cx: x, cy: y, r: settings.pointRadius,
          fill: settings.pointColor, stroke: '#fff', 'stroke-width': '1.5',
          class: 'sg-point'
        }, g);
      }

      if (settings.addHover && tooltip) {
        var hitArea = svgEl('rect', {
          x: x - grid.stepX / 2, y: grid.topEdge,
          width: grid.stepX, height: grid.innerHeight,
          fill: 'transparent', class: 'sg-hit'
        }, g);

        hitArea.addEventListener('mouseenter', function () {
          showTooltip(tooltip, v, label, x, y, settings);
          if (dot) dot.setAttribute('r', settings.activePointRadius);
        });
        hitArea.addEventListener('mouseleave', function () {
          hideTooltip(tooltip);
          if (dot) dot.setAttribute('r', settings.pointRadius);
        });
      }
    });
  }

  // ── Public API ──

  function simplegraph(target, data, labels, options) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return null;

    var settings = extend(defaults, options);

    // Pen shorthand
    if (settings.penColor) {
      settings.lineColor = settings.penColor;
      settings.pointColor = settings.penColor;
      settings.fillColor = settings.penColor;
      settings.barColor = settings.penColor;
    }

    // Coerce string data to numbers
    data = data.map(Number);

    var svg = svgEl('svg', {
      width: settings.width, height: settings.height,
      viewBox: '0 0 ' + settings.width + ' ' + settings.height,
      xmlns: 'http://www.w3.org/2000/svg'
    });
    el.appendChild(svg);

    var grid = new Grid(data, settings);
    var tooltip = settings.addHover ? createTooltip(svg) : null;

    if (settings.drawGrid) drawGrid(svg, grid, settings);
    drawXLabels(svg, labels || [], grid, settings);
    if (settings.yAxisCaption) drawYAxis(svg, grid, settings);
    plotData(svg, data, labels || [], grid, settings, tooltip);

    // Move tooltip to front
    if (tooltip) svg.appendChild(tooltip.g);

    // Return API for chaining
    return {
      svg: svg,
      settings: settings,
      more: function (moreData, moreOptions) {
        var s = extend(settings, moreOptions);
        if (s.penColor) {
          s.lineColor = s.penColor;
          s.pointColor = s.penColor;
          s.fillColor = s.penColor;
          s.barColor = s.penColor;
        }
        moreData = moreData.map(Number);
        var g = new Grid(moreData, s);
        if (s.yAxisCaption) drawYAxis(svg, g, s);
        plotData(svg, moreData, labels || [], g, s, tooltip);
        if (tooltip) svg.appendChild(tooltip.g);
        return this;
      }
    };
  }

  // Export
  root.simplegraph = simplegraph;

  // ES module compat
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = simplegraph;
  }

})(this);
