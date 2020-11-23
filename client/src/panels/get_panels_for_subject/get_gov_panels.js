import {
  // shared all
  declare_welcome_mat_panel,
  declare_financial_key_concepts_panel,

  // shared gov, dept, crso, program
  declare_results_key_concepts_panel,
  declare_late_results_warning_panel,
  declare_late_planned_resources_panel,

  // shared gov, dept
  declare_tp_by_region_panel,
  declare_links_to_rpb_panel,
  declare_in_year_voted_stat_split_panel,
  declare_in_year_estimates_split_panel,
  declare_historical_g_and_c_panel,
  declare_auth_exp_planned_spending_panel,
  declare_people_key_concepts_panel,
  declare_employee_totals_panel,
  declare_employee_prov_panel,
  declare_employee_type_panel,
  declare_employee_age_panel,
  declare_employee_executive_level_panel,
  declare_employee_fol_panel,
  declare_employee_gender_panel,
  declare_results_intro_panel,
  declare_covid_estimates_panel,

  // gov only panels
  declare_simplographic_panel,
  declare_gov_related_info_panel,
  declare_gov_drr_panel,
  declare_gov_dp_panel,
  declare_in_year_voted_breakdown_panel,
  declare_in_year_stat_breakdown_panel,
  declare_gocographic_panel,
  declare_personnel_spend_panel,
} from "../panel_declarations/index.js";

export const get_gov_panels = (subject) => ({
  intro: [declare_simplographic_panel()],
  financial: [
    declare_late_planned_resources_panel(),
    declare_financial_key_concepts_panel(),
    declare_welcome_mat_panel(),
    declare_auth_exp_planned_spending_panel(),
    declare_in_year_estimates_split_panel(),
    declare_covid_estimates_panel(),
    declare_in_year_voted_stat_split_panel(),
    declare_in_year_stat_breakdown_panel(),
    declare_in_year_voted_breakdown_panel(),
    declare_tp_by_region_panel(),
    declare_gocographic_panel(),
    declare_historical_g_and_c_panel(),
    declare_personnel_spend_panel(),
  ],
  people: [
    declare_people_key_concepts_panel(),
    declare_employee_totals_panel(),
    declare_employee_prov_panel(),
    declare_employee_type_panel(),
    declare_employee_age_panel(),
    declare_employee_executive_level_panel(),
    declare_employee_fol_panel(),
    declare_employee_gender_panel(),
  ],
  results: [
    declare_results_key_concepts_panel(),
    declare_late_results_warning_panel(),
    declare_results_intro_panel(),
    declare_gov_drr_panel(),
    declare_gov_dp_panel(),
  ],
  related: [declare_gov_related_info_panel()],
  all_data: [declare_links_to_rpb_panel()],
});
