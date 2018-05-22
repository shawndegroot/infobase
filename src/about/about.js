import about_text_bundle from "./about.yaml";
import './about.scss';

import { StandardRouteContainer } from '../core/NavComponents.js';

import { create_text_maker } from '../models/text';

import { TextMaker } from '../util_components.js';

const custom_tm = create_text_maker([about_text_bundle]);

export class About extends React.Component {
  render(){
    return (
      <StandardRouteContainer
        title={custom_tm("about_title")}
        breadcrumbs={[custom_tm("about_title")]}
        //description={} TODO
        route_key="_about"
      >
        <div className="medium_panel_text about-root">
          <TextMaker text_maker_func={custom_tm} el="div" text_key="about_body_text" />
        </div>
      </StandardRouteContainer>
    );
  }
};