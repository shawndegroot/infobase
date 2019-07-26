import './auth_exp_prog_spending.scss';
import text from './historical_auth_exp.yaml';
import text2 from '../../common_text/common_lang.yaml';
import { Details } from '../../components/Details.js';
import MediaQuery from 'react-responsive';
import {
  run_template,
  PanelGraph,
  years,
  declarative_charts,
  StdPanel,
  Col,
  create_text_maker_component,
  NivoResponsiveLine,
  newIBCategoryColors,
  formatter,
} from "../shared";

const { 
  A11YTable,
} = declarative_charts;

const { std_years, planning_years } = years;
const { text_maker, TM } = create_text_maker_component([text, text2]);

const auth_cols = _.map(std_years, yr=>`${yr}auth`);
const exp_cols = _.map(std_years, yr=>`${yr}exp`);

const text_keys_by_level = {
  dept: "dept_auth_exp_prog_spending_body",
  gov: "gov_auth_exp_prog_spending_body",
};


const calculate = function(subject) {
  const { orgVoteStatPa, programSpending } = this.tables;

  const query_subject = subject.is("gov") ? undefined : subject;
  const qAuthExp = orgVoteStatPa.q(query_subject);
  const auth = qAuthExp.sum(auth_cols, {as_object: false});
  const exp = qAuthExp.sum(exp_cols, {as_object: false});

  const qProgSpending = programSpending.q(query_subject);
  const progSpending = subject.has_planned_spending ? qProgSpending.sum(planning_years, {as_object: false}) : null;

  return {exp, auth, progSpending};
};

const render = function({calculations, footnotes, sources}) {
  const { info, graph_args, subject } = calculations;
  const history_ticks = _.map(std_years, run_template);
  const plan_ticks = _.map(planning_years, run_template);
  const additional_info = {};
  const year1 = _.chain(history_ticks)
    .last()
    .split('-')
    .first()
    .parseInt()
    .value();
  const year2 = _.chain(plan_ticks)
    .first()
    .split('-')
    .first()
    .parseInt()
    .value();
  const gap_year = year2 - year1 === 2 && subject.has_planned_spending ? `${year1+1}-${(year1+2).toString().substring(2)}` : null;
  const marker_year = subject.has_planned_spending ? (gap_year || _.first(plan_ticks)) : null;
  const {exp, auth, progSpending} = graph_args;
  const colors = d3.scaleOrdinal().range(newIBCategoryColors);
  const raw_data = _.concat(exp, auth, progSpending);

  const series_labels = 
    [
      text_maker("expenditures"),
      text_maker("authorities"),
      subject.has_planned_spending ? text_maker("planned_spending") : null,
    ];

  if(gap_year){
    additional_info['last_history_year'] = _.last(history_ticks);
    additional_info['last_planned_year'] = _.last(plan_ticks);
    additional_info['gap_year'] = gap_year;
    additional_info['plan_change'] = info[`${subject.level}_exp_planning_year_3`] - info['dept_auth_average'];
  }

  let graph_content;
  if(window.is_a11y_mode){
    const data = _.map(exp, (exp_value,year_index) => {
      return {
        label: history_ticks[year_index],
        data: [
          formatter("compact2", exp_value, {raw: true}),
          formatter("compact2", auth[year_index], {raw: true}),
          null,
        ],
      };
    });
    _.forEach(progSpending, (progSpending_value, year_index) => {
      data.push({
        label: plan_ticks[year_index],
        data: [
          null,
          null,
          formatter("compact2", progSpending_value, {raw: true}),
        ],
      });
    });

    graph_content = (
      <A11YTable
        data_col_headers={series_labels}
        data={data}
      />
    );
  } else {
    const zip_years_and_data = (years, data) => _.map(
      years,
      (year, year_ix) => {
        if(data){
          return {
            x: year,
            y: data[year_ix],
          };
        }
      }
    );
    
    const graph_data = _.chain(series_labels)
      .zip([
        zip_years_and_data(history_ticks, exp),
        zip_years_and_data(history_ticks, auth),
        _.compact([
          gap_year && {
            x: gap_year,
            y: null,
          },
          ...zip_years_and_data(plan_ticks, progSpending),
        ]),
      ])
      .filter(row => row[0]!==null)
      .map( ([id, data]) => ({id, data}) )
      .value();

    const get_auth_exp_diff = (slice_data) => Math.abs(slice_data[0].data.y - slice_data[1].data.y);

    const nivo_default_props = {
      data: graph_data,
      raw_data: raw_data,
      colorBy: d => colors(d.id),
      magnify_glass_translateX: 80,
      tooltip: (slice, tooltip_formatter) => (
        <div style={{color: window.infobase_color_constants.textColor}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <tbody>
              { slice.data.map(
                tooltip_item => (
                  <tr key = {tooltip_item.serie.id}>
                    <td style= {{padding: '3px 5px'}}>
                      <div style={{height: '12px', width: '12px', backgroundColor: tooltip_item.serie.color}} />
                    </td>
                    <td style={{padding: '3px 5px'}}> {tooltip_item.serie.id} </td>
                    <td style={{padding: '3px 5px'}} dangerouslySetInnerHTML={{__html: tooltip_formatter(tooltip_item.data.y)}} />
                  </tr>
                )
              )}
              {slice.data.length > 1 ? 
              <tr>
                <td style= {{height: '12px', width: '12px', padding: '3px 5px'}}/>
                <td style={{padding: '3px 5px'}}> {text_maker('difference')} </td>
                <td style={{padding: '3px 5px', color: window.infobase_color_constants.highlightColor}} dangerouslySetInnerHTML={{__html: tooltip_formatter(get_auth_exp_diff(slice.data))}}/>
              </tr>
              : null
              }
            </tbody>
          </table>
        </div>
      ),
      margin: {
        top: 27,
        right: 30,
        bottom: 30,
        left: 100,
      },
      legends: [
        {
          anchor: 'top-left',
          direction: 'row',
          translateY: -27,
          itemDirection: 'left-to-right',
          itemWidth: 160,
          itemHeight: 20,
          itemsSpacing: 2,
          itemOpacity: 0.75,
          symbolSize: 12,
          effects: [
            {
              on: 'hover',
              style: {
                itemBackground: 'rgba(0, 0, 0, .03)',
                itemOpacity: 1,
              },
            },
          ],
        },
      ],
    };
    if(marker_year){
      nivo_default_props["markers"] = [
        {
          axis: 'x',
          value: marker_year,
          lineStyle: { 
            stroke: window.infobase_color_constants.tertiaryColor, 
            strokeWidth: 2,
            strokeDasharray: ("3, 3"),
          },
        },
      ];  
    }

    const nivo_mobile_props = _.cloneDeep(nivo_default_props);
    nivo_mobile_props.margin.top = 60;
    nivo_mobile_props.legends[0].translateY = -60;
    nivo_mobile_props.legends[0].direction = "column";
    nivo_mobile_props.legends[0].itemsSpacing = 1;

    graph_content = 
      <div style={{height: 400}} aria-hidden = {true}>
        {
          <MediaQuery minWidth={991}>
            <NivoResponsiveLine
              {...nivo_default_props}
            />
          </MediaQuery>
        }
        {
          <MediaQuery maxWidth={992}>
            <NivoResponsiveLine
              {...nivo_mobile_props}
            />
          </MediaQuery>
        }
      </div>;
  }

  return (
    <StdPanel
      containerAlign={subject.has_planned_spending ? "top" : "middle"}
      title={text_maker("auth_exp_prog_spending_title", {...info, ...additional_info})}
      {...{footnotes,sources}}
    >
      <Col size={4} isText>
        <TM k={text_keys_by_level[subject.level]} args={{...info, ...additional_info}} />
        { gap_year &&
          <div className="auth-gap-details">
            <Details
              summary_content={<TM k={"gap_explain_title"} args={{...info, ...additional_info}}/>}
              content={<TM k={`${subject.level}_gap_explain_body`} args={{...info, ...additional_info}}/>}
            />
          </div>
        }
      </Col>
      <Col size={8} isGraph>
        {graph_content}
      </Col>
    </StdPanel>
  );
};

new PanelGraph({
  level: "gov",
  key: "auth_exp_prog_spending",
  depends_on: ["orgVoteStatPa", "programSpending"],
  info_deps: ["orgVoteStatPa_gov_info", "programSpending_gov_info"],
  calculate,
  render,
});

new PanelGraph({
  level: "dept",
  key: "auth_exp_prog_spending",
  depends_on: ["orgVoteStatPa", "programSpending"],
  info_deps: ["orgVoteStatPa_dept_info", "programSpending_dept_info"],
  calculate,
  render,
});

