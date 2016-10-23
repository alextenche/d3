'use strict';

var time, dots, date, x, y;
var height = 800,
width = 1200;

var defaultCircleRadius = 2;

var padding = 50;

var zoom = d3.behavior.zoom()
  .scaleExtent([1, 10])
  .on('zoom', zoomed);

var circleDrag = d3.behavior.drag()
  .on('dragstart', dragStarted)
  .on('drag', dragged);

var svg = d3.select("#viz-wrapper")
  .append('svg')
  .attr('height', height + padding * 2)
  .attr('width', width + padding * 2)
  .call(zoom);

var viz = svg
  .append('g')
  .attr('id', 'viz')
  .attr('transform', 'translate(' + padding + ',' + padding + ')');

var yScale = d3.scale.linear().range([height, 0]);
var xScale = d3.time.scale().range([0, width]);
var rScale = d3.scale.linear().range([1, 10]);

var xAxis = d3.svg.axis().scale(xScale).orient('bottom').ticks(8);
var yAxis = d3.svg.axis().scale(yScale).orient('left').ticks(20);

var parseTime = d3.time.format("%Y%m%d");
var calculateRadius = function(TMAX){
  var area = Math.abs(TMAX);
  var r = Math.sqrt(area / Math.PI);
  return r;
}

d3.csv('climate_data_truncated.csv', function(data) {
  var yDomain = d3.extent(data, function(element){
    return parseInt(element.TMAX) * 1.1;
  });

  var xMin = d3.min(data, function(element) {
    time = parseTime.parse(element.DATE);
    time.setMonth(time.getMonth() - 1);
    return time;
  });

  var xMax = d3.max(data, function(element) {
    time = parseTime.parse(element.DATE);
    time.setMonth(time.getMonth() + 1);
    return time;
  });

  var rdomain = d3.extent(data, function(element){
    return calculateRadius(parseInt(element.TMAX));
  });

  yScale.domain(yDomain);
  xScale.domain([xMin, xMax]);

  // add the x axis
  viz.append('g')
  .attr('class', 'x axis')
  .attr('transform', 'translate(0, ' + height + ')')
  .call(xAxis)
  .selectAll('text')
  .attr('transform', function(){
    return 'rotate(-65)';
  })
  .style('text-anchor', 'end')
  .style('font-size', '10px')
  .attr('dx', '-10px')
  .attr('dy', '10px');

  viz.append('g')
  .attr('class', 'y axis')
  .call(yAxis);

  dots = viz.selectAll('g.dots')
  .data(data)
  .enter()
  .append('g')
  .attr('class', 'dots');

  dots.attr('transform', function(d){
    date = parseTime.parse(d.DATE);
    x = xScale(date)
    y = yScale(d.TMAX)
    return 'translate(' + x + ',' + y + ')';
  })
  .style('stroke', 'red')
  .style('fill', '#006bff');

  dots.append('circle')
  .attr('r', 5);

  dots.append('text')
  .text(function(d) {
    return d.TMAX
  })
  .style('display', 'none');

  dots.on('mouseenter', function(d, i){
    var dot = d3.select(this);
    var radius = calculateRadius(parseInt(d.TMAX));
    dot.select('text')
    .style('display', 'block');
    dot.select('circle')
    .attr('r', rScale(radius));
  });

  dots.on('mouseleave', function(d, i){
    var dot = d3.select(this);
    dot.select('text')
    .style('display', 'none');
    dot.select('circle')
    .attr('r', 0);
  });

  dots.call(circleDrag);

});

function zoomed() {
  viz.attr("transform", "translate(" + d3.event.translate + ")" + "scale(" + d3.event.scale + ")");
};

function dragStarted() {
  d3.event.sourceEvent.stopPropagation();
  d3.select(this)
    .select('circle')
    .style('fill', 'green');
};

function dragged(data) {
  data.x = d3.event.x;
  data.y = d3.event.y;
  d3.select(this)
    .attr('transform', 'translate(' + data.x + ',' + data.y + ')');
  var date = xScale.invert(d3.event.x);
  data.DATE = parseTime(date);
  var temperature = yScale.invert(d3.event.y);
  data.TMAX = temperature.toString();
};
