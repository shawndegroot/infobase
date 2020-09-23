import { Fragment } from "react";
import { withRouter } from "react-router-dom";

import { StatelessModal } from "./StatelessModal";
import { SafeJSURL } from "src/general_utils";

class ModalButton_ extends React.Component {
  constructor(props) {
    super(props);

    const {
      show_condition,
      match: {
        params: { options },
      },
    } = this.props;

    const options_object = SafeJSURL.parse(options);

    this.state = (show_condition &&
      options_object[show_condition.name] && {
        show_modal:
          show_condition.value === options_object[show_condition.name],
      }) || { show_modal: false };
  }

  toggle_modal = () =>
    this.setState((prev_state) => ({ show_modal: !prev_state.show_modal }));

  render() {
    const { button_text, title, children, aria_label } = this.props;
    const { show_modal } = this.state;

    return (
      <Fragment>
        <button
          className="btn-link"
          onClick={this.toggle_modal}
          aria-label={aria_label}
        >
          {button_text}
        </button>
        <StatelessModal
          show={show_modal}
          title={title}
          body={children}
          on_close_callback={this.toggle_modal}
          additional_dialog_class={"modal-responsive"}
        />
      </Fragment>
    );
  }
}

const ModalButton = withRouter(ModalButton_);
export { ModalButton };
