import { TextMaker, text_maker } from './rpb_text_provider.js';
import { 
  SelectList,
  ReportDetails, 
  ReportDatasets, 
  NoDataMessage, 
} from './shared.js';
import { 
  Select, 
  Format, 
  LabeledBox,
  AlertBanner,
  SortDirections, 
} from '../components/index.js';
import { Details } from '../components/Details.js';
import { rpb_link } from './rpb_link.js';
import { Subject } from '../models/subject.js';

const { Gov, Dept } = Subject;

//note: don't use these outside the context of simple view, and always pass all props in currentProps
const granular_rpb_link_for_org = (currentProps, subject)=> rpb_link( { ...currentProps, subject, mode: 'details' } );
const granular_rpb_link_for_filter = (currentProps, filter) => rpb_link({ ...currentProps, filter, mode: 'details' } );


class SimpleView extends React.Component {

  render() {
    const {
      subject,
      table,
      dimension,
      filter,
      columns,

      flat_data,
      all_data_columns,
      deptBreakoutMode,
      dimensions, 
      filters,
      
      on_set_dimension,
      on_set_filter,
      on_toggle_col_nick,
      on_toggle_deptBreakout,
    } = this.props;
    return (
      <div> 
        <LabeledBox
          label={ <TextMaker text_key="blue_text_table_controls" /> }
          content={
            <div className="rpb-config rpb-simple row">
              <div className="col-md-6">
                <div className="rpb-config-item col-selection simple">
                  <label className="rpb-config-header" > <TextMaker text_key="select_columns" /> </label>
                  <SelectList 
                    items={_.map(all_data_columns, obj => ({id: obj.nick, display: obj.fully_qualified_name }) ) }
                    selected={ _.map(columns,'nick') }
                    is_multi_select={true}
                    onSelect={id=> on_toggle_col_nick(id) }
                  />
                </div>
              </div>
              <div className="col-md-6">
                { subject === Gov && 
                  <div className="rpb-config-item">
                    <label 
                      className="rpb-config-header" 
                    > 
                      <TextMaker text_key="show_dept_breakout" />
                      <input 
                        type="checkbox"
                        disabled={subject!==Gov}
                        checked={deptBreakoutMode}
                        onChange={on_toggle_deptBreakout}
                        style={{ marginLeft: '15px' }}
                      />
                    </label>
                  </div>
                }
                <div className="rpb-config-item">
                  <div className="row">
                    <div className="col-md-2" style={{paddingLeft: "0px"}}>
                      <label className="rpb-config-header" htmlFor="dim-select"> 
                        <span className="nowrap">
                          <TextMaker text_key="group_by" />
                        </span>
                      </label>
                    </div>
                    <div className="col-md-10">
                      <Select
                        id="dim_select"
                        className="form-control form-control-ib rpb-simple-select"
                        options={dimensions}
                        selected={dimension}
                        onSelect={id => on_set_dimension(id)}
                      />
                    </div>
                    <div className="clearfix" />
                  </div>
                </div>
                { deptBreakoutMode &&
                  <div className="rpb-config-item">
                    <div className="row">
                      <div className="col-md-2" style={{paddingLeft: "0px"}}>
                        <label className="rpb-config-header" htmlFor="filt-select"> <TextMaker text_key="filter" /> </label>
                      </div>
                      <div className="col-md-10">
                        <Select
                          id="filt_select"
                          className="form-control form-control-ib rpb-simple-select"
                          options={filters.sort().map( filter => ({ id: filter, display: filter }) )}
                          selected={filter}
                          onSelect={id => on_set_filter({
                            dimension: dimension, 
                            filter: id,
                          })}
                        />
                      </div>
                      <div className="clearfix" />
                    </div>
                  </div>
                }
              </div>
              <div className="clearfix" />
            </div>
          }
        />
        <LabeledBox
          label={ <TextMaker text_key="blue_text_report_details" args={{table_name: table.name}} /> }
          content={
            <Details
              summary_content={
                <div>
                  { table.title } : {subject.name}  
                </div>
              }
              content={
                <ReportDetails {...this.props} />
              }
            />
          }
        />
        <LabeledBox
          label={ <TextMaker text_key="blue_text_report_data_sources" args={{table_name: table.name}} /> }
          content={ <ReportDatasets {...this.props} /> }
        />
        { table.rpb_banner && <AlertBanner>{table.rpb_banner}</AlertBanner> }
        <div id="rpb-main-content" >
          { 
            _.isEmpty(flat_data) ? 
            <NoDataMessage />
            : ( 
              this.get_table_content()
            )
          }
        </div>
      </div>
    );
  } 
  get_table_content(){
    const {
      dimension,   
      columns,
      sort_col,
      descending,
      deptBreakoutMode,
      simple_table_rows: {
        rows,
        total_row,
      },
      on_header_click,
    } = this.props;


    const first_col_nick = deptBreakoutMode ? 'dept' : dimension;

    const headers = [
      { nick: deptBreakoutMode ? 'dept' : dimension, display: text_maker(deptBreakoutMode ? 'org' : dimension) },
      ...columns.map( col => ({ nick: col.nick, display: col.fully_qualified_name }) ),
    ];
    return (
      <table 
        className="medium_panel_text border infobase-table table-rpb table-rpb-simple table-condensed table-dark-blue"
      >
        <thead>
          <tr className="table-header">
            {_.map(headers, ( {nick, display} , ix) => 
              <th 
                key={nick}
                onClick={()=>{ on_header_click(nick); }}
                style={{cursor: 'pointer'}}
                scope="col"
              >
                {display}
                <SortDirections 
                  asc={!descending && sort_col === nick }
                  desc={descending && sort_col === nick }
                />
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {_.map(rows, row => 
            <tr key={row[first_col_nick]} >
              <td 
                className="key-col-cell"
                key={first_col_nick}
              > 
                { first_col_nick === "dept" ? 
              <a href={granular_rpb_link_for_org(this.props, Dept.lookup(row.dept))}>
                {Dept.lookup(row.dept).name}
              </a> :
              <a href={granular_rpb_link_for_filter(this.props, row[first_col_nick])}>
                {row[first_col_nick]}
              </a> 
                }
              </td>
              {_.map( columns, ({nick,type}) => 
                <td 
                  className="data-col-cell"
                  key={nick}
                >
                  <Format 
                    type={type} 
                    content={row[nick]} 
                  /> 
                </td>
              )}
            </tr>
          )}
          <tr key="_rpb_total">
            <td 
              className="key-col-cell"
              key={first_col_nick}
            >
              <TextMaker el="span" text_key='total' /> 
            </td>
            {_.map(columns, ({nick,type}) => 
              <td 
                className="data-col-cell"
                key={nick}
              >
                <Format 
                  type={type} 
                  content={total_row[nick]} 
                /> 
              </td>
            )}
          </tr>
        </tbody>
      </table>
    );
  }
}


export {
  SimpleView,
}; 