import { rpb_link } from '../rpb/rpb_link.js';

export default function(a11y_mode){
  const featured_content_items = [
    {
      text_key: 'quick_link_DRR_1718',
      href: '#orgs/gov/gov/infograph/results',
      is_new: true,
    },
    {
      text_key: 'quick_link_auth_and_exp',
      href: rpb_link({ 
        table: 'table4', 
        mode: 'details',
      }),
      is_new: true,
    },
    {
      text_key: 'quick_link_exp_by_so',
      href: rpb_link({ 
        table: 'table5', 
        mode: 'details',
      }),
      is_new: true,
    },
    {
      text_key: 'quick_link_spending_by_program',
      href: rpb_link({ 
        table: 'table6', 
        mode: 'details',
      }),
      is_new: true,
    },
    {
      text_key: 'quick_link_transfer_payment',
      href: rpb_link({ 
        table: 'table7', 
        mode: 'details',
      }),
      is_new: true,
    },
    { 
      text_key: 'quick_link_prog_by_vote_stat',
      href: rpb_link({ 
        table: 'table300', 
        mode: 'details',
      }),
      is_new: true,
    },
    { 
      text_key: 'quick_link_prog_by_so',
      href: rpb_link({ 
        table: 'table305', 
        mode: 'details',
      }),
      is_new: true,
    },
    {
      text_key: "supps_a",
      href: (
        window.is_a11y_mode ? 
          rpb_link({ 
            table: 'table8', 
            columns: [ "{{est_in_year}}_estimates"], 
            dimension: 'by_estimates_doc', 
            filter: ({ //TODO: D.R.Y this against table8
              en: "Supp. Estimates A",
              fr: "Budget supp. A",
            })[window.lang],
          }) :
          "#compare_estimates"
      ),
    },
  ];


  return {
    featured_content_items: _.compact(featured_content_items),
  };

};