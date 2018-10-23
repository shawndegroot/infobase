import './EmbeddedVideo.scss';

import { SpinnerWrapper } from './SpinnerWrapper.js';
import { Details } from './Details.js';

export class EmbeddedVideo extends React.Component {
  constructor(){
    super();

    this.state = {
      loading: true,
    };
  }
  render(){
    const { 
      loading,
    } = this.state;

    const {
      video_source,
      transcript,
      title,
      container,
    } = this.props;

    const transcript_content = transcript && React.isValidElement(transcript) ?
      transcript :
      <div dangerouslySetInnerHTML={{ __html: transcript }}/>;

    return (
      <div className = { container && "embedded-video-container" }>
        <div className = "embedded-video">
          { loading && <SpinnerWrapper ref="spinner" scale = { 2 } /> }
          <iframe
            title = { title }
            onLoad = { () => this.setState( { loading: false } ) }
            src = { video_source }
            frameBorder = "0" 
            allow = "encrypted-media" 
            allowFullScreen
          />
        </div>
        { transcript && 
          <Details
            summary_content = "Transcription"
            content = { transcript_content }
          />
        }
      </div>
    );
  }
}

EmbeddedVideo.defaultProps = {
  transfript: false,
  title: "",
  container: true,
};