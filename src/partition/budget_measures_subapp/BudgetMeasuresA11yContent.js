import './BudgetMeasuresA11yContent.ib.yaml';

import { formats } from '../../core/format.js';

import { 
  text_maker,
  run_template,
} from "../../models/text";

import { TextMaker } from '../../util_components.js';

import { budget_measures_hierarchy_factory } from './budget_measures_hierarchy_factory.js';

import { make_budget_link } from './budget_utils.js';

import * as businessConstants from '../../models/businessConstants.yaml';

const { budget_chapters } = businessConstants;

const year = run_template("{{planning_year_2}}");

const name_and_value_cell_formatter = node => {
  const in_billions = node.value >= 1*Math.pow(10,9);
  const format = in_billions ? formats.compact1 : formats.compact;
  return node.data.name + " (" + format(node.value, {raw: true}) + ")";
}

export function BudgetMeasuresA11yContent(){
  const hierarchical_budget_measures_data = budget_measures_hierarchy_factory("budget-measure", []);

  const budget_measures_data_by_chapter = _.groupBy(
    hierarchical_budget_measures_data.children, 
    budget_measure_node => budget_measure_node.data.chapter_key
  );

  const ordered_col_header_text_keys = [
    "budget_measures",
    "budget_measure_descriptions",
    "budget_measure_link_header",
    "orgs_funded_by_budget_measure",
  ];

  return (
    <div style={{overflow: "auto"}}>
      {
        _.map(_.keys(budget_chapters), chapter_key => {
          const budget_measures_for_chapter = budget_measures_data_by_chapter[chapter_key];
  
          return <table 
            className="table table-striped table-bordered" 
            key={chapter_key}
          >
            <caption>
              <TextMaker 
                text_key="budget_measures_partition_a11y_chapter_table_caption" 
                args={{
                  value: _.reduce(budget_measures_for_chapter, (sum, child_node) => sum + child_node.value, 0), 
                  chapter: budget_chapters[chapter_key].text,
                  year,
                }} 
              />
            </caption>
            <thead>
              <tr>
                {_.map(ordered_col_header_text_keys, col_text_key =>
                  <th 
                    scope="col"
                    key={ col_text_key }
                  >
                    { text_maker(col_text_key) }
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {
                _.map(budget_measures_for_chapter, budget_measure => {
                  const main_row = <tr key={ "measure" + budget_measure.data.id }>
                    <th
                      scope="row"
                      rowSpan={ budget_measure.children.length }
                    >
                      { name_and_value_cell_formatter(budget_measure) }
                    </th>
                    <td
                      key={ "measure_description" + budget_measure.data.id }
                      scope="row"
                      rowSpan={ budget_measure.children.length }
                    >
                      { !_.isEmpty(budget_measure.data.description) && 
                        budget_measure.data.description 
                      }
                    </td>
                    <td
                      key={ "measure_link" + budget_measure.data.id }
                      scope="row"
                      rowSpan={ budget_measure.children.length }
                    >
                      { budget_measure.data.chapter_key !== "oth" && !_.isEmpty(budget_measure.data.ref_id) && 
                        <a
                          href = {make_budget_link(budget_measure.data.chapter_key, budget_measure.data.ref_id)}
                        >
                          { text_maker("link_to_budget_section_for") + ": " + budget_measure.data.name }
                        </a>
                      }
                      { budget_measure.data.chapter_key === "oth" || _.isEmpty(budget_measure.data.ref_id) && 
                        text_maker("not_found_in_budget_text") 
                      }
                    </td>
                    <td
                      key={ "measure" + budget_measure.data.id + "-org" + budget_measure.children[0].data.id }
                    >
                      { name_and_value_cell_formatter(budget_measure.children[0]) }
                    </td>
                  </tr>;
  
                  if ( budget_measure.children.length === 1 ){
                    return main_row;
                  } else {
                    const sub_rows = _.chain(budget_measure.children)
                      .tail()
                      .map( org => 
                        <tr key={ "measure" + budget_measure.data.id + "-org" + org.data.id }>
                          <td>
                            { name_and_value_cell_formatter(org) }
                          </td>
                        </tr>
                      )
                      .value();
  
                    return [
                      main_row,
                      ...sub_rows,
                    ];
                  }
                })
              }
            </tbody>
          </table>
        }) 
      }
    </div>
  );
}