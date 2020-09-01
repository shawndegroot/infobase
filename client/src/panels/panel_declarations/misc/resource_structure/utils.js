import { create_text_maker_component } from "components";

import { year_templates } from "models/years";

import text from "./resource_structure.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const { std_years, planning_years } = year_templates;

const actual_year = _.last(std_years);
const planning_year = _.first(planning_years);

export { text_maker, TM, actual_year, planning_year };
