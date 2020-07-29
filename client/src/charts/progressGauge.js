import "./progressGauge.scss";
import { successDarkColor, highlightDark } from "../core/color_defs";
import { Format } from "../components";

export default class ProgressGauge extends React.Component {
  render() {
    const { value, total_value, circle_color } = this.props;
    const gauge_value = value || 0;
    const percentage = gauge_value / total_value;

    const num_circles = total_value < 10 ? total_value : 10;

    const progress_gauge = _.times(num_circles, (i) => {
      const filled_circle_style = {
        background:
          circle_color || (percentage > 0.5 ? successDarkColor : highlightDark),
      };
      const empty_circle_style = {
        border: "2px solid",
      };
      return (
        <span
          key={i}
          className="progress-circle"
          style={
            i < percentage * num_circles
              ? filled_circle_style
              : empty_circle_style
          }
        />
      );
    });

    return (
      <div>
        <h4 style={{ textAlign: "center" }}>
          {gauge_value} / {total_value}
        </h4>
        <div>{progress_gauge}</div>
        <h2 style={{ textAlign: "center", margin: "0" }}>
          <Format type={"percentage"} content={percentage} />
        </h2>
      </div>
    );
  }
}
