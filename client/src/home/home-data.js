const featured_content_items = _.compact([
  {
    text_key: 'quick_link_main_estimates',
    href: '#compare_estimates',
    is_new: 'true',
  },
  {
    text_key: 'quick_link_DRR_1819',
    href: "#orgs/gov/gov/infograph/results/.-.-(panel_key.-.-'gov_drr)",
    is_new: "true",
  },
  {
    text_key: 'supps_b',
    href: {
      en: "#rpb/.-.-(subject.-.-'gov_gov.-.-preferDeptBreakout.-.-true.-.-mode.-.-'simple.-.-table.-.-'orgVoteStatEstimates.-.-columns.-.-(.-.-'*7b*7best_last_year*7d*7d_estimates).-.-dimension.-.-'by_estimates_doc.-.-filter.-.-'Supp.*20Estimates*20B.-.-sort_col.-.-'dept.-.-descending.-.-false)",
      fr: "#rpb/.-.-(subject.-.-'gov_gov.-.-preferDeptBreakout.-.-true.-.-mode.-.-'simple.-.-table.-.-'orgVoteStatEstimates.-.-columns.-.-(.-.-'*7b*7best_last_year*7d*7d_estimates).-.-dimension.-.-'by_estimates_doc.-.-filter.-.-'Budget*20supp.*20B.-.-sort_col.-.-'dept.-.-descending.-.-false)",
    },
  },
  {
    text_key: 'quick_link_spending_by_program',
    href: '#partition/dept/exp',
  },
  {
    text_key: 'quick_link_ftes_by_program',
    href: '#partition/dept/fte',
  },
  {
    text_key: 'igoc',
    href: '#igoc',
  },
  {
    text_key: 'quick_link_people_2019',
    href: '#orgs/gov/gov/infograph/people',
  },
]);

export { featured_content_items };