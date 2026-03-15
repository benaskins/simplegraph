// SimpleGraph v2.2 — zero-dependency SVG graphs
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
    drawGrid: false,
    drawPoints: false,
    pointRadius: 3,
    activePointRadius: 5,
    drawLine: true,
    lineWidth: 2,
    smooth: true,
    drawBars: false,
    barWidth: 10,
    barOffset: 0,
    fillUnderLine: false,
    fillOpacity: 0.15,
    yAxisCaption: null,
    yAxisOffset: 0,
    units: '',
    lowerBound: 0,
    minYAxisValue: null,
    xAxisLabelOffset: 0,
    addHover: true,
    // Series index for CSS color classes
    seriesIndex: 0
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

  // ── Path builders ──

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
    var g = svgEl('g', { class: 'sg-tooltip', 'pointer-events': 'none' }, svg);
    svgEl('rect', { class: 'sg-tooltip-bg', rx: '4', ry: '4' }, g);
    svgEl('text', { class: 'sg-tooltip-value', 'text-anchor': 'middle' }, g);
    svgEl('text', { class: 'sg-tooltip-label', 'text-anchor': 'middle' }, g);
    return g;
  }

  function showTooltip(tipG, value, label, x, y, settings) {
    var text = value + (settings.units ? ' ' + settings.units : '');
    var rect = tipG.querySelector('.sg-tooltip-bg');
    var textVal = tipG.querySelector('.sg-tooltip-value');
    var textLabel = tipG.querySelector('.sg-tooltip-label');

    textVal.textContent = text;
    textLabel.textContent = label || '';

    var padX = 12, gap = 8;
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

    rect.setAttribute('x', tx);
    rect.setAttribute('y', ty);
    rect.setAttribute('width', w);
    rect.setAttribute('height', h);
    textVal.setAttribute('x', tx + w / 2);
    textVal.setAttribute('y', ty + (label ? 18 : 18));
    textLabel.setAttribute('x', tx + w / 2);
    textLabel.setAttribute('y', ty + 34);
    tipG.classList.add('sg-tooltip--visible');
  }

  function hideTooltip(tipG) {
    tipG.classList.remove('sg-tooltip--visible');
  }

  // ── Draw functions ──

  function drawGrid(svg, grid, settings) {
    var g = svgEl('g', { class: 'sg-grid' }, svg);
    for (var i = 0; i <= grid.columns; i++) {
      var x = grid.x(i);
      svgEl('line', { x1: x, y1: grid.topEdge, x2: x, y2: grid.topEdge + grid.innerHeight }, g);
    }
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
        'text-anchor': 'middle'
      }, g).textContent = label;
    });
  }

  function drawYAxis(svg, grid, settings) {
    var g = svgEl('g', { class: 'sg-y-axis' }, svg);

    for (var i = 1; i < grid.rows; i += 2) {
      var val = (grid.rows - i) * 2 + settings.lowerBound;
      var y = grid.y(val) + 4;
      var x = grid.leftEdge - (6 + settings.yAxisOffset);
      svgEl('text', { x: x, y: y, 'text-anchor': 'end' }, g).textContent = val;
    }

    if (settings.yAxisCaption) {
      var caption = settings.yAxisCaption + (settings.units ? ' (' + settings.units + ')' : '');
      var cx = grid.leftEdge - (20 + settings.yAxisOffset);
      var cy = grid.topEdge + grid.innerHeight / 2;
      var el = svgEl('text', {
        x: cx, y: cy, 'text-anchor': 'middle',
        class: 'sg-y-caption',
        transform: 'rotate(-90, ' + cx + ', ' + cy + ')'
      }, g);
      el.textContent = caption;
      settings.yAxisOffset += 30;
    }
  }

  function plotData(svg, data, labels, grid, settings, tipG) {
    var si = settings.seriesIndex;
    var g = svgEl('g', { class: 'sg-series sg-series-' + si }, svg);
    var points = data.map(function (v, i) { return [grid.x(i), grid.y(v)]; });
    var pathD = settings.smooth ? smoothPath(points) : straightPath(points);
    var bottom = settings.height - settings.bottomGutter;

    if (settings.fillUnderLine && points.length > 1) {
      var fillD = pathD +
        ' L ' + points[points.length - 1][0] + ' ' + bottom +
        ' L ' + points[0][0] + ' ' + bottom + ' Z';
      svgEl('path', { d: fillD, class: 'sg-fill' }, g);
    }

    if (settings.drawLine && points.length > 1) {
      svgEl('path', {
        d: pathD, class: 'sg-line',
        'stroke-width': settings.lineWidth
      }, g);
    }

    if (settings.drawBars) {
      data.forEach(function (v, i) {
        var x = grid.x(i) + settings.barOffset;
        var y = grid.y(v);
        var h = bottom - y;
        svgEl('rect', {
          x: x - settings.barWidth / 2, y: y,
          width: settings.barWidth, height: Math.max(0, h),
          class: 'sg-bar'
        }, g);
      });
    }

    data.forEach(function (v, i) {
      var x = grid.x(i);
      var y = grid.y(v);
      var label = labels ? labels[i] : '';

      var dot = null;
      if (settings.drawPoints) {
        dot = svgEl('circle', {
          cx: x, cy: y, r: settings.pointRadius,
          class: 'sg-point'
        }, g);
      }

      if (settings.addHover && tipG) {
        var hitArea = svgEl('rect', {
          x: x - grid.stepX / 2, y: grid.topEdge,
          width: grid.stepX, height: grid.innerHeight,
          class: 'sg-hit'
        }, g);

        hitArea.addEventListener('mouseenter', function () {
          showTooltip(tipG, v, label, x, y, settings);
          if (dot) dot.setAttribute('r', settings.activePointRadius);
        });
        hitArea.addEventListener('mouseleave', function () {
          hideTooltip(tipG);
          if (dot) dot.setAttribute('r', settings.pointRadius);
        });
      }
    });
  }

  // ── Render ──

  function render(svg, data, labels, settings, series) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    svg.setAttribute('width', settings.width);
    svg.setAttribute('height', settings.height);
    svg.setAttribute('viewBox', '0 0 ' + settings.width + ' ' + settings.height);

    var grid = new Grid(data, settings);
    var tipG = settings.addHover ? createTooltip(svg) : null;

    if (settings.drawGrid) drawGrid(svg, grid, settings);
    drawXLabels(svg, labels, grid, settings);
    if (settings.yAxisCaption) drawYAxis(svg, grid, settings);
    plotData(svg, data, labels, grid, settings, tipG);

    series.forEach(function (s, i) {
      var seriesSettings = extend(settings, s.options);
      seriesSettings.seriesIndex = i + 1;
      var g = new Grid(s.data, seriesSettings);
      if (seriesSettings.yAxisCaption) drawYAxis(svg, g, seriesSettings);
      plotData(svg, s.data, labels, g, seriesSettings, tipG);
    });

    if (tipG) svg.appendChild(tipG);
  }

  // ── Public API ──

  function simplegraph(target, data, labels, options) {
    var el;
    if (typeof target === 'string') {
      el = document.querySelector(target);
    } else {
      el = target;
    }
    if (!el) return null;

    var isSvg = el instanceof SVGElement;
    var settings = extend(defaults, options);
    data = data.map(Number);
    labels = labels || [];
    var series = [];

    var svg;
    if (isSvg) {
      svg = el;
    } else {
      var existing = el.querySelector('svg[data-simplegraph]');
      if (existing) el.removeChild(existing);
      svg = svgEl('svg', {
        'data-simplegraph': '',
        class: 'sg',
        xmlns: 'http://www.w3.org/2000/svg'
      });
      el.appendChild(svg);
    }

    render(svg, data, labels, settings, series);

    var api = {
      svg: svg,
      settings: settings,

      more: function (moreData, moreOptions) {
        series.push({ data: moreData.map(Number), options: moreOptions });
        render(svg, data, labels, settings, series);
        return api;
      },

      update: function (newData, newLabels, newOptions) {
        data = newData.map(Number);
        if (newLabels) labels = newLabels;
        if (newOptions) settings = extend(settings, newOptions);
        series = [];
        render(svg, data, labels, settings, series);
        return api;
      },

      destroy: function () {
        if (svg.parentNode) svg.parentNode.removeChild(svg);
        svg = null;
      }
    };

    return api;
  }

  root.simplegraph = simplegraph;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = simplegraph;
  }

})(this);
