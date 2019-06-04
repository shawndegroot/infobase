import common_charts_utils from './common_charts_utils';
import { get_static_url } from '../request_utils.js';

export class LiquidFillGauge{
  constructor(container, options){
    common_charts_utils.setup_graph_instance(this, d3.select(container), options);
  };

  render(options){
    this.options = _.extend(this.options,options);
    const waveHeight = this.options.waveHeight || 0.05
    const waveHeightScale = d3.scaleLinear()
      .range([waveHeight, waveHeight])
      .domain([0,100]);

    const margin = this.options.margin || {top: 10,
      right: 0,
      bottom: 0,
      left: 0};

    const width = this.outside_width - margin.left - margin.right;
    const height = this.outside_height - margin.top - margin.bottom;
    
    const radius = Math.min(parseInt(width), parseInt(height))/2;
    const locationX = parseInt(width)/2 - radius;
    var locationY = (parseInt(height) - radius)/22;

    const fillPercent = this.options.value / this.options.totalValue;
    const textValue = parseFloat(fillPercent * 100).toFixed(1);
    const textPixels = (this.options.textSize*radius/2) || (radius/2);
    const titleGap = this.options.titleGap || 40;
    const circleThickness = this.options.circleThickness * radius || 0.05 * radius;
    const circleFillGap = this.options.circleFillGap * radius || 0.05 * radius;
    const fillCircleMargin = circleThickness + circleFillGap;
    const fillCircleRadius = radius - fillCircleMargin;
    const waveHeightValue = fillCircleRadius * waveHeightScale(textValue);

    const waveCount = this.options.waveCount || 1
    const waveLength = fillCircleRadius*2 / waveCount;
    const waveClipCount = 1 + waveCount;
    const waveClipWidth = waveLength * waveClipCount;

    const outerArcColor = this.options.outerArcColor || window.infobase_color_constants.secondaryColor;
    const circleColor = this.options.circleColor || window.infobase_color_constants.secondaryColor;
    const textColor = this.options.textColor || window.infobase_color_constants.secondaryColor;
    const waveTextColor = this.options.waveTextColor || window.infobase_color_constants.textLightColor;
  
    const textVertPosition = this.options.textVertPosition || 0.5;
    const waveIsFall = this.options.waveIsFall || 1;
    const waveDirection = waveIsFall ? 100:0;
    const waveRiseFallTime = this.options.waveRiseFallTime || 2200
    const waveAnimateTime = this.options.waveAnimateTime || 2400

    if(this.options.title){
      locationY = locationY + titleGap;
      this.outside_height = this.outside_height + titleGap;
      this.html.append("div")
        .attr("class", "title center-text")
        .styles({
          "font-size": `${textPixels/2}px`,
          "position": "absolute",
          "font-weight": "500",
          "left": `${margin.left}px`,
          "top": `0px`,
          "width": `${width}px`,
        })
        .append("div")
        .styles({"width": "80%","margin": "auto"})
        .html(this.options.title);
    };


    this.graph = this.svg.append("g")
      .attr("class","_graph_area")
      .attr("transform", `translate(${locationX},${locationY})`);
    this.graph.append("svg:image")
      .attr("xlink:href", get_static_url("svg/replay.svg"))
      .attr("transform", `translate(0,0)`)
      .style("cursor", "pointer")
      .on("click", (() => {
        animateWaveRiseFall();
      }));

    this.svg
      .attr("width", this.outside_width)
      .attr("height", this.outside_height);

    const arc = d3.arc()
      .startAngle(0)
      .endAngle(360)
      .innerRadius(radius)
      .outerRadius(radius+5);

    this.graph.append("path")
      .attr("d", arc)
      .attr("transform", `translate(${radius},${radius})`)
      .style("fill", outerArcColor);

    const textRiseScaleY = d3.scaleLinear()
      .range([fillCircleMargin+fillCircleRadius*2,(fillCircleMargin+textPixels*0.7)])
      .domain([0,1]);
    const textTween = () =>{
      var i = d3.interpolate(waveDirection, textValue);
      return function(t) { this.textContent = `${parseFloat(i(t)).toFixed(1)}%`; }
    };
  
    const text = this.graph.append("text")
      .text(`${textValue}%`)
      .attr("text-anchor", "middle")
      .attr("font-size", `${textPixels}px`)
      .style("fill", textColor)
      .attr('transform',`translate(${radius},${textRiseScaleY(textVertPosition)})`);
  
    const waveScaleX = d3.scaleLinear().range([0,waveClipWidth]).domain([0,1]);
    const waveScaleY = d3.scaleLinear().range([0,waveHeightValue]).domain([0,1]);
    const clipArea = d3.area()
      .x((d) => { return waveScaleX(d.x); } )
      .y0((d) => { return waveScaleY(Math.sin(d.y*2*Math.PI));} )
      .y1((d) => { return (fillCircleRadius*2 + waveHeightValue); } );

    const data = [];
    for(var i = 0; i <= 40*waveClipCount; i++){
      data.push({x: i/(40*waveClipCount), y: (i/(40))});
    }
    const uniqueId = _.uniqueId("clipWave_");
    const waveGroup = this.graph.append("defs")
      .append("clipPath")
      .attr("id", uniqueId);
    const wave = waveGroup.append("path")
      .datum(data)
      .attr("d", clipArea)
      .attr("T", 0);

    const fillCircleGroup = this.graph.append("g")
      .attr("clip-path", `url(#${uniqueId})`);
    fillCircleGroup.append("circle")
      .attr("cx", radius)
      .attr("cy", radius)
      .attr("r", fillCircleRadius)
      .style("fill", circleColor);
    const waveText = fillCircleGroup.append("text")
      .text(`${textValue}%`)
      .attr("text-anchor", "middle")
      .attr("font-size", `${textPixels}px`)
      .style("fill", waveTextColor)
      .attr('transform',`translate(${radius},${textRiseScaleY(textVertPosition)})`);
    const waveGroupXPosition = fillCircleMargin+fillCircleRadius*2-waveClipWidth;
    const waveRiseScale = d3.scaleLinear()
      .range([fillCircleMargin+fillCircleRadius*2+waveHeightValue,fillCircleMargin-waveHeightValue])
      .domain([0,1]);
    
    const waveAnimateScale = d3.scaleLinear()
      .range([0, waveClipWidth-fillCircleRadius*2])
      .domain([0,1]);

    const animateWaveRiseFall = () => {
      waveGroup.interrupt();
      waveGroup.attr('transform',`translate(${waveGroupXPosition},${waveRiseScale(waveIsFall)})`)
        .transition()
        .duration(waveRiseFallTime)
        .attr('transform',`translate(${waveGroupXPosition},${waveRiseScale(fillPercent)})`)
      text.transition()
        .duration(waveRiseFallTime)
        .tween("text", textTween);
      waveText.transition()
        .duration(waveRiseFallTime)
        .tween("text", textTween);
    };

    const animateWave = () => {
      wave.attr('transform',`translate(${waveAnimateScale(wave.attr('T'))},0)`);
      wave.transition()
        .duration(waveAnimateTime * (1-wave.attr('T')))
        .ease(d3.easeLinear)
        .attr('transform',`translate(${waveAnimateScale(1)},0)`)
        .attr('T', 1)
        .on('end', (() => {
          wave.attr('T', 0);
          animateWave(waveAnimateTime);
        }));
    };

    animateWaveRiseFall();
    animateWave();

    return this;
  };
}