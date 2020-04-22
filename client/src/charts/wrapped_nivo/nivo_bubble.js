import './nivo_bubble.scss';
import text from './nivo_bubble.yaml';

import { ResponsiveBubble } from '@nivo/circle-packing';
import { Fragment } from 'react';
import MediaQuery from 'react-responsive';

import {
  InteractiveGraph,
  create_text_maker_component_with_nivo_common,
  general_default_props,
  get_formatter,
} from './nivo_common.js';

import { formats } from "../../core/format.js";
import { breakpoints } from '../../core/breakpoint_defs.js';
import { newIBCategoryColors } from '../../core/color_schemes.js';
import { DisplayTable } from '../../components/index.js';
  
const { text_maker, TM } = create_text_maker_component_with_nivo_common(text);

// Hacky abuse of ResponsiveBubble... very fragile against nivo changes. Bonus comments left in this file to balance against that
// Would be trivial to make this graph ourselves, only reason for doing it like this is to get nivo native tooltips (and even 
// then they're extra customized ones) and our common nivo graph utilities ...consider rethinking this though

const MIN_NODE_RADIUS = 2;
const ProportionalNode = ({ node, style, handlers }) => {
  if (style.r <= 0){
    return null;
  }

  const {
    // note these aren't values for the specific node, but for the whole graph, e.g. r is always the outer circle radius,
    // and (x, y) is the center of the graph. Node specific values are calculated below
    r: graph_radius,
    x: center_x,
    y: center_y,

    fill,
    color,
    borderColor,
    borderWidth,
  } = style;

  const {
    node_radius,
    node_x,
    node_y,
  } = (() => {
    if ( _.isNull(node.parent) ){
      return {
        node_radius: graph_radius,
        node_x: center_x,
        node_y: center_y,
      };
    } else {

      // need to be clear here, node.value !== graph_data.value as seen below. The config data from graph_data is stored in
      // node.data. The value in node.value is node.data.value PLUS the sum of child values
      // ... kind of makes sense for the standard use of this graph, but still a bit of annoying hidden logic. Makes what
      // we're doing here extra hacky
      const proportion_ratio = node.value/node.parent.value;

      const node_radius = _.max([
        graph_radius*Math.sqrt(proportion_ratio), // do the math, make the actual area proportional
        MIN_NODE_RADIUS,
      ]);

      // this y position will place the bottom of the inner circle just barely above the bottom of the outer circle.
      // Easier to judge proptions than when it's centered, and the slight offset stops the the svg's edges from
      // overlaping and looking jagged
      const node_y = center_y + (graph_radius - node_radius) - 1;

      return {
        node_radius,
        node_x: center_x,
        node_y,
      };
    }
  })();
  
  return (
    <g transform={`translate(${node_x},${node_y})`}>
      <circle
        r={node_radius}
        {...handlers}
        fill={fill ? fill : color}
        stroke={borderColor}
        strokeWidth={borderWidth}
        shapeRendering={"geometricPrecision"}
      />
    </g>
  );
};


export class CircleProportionChart extends React.Component{
  render(){
    const {
      margin,
      is_money,
      text_formatter,
      labelSkipWidth,
      height,
      child_value,
      child_name,
      parent_value,
      parent_name,
      disable_table_view,
    } = this.props;

    const color_scale = d3.scaleOrdinal().range(newIBCategoryColors);
    const value_formatter= get_formatter(is_money, text_formatter, true, true);

    const graph_data = {
      id: parent_name,
      name: parent_name,
      // ... nivo bubble will roll child values back up and add them to the parent value for use in the graph
      // so we need to remove the inner portion from the total here
      value: parent_value - child_value,
      color: color_scale(parent_name),
      children: [
        {
          id: child_name,
          name: child_name,
          value: child_value,
          color: color_scale(child_name),
        },
      ],
    };

    const tooltip = () => (
      <div className="proportional-bubble-tooltip" style={{color: window.infobase_color_constants.textColor}}>
        <table className="nivo-tooltip">
          <tbody>
            { _.map(
              [
                [parent_name, parent_value],
                [child_name, child_value],
              ],
              ([name, value]) => <tr key={name}>
                <td className="nivo-tooltip__content">
                  <div
                    className="proportional-bubble-tooltip__legend_icon"
                    style={{backgroundColor: color_scale(name)}}
                  />
                </td>
                <MediaQuery minDeviceWidth={breakpoints.minSmallDevice}>
                  <Fragment>{ /* MediaQuery jank, it will insert a div wrapping its children when it has mutliple of them, need a manual Fragment to avoid that */ }
                    <td className="nivo-tooltip__content">
                      {name}
                    </td>
                    <td className="nivo-tooltip__content" 
                      dangerouslySetInnerHTML={{__html: value_formatter(value)}}
                    />
                    <td className="nivo-tooltip__content" dangerouslySetInnerHTML={{__html: `(${formats.smart_percentage1(value/parent_value)})` }} />
                  </Fragment>
                </MediaQuery>
                <MediaQuery maxDeviceWidth={breakpoints.maxSmallDevice}>
                  <td>
                    <div className="nivo-tooltip__content">{name}</div>
                    <div className="nivo-tooltip__content" dangerouslySetInnerHTML={{__html: value_formatter(value)}} />
                    <div className="nivo-tooltip__content" dangerouslySetInnerHTML={{__html: `(${formats.smart_percentage1(value/parent_value)})` }} />
                  </td>
                </MediaQuery>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );

    const graph = (
      <Fragment>
        <div style={{height: height}}>
          <ResponsiveBubble
            root={graph_data}
            identity="name"
            value="value"
            colorBy={d => color_scale(d.name)}
            borderColor="inherit:darker(1.6)"
            borderWidth={0}
            enableLabel={false}
            labelTextColor={window.infobase_color_constants.textColor}
            labelSkipWidth={labelSkipWidth}
            animate={true}
            motionStiffness={90}
            motionDamping={12}  
            leavesOnly={false}
            padding={0}
            nodeComponent={ProportionalNode}
            margin={margin}
            tooltip={tooltip}
          />
        </div>
        <div style={{textAlign: "center"}}>
          <TM
            k={"bubble_title"} 
            args={{outer: parent_name, inner: child_name}}
          />
        </div>
      </Fragment>
    );


    const ordered_column_keys = ["label", "value"];
    const column_names = _.map(ordered_column_keys, text_maker);
    const table_data = _.map(
      [
        [parent_name, parent_value],
        [child_name, child_value],
      ],
      ([label, value]) => ({
        display_values: {
          label,
          value: value_formatter(value),
        },
        sort_values: {label, value},
      })
    );
    const table = !disable_table_view && (
      <DisplayTable
        rows={table_data}
        column_names={column_names}
        ordered_column_keys={ordered_column_keys}
      />
    );


    return <InteractiveGraph graph={graph} table={table} />;
  }
};
CircleProportionChart.defaultProps = {
  ...general_default_props,
  margin: { top: 15, right: 0, bottom: 15, left: 0 },
};
