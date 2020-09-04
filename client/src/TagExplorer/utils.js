import { year_templates } from "src/models/years.js";

import { create_text_maker_component } from "src/components";

import text from "./TagExplorer.yaml";

const { text_maker, TM } = create_text_maker_component(text);

export { text_maker, TM };

const { std_years, planning_years } = year_templates;
const actual_year = _.last(std_years);
const planning_year = _.first(planning_years);

const route_arg_to_year_map = {
  actual: actual_year,
  planned: planning_year,
};
const year_to_route_arg_map = _.invert(route_arg_to_year_map);

export {
  planning_year,
  actual_year,
  route_arg_to_year_map,
  year_to_route_arg_map,
};
