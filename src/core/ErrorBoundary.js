import { get_static_url, make_request } from './request_utils.js';
import { log_standard_event } from './analytics.js';

export class ErrorBoundary extends React.Component {
  constructor(){
    super();

    this.state = {
      has_error: false,
      testing_for_stale_client: false,
    };
  }
  static getDerivedStateFromError(error) {
    return {
      has_error: true,
      testing_for_stale_client: true,
    };
  }
  handle_stale_client_error_case(){
    const unique_query_param = Date.now() + Math.random().toString().replace('.','');

    // Stale clients are our most likely production errors, always check for and attempt to handle them
    // That is, reload the page without cache if the client/CDN sha's are mismatched (and the build is non-DEV)
    // Otherwise, log the error (again, if non-DEV) and display error component
    make_request( get_static_url('build_sha', unique_query_param) )
      .then( build_sha => {
        const local_sha_matches_remote_sha = build_sha.search(`^${window.sha}`) !== -1;
    
        if (!local_sha_matches_remote_sha && !DEV) {
          window.location.reload(true);
        } else {
          this.log_error_and_display_error_page();
        }
      })
      .catch( () => {
        this.log_error_and_display_error_page();
      });
  }
  log_error_and_display_error_page(){
    if (!DEV){
      log_standard_event({
        SUBAPP: window.location.hash.replace('#',''),
        MISC1: "ERROR_IN_PROD",
      });
    }

    this.setState({
      testing_for_stale_client: false,
    });
  }
  render(){
    if (!this.state.has_error){
      return this.props.children;
    } else if (this.state.testing_for_stale_client){
      this.handle_stale_client_error_case();
      return null;
    } else {
      return (
        <div
          style = {{
            fontSize: "32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span>
            { 
              window.lang === "en" ? 
                "An error has occured" :
                "Une erreur est survenue"
            }
          </span>
          <img 
            className = "aria-hidden" 
            src = { get_static_url("svg/not-available.svg") }
            style = {{
              maxWidth: "100%",
              width: "400px",
            }}
          />
          <span>
            { 
              window.lang === "en" ? 
                "Please refresh the page" :
                "Veuillez actualiser la page"
            }
          </span>
        </div>
      );
    }
  }
}
