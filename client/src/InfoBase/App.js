import axios from "axios";

import _ from "lodash";
import React, { Suspense } from "react";
import { Provider } from "react-redux";
import { Route, Switch, Redirect } from "react-router-dom";
import { createStore } from "redux";

import { lang, is_a11y_mode, is_dev } from "src/app_bootstrap/globals.js";

import { HeaderNotification } from "../components/HeaderNotification";
import { PageDetails } from "../components/PageDetails.js";
import { SpinnerWrapper } from "../components/SpinnerWrapper.js";
import { initialize_analytics } from "../core/analytics.js";
import { DevFip } from "../core/DevFip.js";
import { EasyAccess } from "../core/EasyAccess.js";
import { ErrorBoundary } from "../core/ErrorBoundary.js";
import { has_local_storage } from "../core/feature_detection.js";
import { InsertRuntimeFooterLinks } from "../core/InsertRuntimeFooterLinks.js";
import { ReactUnmounter } from "../core/NavComponents.js";
import { RedirectHeader } from "../core/RedirectHeader.js";
import { TooltipActivator } from "../glossary/TooltipActivator.js";
import { SurveyPopup } from "../Survey/SurveyPopup.js";

import { app_reducer } from "./AppState.js";

import {
  ensure_linked_stylesheets_load,
  retrying_react_lazy,
} from "./common_app_component_utils.js";

import "./App.scss";

const Home = retrying_react_lazy(() => import("../home/home.js"));
const A11yHome = retrying_react_lazy(() => import("../home/a11y_home.js"));
const PartitionRoute = retrying_react_lazy(() =>
  import("../partition/partition_subapp/PartitionRoute.js")
);
const About = retrying_react_lazy(() => import("../about/about.js"));

const Contact = retrying_react_lazy(() => import("../contact/contact.js"));
const FAQ = retrying_react_lazy(() => import("../FAQ/FAQ.js"));
const MetaData = retrying_react_lazy(() => import("../metadata/metadata.js"));
const IgocExplorer = retrying_react_lazy(() =>
  import("../IgocExplorer/IgocExplorer.js")
);
const TagExplorer = retrying_react_lazy(() =>
  import("../TagExplorer/TagExplorer.js")
);
const Glossary = retrying_react_lazy(() => import("../glossary/glossary.js"));
const ReportBuilder = retrying_react_lazy(() => import("../rpb/index.js"));
const Infographic = retrying_react_lazy(() =>
  import("../infographic/Infographic.js")
);
const EstimatesComparison = retrying_react_lazy(() =>
  import("../EstimatesComparison/EstimatesComparison.js")
);
const PrivacyStatement = retrying_react_lazy(() =>
  import("../PrivacyStatement/PrivacyStatement.js")
);
const TreeMap = retrying_react_lazy(() => import("../TreeMap/TreeMap.js"));
const TextDiff = retrying_react_lazy(() => import("../TextDiff/TextDiff.js"));
const Lab = retrying_react_lazy(() => import("../InfoLab/InfoLab.js"));
const IsolatedPanel = retrying_react_lazy(() =>
  import("../panels/panel_routes/IsolatedPanel.js")
);
const PanelInventory = retrying_react_lazy(() =>
  import("../panels/panel_routes/PanelInventory.js")
);
const GraphiQL = retrying_react_lazy(() =>
  import("../graphql_utils/GraphiQL.js")
);
const FootnoteInventory = retrying_react_lazy(() =>
  import("../models/footnotes/FootnoteInventory.js")
);

const Survey = retrying_react_lazy(() =>
  import(/* webpackChunkName: "Survey" */ "../Survey/Survey.js")
);

const store = createStore(app_reducer);

export class App extends React.Component {
  constructor() {
    super();
    initialize_analytics();

    ensure_linked_stylesheets_load();
  }

  state = {
    outage_message: null,
    showSurvey: false,
  };

  toggleSurvey = (override = null) => {
    this.setState((prevState) => {
      return {
        showSurvey: !_.isNil(override) ? override : !prevState.showSurvey,
      }; //add es2020 nullish coalescing when possible
    });
  };

  componentDidMount() {
    if (!is_dev) {
      axios
        .get("https://storage.googleapis.com/ib-outage-bucket/outage_msg.json")
        .then((res) => {
          const data = res.data;
          if (data.outage) {
            this.setState({
              showNotification: true,
              outage_msg: data[lang],
            });
          }
        });
    }
  }

  render() {
    const { outage_msg, showSurvey } = this.state;
    return (
      <div
        tabIndex={-1}
        id="app-focus-root"
        className={`app-focus-root--${is_a11y_mode ? "a11y" : "standard"}`}
      >
        <Provider store={store}>
          <ErrorBoundary>
            <DevFip />
            <InsertRuntimeFooterLinks />
            <EasyAccess />
            {outage_msg && (
              <HeaderNotification
                list_of_text={[outage_msg]}
                hideNotification={() => {
                  this.setState({ outage_msg: null });
                }}
              />
            )}
            <RedirectHeader
              redirect_msg_key="redirected_msg"
              url_before_redirect_key="pre_redirected_url"
            />
            {has_local_storage && <SurveyPopup />}
            <ReactUnmounter />
            {!is_a11y_mode && <TooltipActivator />}
            <Suspense fallback={<SpinnerWrapper config_name={"route"} />}>
              <Switch>
                <Route
                  path="/error-boundary-test"
                  component={() => {
                    throw "This route throws errors!";
                  }}
                />
                <Route path="/metadata/:data_source?" component={MetaData} />
                <Route path="/igoc/:grouping?" component={IgocExplorer} />
                <Redirect
                  from="/resource-explorer/:hierarchy_scheme?/:doc?"
                  to="/tag-explorer/:hierarchy_scheme?"
                />
                <Route
                  path="/tag-explorer/:hierarchy_scheme?/:period?"
                  component={TagExplorer}
                />
                <Route
                  path="/orgs/:level/:subject_id/infograph/:active_bubble_id?/:options?/"
                  component={Infographic}
                />
                <Route path="/glossary/:active_key?" component={Glossary} />
                <Route path="/rpb/:config?" component={ReportBuilder} />
                <Route
                  path="/about"
                  render={() => <About toggleSurvey={this.toggleSurvey} />}
                />
                <Route
                  path="/contact"
                  render={() => <Contact toggleSurvey={this.toggleSurvey} />}
                />
                <Route path="/faq/:selected_qa_key?" component={FAQ} />
                <Route
                  path="/compare_estimates/:h7y_layout?"
                  component={EstimatesComparison}
                />
                <Route path="/privacy" component={PrivacyStatement} />
                <Route
                  path="/diff/:org_id?/:crso_id?/:program_id?"
                  component={TextDiff}
                />
                <Route
                  path="/lab"
                  render={() => <Lab toggleSurvey={this.toggleSurvey} />}
                />
                <Route
                  path="/panel/:level?/:subject_id?/:panel_key?"
                  component={IsolatedPanel}
                />
                <Redirect
                  from="/graph/:level?/:panel?/:id?"
                  to="/panel-inventory/:level?/:panel?/:id?"
                />
                <Route
                  path="/panel-inventory/:level?/:panel?/:id?"
                  component={PanelInventory}
                />
                <Route
                  path="/footnote-inventory"
                  component={FootnoteInventory}
                />
                <Route
                  path="/graphiql/:encoded_query?/:encoded_variables?"
                  component={GraphiQL}
                />
                {!is_a11y_mode && (
                  <Route
                    path="/partition/:perspective?/:data_type?"
                    component={PartitionRoute}
                  />
                )}
                {!is_a11y_mode && (
                  <Route
                    path="/treemap/:perspective?/:color_var?/:filter_var?/:year?/:get_changes?"
                    component={TreeMap}
                  />
                )}
                <Route path="/survey" component={Survey} />
                {is_a11y_mode && (
                  <Route
                    path="/start/:no_basic_equiv?"
                    render={() => <A11yHome />}
                  />
                )}
                <Route
                  path="/start"
                  render={() => (is_a11y_mode ? <A11yHome /> : <Home />)}
                />
                <Route
                  path="/"
                  render={() => (is_a11y_mode ? <A11yHome /> : <Home />)}
                />
              </Switch>
              <PageDetails
                showSurvey={showSurvey}
                toggleSurvey={this.toggleSurvey}
                non_survey_routes={["/lab", "/contact", "/survey"]}
              />
            </Suspense>
          </ErrorBoundary>
        </Provider>
      </div>
    );
  }
}
