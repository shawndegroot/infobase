import _ from "lodash";
import React, { Fragment } from "react";

import { lang } from "src/core/injected_build_constants.js";

import { PRE_DRR_PUBLIC_ACCOUNTS_LATE_FTE_MOCK_DOC } from "../../../models/footnotes/dynamic_footnotes.js";
import dynamic_footnote_text from "../../../models/footnotes/dynamic_footnotes.yaml";

import {
  util_components,
  Subject,
  Results,
  create_text_maker_component,
  declare_panel,
} from "../shared.js";

import text from "./warning_panels.yaml";

const { TM, text_maker } = create_text_maker_component([
  text,
  dynamic_footnote_text,
]);
const { Dept } = Subject;
const { result_docs_in_tabling_order } = Results;
const { AlertBanner, KeyConceptList, MultiColumnList } = util_components;

const WarningPanel = ({
  banner_class = "info",
  center_text = true,
  children,
}) => (
  <AlertBanner
    banner_class={banner_class}
    additional_class_names="large_panel_text"
    style={center_text ? { textAlign: "center" } : {}}
  >
    {children}
  </AlertBanner>
);

export const declare_dead_program_warning_panel = () =>
  declare_panel({
    panel_key: "dead_program_warning",
    levels: ["program"],
    panel_config_func: (level, panel_key) => ({
      is_static: true,
      footnotes: false,
      calculate: _.property("is_dead"),
      render() {
        return (
          <WarningPanel banner_class="danger">
            <TM k="dead_program_warning" />
          </WarningPanel>
        );
      },
    }),
  });

export const declare_dead_crso_warning_panel = () =>
  declare_panel({
    panel_key: "dead_crso_warning",
    levels: ["crso"],
    panel_config_func: (level, panel_key) => ({
      is_static: true,
      footnotes: false,
      calculate: _.property("is_dead"),
      render() {
        return (
          <WarningPanel banner_class="danger">
            <TM k="dead_crso_warning" />
          </WarningPanel>
        );
      },
    }),
  });

export const declare_m2m_tag_warning_panel = () =>
  declare_panel({
    panel_key: "m2m_warning",
    levels: ["tag"],
    panel_config_func: (level, panel_key) => ({
      is_static: true,
      footnotes: false,
      calculate(subject) {
        return subject.is_m2m;
      },

      render: () => (
        <WarningPanel center_text={false}>
          <KeyConceptList
            question_answer_pairs={_.map(
              [
                "MtoM_tag_warning_reporting_level",
                "MtoM_tag_warning_resource_splitting",
                "MtoM_tag_warning_double_counting",
              ],
              (key) => [
                <TM key={key + "_q"} k={key + "_q"} />,
                <TM key={key + "_a"} k={key + "_a"} />,
              ]
            )}
          />
        </WarningPanel>
      ),
    }),
  });

export const declare_late_results_warning_panel = () =>
  declare_panel({
    panel_key: "late_results_warning",
    levels: ["gov", "dept", "crso", "program"],
    panel_config_func: (level, panel_key) => {
      const docs_with_late_orgs = _.chain(result_docs_in_tabling_order)
        .reverse()
        .filter(({ late_results_orgs }) => late_results_orgs.length > 0)
        .value();

      const get_per_doc_late_results_alert = (per_doc_inner_content) => (
        <Fragment>
          {_.map(docs_with_late_orgs, (result_doc, ix) => (
            <WarningPanel key={ix} banner_class="warning">
              {per_doc_inner_content(result_doc)}
            </WarningPanel>
          ))}
        </Fragment>
      );

      switch (level) {
        case "gov":
          return {
            is_static: true,
            footnotes: false,
            source: false,
            calculate: () => !_.isEmpty(docs_with_late_orgs),
            render() {
              const per_doc_inner_content = (result_doc) => (
                <div style={{ textAlign: "left" }}>
                  <TM
                    k={"late_results_warning_gov"}
                    args={{
                      result_doc_name: text_maker(
                        `${result_doc.doc_type}_name`,
                        { year: result_doc.year }
                      ),
                    }}
                  />
                  <MultiColumnList
                    list_items={_.map(
                      result_doc.late_results_orgs,
                      (org_id) => Dept.lookup(org_id).name
                    )}
                    column_count={
                      lang === "en" && result_doc.late_results_orgs.length > 3
                        ? 2
                        : 1
                    }
                    li_class={
                      result_doc.late_results_orgs.length > 4
                        ? "font-small"
                        : ""
                    }
                  />
                </div>
              );

              return get_per_doc_late_results_alert(per_doc_inner_content);
            },
          };
        default:
          return {
            is_static: true,
            footnotes: false,
            source: false,
            calculate: (subject) =>
              _.chain(docs_with_late_orgs)
                .flatMap("late_results_orgs")
                .includes(level === "dept" ? subject.id : subject.dept.id)
                .value(),
            render() {
              const per_doc_inner_content = (result_doc) => (
                <TM
                  k={`late_results_warning_${level}`}
                  args={{
                    result_doc_name: text_maker(`${result_doc.doc_type}_name`, {
                      year: result_doc.year,
                    }),
                  }}
                />
              );

              return get_per_doc_late_results_alert(per_doc_inner_content);
            },
          };
      }
    },
  });

const get_declare_late_resources_panel = (planned_or_actual, late_orgs) => () =>
  declare_panel({
    panel_key: `late_${planned_or_actual}_resources_warning`,
    levels: ["gov", "dept", "crso", "program"],
    panel_config_func: (level, panel_key) => {
      switch (level) {
        case "gov":
          return {
            is_static: true,
            footnotes: false,
            source: false,
            calculate: () => !_.isEmpty(late_orgs),
            render: () => (
              <WarningPanel center_text={false} banner_class="warning">
                <TM k={`late_${planned_or_actual}_resources_warning_gov`} />
                <MultiColumnList
                  list_items={_.map(
                    late_orgs,
                    (org_id) => Dept.lookup(org_id).name
                  )}
                  column_count={lang === "en" && late_orgs.length > 3 ? 2 : 1}
                  li_class={late_orgs.length > 4 ? "font-small" : ""}
                />
              </WarningPanel>
            ),
          };
        default:
          return {
            is_static: true,
            footnotes: false,
            source: false,
            calculate: (subject) =>
              _.includes(
                late_orgs,
                level === "dept" ? subject.id : subject.dept.id
              ),
            render: () => (
              <WarningPanel banner_class="warning">
                <TM
                  k={`late_${planned_or_actual}_resources_warning_${level}`}
                />
              </WarningPanel>
            ),
          };
      }
    },
  });

const depts_with_late_actual_resources = _.chain(result_docs_in_tabling_order)
  .filter(({ doc_type }) => doc_type === "drr")
  .last()
  .get("late_resources_orgs")
  .concat(PRE_DRR_PUBLIC_ACCOUNTS_LATE_FTE_MOCK_DOC.late_resources_orgs)
  .uniq()
  .value();
export const declare_late_actual_resources_panel = get_declare_late_resources_panel(
  "actual",
  depts_with_late_actual_resources
);

const depts_with_late_planned_resources = _.chain(result_docs_in_tabling_order)
  .filter(({ doc_type }) => doc_type === "dp")
  .last()
  .get("late_resources_orgs")
  .value();
export const declare_late_planned_resources_panel = get_declare_late_resources_panel(
  "planned",
  depts_with_late_planned_resources
);
