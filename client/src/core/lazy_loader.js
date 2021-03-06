import _ from "lodash";

import {
  api_load_covid_estimates,
  api_load_covid_estimates_gov_summary,
  api_load_covid_initiatives,
  api_load_covid_measures,
} from "../models/covid/populate.js";
import { load_footnotes_bundle } from "../models/footnotes/populate_footnotes.js";
import { load_horizontal_initiative_lookups } from "../models/populate_horizontal_initiative_lookups.js";
import {
  api_load_results_bundle,
  api_load_results_counts,
  subject_has_results,
} from "../models/populate_results.js";
import {
  api_load_subject_has_services,
  api_load_services,
} from "../models/populate_services.js";
import { PanelRegistry, tables_for_panel } from "../panels/PanelRegistry.js";

import { assign_to_dev_helper_namespace } from "./assign_to_dev_helper_namespace.js";

import { Table } from "./TableClass.js";

// given an array of tables, returns a promise when they are all loaded.
function load(table_objs) {
  return Promise.all(
    _.chain(table_objs)
      .reject(_.property("loaded")) //ignore tables that are already loaded
      .map((table) => table.load())
      .value()
  );
}

function ensure_loaded({
  panel_keys,
  stat_keys,
  table_keys,
  subject_level,
  subject,
  has_results,
  results,
  result_docs,
  requires_result_counts,
  requires_granular_result_counts,
  has_services,
  services,
  covid_measures,
  covid_initiatives,
  covid_estimates,
  covid_estimates_gov_summary,
  footnotes_for: footnotes_subject,
}) {
  const table_set = _.chain(table_keys)
    .union(
      _.chain(panel_keys)
        .map((key) => tables_for_panel(key, subject_level))
        .flatten()
        .value()
    )
    .uniqBy()
    .map((table_key) => Table.lookup(table_key))
    .value();

  //results can be required explicitly, or be a dependency of a panel/statistic
  const should_load_results =
    results ||
    _.chain(panel_keys)
      .map((key) => PanelRegistry.lookup(key, subject_level))
      .map("requires_results")
      .some()
      .value();

  const should_load_result_counts =
    requires_result_counts ||
    _.chain(panel_keys)
      .map((key) => PanelRegistry.lookup(key, subject_level))
      .map("requires_result_counts")
      .some()
      .value();

  const should_load_granular_result_counts =
    requires_granular_result_counts ||
    _.chain(panel_keys)
      .map((key) => PanelRegistry.lookup(key, subject_level))
      .map("requires_granular_result_counts")
      .some()
      .value();

  const should_load_horizontal_initiative_lookups =
    subject &&
    subject.level === "tag" &&
    subject.root.id === "HI" &&
    _.isUndefined(subject.lookups);

  const should_load_has_services =
    has_services ||
    _.chain(panel_keys)
      .map((key) => PanelRegistry.lookup(key, subject_level))
      .map("requires_has_services")
      .some()
      .value();

  const should_load_services =
    services ||
    _.chain(panel_keys)
      .map((key) => PanelRegistry.lookup(key, subject_level))
      .map("requires_services")
      .some()
      .value();

  const should_load_covid_estimates =
    covid_estimates ||
    _.chain(panel_keys)
      .map((key) => PanelRegistry.lookup(key, subject_level))
      .map("requires_covid_estimates")
      .some()
      .value();

  const should_load_covid_estimates_gov_summary =
    covid_estimates_gov_summary ||
    _.chain(panel_keys)
      .map((key) => PanelRegistry.lookup(key, subject_level))
      .map("requires_covid_estimates_gov_summary")
      .some()
      .value();

  const should_load_covid_initiatives =
    covid_initiatives ||
    _.chain(panel_keys)
      .map((key) => PanelRegistry.lookup(key, subject_level))
      .map("requires_covid_initiatives")
      .some()
      .value();

  const should_load_covid_measures =
    covid_measures ||
    _.chain(panel_keys)
      .map((key) => PanelRegistry.lookup(key, subject_level))
      .map("requires_covid_measures")
      .some()
      .value();

  const result_docs_to_load = !_.isEmpty(result_docs)
    ? result_docs
    : _.chain(panel_keys)
        .map((key) => PanelRegistry.lookup(key, subject_level))
        .map("required_result_docs")
        .flatten()
        .uniq()
        .compact()
        .value();

  const results_prom = should_load_results
    ? api_load_results_bundle(subject, result_docs_to_load)
    : Promise.resolve();

  const result_counts_prom = should_load_result_counts
    ? api_load_results_counts("summary")
    : Promise.resolve();

  const has_results_prom =
    has_results && _.isFunction(subject.set_has_data)
      ? subject_has_results(subject)
      : Promise.resolve();

  const granular_result_counts_prom = should_load_granular_result_counts
    ? api_load_results_counts("granular")
    : Promise.resolve();

  const footnotes_prom = footnotes_subject
    ? load_footnotes_bundle(footnotes_subject)
    : Promise.resolve();

  const has_services_prom =
    should_load_has_services && _.isFunction(subject.set_has_data)
      ? api_load_subject_has_services(subject)
      : Promise.resolve();

  const services_prom = should_load_services
    ? api_load_services(subject)
    : Promise.resolve();

  const horizontal_initiative_lookups_prom = should_load_horizontal_initiative_lookups
    ? load_horizontal_initiative_lookups()
    : Promise.resolve();

  const covid_estimates_prom = should_load_covid_estimates
    ? api_load_covid_estimates(subject)
    : Promise.resolve();

  const covid_estimates_gov_summary_prom = should_load_covid_estimates_gov_summary
    ? api_load_covid_estimates_gov_summary()
    : Promise.resolve();

  const covid_initiatives_prom = should_load_covid_initiatives
    ? api_load_covid_initiatives(subject)
    : Promise.resolve();

  const covid_measures_prom = should_load_covid_measures
    ? api_load_covid_measures()
    : Promise.resolve();

  return Promise.all([
    load(table_set),
    results_prom,
    result_counts_prom,
    has_results_prom,
    granular_result_counts_prom,
    footnotes_prom,
    has_services_prom,
    services_prom,
    horizontal_initiative_lookups_prom,
    covid_initiatives_prom,
    covid_measures_prom,
    covid_estimates_prom,
    covid_estimates_gov_summary_prom,
  ]);
}

assign_to_dev_helper_namespace({ ensure_loaded });

export { ensure_loaded };
