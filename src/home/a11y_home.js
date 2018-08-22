import home_text1 from "./home.yaml";
import home_text2 from "./home-a11y.yaml";

import get_home_content from './home-data.js';

import { StandardRouteContainer } from '../core/NavComponents.js';
import { CreateTMComponent } from '../util_components.js';

const { text_maker, TM } = CreateTMComponent([home_text1, home_text2]);

export const Home = () => {

  const { featured_content_items } = get_home_content();


  return (
    <StandardRouteContainer route_key="start">
      <h1> <TM k="title" /> </h1>
      <section>
        <h2> <TM k="home_a11y_gov_infograph" /> </h2>
        <ul>
          <li> 
            <a href="#orgs/gov/gov/infograph/financial">
              <TM k="home_a11y_gov_fin" />
            </a>
          </li>
          <li> 
            <a href="#orgs/gov/gov/infograph/people">
              <TM k="home_a11y_gov_ppl" />
            </a>
          </li>
          <li> 
            <a href="#orgs/gov/gov/infograph/results">
              <TM k="home_a11y_gov_results" />
            </a>
          </li>
        </ul>
      </section>
      <section>
        <h2> <TM k="home_a11y_subject_section_title" /> </h2>
        
        <section>
          <h3>
            <a href="#igoc/">
              <TM k="igoc_home_title" />
            </a>
          </h3>
          <TM k="igoc_home_desc" />
        </section>

        <section>
          <h3>
            <a href="#budget-measures/budget-measure">
              <TM k="budget_home_title" />
            </a>
          </h3>
          <TM k="budget_home_text" />
        </section>

        <section>
          <h3>
            <a href="#resource-explorer/">
              <TM k="explorer_home_title" />
            </a>
          </h3>
          <TM k="explorer_home_text" />
        </section>

        <section>
          <h3>
            <a href="#rpb/">
              <TM k="home_build_a_report" />
            </a>
          </h3>
          <TM k="report_builder_home_desc" />
        </section>

        <section>
          <h3>
            <a href={text_maker("survey_link_href")} target="_blank">
              <TM k="survey_link_text" />
            </a>
          </h3>
          <TM k="survey_home_desc" />
        </section>

      </section>

      <ul>
        {_.map(featured_content_items, ({ text_key, href }) =>
          <li key={text_key}>
            <a href={href}>
              <TM k={text_key} />
            </a>
          </li>
        )}
      </ul>

    </StandardRouteContainer>
  )
  
}