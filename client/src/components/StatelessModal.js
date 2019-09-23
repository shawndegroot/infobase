import './StatelessModal.scss';

import { Modal } from 'react-bootstrap';
import classNames from 'classnames';

import { CountdownCircle } from './CountdownCircle.js';
import { trivial_text_maker } from '../models/text.js';


export class StatelessModal extends React.Component {
  constructor(props){
    super(props);

    this.auto_close_timeouts = [];
    this.closeModal = this.closeModal.bind(this);
    this.stopAutoCloseTimeouts = this.stopAutoCloseTimeouts.bind(this);
    this.clearAutoCloseTimeouts = this.clearAutoCloseTimeouts.bind(this);

    this.state = { timeout_stopped: false };
  }
  componentDidUpdate(){
    const { 
      auto_close_time,
      show,
      backdrop,
    } = this.props;

    const { timeout_stopped } = this.state;

    if (show && !backdrop){
      // Bootstrap modals prevent scrolling by temporarily adding the 'modal-open' class to <body>
      document.body.classList.add('modal-open--allow-scroll');
    }

    if ( _.isNumber(auto_close_time) && show && !timeout_stopped ){
      this.auto_close_timeouts.push( setTimeout(this.closeModal, auto_close_time) );
    }
  }
  componentWillUnmount(){
    this.closeModal();
  }
  closeModal(){
    const {
      on_close_callback,
      backdrop,
    } = this.props;

    this.clearAutoCloseTimeouts();
    this.setState({ timeout_stopped: false });

    if (!backdrop){
      // Bootstrap modals prevent scrolling by temporarily adding the 'modal-open' class to <body>
      document.body.classList.remove('modal-open--allow-scroll');
    }

    on_close_callback();
  }
  stopAutoCloseTimeouts(){
    // With all the timeouts floating around, despite clearing them carefully, this occasionally gets 
    // called after the modal's closed, which could make it start with timeout_stopped true the next
    // time it was opened. So, don't try to stop the timeout if the modal's not being shown
    if (this.props.show && !this.state.timeout_stopped){
      this.clearAutoCloseTimeouts();
      this.setState({ timeout_stopped: true });
    }
  }
  clearAutoCloseTimeouts(){
    this.auto_close_timeouts.forEach( (auto_close_timeout) => clearTimeout(auto_close_timeout) );
    this.auto_close_timeouts = [];
  }
  render(){
    const {
      show,
      title,
      subtitle,
      header,
      body,
      footer,
      backdrop,
      dialog_position,
      additional_dialog_class,
      auto_close_time,
      close_text,
      close_button_in_header,
    } = this.props;

    const { timeout_stopped } = this.state;

    const default_header = (
      <div style={{display: "inline-block"}}>
        {title && <Modal.Title style={{fontSize: '130%'}}>{title}</Modal.Title>}
        {subtitle && <Modal.Title style={{fontSize: '100%', marginTop: '7px'}}>{subtitle}</Modal.Title>}
      </div>
    );

    const close_button_and_timer = (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          height: "3em",
        }}
      >
        { auto_close_time && !timeout_stopped &&
          <CountdownCircle time={auto_close_time} show_numbers={auto_close_time >= 2000} size="3em" />
        }
        { close_text &&
          <button className="btn btn-ib-primary" onClick={this.closeModal}>
            {close_text}
          </button>
        }
      </div>
    );

    const common_layout = (content, include_close_button) => (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        {content || <div /> /* empty div fallback so that space-between justification consistently positions the close button */} 
        {include_close_button && close_button_and_timer}
      </div>
    );
    const header_content = common_layout(header || default_header, close_button_in_header);
    const footer_content = footer || !close_button_in_header && common_layout(footer || <div/>, !close_button_in_header);

    return (
      <Modal 
        show={show}
        backdrop={backdrop}
        modal-without-backdrop={(!backdrop).toString()}
        dialogClassName={classNames(`modal-dialog--${dialog_position}`, additional_dialog_class)}
        onHide={this.closeModal}
        restoreFocus={
          // don't want to restore focus if the window could scroll, since it will (unexpectedly for the user) jump the window back
          // when focus returns. Always restore focus in a11y mode
          backdrop || window.is_a11y_mode
        }
      >
        <div onFocus={this.stopAutoCloseTimeouts} onMouseOver={this.stopAutoCloseTimeouts}>
          <Modal.Header closeButton={!close_text}>
            {header_content}
          </Modal.Header>
          { body &&
            <Modal.Body>
              {body}
            </Modal.Body>
          }
          { footer_content &&
            <Modal.Footer>
              {footer_content}
            </Modal.Footer>
          }
          <div tabIndex='0' onFocus={this.closeModal} />
        </div>
      </Modal>
    );
  }
}
StatelessModal.defaultProps = {
  backdrop: true,
  dialog_position: "center",
  auto_close_time: false,
  close_text: _.upperFirst( trivial_text_maker("close") ),
  close_button_in_header: false,
};