import "./HeaderNotification.scss";
import { trivial_text_maker } from "../models/text.js";

export class HeaderNotification extends React.Component {
  state = {
    show: false,
  };

  componentDidMount() {
    setTimeout(() => this.setState({ show: true }), 500);
  }

  render() {
    const { text } = this.props;

    const closeNotification = () => {
      this.setState({ show: false });
    };

    return (
      <div
        style={{
          transform: !this.state.show ? "translateY(-100%)" : "translateY(0)",
        }}
        className="ib-header alert alert-warning"
      >
        <p style={{ marginBottom: "1.2rem" }}>{text}</p>
        <button className="btn btn-ib-primary" onClick={closeNotification}>
          {trivial_text_maker("close")}
        </button>
      </div>
    );
  }
}
