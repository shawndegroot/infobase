import classNames from "classnames";
import { scaleOrdinal } from "d3-scale";
import * as Diff from "diff";
import _ from "lodash";
import React, { Fragment } from "react";
import MediaQuery from "react-responsive";

import {
  primaryColor,
  warnDarkColor,
  successDarkColor,
  failDarkColor,
  infoDarkColor,
} from "src/core/color_defs.js";

import { is_a11y_mode } from "src/core/injected_build_constants.js";

import { LegendList } from "../charts/legends";
import {
  Select,
  Panel,
  create_text_maker_component,
  SpinnerWrapper,
} from "../components";
import { ensure_loaded } from "../core/lazy_loader.js";
import { StandardRouteContainer } from "../core/NavComponents.js";

import { result_docs } from "../models/results.js";
import { Subject } from "../models/subject";
import result_text from "../panels/panel_declarations/results/result_components.yaml";
import {
  Result,
  indicator_text_functions,
} from "../panels/panel_declarations/results/results_common.js";

import diff_text from "./TextDiff.yaml";
import "./TextDiff.scss";

const { indicator_target_text } = indicator_text_functions;
const { Dept, CRSO, Program } = Subject;

const { TM, text_maker } = create_text_maker_component([
  diff_text,
  result_text,
]);

const doc_keys_to_compare = _.chain(result_docs)
  .sortBy("year")
  .takeRight(2)
  .map("doc_key")
  .value();
const [previous_doc_key, current_doc_key] = doc_keys_to_compare;
const [previous_year, current_year] = _.map(
  doc_keys_to_compare,
  (key) => result_docs[key].year
);
const [previous_doc_name, current_doc_name] = _.map(
  doc_keys_to_compare,
  (key) => result_docs[key].name
);

const get_subject_from_props = (props) => {
  const {
    match: {
      params: { org_id, crso_id, program_id },
    },
  } = props;
  if (program_id && Program.lookup(program_id)) {
    return Program.lookup(program_id);
  }
  if (crso_id && CRSO.lookup(crso_id)) {
    return CRSO.lookup(crso_id);
  }
  if (org_id && Dept.lookup(org_id)) {
    return Dept.lookup(org_id);
  }
  return props.subject; // default
};

const subject_intro = (subject, num_indicators) => (
  <div className="medium-panel-text">
    <TM k={"indicator_counts_text"} args={{ num_indicators: num_indicators }} />
  </div>
);

const get_indicators = (subject) => {
  return _.chain(Result.get_all())
    .filter((res) => {
      const res_subject =
        Program.lookup(res.subject_id) || CRSO.lookup(res.subject_id);
      return subject.level === "dept"
        ? res_subject.dept === subject
        : res_subject === subject || res_subject.crso === subject;
    })
    .map((res) => res.indicators)
    .flatten()
    .groupBy("stable_id")
    .map((pair) => _.sortBy(pair, "doc"))
    .value();
};
const process_indicators = (matched_indicators, indicator_status) => {
  const processed_indicators = _.chain(matched_indicators)
    .map((indicator_pair) => {
      if (indicator_pair.length === 2) {
        const name_diff = Diff.diffWords(
          indicator_pair[0].name,
          indicator_pair[1].name
        );
        const methodology_diff = is_a11y_mode
          ? Diff.diffSentences(
              indicator_pair[0].methodology,
              indicator_pair[1].methodology
            )
          : Diff.diffWords(
              indicator_pair[0].methodology,
              indicator_pair[1].methodology
            );
        const target_diff = Diff.diffWords(
          indicator_target_text(indicator_pair[0], false),
          indicator_target_text(indicator_pair[1], false)
        );
        const target_explanation_diff = Diff.diffWords(
          indicator_pair[0].target_explanation || "",
          indicator_pair[1].target_explanation || ""
        );

        const status = _.compact([
          _.max([target_diff.length, target_explanation_diff.length]) > 1 &&
            "target_changed",
          _.max([name_diff.length, methodology_diff.length]) > 1 &&
            "indicator_desc_changed",
          !(
            _.max([
              name_diff.length,
              methodology_diff.length,
              target_diff.length,
              target_explanation_diff.length,
            ]) > 1
          ) && "indicator_no_diff",
        ]);
        return {
          status,
          indicator1: indicator_pair[0],
          indicator2: indicator_pair[1],
          name_diff,
          methodology_diff,
          target_diff,
          target_explanation_diff,
        };
      }
      const indicator = indicator_pair[0];
      const status = _.compact([
        indicator.doc === previous_doc_key && "indicator_removed",
        indicator.doc === current_doc_key && "indicator_added",
      ]);
      return {
        status: status,
        indicator1: indicator,
        indicator2: indicator,
        name_diff: [indicator.name],
        methodology_diff: [indicator.methodology],
        target_diff: [indicator_target_text(indicator, false)],
        target_explanation_diff: [indicator.target_explanation],
      };
    })
    .filter(
      (row) =>
        !_.chain(indicator_status)
          .map((status_row) => status_row.active && status_row.id)
          .intersection(row.status)
          .isEmpty()
          .value()
    )
    .value();
  return processed_indicators;
};

const no_difference = (text, key) => (
  <Fragment>
    <div className="text-diff__indicator-report__subheader">
      <h4>{`${text_maker(key)} (${text_maker("indicator_no_diff")})`}</h4>
    </div>
    <div className="text-diff__indicator-report__row">
      <div>{text}</div>
    </div>
  </Fragment>
);

const difference_report = (diff, key) => {
  const year1 = (
    <div className="col-md-6">
      <h5>{previous_year}</h5>
    </div>
  );
  const year2 = (
    <div className="col-md-6">
      <h5>{current_year}</h5>
    </div>
  );

  const removed_part = (
    <div className="col-md-6">
      {_.map(diff, (part, iix) => (
        <Fragment key={iix}>
          {is_a11y_mode && part.removed && (
            <span className="text-diff__text-part--removed">
              {" "}
              [{text_maker("a11y_begin_removed")}]
            </span>
          )}
          <span
            className={part.removed ? "text-diff__text-part--removed" : ""}
            style={{ display: part.added ? "none" : "inline" }}
          >
            {part.value}
          </span>
          {is_a11y_mode && part.removed && (
            <span className="text-diff__text-part--removed">
              {" "}
              [{text_maker("a11y_end_removed")}]
            </span>
          )}
        </Fragment>
      ))}
    </div>
  );
  const added_part = (
    <div className="col-md-6">
      {_.map(diff, (part, iix) => (
        <Fragment key={iix}>
          {is_a11y_mode && part.added && (
            <span className="text-diff__text-part--added">
              {" "}
              [{text_maker("a11y_begin_added")}]
            </span>
          )}
          <span
            className={part.added ? "text-diff__text-part--added" : ""}
            style={{ display: part.removed ? "none" : "inline" }}
          >
            {part.value}
          </span>
          {is_a11y_mode && part.added && (
            <span className="text-diff__text-part--added">
              [{text_maker("a11y_end_added")}]
            </span>
          )}
        </Fragment>
      ))}
    </div>
  );

  return (
    <Fragment>
      <div className="text-diff__indicator-report__subheader">
        <h4>{text_maker(key)}</h4>
      </div>
      <MediaQuery minWidth={992}>
        <div className={classNames("row", "text-diff__indicator-report__row")}>
          {year1}
          {year2}
        </div>
        <div className={classNames("row", "text-diff__indicator-report__row")}>
          {removed_part}
          {added_part}
        </div>
      </MediaQuery>
      <MediaQuery maxWidth={991}>
        <div className={classNames("row", "text-diff__indicator-report__row")}>
          {year1}
        </div>
        <div className={classNames("row", "text-diff__indicator-report__row")}>
          {removed_part}
        </div>
        <div className={classNames("row", "text-diff__indicator-report__row")}>
          {year2}
        </div>
        <div className={classNames("row", "text-diff__indicator-report__row")}>
          {added_part}
        </div>
      </MediaQuery>
    </Fragment>
  );
};

const get_status_flag = (indicator_status) =>
  _.map(indicator_status, (status_key) => (
    <div
      key={status_key}
      className={`text-diff__${
        status_key === "target_changed" ? "indicator_desc_changed" : status_key
      }`}
    >
      {text_maker(status_key)}
    </div>
  ));

const indicator_report = (processed_indicator) => (
  <div
    className="text-diff__indicator-report"
    key={processed_indicator.indicator1.stable_id}
  >
    <Panel title={processed_indicator.indicator2.name}>
      <Fragment>
        {get_status_flag(processed_indicator.status)}
        {processed_indicator.name_diff.length > 1
          ? difference_report(processed_indicator.name_diff, "indicator_name")
          : no_difference(
              processed_indicator.indicator1.name,
              "indicator_name"
            )}
        {processed_indicator.methodology_diff.length > 1
          ? difference_report(
              processed_indicator.methodology_diff,
              "indicator_methodology"
            )
          : no_difference(
              processed_indicator.indicator1.methodology,
              "indicator_methodology"
            )}
        {processed_indicator.target_diff.length > 1
          ? difference_report(
              processed_indicator.target_diff,
              "indicator_target"
            )
          : no_difference(
              indicator_target_text(processed_indicator.indicator1, false),
              "indicator_target"
            )}
        {processed_indicator.target_explanation_diff.length > 1
          ? difference_report(
              processed_indicator.target_explanation_diff,
              "indicator_target_explanation"
            )
          : no_difference(
              processed_indicator.indicator1.target_explanation,
              "indicator_target_explanation"
            )}
        <div className="text-diff__id-tag">{`ID: ${processed_indicator.indicator1.stable_id}`}</div>
      </Fragment>
    </Panel>
  </div>
);

export default class TextDiffApp extends React.Component {
  constructor(props) {
    super(props);
    const colors = scaleOrdinal().range([
      primaryColor,
      warnDarkColor,
      successDarkColor,
      failDarkColor,
      infoDarkColor,
    ]);

    this.state = {
      first_load: true,
      loading: true,
      subject: get_subject_from_props(props),
      indicator_status_changed: false,
      indicator_status: _.map(
        [
          {
            label: text_maker("indicator_desc_changed"),
            id: "indicator_desc_changed",
          },
          { label: text_maker("target_changed"), id: "target_changed" },
          { label: text_maker("indicator_added"), id: "indicator_added" },
          { label: text_maker("indicator_removed"), id: "indicator_removed" },
          { label: text_maker("indicator_no_diff"), id: "indicator_no_diff" },
        ],
        (status) => ({
          active: true,
          label: status.label,
          id: status.id,
          color: colors(status.id),
        })
      ),
    };
  }

  get_new_url(context) {
    if (context.level === "dept") {
      return `/diff/${context.id}`;
    } else if (context.level === "crso") {
      return `/diff/${context.dept.id}/${context.id}`;
    } else if (context === "all") {
      const { subject } = this.state;
      return `/diff/${subject.level === "dept" ? subject.id : subject.dept.id}`;
    } else {
      return `/diff/${context.dept.id}/${context.crso.id}/${context.id}`;
    }
  }

  componentDidMount() {
    const { subject, indicator_status } = this.state;
    ensure_loaded({
      subject,
      results: true,
      result_docs: doc_keys_to_compare,
    }).then(() => {
      const matched_indicators = get_indicators(subject);
      const processed_indicators = process_indicators(
        matched_indicators,
        indicator_status
      );
      this.setState({
        first_load: false,
        subject: subject,
        loading: false,
        matched_indicators: matched_indicators,
        processed_indicators: processed_indicators,
      });
    });
  }

  static getDerivedStateFromProps(props, state) {
    const { first_load, subject, indicator_status_changed } = state;
    const should_load =
      first_load ||
      get_subject_from_props(props) !== subject ||
      indicator_status_changed;
    const new_subject = should_load ? get_subject_from_props(props) : subject;
    return {
      loading: should_load,
      subject: new_subject,
      indicator_status_changed: false,
    };
  }

  componentDidUpdate() {
    const { loading, subject, indicator_status } = this.state;

    if (loading) {
      ensure_loaded({
        subject,
        results: true,
        result_docs: doc_keys_to_compare,
      }).then(() => {
        const matched_indicators = get_indicators(subject);
        const processed_indicators = process_indicators(
          matched_indicators,
          indicator_status
        );

        this.setState({
          first_load: false,
          subject: subject,
          loading: false,
          matched_indicators: matched_indicators,
          processed_indicators: processed_indicators,
        });
      });
    }
  }

  render() {
    const {
      loading,
      subject,
      processed_indicators,
      indicator_status,
    } = this.state;

    const { history } = this.props;

    const all_depts = _.chain(Dept.get_all())
      .filter((dept) => !!dept.dp_status)
      .sortBy("name")
      .value();
    const crs_without_internal = _.filter(
      subject.level === "dept" ? subject.crsos : subject.dept.crsos,
      (cr) => cr.is_cr && !cr.is_internal_service
    );

    const current_dept = subject.level === "dept" ? subject : subject.dept;

    return (
      <StandardRouteContainer
        title={text_maker("diff_title")}
        breadcrumbs={[text_maker("diff_title")]}
        description={text_maker("diff_intro_text", {
          previous_doc_name,
          current_doc_name,
        })}
        route_key="_diff"
        beta={true}
      >
        <TM k="diff_title" el="h1" />
        <div
          className={classNames("medium-panel-text", "text-diff__instructions")}
        >
          <TM
            k="diff_intro_text"
            args={{ previous_doc_name, current_doc_name }}
          />
        </div>
        <div className={classNames("medium-panel-text")}>
          <label htmlFor="select_dept">
            <TM k="select_dept" />
          </label>
          <Select
            className="text-diff__selector"
            id="select_dept"
            selected={current_dept.id}
            onSelect={(id) => {
              const new_url = this.get_new_url(Dept.lookup(id));
              history.push(new_url);
            }}
            options={_.map(all_depts, (dept) => ({
              id: dept.id,
              display: dept.name,
            }))}
          />
        </div>
        <div className={classNames("medium-panel-text")}>
          <label htmlFor="select_cr">
            <TM k="select_cr" />
          </label>
          <Select
            className="text-diff__selector"
            id="select_cr"
            selected={
              subject.level === "program"
                ? subject.crso.id
                : subject.level === "crso"
                ? subject.id
                : "all"
            }
            onSelect={(id) => {
              const new_url = this.get_new_url(CRSO.lookup(id) || id);
              history.push(new_url);
            }}
            options={_.chain(crs_without_internal)
              .map((cr) => ({ id: cr.id, display: cr.name }))
              .concat([{ id: "all", display: text_maker("all_crs") }])
              .value()}
          />
        </div>
        <div className={classNames("medium-panel-text")}>
          <label htmlFor="select_program">
            <TM k="select_program" />
          </label>
          <Select
            className="text-diff__selector"
            id="select_program"
            selected={subject.level === "program" ? subject.id : "all"}
            onSelect={(id) => {
              const new_url = this.get_new_url(Program.lookup(id) || id);
              history.push(new_url);
            }}
            options={_.chain(
              subject.level === "dept"
                ? crs_without_internal
                : subject.level === "crso"
                ? [subject]
                : [subject.crso]
            )
              .map("programs")
              .flatten()
              .compact()
              .map((prog) => ({ id: prog.id, display: prog.name }))
              .concat([{ id: "all", display: text_maker("all_programs") }])
              .value()}
          />
        </div>
        <div style={{ padding: "0px 0px 20px 0px" }}>
          <div className="medium-panel-text">
            <label htmlFor="filter_by_status">
              <TM k="filter_by_status" />
            </label>
            <LegendList
              items={indicator_status}
              LegendCheckBoxProps={{
                checkmark_vertical_align: 6,
                onClick: (id) => {
                  const copy_indicator_status = _.map(indicator_status, (row) =>
                    row.id === id
                      ? {
                          ...row,
                          active: !row.active,
                        }
                      : row
                  );
                  this.setState({
                    indicator_status: copy_indicator_status,
                    indicator_status_changed: true,
                  });
                },
              }}
            />
          </div>
        </div>
        {loading ? (
          <SpinnerWrapper ref="spinner" config_name={"sub_route"} />
        ) : (
          <div>
            <h2>{text_maker("list_of_indicators")}</h2>
            <div>{subject_intro(subject, processed_indicators.length)}</div>
            {_.map(processed_indicators, (processed_indicator) =>
              indicator_report(processed_indicator)
            )}
          </div>
        )}
      </StandardRouteContainer>
    );
  }
}

TextDiffApp.defaultProps = {
  subject: Dept.lookup(326),
};
