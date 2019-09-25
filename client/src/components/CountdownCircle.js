import './CountdownCircle.scss';

import { Countdown } from "./Countdown.js";

const split_value_and_units = (size) => {
  const unit = /[a-z]+$/.exec(size);
  const value = size.replace(unit, "");
  return [value, unit];
};


const get_animation_steps = (step_count, circle_circumference) => {
  if ( window.feature_detection.is_IE() ){
    // IE can't interpolate stroke-dashoffset in animations, so we need to explicitly define each frame
    const [circumference_value, unit] = split_value_and_units(circle_circumference);

    const step_size = 100/step_count;
    const dashoffset_per_step = circumference_value/step_count;
  
    return _.chain()
      .range(step_count-1)
      .map(step_minus_1 => step_minus_1+1)
      .reduce(
        (animation_stages, step) => animation_stages +
          `\n ${step*step_size}% { stroke-dashoffset: ${step*dashoffset_per_step}${unit}; }`,
        `0% { stroke-dashoffset: 0${unit}; }`
      )
      .value();
  } else {
    return `
      from {
        stroke-dashoffset: 0px;
      }
      to {
        stroke-dashoffset: ${circle_circumference};
      }
    `;
  }
};


export class CountdownCircle extends React.Component {
  constructor(){
    super();
    this.state = { countdown_circle_instance_id: _.uniqueId("countdown-circle-instance-") };
  }
  render(){
    const {
      time, // in ms
      size,
      color,
      stroke_width,
      show_numbers,
      on_end_callback,
    } = this.props;

    const { countdown_circle_instance_id } = this.state;

    const time_in_seconds = time/1000;

    const [size_value, size_unit] = split_value_and_units(size);
    const circle_position = `${size_value/2}${size_unit}`;
    const circle_radius_value = size_value/2.33;
    const circle_radius = `${circle_radius_value}${size_unit}`;
    const circle_circumference = `${2*Math.PI*circle_radius_value}${size_unit}`;

    // Note that the animation is on the svg tag, not the circle
    // IE11 can't animate elements inside of an svg tag but can animate the whole tag
    return (
      <div 
        className="countdown-circle"
        style={{
          width: size,
          height: size,
        }}
      >
        { show_numbers &&
          <div 
            className="countdown-circle__number"
            style={{lineHeight: size, color}}
          >
            <Countdown time={time_in_seconds} />
          </div>
        }
        <svg 
          className="countdown-circle__display"
          style={show_numbers ? {top: `-${size}`} : {}}
          id={countdown_circle_instance_id}
          onAnimationEnd={on_end_callback}
        >
          <style 
            dangerouslySetInnerHTML={{__html: `
              #${countdown_circle_instance_id} {
                stroke-dasharray: ${circle_circumference};
                stroke: ${color};
                stroke-width: ${stroke_width};
                animation: ${countdown_circle_instance_id} ${time}ms linear 1 forwards;
              }
              @keyframes ${countdown_circle_instance_id} {
                ${get_animation_steps(60, circle_circumference)}
              }
            `}} 
          />
          <circle
            r={circle_radius}
            cx={circle_position}
            cy={circle_position}
          />
        </svg>
      </div>
    );
  }
}
CountdownCircle.defaultProps = {
  size: "3em",
  color: window.infobase_color_constants.buttonPrimaryColor,
  stroke_width: "2px",
  show_numbers: false,
};