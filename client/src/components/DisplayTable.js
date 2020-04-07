import './DisplayTable.scss';

import classNames from 'classnames';
import text from '../common_text/common_lang.yaml';
import { create_text_maker_component, Format } from './misc_util_components.js';

import { SortDirections } from './SortDirection.js';
import { DebouncedTextInput } from './DebouncedTextInput.js';

const { text_maker, TM } = create_text_maker_component(text);

export class DisplayTable extends React.Component {
  constructor(props){
    super(props);

    this.sort_click.bind(this);

    const {
      rows,
      unsorted_initial,
    } = props;

    const { sort_values } = _.first(rows);

    const sort_by = unsorted_initial ? null : _.chain(sort_values)
      .keys()
      .first()
      .value();
    
    const searches = _.chain(rows)
      .flatMap( 
        ({search_values}) => _.chain(search_values)
          .keys()
          .map( (search_key) => [search_key, ""] )
          .value()
      )
      .fromPairs()
      .value();
    

    this.state = {
      sort_by,
      descending: unsorted_initial ? null : true,
      searches,
    };
  }

  sort_click(column_key){
    this.setState({
      sort_by: column_key,
      descending: (
        this.state.sort_by === column_key ?
          !this.state.descending :
          true
      ),
    });
  }

  render(){
    const {
      name,
      column_names,
      total_row_config,
      rows,
      ordered_column_keys,
    } = this.props;
    const {
      sort_by,
      descending,
      searches,
    } = this.state;

    const clean_search_string = (search_string) => _.chain(search_string).deburr().toLower().trim().value();
    const sorted_filtered_data = _.chain(rows)
      .filter(
        ({search_values}) => _.chain(search_values)
          .map( (search_value, column_key) => (
            _.isEmpty(searches[column_key]) ||
            _.includes(
              clean_search_string(search_value),
              clean_search_string(searches[column_key])
            )
          ) )
          .every()
          .value()
      )
      .sortBy( ({sort_values}) => _.isNumber(sort_values[sort_by]) ? sort_values[sort_by] : Number.NEGATIVE_INFINITY )
      .tap( descending ? _.reverse : _.noop )
      .value();

    const all_sort_keys = _.chain(rows)
      .flatMap( row => _.keys(row.sort_values) )
      .uniq()
      .value();

    const all_search_keys = _.chain(rows)
      .flatMap( row => _.keys(row.search_values) )
      .uniq()
      .value();
    
    const total_row = _.reduce(
      sorted_filtered_data,
      (totals, row) => _.mapValues(
        totals,
        (total, col_key) => total + row.sort_values[col_key]
      ),
      _.mapValues(total_row_config, () => 0)
    );

    return (
      <div style={{overflowX: "auto", marginTop: "20px", marginBottom: "20px"}}>
        <table className={classNames("table", "display-table", !total_row_config && "no-total-row")}>
          <caption className="sr-only">
            <div>
              { 
                !_.isEmpty(name) ? 
                  name :
                  <TM k="a11y_table_title_default" />
              }
            </div>
          </caption>
          <thead>
            <tr className="table-header">
              {
                _.map(
                  column_names,
                  (name, i) => <th
                    key={i} 
                    className={"center-text"}
                  >
                    {name}
                  </th>
                )
              }
            </tr>
            <tr className="table-header">
              { rows.length > 0 &&
                _.chain(rows)
                  .first()
                  .thru(
                    ({sort_values, search_values}) => _.map(
                      ordered_column_keys,
                      (column_key) => {
                        const sortable = _.includes(all_sort_keys, column_key);
                        const searchable = _.includes(all_search_keys, column_key);

                        const current_search_input = (searchable && searches[column_key]) || null;

                        return (
                          <th 
                            key={column_key}
                            style={{textAlign: "center"}}
                          >
                            { sortable &&
                              <div onClick={ () => this.sort_click(column_key) }>
                                <SortDirections 
                                  asc={!descending && sort_by === column_key}
                                  desc={descending && sort_by === column_key}
                                />
                              </div>
                            }
                            { searchable &&
                              <DebouncedTextInput
                                inputClassName={"search input-sm"}
                                placeHolder={text_maker('filter_data')}
                                defaultValue={current_search_input}
                                updateCallback={ (search_value) => {
                                  const updated_searches = _.mapValues(
                                    searches,
                                    (value, key) => key === column_key ? 
                                      search_value :
                                      value
                                  );
      
                                  this.setState({ searches: updated_searches });
                                }}
                                debounceTime={300}
                              />
                            }
                          </th>
                        );
                      }
                    )
                  )
                  .value()
              }
            </tr>
          </thead>
          <tbody>
            {_.map(
              sorted_filtered_data, 
              ({ display_values }, i) => (
                <tr key={i}>
                  {_.map(
                    ordered_column_keys,
                    col => (
                      <td style={{fontSize: "14px"}} key={col}>
                        {display_values[col]}
                      </td>
                    )
                  )}
                </tr>
              )
            )}
            { total_row_config &&
              <tr key="total_row">
                <td>{text_maker("total")}</td>
                { _.chain(ordered_column_keys)
                  .tail()
                  .map(col => (
                    <td key={col}>
                      { total_row[col] ? 
                        <Format type={total_row_config[col]} content={total_row[col]}/> : 
                        ""
                      }
                    </td>
                  ))
                  .value()
                }
              </tr>
            }
          </tbody>
        </table>
        { sorted_filtered_data.length === 0 &&
          <TM 
            k="no_data" 
            el="div" 
            style={{width: "100%", textAlign: "center"}} 
          />
        }
      </div>
    );
  }
}