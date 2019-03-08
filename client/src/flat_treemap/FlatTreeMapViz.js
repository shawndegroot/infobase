
import classNames from "classnames";
import { make_unique } from "../general_utils";
import common_charts_utils from '../charts/common_charts_utils';
import { formats } from '../core/format.js';
import './FlatTreeMap.scss';

export class FlatTreeMapViz extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <div ref={div => this.el = div} />
  }
  componentDidMount() {
    this._imperative_render();
  }
  componentDidUpdate() {
    this._imperative_render();
  }
  _imperative_render() {
    const {
      data,
      colorScale,
      height,
      node_render,
      tooltip_render,
    } = this.props;

    const el = this.el;
    el.innerHTML = `
    <div  class="TreeMap__Mainviz">
      <div
          class="viz-root"
          style="
            position:relative;
            min-height: ${height}px;"
          >
      </div>
    </div>`;

    const width = height;

    const root = d3.hierarchy(data);

    const treemap = d3.treemap();
    treemap
      .size([width, height])
      .paddingOuter(10)
      .tile(d3.treemapSquarify.ratio(1))
    treemap(root
      .sum(function (d) { return d["{{est_in_year}}_estimates"]; })
      .sort((a, b) => {
        if (a.data.others) {
          return 9999999
        }
        if (b.data.others) {
          return -9999999
        }
        return b.value - a.value || b.height - a.height
      })
    );

    // sets x and y scale to determine size of visible boxes
    const x = d3.scaleLinear()
      .domain([0, width])
      .range([0, width]);
    const y = d3.scaleLinear()
      .domain([0, height])
      .range([0, height]);

    const html_root = d3.select(el).select('div');

    // the actual treemap div
    const viz_root = html_root.select('.viz-root');


    viz_root
      .append("div")
      .attr("class", "FlatTreeMap__GraphArea")
      .styles(() => ({
        width: `${x(width)}px`,
        height: `${y(height)}px`,
      }));

    const vs_items = viz_root.select('.FlatTreeMap__GraphArea')
      .selectAll('div')
      .data(root.children)
      .enter()
      .append('div')
      .attr("class", "FlatTreeMap__ContentBox")
      .attr("tabindex", 0)
      .call(treemap_node_content_container)
      .styles((d) => ({
        "background-color": colorScale(d.data.desc),
      }));

    vs_items
      .append('div')
      .attr("class", "FlatTreeMap__TextBox")
      .call(treemap_node_text_container)
      .call(node_render)

    function treemap_node_content_container(sel) {
      sel
        .styles(d => ({
          left: `${x(d.x0)}px`,
          top: `${y(d.y0)}px`,
          width: `${x(d.x1) - x(d.x0)}px`,
          height: `${y(d.y1) - y(d.y0)}px`,
        }))
    }

    function treemap_node_text_container(sel) {
      sel
        .styles(d => ({
          width: `${x(d.x1) - x(d.x0)}px`,
          height: `${y(d.y1) - y(d.y0)}px`,
        }))
    }

    const tt = viz_root.append("div")
      .attr("class", "FlatTreeMap__ToolTip")
      .style("opacity", 0);


    vs_items
      .on("mouseenter", function (d) {
        tt
          .transition()
          .duration(100)
          .style("opacity", 1);
        tt
          .call(tooltip_render,d)
          .styles(() => ({
            left: tooltip_pos(d)[0] + "px",
            top: tooltip_pos(d)[1] + "px",
            "max-width": "300px",
          }))
      })
      .on("mouseleave", function (d) {
        tt.transition()
          .duration(1)
          .style("opacity", 0);
      });

    function tooltip_pos(d){
      let tx = d.x1 - 50;
      let ty = d.y0 - 25;
      if (tx + 300 > width) {
        tx = width-300;
      }
      return [tx,ty];
    }

    return viz_root;
  }
}

