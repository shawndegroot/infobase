import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React, { Fragment } from "react";

import {
  tertiaryColor,
  textColor,
  highlightColor,
} from "src/core/color_defs.js";

import { is_a11y_mode } from "src/core/injected_build_constants.js";

import FootNote from "../../../../models/footnotes/footnotes";
import {
  run_template,
  year_templates,
  actual_to_planned_gap_year,
  StandardLegend,
  InfographicPanel,
  SelectAllControl,
  create_text_maker_component,
  WrappedNivoLine,
  newIBCategoryColors,
  util_components,
  declare_panel,
  formats,
} from "../../shared.js";

import text from "./auth_exp_planned_spending.yaml";
import "./auth_exp_planned_spending.scss";

const {
  Details,
  HeightClipper,
  TabbedContent,
  SmartDisplayTable,
  GraphOverlay,
} = util_components;

const { std_years, planning_years, estimates_years } = year_templates;
const { text_maker, TM } = create_text_maker_component(text);
const colors = scaleOrdinal().range(newIBCategoryColors);

const auth_cols = _.map(std_years, (yr) => `${yr}auth`);
const exp_cols = _.map(std_years, (yr) => `${yr}exp`);

const include_verbose_gap_year_explanation = false;

const get_auth_exp_diff = ([larger_data_point, smaller_data_point]) =>
  Math.abs(larger_data_point.data.y - smaller_data_point.data.y);
const auth_exp_planned_spending_tooltip = (graph_slice, tooltip_formatter) => {
  const null_filtered_slice_data = _.filter(
    graph_slice.data,
    ({ data }) => !_.isNull(data.y)
  );

  return (
    <div style={{ color: textColor }}>
      <table className="auth-exp-planned-spend-tooltip">
        <tbody>
          {null_filtered_slice_data.map((tooltip_item) => (
            <tr key={tooltip_item.serie.id}>
              <td>
                <div
                  style={{
                    backgroundColor: tooltip_item.serie.color,
                    height: "12px",
                    width: "12px",
                  }}
                />
              </td>
              <td>{tooltip_item.serie.id}</td>
              <td
                dangerouslySetInnerHTML={{
                  __html: tooltip_formatter(tooltip_item.data.y),
                }}
              />
            </tr>
          ))}
          {null_filtered_slice_data.length > 1 ? (
            <tr>
              <td />
              <td>{text_maker("difference")}</td>
              <td
                style={{
                  color: highlightColor,
                }}
                dangerouslySetInnerHTML={{
                  __html: tooltip_formatter(
                    get_auth_exp_diff(null_filtered_slice_data)
                  ),
                }}
              />
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
};
class AuthExpPlannedSpendingGraph extends React.Component {
  constructor(props) {
    super(props);

    const active_series = _.chain(props.data_series)
      .map(({ key, values }) => [key, _.some(values)])
      .fromPairs()
      .value();

    this.state = { active_series };
  }
  render() {
    const { data_series, gap_year } = this.props;
    const { active_series } = this.state;

    const has_multiple_active_series =
      _.chain(active_series).values().compact().value().length > 1;

    const legend_items = _.map(data_series, ({ key, label }) => ({
      id: label,
      label: label,
      active: active_series[key],
      color: colors(label),
    }));

    const graph_data = _.chain(data_series)
      .filter(({ key }) => active_series[key])
      .flatMap(({ key, label, years, values }) => [
        gap_year &&
          key === "planned_spending" &&
          has_multiple_active_series && {
            id: "gap-year",
            data: [
              {
                x: gap_year,
                y: null,
              },
            ],
          },
        {
          id: label,
          data: _.chain(years)
            .zip(values)
            .map(([year, value]) => ({
              x: year,
              y: value,
            }))
            .value(),
        },
      ])
      .compact()
      .value();

    // TODO: is it worth hoisting this pattern in to WrappedNivoLine? Doesn't account for more than two lines overlapping but that would be easy enough to add
    const line_segments = _.chain(graph_data)
      .flatMap(({ id, data }, z_index) =>
        _.chain(data)
          .dropRight()
          .map((point, index) => ({
            id,
            z_index,
            range: `${point.x}/${data[index + 1].x}`,
            data: [point, data[index + 1]],
          }))
          .value()
      )
      .thru((line_segments) =>
        _.map(line_segments, (line_segment) => ({
          ...line_segment,
          overlaps: !_.chain(line_segments)
            .filter(
              ({ z_index, range, data }) =>
                z_index < line_segment.z_index &&
                range === line_segment.range &&
                _.isEqual(data, line_segment.data)
            )
            .isEmpty()
            .value(),
        }))
      )
      .value();
    const lines_with_dashed_overlaps = ({ lineGenerator, xScale, yScale }) =>
      _.map(line_segments, ({ id, data, overlaps }, index) => (
        <path
          key={index}
          d={lineGenerator(
            _.map(data, ({ x, y }) => ({
              x: xScale(x),
              y: !_.isNull(y) ? yScale(y) : null,
            }))
          )}
          fill="none"
          style={{
            stroke: colors(id),
            strokeWidth: 2.5,
            strokeDasharray: overlaps ? 25 : null,
          }}
        />
      ));

    const should_mark_gap_year =
      gap_year &&
      active_series.budgetary_expenditures &&
      !active_series.authorities && // authorities always span the gap year, so don't mark it when displaying them
      active_series.planned_spending;

    const nivo_props = {
      data: graph_data,
      raw_data: _.flatMap(data_series, "values"),
      colorBy: (d) => colors(d.id),
      magnify_glass_translateX: 80,
      magnify_glass_translateY: 70,
      tooltip: auth_exp_planned_spending_tooltip,
      margin: {
        top: 10,
        right: 30,
        bottom: 40,
        left: 100,
      },
      table_ordered_column_keys: _.map(
        ["authorities", "budgetary_expenditures", "planned_spending"],
        (key) => text_maker(key)
      ),
      layers: [
        "grid",
        "markers",
        "areas",
        lines_with_dashed_overlaps,
        "slices",
        "dots",
        "axes",
        "legends",
      ],
      ...(should_mark_gap_year && {
        markers: [
          {
            axis: "x",
            value: gap_year,
            lineStyle: {
              stroke: tertiaryColor,
              strokeWidth: 2,
              strokeDasharray: "3, 3",
            },
          },
        ],
      }),
    };

    return (
      <Fragment>
        <div style={{ padding: "10px 25px 0px 97px" }}>
          {!is_a11y_mode && (
            <StandardLegend
              isHorizontal={true}
              items={legend_items}
              onClick={(label) => {
                const key_corresponding_to_label = _.find(data_series, {
                  label,
                }).key;

                this.setState({
                  active_series: {
                    ...active_series,
                    [key_corresponding_to_label]:
                      !active_series[key_corresponding_to_label] ||
                      !has_multiple_active_series,
                  },
                });
              }}
            />
          )}
        </div>

        <GraphOverlay>
          <WrappedNivoLine {...nivo_props} />
        </GraphOverlay>
      </Fragment>
    );
  }
}
class LapseByVotesGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      active_votes: this.get_active_votes(() => true),
    };
  }
  get_active_votes = (func) =>
    _.chain(this.props.queried_votes)
      .map((vote_row) => [vote_row.desc, func(vote_row)])
      .fromPairs()
      .value();

  render() {
    const { subject, queried_votes } = this.props;
    const { active_votes } = this.state;
    const filtered_votes = _.reject(
      queried_votes,
      ({ desc }) => !active_votes[desc]
    );
    const caculate_lapse = (auth, exp, is_pct) => {
      const lapse = auth - exp;
      return is_pct ? lapse / auth || 0 : lapse;
    };

    const get_lapse_data = (is_pct) =>
      _.map(filtered_votes, (vote_row) => ({
        id: vote_row.desc,
        data: _.map(std_years, (yr) => ({
          x: run_template(yr),
          y: caculate_lapse(
            vote_row[`${yr}auth`],
            vote_row[`${yr}exp`],
            is_pct
          ),
        })),
      }));
    const get_lapse_raw_data = (is_pct) =>
      _.flatMap(filtered_votes, (vote_row) =>
        _.map(std_years, (yr) =>
          caculate_lapse(vote_row[`${yr}auth`], vote_row[`${yr}exp`], is_pct)
        )
      );

    const get_table_data = (is_pct) =>
      _.map(filtered_votes, (vote_row) => ({
        id: vote_row.desc,
        ..._.chain(std_years)
          .map((yr) => [
            run_template(yr),
            caculate_lapse(vote_row[`${yr}auth`], vote_row[`${yr}exp`], is_pct),
          ])
          .fromPairs()
          .value(),
      }));
    const get_column_configs = (is_pct) => ({
      id: {
        index: 0,
        header: text_maker("vote"),
      },
      ..._.chain(std_years)
        .map((yr, i) => [
          run_template(yr),
          {
            index: i + 1,
            header: run_template(yr),
            is_summable: !is_pct,
            formatter: is_pct ? "smart_percentage2" : "compact2_written",
          },
        ])
        .fromPairs()
        .value(),
    });

    const get_lapse_infograph = (is_pct) => {
      const nivo_pct_props = is_pct && {
        is_money: false,
        left_axis: { format: formats.smart_percentage2_raw },
        text_formatter: formats.smart_percentage2,
      };

      return (
        <div className="frow">
          {!subject.is("gov") && (
            <div className="fcol-md-4">
              <StandardLegend
                items={_.map(queried_votes, ({ desc }) => ({
                  id: desc,
                  label: desc,
                  active: active_votes[desc],
                  color: colors(desc),
                }))}
                onClick={(vote_desc) =>
                  this.setState({
                    active_votes: {
                      ...active_votes,
                      [vote_desc]: !active_votes[vote_desc],
                    },
                  })
                }
                Controls={
                  <SelectAllControl
                    SelectAllOnClick={() =>
                      this.setState({
                        active_votes: this.get_active_votes(() => true),
                      })
                    }
                    SelectNoneOnClick={() =>
                      this.setState({
                        active_votes: this.get_active_votes(() => false),
                      })
                    }
                  />
                }
              />
            </div>
          )}
          <div className={`fcol-md-${subject.is("gov") ? 12 : 8}`}>
            <WrappedNivoLine
              data={get_lapse_data(is_pct)}
              raw_data={get_lapse_raw_data(is_pct)}
              colorBy={(d) => colors(d.id)}
              custom_table={
                <SmartDisplayTable
                  column_configs={get_column_configs(is_pct)}
                  data={get_table_data(is_pct)}
                />
              }
              {...nivo_pct_props}
            />
          </div>
        </div>
      );
    };

    return (
      <div>
        <TM
          el="h4"
          k={subject.is("gov") ? "aggregated_lapse_by_votes" : "lapse_by_votes"}
          style={{ textAlign: "center" }}
        />
        <HeightClipper allowReclip={true} clipHeight={200}>
          <TabbedContent
            tab_keys={["lapse_dollar", "lapse_pct"]}
            tab_labels={{
              lapse_dollar: `${text_maker("lapse_by_votes")} ($)`,
              lapse_pct: `${text_maker("lapse_by_votes")} (%)`,
            }}
            tab_pane_contents={{
              lapse_dollar: get_lapse_infograph(false),
              lapse_pct: get_lapse_infograph(true),
            }}
          />
        </HeightClipper>
      </div>
    );
  }
}
const render = function ({ calculations, footnotes, sources, glossary_keys }) {
  const { panel_args, subject } = calculations;
  const { data_series, additional_info, queried_votes } = panel_args;

  const final_info = {
    ...additional_info,
    dept: subject,
  };
  footnotes = _.concat(
    new FootNote({
      subject,
      text: text_maker("actual_spending_footnote"),
      topic_keys: ["EXP"],
    }),
    footnotes
  );

  return (
    <InfographicPanel
      containerAlign={subject.has_planned_spending ? "top" : "middle"}
      title={text_maker("auth_exp_planned_spending_title", final_info)}
      {...{ footnotes, sources, glossary_keys }}
    >
      <div className="frow">
        <div className="fcol-md-4">
          <TM
            className="medium_panel_text"
            k={`${subject.level}_auth_exp_planned_spending_body`}
            args={final_info}
          />
          {include_verbose_gap_year_explanation && additional_info.gap_year && (
            <div className="auth-gap-details">
              <Details
                summary_content={
                  <TM k={"gap_explain_title"} args={final_info} />
                }
                content={
                  <TM
                    k={`${subject.level}_gap_explain_body`}
                    args={final_info}
                  />
                }
              />
            </div>
          )}
        </div>
        <div className="fcol-md-8">
          <AuthExpPlannedSpendingGraph
            data_series={data_series}
            gap_year={additional_info.gap_year}
          />
        </div>
      </div>
      <div className="panel-separator" />
      <LapseByVotesGraph subject={subject} queried_votes={queried_votes} />
    </InfographicPanel>
  );
};

const calculate = function (subject, options) {
  const { orgVoteStatPa, programSpending, orgVoteStatEstimates } = this.tables;

  const query_subject = subject.is("gov") ? undefined : subject;
  const queried_subject = orgVoteStatPa.q(query_subject);

  const exp_values = queried_subject.sum(exp_cols, { as_object: false });

  const history_years_written = _.map(std_years, run_template);
  const future_auth_year_templates = _.takeRightWhile(
    estimates_years,
    (est_year) => !_.includes(history_years_written, run_template(est_year))
  );

  const historical_auth_values = queried_subject.sum(auth_cols, {
    as_object: false,
  });
  const future_auth_values = _.map(
    future_auth_year_templates,
    (future_auth_year_template) =>
      orgVoteStatEstimates
        .q(query_subject)
        .sum(`${future_auth_year_template}_estimates`, { as_object: false })
  );

  const auth_values = _.concat(historical_auth_values, future_auth_values);

  const planned_spending_values = programSpending
    .q(query_subject)
    .sum(planning_years, { as_object: false });

  const data_series = _.chain([
    {
      key: "budgetary_expenditures",
      untrimmed_year_templates: std_years,
      untrimmed_values: exp_values,
    },
    {
      key: "authorities",
      untrimmed_year_templates: _.concat(std_years, future_auth_year_templates),
      untrimmed_values: auth_values,
    },
    subject.has_planned_spending && {
      key: "planned_spending",
      untrimmed_year_templates: planning_years,
      untrimmed_values: planned_spending_values,
      year_templates: planning_years,
      values: planned_spending_values,
    },
  ])
    .compact()
    .map((series) => {
      const { year_templates, values } = (() => {
        if (series.year_templates && series.values) {
          return series;
        } else {
          const [trimmed_year_templates, trimmed_values] = _.chain(
            series.untrimmed_year_templates
          )
            .zip(series.untrimmed_values)
            .dropWhile(([year_template, value]) => !value)
            .unzip()
            .value();

          return {
            year_templates: trimmed_year_templates,
            values: trimmed_values,
          };
        }
      })();

      return {
        ...series,

        year_templates,
        values,

        years: _.map(year_templates, run_template),
        label: text_maker(series.key),
      };
    })
    .value();

  const last_shared_index = _.min([exp_values.length, auth_values.length]) - 1;

  const hist_unspent_avg_pct =
    _.reduce(
      exp_values,
      (result, value, i) => result + auth_values[i] - value,
      0
    ) /
    _.reduce(
      auth_values,
      (result, value, index) =>
        index <= last_shared_index ? result + value : result,
      0
    );

  const unspent_last_year =
    auth_values[last_shared_index] - exp_values[last_shared_index];

  const get_five_year_auth_average = (auth_or_exp) =>
    _.chain(std_years)
      .map((year) => orgVoteStatPa.q(query_subject).sum([year + auth_or_exp]))
      .sum()
      .divide(std_years.length)
      .value();

  const additional_info = {
    five_year_auth_average: get_five_year_auth_average("auth"),
    five_year_exp_average: get_five_year_auth_average("exp"),
    has_planned_spending: subject.has_planned_spending,
    last_planned_spending: _.last(planned_spending_values),
    last_planned_year: run_template(_.last(planning_years)),
    plan_change: _.last(planned_spending_values) - _.last(auth_values),
    last_history_year: run_template(_.last(std_years)),
    gap_year:
      (subject.has_planned_spending && actual_to_planned_gap_year) || null,
    hist_avg_tot_pct: hist_unspent_avg_pct,
    last_year_lapse_amt: unspent_last_year || 0,
    last_year_lapse_pct:
      (unspent_last_year || 0) / auth_values[last_shared_index],
  };

  const flat_auth_exp_years = _.flatMap(["exp", "auth"], (type) =>
    _.map(std_years, (yr) => `${yr}${type}`)
  );
  const queried_votes = subject.is("gov")
    ? [
        {
          desc: text_maker("aggregated_lapse_by_votes"),
          ..._.chain(queried_subject.data)
            .reject(({ votenum }) => votenum === "S")
            .reduce(
              (result, vote_row) => ({
                ..._.chain(flat_auth_exp_years)
                  .map((yr) => [yr, result[yr] + vote_row[yr]])
                  .fromPairs()
                  .value(),
              }),
              _.chain(flat_auth_exp_years)
                .map((yr) => [yr, 0])
                .fromPairs()
                .value()
            )
            .value(),
        },
      ]
    : _.reject(queried_subject.data, ({ votenum }) => votenum === "S");

  return {
    data_series,
    additional_info,
    queried_votes,
  };
};

export const declare_auth_exp_planned_spending_panel = () =>
  declare_panel({
    panel_key: "auth_exp_planned_spending",
    levels: ["gov", "dept"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["orgVoteStatPa", "programSpending", "orgVoteStatEstimates"],
      glossary_keys: ["BUD_EXP", "NB_EXP"],
      calculate,
      render,
    }),
  });
