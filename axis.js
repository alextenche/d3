'use strict';

var height = 900,
     width = 500;

var padding = 50;

var viz = d3.select("#viz-wrapper")
            .append('svg')
            .attr('height', height + padding * 2)
            .attr('width', width + padding * 2)
            .append('g')
            .attr('id', 'viz')
            .attr('transform', 'translate(' + padding + ',' + padding + ')');

var yScale = d3.scale.linear().range([height, 0]);
var xScale = d3.time.scale().range([0, width]);

var xAxis = d3.svg.axis().scale(xScale).orient('bottom').ticks(8);
var yAxis = d3.svg.axis().scale(yScale).orient('left').ticks(20);

var parseTime = d3.time.format("%Y%m%d");

d3.csv('climate_data.csv', function(data) {
  yDomain = d3.extent(data, function(element){
    return parseInt(element.TMAX);
  });

  xDomain = d3.extent(data, function(element) {
    return parseTime.parse(element.DATE);
  });

  yScale.domain(yDomain);
  xScale.domain(xDomain);


  dots = viz.selectAll('circle')
               .data(data)
               .enter()
              .append('circle');

  dots.attr('r', 5)
      .attr('cx', function(d) {
        date = parseTime.parse(d.DATE);
        return xScale(date)
      })
      .attr('cy', function(d) {
        return yScale(d.TMAX)
      })
      .style('stroke', '#00ffd2')
      .style('fill', '#006bff');
});
