import './App.scss';

import { Suspense } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { initialize_analytics } from '../core/analytics.js';

import { ensure_linked_stylesheets_load, retrying_react_lazy } from './common_app_component_utils.js';

export const app_reducer = (state={ lang: window.lang }, { type, payload }) => {
  //doesn't do anything yet...
  return state;
};

import { ErrorBoundary } from '../core/ErrorBoundary.js';
import { DevFip } from '../core/DevFip.js';
import { TooltipActivator } from '../glossary/TooltipActivator';
import { InsertRuntimeFooterLinks } from '../core/InsertRuntimeFooterLinks.js';
import { ReactUnmounter } from '../core/NavComponents';
import { EasyAccess } from '../core/EasyAccess';
import { SpinnerWrapper } from '../components/SpinnerWrapper.js';
import { PageDetails } from '../components/PageDetails.js';

const Home = retrying_react_lazy( () => import(/* webpackChunkName: "Home" */ '../home/home.js') );
const A11yHome = retrying_react_lazy( () => import(/* webpackChunkName: "A11yHome" */ '../home/a11y_home.js') );
const GraphInventory = retrying_react_lazy( () => import(/* webpackChunkName: "GraphInventory" */ '../graph_route/GraphInventory.js') );
const PartitionRoute = retrying_react_lazy( () => import(/* webpackChunkName: "PartitionRoute" */ '../partition/partition_subapp/PartitionRoute.js') );
const BudgetMeasuresRoute = retrying_react_lazy( () => import(/* webpackChunkName: "BudgetMeasuresRoute" */ '../partition/budget_measures_subapp/BudgetMeasuresRoute.js') );
const About = retrying_react_lazy( () => import(/* webpackChunkName: "About" */ '../about/about.js') );
const MetaData = retrying_react_lazy( () => import(/* webpackChunkName: "Metadata" */ '../metadata/metadata.js') );
const IgocExplorer = retrying_react_lazy( () => import(/* webpackChunkName: "igoc_explorer" */ '../igoc_explorer/igoc_explorer.js') );
const ResourceExplorer = retrying_react_lazy( () => import(/* webpackChunkName: "ResourceExplorer" */ '../resource_explorer/resource-explorer.js') );
const Glossary = retrying_react_lazy( () => import(/* webpackChunkName: "Glossary" */ '../glossary/glossary.js') );
const ReportBuilder = retrying_react_lazy( () => import(/* webpackChunkName: "ReportBuilder" */ '../rpb/index.js') );
const InfoGraph = retrying_react_lazy( () => import(/* webpackChunkName: "Infographic" */ '../infographic/infographic.js') );
const EstimatesComparison = retrying_react_lazy( () => import(/* webpackChunkName: "EstimatesComparison" */ '../EstimatesComparison/EstimatesComparison.js') );
const PrivacyStatement = retrying_react_lazy( () => import(/* webpackChunkName: "PrivacyStatement" */ '../PrivacyStatement/PrivacyStatement.js') );
const TreeMap = retrying_react_lazy( () => import(/* webpackChunkName: "TreeMap" */ '../TreeMap/TreeMap.js') ); 
const TextDiff = retrying_react_lazy( () => import(/* webpackChunkName: "TextDiff" */ '../diff/TextDiff.js') ); 
const Lab = retrying_react_lazy( () => import(/* webpackChunkName: "InfoLab" */ '../lab/InfoLab.js') ); 
const IsolatedPanel = retrying_react_lazy( () => import(/* webpackChunkName: "IsolatedPanel" */ '../panels/IndividualPanelRoute.js') ); 

export class App extends React.Component {
  constructor(){
    super();
    initialize_analytics();

    ensure_linked_stylesheets_load();
  }
  render(){
    return (
      <div tabIndex={-1} id="app-focus-root" className={`app-focus-root--${ window.is_a11y_mode ? "a11y" : "standard" }`}>
        <ErrorBoundary>
          <DevFip />
          <InsertRuntimeFooterLinks />
          <EasyAccess />
          <ReactUnmounter />
          { !window.is_a11y_mode && <TooltipActivator /> }
          <Suspense fallback={<SpinnerWrapper config_name={"route"} />}>
            <Switch>
              <Route path="/error-boundary-test" component={ () => {throw "This route throws errors!";} }/>
              <Route path="/metadata/:data_source?" component={MetaData}/>
              <Route path="/igoc/:grouping?" component={IgocExplorer} />
              <Route path="/resource-explorer/:hierarchy_scheme?/:doc?" component={ResourceExplorer} />
              <Route path="/orgs/:level/:subject_id/infograph/:active_bubble_id?/:options?/" component={InfoGraph} />
              <Route path="/glossary/:active_key?" component={Glossary} />
              <Redirect 
                from="/budget-measures/:first_column?/:selected_value?/:budget_year?" 
                to="/budget-tracker/:first_column?/:selected_value?/:budget_year?"
              />
              <Route path="/budget-tracker/:first_column?/:selected_value?/:budget_year?" component={BudgetMeasuresRoute} />
              <Route path="/rpb/:config?" component={ReportBuilder} />
              <Route path="/about" component={About} />
              <Route path="/graph/:level?/:graph?/:id?" component={GraphInventory} />
              <Route path="/compare_estimates/:h7y_layout?" component={EstimatesComparison} />
              <Route path="/privacy" component={PrivacyStatement} />
              <Route path="/diff/:org_id?/:crso_id?/:program_id?" component={TextDiff} />
              <Route path="/lab" component={Lab} />
              <Route path="/panel/:level?/:subject_id?/:panel_key?" component={IsolatedPanel} />
              { !window.is_a11y_mode && <Route path="/partition/:perspective?/:data_type?" component={PartitionRoute} /> }
              { !window.is_a11y_mode && <Route path="/treemap/:perspective?/:color_var?/:filter_var?/:year?/:get_changes?" component={TreeMap} /> }
              { window.is_a11y_mode && <Route path="/start/:no_basic_equiv?" component={A11yHome} /> }
              <Route path="/start" component={window.is_a11y_mode ? A11yHome : Home} />
              <Route path="/" component={window.is_a11y_mode ? A11yHome : Home} />
            </Switch>
            <PageDetails />
          </Suspense>
        </ErrorBoundary>
      </div>
    );
  }
}

